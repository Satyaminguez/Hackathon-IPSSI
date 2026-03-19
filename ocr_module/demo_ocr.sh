#!/bin/bash

echo "----------------------------------------"
echo "      DEMO OCR - Hackathon Silver Zone"
echo "----------------------------------------"
echo ""

# Chemin du PDF à analyser
PDF_PATH="tests/samples/FAC-2025-6064_35600000000048.pdf"

# Dossier de sortie
OUTPUT_DIR="output_demo"

# Création du dossier si nécessaire
mkdir -p "$OUTPUT_DIR"

echo "📄 Fichier analysé : $PDF_PATH"
echo "📁 Dossier de sortie : $OUTPUT_DIR"
echo ""

# Exécution du module OCR
echo "🚀 Lancement de l'OCR..."
python ocr_module.py "$PDF_PATH" --output "$OUTPUT_DIR"

echo ""
echo "----------------------------------------"
echo "        OCR TERMINÉ ✔"
echo "Résultat disponible dans : $OUTPUT_DIR/ocr_result.json"
echo "----------------------------------------"
echo ""

# Pause pour garder la fenêtre ouverte
read -p "Appuyez sur Entrée pour fermer la fenêtre..."