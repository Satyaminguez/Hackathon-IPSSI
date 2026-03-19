from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from typing import List
import uuid
from security import get_current_user
from models import ExtractedData, ValidationResult
from services.validation_ia import validate_business_rules, check_cross_document_coherence
from services.datalake import save_to_datalake
from database import documents_collection 

# L'intégration native !
from services.ocr_service import process_document_native

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
    
    return {
        "statistiques": {
            "total_envoyes": total_docs,
            "valides": docs_valides,
            "en_attente_ou_anomalie": docs_anomalies
        },
        "derniers_documents": recent_docs_list
    }