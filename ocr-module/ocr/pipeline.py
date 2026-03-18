from .pdf_utils import pdf_to_images
from .preprocess import preprocess_image
from .ocr_engine import run_ocr
from .invoice_extractor import extract_invoice_data

def process_invoice(pdf_path: str):
    pages = pdf_to_images(pdf_path)
    texts = []

    for page in pages:
        processed = preprocess_image(page)
        text = run_ocr(processed)
        texts.append(text)

    full_text = "\n".join(texts)
    data = extract_invoice_data(full_text)
    return data