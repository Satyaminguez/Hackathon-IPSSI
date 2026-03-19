import re
from datetime import datetime

def extract_dates(text: str):
    """
    Extrait toutes les dates au format JJ/MM/AAAA.
    Retourne une liste de dates normalisées.
    """

    pattern = r"\b(\d{2}/\d{2}/\d{4})\b"
    matches = re.findall(pattern, text)

    dates = []
    for d in matches:
        try:
            parsed = datetime.strptime(d, "%d/%m/%Y").date()
            dates.append(str(parsed))
        except:
            pass

    return dates if dates else None