import os
import sys
import json
import traceback
from datetime import datetime

from pdf2image import convert_from_path
import pytesseract
from PIL import Image

import cv2
import numpy as np

from extractor import SilverExtractor


# ---------------------------------------------------------
# CONFIG
# ---------------------------------------------------------
POPPLER_PATH = r"C:\poppler-25.12.0\Library\bin"
TESSERACT_PATH = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

pytesseract.pytesseract.tesseract_cmd = TESSERACT_PATH


# ---------------------------------------------------------
# LOGGING
# ---------------------------------------------------------
def log(msg):
    print(f"[OCR] {msg}")


# ---------------------------------------------------------
# PDF → IMAGES
# ---------------------------------------------------------
def pdf_to_images(pdf_path):
    log(f"Conversion PDF → images : {pdf_path}")

    if not os.path.exists(pdf_path):
        raise FileNotFoundError(f"PDF introuvable : {pdf_path}")

    try:
        images = convert_from_path(
            pdf_path,
            poppler_path=POPPLER_PATH
        )
        log(f"  → {len(images)} page(s) convertie(s)")
        return images

    except Exception as e:
        log("ERREUR : échec de la conversion PDF → images")
        log(str(e))
        traceback.print_exc()
        return []


# ---------------------------------------------------------
# PRÉTRAITEMENT D’IMAGE
# ---------------------------------------------------------
def preprocess_pil_image(pil_img):
    img = np.array(pil_img)

    if img.ndim == 3:
        img = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)

    img = cv2.GaussianBlur(img, (3, 3), 0)

    img = cv2.adaptiveThreshold(
        img, 255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY,
        31, 10
    )

    img = cv2.resize(img, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)

    return Image.fromarray(img)


# ---------------------------------------------------------
# OCR SUR UNE IMAGE
# ---------------------------------------------------------
def ocr_image(img):
    try:
        img = preprocess_pil_image(img)

        custom_config = "--oem 1 --psm 6"
        text = pytesseract.image_to_string(img, lang="fra", config=custom_config)

        data = pytesseract.image_to_data(
            img,
            output_type=pytesseract.Output.DICT,
            config=custom_config
        )
        conf = [int(c) for c in data["conf"] if c != "-1"]
        avg_conf = sum(conf) / len(conf) if conf else 0

        return text, avg_conf

    except Exception as e:
        log("ERREUR OCR sur une image")
        log(str(e))
        traceback.print_exc()
        return "", 0


# ---------------------------------------------------------
# OCR COMPLET SUR UN PDF
# ---------------------------------------------------------
def ocr_pdf(pdf_path):
    images = pdf_to_images(pdf_path)

    if not images:
        return {
            "success": False,
            "pages": 0,
            "avg_conf": 0,
            "text": ""
        }

    all_text = []
    confs = []

    for i, img in enumerate(images):
        log(f"OCR page {i+1}/{len(images)}")
        text, conf = ocr_image(img)
        all_text.append(text)
        confs.append(conf)

    avg_conf = sum(confs) / len(confs) if confs else 0

    return {
        "success": True,
        "pages": len(images),
        "avg_conf": avg_conf,
        "text": "\n".join(all_text)
    }


# ---------------------------------------------------------
# MAIN
# ---------------------------------------------------------
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python ocr_module.py <pdf_path> [--output <folder>]")
        sys.exit(1)

    pdf_path = sys.argv[1]
    output_folder = "output"

    if "--output" in sys.argv:
        output_folder = sys.argv[sys.argv.index("--output") + 1]

    os.makedirs(output_folder, exist_ok=True)

    log("=== DÉBUT OCR ===")
    ocr_result = ocr_pdf(pdf_path)

    # Extraction Silver Zone
    extractor = SilverExtractor(ocr_result["text"], pdf_path)
    extraction = extractor.extract_all()

    final_json = {
        "ocr": ocr_result,
        "extraction": extraction
    }

    out_path = os.path.join(output_folder, "ocr_result.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(final_json, f, indent=4, ensure_ascii=False)

    log(f"Résultat enregistré dans : {out_path}")

    log("=== OCR STATS ===")
    log(f"Success : {ocr_result['success']}")
    log(f"Pages   : {ocr_result['pages']}")
    log(f"Conf    : {ocr_result['avg_conf']:.2f}%")
    log("=================")