import pytesseract
from PIL import Image
from .config import TESSERACT_LANG

def run_ocr(image, lang: str = TESSERACT_LANG) -> str:
    if not isinstance(image, Image.Image):
        image = Image.fromarray(image)
    return pytesseract.image_to_string(image, lang=lang)