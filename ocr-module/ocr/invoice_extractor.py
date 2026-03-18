import re
from .postprocess import clean_text

def extract_dates(text: str):
    patterns = [
        r"\b\d{2}/\d{2}/\d{4}\b",
        r"\b\d{4}-\d{2}-\d{2}\b",
    ]
    dates = []
    for p in patterns:
        dates.extend(re.findall(p, text))
    return list(set(dates))

def extract_amounts(text: str):
    pattern = r"\b\d{1,3}(?:[ .]\d{3})*(?:,\d{2})?\b"
    return re.findall(pattern, text)

def extract_tva(text: str):
    pattern = r"TVA[: ]+(\d{1,3}(?:,\d{2})?)"
    match = re.search(pattern, text, re.IGNORECASE)
    return match.group(1) if match else None

def extract_total(text: str):
    pattern = r"(Total(?: TTC)?|Montant TTC)[: ]+(\d{1,3}(?:[ .]\d{3})*(?:,\d{2})?)"
    match = re.search(pattern, text, re.IGNORECASE)
    return match.group(2) if match else None

def extract_invoice_data(raw_text: str):
    text = clean_text(raw_text)
    return {
        "dates": extract_dates(text),
        "amounts": extract_amounts(text),
        "tva": extract_tva(text),
        "total": extract_total(text),
        "raw_text": text,
    }