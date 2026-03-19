import re

def extract_siret(text: str):
    """
    Extrait un SIRET (14 chiffres).
    Retourne le premier SIRET trouvé ou None.
    """

    match = re.search(r"\b(\d{14})\b", text)
    return match.group(1) if match else None