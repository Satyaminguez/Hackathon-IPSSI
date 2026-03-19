# Module OCR – Abraham – Hackathon MIA 2026

## 🎯 Objectif

Fournir un **module OCR robuste, modulaire et industrialisable** pour traiter les documents (PDF, images, TXT) et produire un texte exploitable dans le pipeline (Silver Zone → MongoDB → extraction entités → dashboard).

---

## 📦 Fonctionnalités

- Support multi-formats : **PDF, PNG, JPG, TIFF, TXT**
- Prétraitement automatique :
  - niveaux de gris
  - contraste ×1.5
  - netteté ×2.0
  - filtre médian anti-bruit
- OCR Tesseract (**français + anglais**)
- Classification :
  - facture / devis / attestation / autre
- Extraction légère :
  - SIRET
  - IBAN / BIC
  - dates
  - montants HT / TVA / TTC
- Export :
  - JSON (Silver Zone)
  - CSV
  - TXT
- Logging + statistiques

---

## 🛠 Prérequis

- Python 3.10+
- Tesseract installé
- Poppler (pour PDF → images)

---

## 🚀 Utilisation

### Fichier unique

```bash
python3 ocr_module.py facture_001.pdf --single --output output/