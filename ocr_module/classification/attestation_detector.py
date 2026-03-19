import re

def is_attestation(text: str) -> bool:
    """
    Détecte une attestation URSSAF ou administrative.
    """

    keywords = [
        "urssaf", "attestation", "cotisations", "certifie que",
        "attestation de vigilance", "organisme"
    ]

    if any(k in text for k in keywords):
        return True

    # Référence attestation : ATT-2026-XXXX
    if re.search(r"(att[-\s]?\d{4}[-\s]?\d+)", text):
        return True

    return False