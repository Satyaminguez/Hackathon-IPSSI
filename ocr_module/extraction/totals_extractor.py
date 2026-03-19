import re

def extract_totals(text: str):
    """
    Extrait les montants HT, TVA et TTC.
    Retourne un dict avec les valeurs trouvées.
    """

    # Formats possibles : 12 345,67 € | 12345.67 | 12345,67
    amount_pattern = r"(\d{1,3}(?:[ \.,]\d{3})*(?:[\,\.]\d{2}))"

    results = {
        "total_ht": None,
        "tva": None,
        "total_ttc": None
    }

    # Total HT
    ht_match = re.search(r"(total ht|ht)\D*" + amount_pattern, text.lower())
    if ht_match:
        results["total_ht"] = ht_match.group(2).replace(" ", "").replace(",", ".")

    # TVA
    tva_match = re.search(r"(tva)\D*" + amount_pattern, text.lower())
    if tva_match:
        results["tva"] = tva_match.group(2).replace(" ", "").replace(",", ".")

    # Total TTC
    ttc_match = re.search(r"(total ttc|ttc)\D*" + amount_pattern, text.lower())
    if ttc_match:
        results["total_ttc"] = ttc_match.group(2).replace(" ", "").replace(",", ".")

    return results