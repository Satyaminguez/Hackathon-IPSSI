import os
from pathlib import Path
from PIL import Image

TEMP_DIR = Path("temp_images")
TEMP_DIR.mkdir(exist_ok=True)


def load_image(path: Path) -> Image.Image:
    """
    Charge une image depuis un fichier.
    Convertit automatiquement en niveaux de gris.
    """
    img = Image.open(path)

    # Convertir en niveaux de gris pour OCR
    img = img.convert("L")

    return img


def save_temp_image(img: Image.Image, index: int) -> str:
    """
    Sauvegarde une image temporaire (utilisé pour les pages PDF).
    Retourne le chemin du fichier temporaire.
    """
    temp_path = TEMP_DIR / f"page_{index}.png"
    img.save(temp_path)
    return str(temp_path)