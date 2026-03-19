import fitz  # PyMuPDF (Ne nécessite PAS Poppler !)
import pytesseract
from PIL import Image
import os
import io
from typing import Dict, Any

# On importe la classe de ton ami qu'on vient de sauvegarder !
from services.extractor import SilverExtractor

# Configuration Tesseract absolue pour Windows
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
os.environ["TESSDATA_PREFIX"] = r"C:\Program Files\Tesseract-OCR\tessdata"

async def process_document_native(file_content: bytes, filename: str) -> Dict[str, Any]:
    """
    Lit le document, fait l'OCR, et passe le texte à l'extracteur Silver.
    """
    full_text = ""
    
    # 1. Lecture de l'image ou du PDF (Directement en mémoire RAM)
    if filename.lower().endswith(".pdf"):
        # PyMuPDF est magique : il lit le PDF sans logiciel externe
        with fitz.open(stream=file_content, filetype="pdf") as doc:
            for page in doc:
                pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
                img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
                text = pytesseract.image_to_string(img, lang="fra")
                full_text += text + "\n"
    else:
        # Si c'est déjà une image
        img = Image.open(io.BytesIO(file_content))
        full_text = pytesseract.image_to_string(img, lang="fra")

    # 2. On passe le texte brut à la classe de ton ami
    extractor = SilverExtractor(full_text, filename)
    result = extractor.extract_all()
    
    return result