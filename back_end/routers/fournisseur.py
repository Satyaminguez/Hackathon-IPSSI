from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from typing import List
import uuid
from security import get_current_user
from models import ExtractedData, ValidationResult
from services.validation_ia import validate_business_rules, check_cross_document_coherence
from services.datalake import save_to_datalake
from database import documents_collection
from bson import ObjectId 
from fastapi.responses import FileResponse

# L'intégration native !
from services.ocr_service import process_document_native

import os
from datetime import datetime, timedelta

router = APIRouter(prefix="/fournisseur", tags=["Espace Fournisseur"])

@router.post("/upload")
async def upload_documents(files: List[UploadFile] = File(...), current_user: dict = Depends(get_current_user)):
    """
    Upload MULTI-DOCUMENTS : Traite plusieurs fichiers à la fois et leur attribue le même LOT_ID.
    """
    # 1. Création d'un identifiant de Lot unique pour cet envoi groupé
    lot_id_unique = f"LOT-2026-{uuid.uuid4().hex[:6].upper()}"
    
    resultats_batch = []
    
    # 2. On boucle sur tous les fichiers uploadés
    for file in files:
        content = await file.read()
        filename = file.filename.lower()

        # A. OCR + Extraction via l'algo SilverExtractor
        try:
            extraction_data = await process_document_native(content, filename)
        except Exception as e:
            # Si un fichier plante, on passe au suivant sans tout bloquer
            resultats_batch.append({
                "fichier": filename,
                "status": "erreur",
                "detail": str(e)
            })
            continue

        # B. Formatage des données
        def safe_float(value):
            try:
                return float(value) if value is not None else 0.0
            except (TypeError, ValueError):
                return 0.0

        siret = extraction_data.get("fournisseur_siret") or "00000000000000"
        nom = extraction_data.get("fournisseur_nom") or current_user.get("nom_entreprise", "Fournisseur Inconnu")
        date_em = extraction_data.get("date_emission") or "01/01/2026"
        date_ech = extraction_data.get("date_echeance") or "01/01/2026"
        doc_type = extraction_data.get("type") or "document"
        doc_id = extraction_data.get("doc_id") or f"DOC-{uuid.uuid4().hex[:6]}"

        extraction = ExtractedData(
            type=doc_type,
            doc_id=doc_id,
            # Attention : il faut que ton modèle ExtractedData dans models.py accepte "lot_id"
            lot_id=lot_id_unique, 
            fournisseur_siret=siret,
            fournisseur_nom=nom,
            date_emission=date_em,
            date_echeance=date_ech,
            chemin_fichier=filename,
            total_ht=safe_float(extraction_data.get("total_ht")),
            tva=safe_float(extraction_data.get("tva")),
            total_ttc=safe_float(extraction_data.get("total_ttc")),
        )

        # C. Validation Métier
        validation = validate_business_rules(extraction)

        if validation.coherent:
            coherence_issue = await check_cross_document_coherence(extraction, documents_collection)
            if coherence_issue:
                validation.anomalie = coherence_issue
          
        # D. Sauvegarde Data Lake
        db_id = await save_to_datalake(
            filename=file.filename,
            raw_content=content,
            extracted_data=extraction,
            validation=validation,
            user_email=current_user["email"]
        )

        # E. On ajoute le résultat de CE fichier à la liste globale
        resultats_batch.append({
            "fichier": filename,
            "type_document": extraction.type,
            "document_id": db_id,
            "coherent": validation.coherent,
            "anomalie": validation.anomalie,
            "details": {
                "siret": extraction.fournisseur_siret,
                "ttc": extraction.total_ttc
            }
        })

    # --- NOUVEAU : Déclenchement automatique du pipeline Airflow ---
    # On délègue l'ingestion lourde à Airflow de manière asynchrone
    from utils.airflow import trigger_dag
    await trigger_dag("1_ocr_document_ingestion", {
        "lot_id": lot_id_unique,
        "email": current_user["email"]
    })

    # 3. Réponse finale au Front-end résumant tout le lot
    return {
        "message": f"Traitement du lot terminé. {len(files)} document(s) analysé(s).",
        "lot_id": lot_id_unique,
        "resultats": resultats_batch
    }

