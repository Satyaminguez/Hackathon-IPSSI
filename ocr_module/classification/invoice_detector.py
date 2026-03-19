import re

def is_invoice(text: str) -> bool:
    """
    Détecte si un document est une facture.
    Basé sur mots-clés + patterns financiers.
    """

    keywords = [
        "facture", "invoice", "total ht", "total ttc", "tva",
        "montant dû", "siret", "iban", "bic"
    ]

    if any(k in text for k in keywords):
        return True

    # Numéro de facture typique : FAC-2026-XXXX
    if re.search(r"(fac[-\s]?\d{4}[-\s]?\d+)", text):
        return True

    # Montants typiques
    if re.search(r"\d+\s?€", text):
        return True

    return False