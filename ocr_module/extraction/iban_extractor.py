import re

def extract_iban(text: str):
    """
    Extrait un IBAN (FR ou international).
    Retourne l'IBAN trouvé ou None.
    """

    # IBAN FR : FR76 1234 5678 9012 3456 7890 123
    iban_pattern = r"\b([A-Z]{2}\d{2}[A-Z0-9]{10,30})\b"

    match = re.search(iban_pattern, text.replace(" ", ""))
    return match.group(1) if match else None


def extract_bic(text: str):
    """
    Extrait un code BIC (8 ou 11 caractères).
    """

    bic_pattern = r"\b([A-Z0-9]{8}(?:[A-Z0-9]{3})?)\b"
    match = re.search(bic_pattern, text)
    return match.group(1) if match else None