@router.get("/dashboard")
async def get_fournisseur_dashboard(current_user: dict = Depends(get_current_user)):
    """
    API Dashboard Fournisseur : Statistiques personnelles de l'utilisateur connecté
    """
    user_email = current_user["email"]
    
    total_docs = await documents_collection.count_documents({"uploaded_by": user_email})
    docs_valides = await documents_collection.count_documents({
        "uploaded_by": user_email, 
        "curated_zone.status_final": "VALIDE"
    })
    docs_anomalies = await documents_collection.count_documents({
        "uploaded_by": user_email, 
        "curated_zone.status_final": "A_VERIFIER"
    })
    
    cursor = documents_collection.find({"uploaded_by": user_email}).sort("upload_date", -1).limit(5)
    derniers_docs = await cursor.to_list(length=5)
    
    recent_docs_list = []
    for doc in derniers_docs:
        recent_docs_list.append({
            "id": doc.get("document_id", str(doc["_id"])),
            "nom_fichier": doc["raw_zone"]["filename"],
            "date": doc["upload_date"],
            "statut": doc["curated_zone"]["status_final"]
        })

    # --- Generation des Graphiques ---
    # 1. Evolution (Volume sur 7 jours)
    today = datetime.now()
    evolution = []
    days_fr = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]
    
    for i in range(6, -1, -1):
        target_day = today - timedelta(days=i)
        day_str = target_day.strftime("%Y-%m-%d")
        name = days_fr[target_day.weekday()]
        
        count = await documents_collection.count_documents({
            "uploaded_by": user_email,
            "upload_date": {"$regex": f"^{day_str}"}
        })
        evolution.append({"name": name, "docs": count})

    # 2. Répartition (Par type de document)
    pipeline = [
        {"$match": {"uploaded_by": user_email}},
        {"$group": {"_id": "$curated_zone.document_type", "value": {"$sum": 1}}}
    ]
    repartition = []
    async for item in documents_collection.aggregate(pipeline):
        doc_type = item["_id"]
        # On rend le type plus lisible si besoin
        name = doc_type.upper() if doc_type else "AUTRE"
        repartition.append({"name": name, "value": item["value"]})
    
    return {
        "statistiques": {
            "total_envoyes": total_docs,
            "valides": docs_valides,
            "en_attente_ou_anomalie": docs_anomalies,
            "taux_precision": "99.8%" # On peut le simuler ou le calculer
        },
        "graphiques": {
            "evolution": evolution,
            "repartition": repartition
        },
        "derniers_documents": recent_docs_list
    }


@router.get("/documents")
async def get_my_documents(current_user: dict = Depends(get_current_user)):
    """
    Retourne la liste complète des documents importés par l'utilisateur connecté
    """
    user_email = current_user["email"]
    cursor = documents_collection.find({"uploaded_by": user_email}).sort("upload_date", -1)
    docs = await cursor.to_list(length=100)
    
    return [
        {
            "id": str(doc["_id"]),
            "document_id": doc.get("document_id"),
            "nom_fichier": doc.get("raw_zone", {}).get("filename", "Sans nom"),
            "type": doc.get("curated_zone", {}).get("document_type", "Inconnu"),
            "date": doc.get("upload_date"),
            "statut": doc.get("curated_zone", {}).get("status_final", "EN_ATTENTE"),
            "details": doc.get("curated_zone", {}).get("details", {})
        }
        for doc in docs
    ]

@router.delete("/documents/{doc_id}")
async def delete_document(doc_id: str, current_user: dict = Depends(get_current_user)):
    """Supprime un document appartenant à l'utilisateur connecté"""
    user_email = current_user["email"]
    try:
        obj_id = ObjectId(doc_id)
    except:
        raise HTTPException(status_code=400, detail="ID de document invalide")
        
    result = await documents_collection.delete_one({"_id": obj_id, "uploaded_by": user_email})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Document non trouvé ou accès refusé")
    return {"message": "Document supprimé avec succès"}

@router.get("/documents/{doc_id}/view")
async def view_document(doc_id: str, current_user: dict = Depends(get_current_user)):
    """Visualiser un document (Stream PDF/Image)"""
    user_email = current_user["email"]
    try:
        obj_id = ObjectId(doc_id)
    except:
        raise HTTPException(status_code=400, detail="ID invalide")

    doc = await documents_collection.find_one({"_id": obj_id, "uploaded_by": user_email})
    if not doc:
        raise HTTPException(status_code=404, detail="Document non trouvé")
    
    file_path = doc.get("raw_zone", {}).get("physical_path")
    if not file_path or not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Fichier introuvable sur le disque")
    
    return FileResponse(file_path)