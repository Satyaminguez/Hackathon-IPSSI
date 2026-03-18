from pdf2image import convert_from_path
from .config import PDF_DPI

def pdf_to_images(pdf_path: str):
    return convert_from_path(pdf_path, dpi=PDF_DPI)