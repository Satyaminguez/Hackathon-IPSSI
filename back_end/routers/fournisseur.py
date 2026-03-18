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