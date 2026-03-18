from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from security import get_current_user
from models import ExtractedData, ValidationResult
from services.validation_ia import validate_business_rules, check_cross_document_coherence
from services.datalake import save_to_datalake
from database import documents_collection 

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