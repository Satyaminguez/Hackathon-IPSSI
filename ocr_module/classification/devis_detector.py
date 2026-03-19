import re

def is_devis(text: str) -> bool:
    """
    Détecte si un document est un devis.
    """

    keywords = [
        "devis", "proposition commerciale", "estimation",
        "validité du devis", "bon pour accord"
    ]

    if any(k in text for k in keywords):
        return True

    # Numéro de devis typique : DEV-2026-XXXX
    if re.search(r"(dev[-\s]?\d{4}[-\s]?\d+)", text):
        return True

    return False