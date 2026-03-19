from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, status
from fastapi.responses import FileResponse
from security import get_current_user
from models import ExtractedData, ValidationResult
from services.validation_ia import validate_business_rules, check_cross_document_coherence
from services.datalake import save_to_datalake
from database import documents_collection 
from bson import ObjectId
import os
from datetime import datetime, timedelta

router = APIRouter(prefix="/fournisseur", tags=["Espace Fournisseur"])

@router.post("/upload")
async def upload_document(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    """
    Upload de document avec détection dynamique (Mock) et validation multi-niveaux.
    """
    content = await file.read()
    filename = file.filename.lower()

    if "attestation" in filename:
        mock_extraction = ExtractedData(
            type="attestation",
            doc_id=f"URS-2026-{filename}",
            fournisseur_siret="33070384400036",
            fournisseur_nom="CAPGEMINI",
            organisme_nom="URSSAF",
            reference_attestation="ATT-2026-6182",
            date_emission="14/02/2026",
            date_echeance="16/03/2026",
            chemin_fichier=f"data\\raw\\attestations\\{file.filename}"
        )
    elif "devis" in filename:
        mock_extraction = ExtractedData(
            type="devis",
            doc_id=f"DEV-2026-{filename}",
            fournisseur_siret="33070384400036",
            fournisseur_nom="CAPGEMINI",
            client_nom="Pires",
            client_siret="69418806484183",
            date_emission="26/11/2025",
            date_echeance="11/12/2025",
            total_ht=11085.77,
            tva=2217.15,
            total_ttc=13302.92,
            chemin_fichier=f"data\\raw\\devis\\{file.filename}"
        )
    else: # Par défaut : Facture
        mock_extraction = ExtractedData(
            type="facture",
            doc_id=f"FAC-2026-{filename}",
            fournisseur_siret="33070384400036",
            fournisseur_nom="CAPGEMINI",
            client_nom="Martin",
            client_siret="52131335478275",
            iban="FR76 8129 0622 9051 5899 4901",
            bic="SEPGVREO",
            date_emission="10/12/2025",
            date_echeance="08/02/2026",
            total_ht=14555.98,
            tva=2911.2,
            total_ttc=17467.18,
            chemin_fichier=f"data\\raw\\factures\\{file.filename}"
        )

    validation = validate_business_rules(mock_extraction)

    if validation.coherent:
        coherence_issue = await check_cross_document_coherence(mock_extraction, documents_collection)
        if coherence_issue:
            validation.anomalie = coherence_issue
      
    doc_id = await save_to_datalake(
        filename=file.filename,
        raw_content=content,
        extracted_data=mock_extraction,
        validation=validation,
        user_email=current_user["email"]
    )

    return {
        "message": "Analyse terminée",
        "type_document": mock_extraction.type,
        "document_id": doc_id,
        "coherent": validation.coherent,
        "anomalie": validation.anomalie,
        "details": {
            "fournisseur": mock_extraction.fournisseur_nom,
            "total_ttc": getattr(mock_extraction, 'total_ttc', 0)
        }
    }

@router.get("/dashboard")
async def get_fournisseur_dashboard(current_user: dict = Depends(get_current_user)):
    """
    API Dashboard Fournisseur enrichie avec données graphiques
    """
    user_email = current_user["email"]
    
    # 1. KPIs de base
    total_docs = await documents_collection.count_documents({"uploaded_by": user_email})
    docs_verifies = await documents_collection.count_documents({
        "uploaded_by": user_email, 
        "curated_zone.status_final": "VERIFIE"
    })
    docs_attente = await documents_collection.count_documents({
        "uploaded_by": user_email, 
        "curated_zone.status_final": "EN_ATTENTE"
    })

    # 2. Évolution sur 7 jours (Line Chart)
    evolution_docs = []
    for i in range(6, -1, -1):
        date = (datetime.now() - timedelta(days=i)).date()
        date_str = date.isoformat()
        # On cherche les docs dont la date commence par ce jour
        count = await documents_collection.count_documents({
            "uploaded_by": user_email,
            "upload_date": {"$regex": f"^{date_str}"}
        })
        evolution_docs.append({"name": date.strftime("%a"), "docs": count})

    # 3. Répartition par type (Doughnut Chart)
    pipeline = [
        {"$match": {"uploaded_by": user_email}},
        {"$group": {"_id": "$curated_zone.document_type", "count": {"$sum": 1}}}
    ]
    cursor_repart = documents_collection.aggregate(pipeline)
    repartition_data = []
    async for item in cursor_repart:
        label = item["_id"] if item["_id"] else "Inconnu"
        repartition_data.append({"name": label.capitalize(), "value": item["count"]})

    # 4. Activité récente
    cursor = documents_collection.find({"uploaded_by": user_email}).sort("upload_date", -1).limit(5)
    derniers_docs_raw = await cursor.to_list(length=5)
    recent_docs_list = [
        {
            "id": str(doc["_id"]),
            "nom_fichier": doc.get("raw_zone", {}).get("filename", "Sans nom"),
            "type": doc.get("curated_zone", {}).get("document_type", "Inconnu"),
            "date": doc.get("upload_date"),
            "statut": doc.get("curated_zone", {}).get("status_final", "EN_ATTENTE")
        } for doc in derniers_docs_raw
    ]
    
    return {
        "statistiques": {
            "total_envoyes": total_docs,
            "verifies": docs_verifies,
            "en_attente": docs_attente,
            "taux_precision": "99.8%" # Mock pour le style
        },
        "graphiques": {
            "evolution": evolution_docs,
            "repartition": repartition_data
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
