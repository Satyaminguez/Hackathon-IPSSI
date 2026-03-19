from classification.invoice_detector import is_invoice
from classification.devis_detector import is_devis
from classification.attestation_detector import is_attestation


def classify_document(text: str) -> str:
    """
    Classification principale.
    Retourne: facture | devis | attestation | autre
    """

    text_lower = text.lower()

    if is_invoice(text_lower):
        return "facture"

    if is_devis(text_lower):
        return "devis"

    if is_attestation(text_lower):
        return "attestation"

    return "autre"