from ocr.pipeline import process_invoice
import json

def main():
    pdf_path = "samples/facture.pdf"
    result = process_invoice(pdf_path)
    print(json.dumps(result, indent=4, ensure_ascii=False))

if __name__ == "__main__":
    main()