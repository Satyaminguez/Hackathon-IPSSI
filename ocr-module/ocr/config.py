import os

TESSERACT_LANG = "fra"
PDF_DPI = 300

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTPUT_JSON_DIR = os.path.join(BASE_DIR, "output", "json")

os.makedirs(OUTPUT_JSON_DIR, exist_ok=True)