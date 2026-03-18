from datetime import datetime
import re
from models import ExtractedData, ValidationResult

def validate_business_rules(data: ExtractedData) -> ValidationResult:
    """
    Moteur de règles principal : Valide la cohérence interne du document.
    """
    
    siret_clean = str(data.fournisseur_siret).strip()
    if not re.match(r"^\d{14}$", siret_clean):
        return ValidationResult(coherent=False, anomalie="siret_malforme")


    if data.type in ["facture", "devis"]:
    
        if data.total_ht and data.tva:
            tva_attendue = round(data.total_ht * 0.20, 2)
            if abs(data.tva - tva_attendue) > 0.01:
                return ValidationResult(coherent=False, anomalie="tva_incoherente")
        

        if data.total_ht and data.tva and data.total_ttc:
            ttc_attendu = round(data.total_ht + data.tva, 2)
            if abs(data.total_ttc - ttc_attendu) > 0.01:
                return ValidationResult(coherent=False, anomalie="ttc_incorrect")

    if data.type == "facture":
        if data.iban:
            clean_iban = data.iban.replace(" ", "")
            if not re.match(r"^FR\d{12}[A-Z0-9]{11}\d{2}$", clean_iban):
                return ValidationResult(coherent=False, anomalie="iban_malforme")
        
        if data.bic:
            if not re.match(r"^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$", data.bic):
                return ValidationResult(coherent=False, anomalie="bic_malforme")

    try:
       
        date_ech = datetime.strptime(data.date_echeance, "%d/%m/%Y")
        date_emi = datetime.strptime(data.date_emission, "%d/%m/%Y")
        
    
        if date_ech < date_emi:
            return ValidationResult(coherent=False, anomalie="echeance_depassee")
            
        
        if data.type == "attestation":
            if date_ech < datetime.now():
                return ValidationResult(coherent=False, anomalie="echeance_depassee")
                
    except (ValueError, TypeError):
        return ValidationResult(coherent=False, anomalie="format_date_invalide")

    return ValidationResult(coherent=True, anomalie=None)


async def check_cross_document_coherence(current_doc: ExtractedData, db_collection) -> str:
    """
    Règle de cohérence croisée : Vérifie en base si les documents liés existent.
    """
    if current_doc.type == "facture":
        existing_attestation = await db_collection.find_one(
            {
                "clean_zone.fournisseur_siret": current_doc.fournisseur_siret,
                "clean_zone.type": "attestation",
                "curated_zone.coherent": True
            },
            sort=[("upload_date", -1)]
        )
        
        if not existing_attestation:
            return "attestation_manquante"

    return None