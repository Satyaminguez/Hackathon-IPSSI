from copy import deepcopy
from pathlib import Path

import fitz
from PIL import Image, ImageFilter


class ImageGeneratorError(Exception):
    """Erreur liee a la generation des variantes image."""


def construire_doc_id_image(doc_id, variante):
    return f"{doc_id}-img-{variante}"


def convertir_pdf_en_image(pdf_path, image_path):
    pdf_path = Path(pdf_path)
    image_path = Path(image_path)
    image_path.parent.mkdir(parents=True, exist_ok=True)

    try:
        with fitz.open(pdf_path) as document_pdf:
            if document_pdf.page_count == 0:
                raise ImageGeneratorError(f"Le PDF {pdf_path.name} ne contient aucune page.")

            page = document_pdf.load_page(0)
            # x2 garde un rendu net sans faire exploser la taille des images
            matrice = fitz.Matrix(2, 2)
            pixmap = page.get_pixmap(matrix=matrice, alpha=False)
            pixmap.save(str(image_path))
    except Exception as error:
        raise ImageGeneratorError(
            f"Impossible de convertir le PDF {pdf_path.name} en image."
        ) from error

    if not image_path.exists():
        raise ImageGeneratorError(f"L'image {image_path.name} n'a pas ete creee.")

    return image_path


def appliquer_rotation_legere(image):
    return image.rotate(3, expand=True, fillcolor="white")


def appliquer_rotation_moyenne(image):
    return image.rotate(7, expand=True, fillcolor="white")


def appliquer_flou(image):
    return image.filter(ImageFilter.GaussianBlur(radius=1.5))


def appliquer_pixelisation(image):
    image_rgb = image.convert("RGB")
    largeur, hauteur = image_rgb.size
    image_reduite = image_rgb.resize((max(1, largeur // 8), max(1, hauteur // 8)), Image.Resampling.BILINEAR)
    return image_reduite.resize((largeur, hauteur), Image.Resampling.NEAREST)


def construire_metadata_image(metadata_pdf, image_path, variante):
    metadata_image = deepcopy(metadata_pdf)
    metadata_image["doc_id"] = construire_doc_id_image(metadata_pdf["doc_id"], variante)
    metadata_image["chemin_fichier"] = str(image_path)
    return metadata_image


def generer_variantes_image(metadata_pdf, image_dir):
    image_dir = Path(image_dir)
    image_dir.mkdir(parents=True, exist_ok=True)

    pdf_path = Path(metadata_pdf["chemin_fichier"])
    base_nom = pdf_path.stem
    image_clean_path = image_dir / f"{base_nom}-img-clean.jpg"
    convertir_pdf_en_image(pdf_path, image_clean_path)

    metadata_images = [construire_metadata_image(metadata_pdf, image_clean_path, "clean")]

    with Image.open(image_clean_path) as image_source:
        image_base = image_source.convert("RGB")

        # On part toujours de la version clean pour garder des variantes comparables
        variantes = {
            "rotation_legere": appliquer_rotation_legere(image_base),
            "rotation_moyenne": appliquer_rotation_moyenne(image_base),
            "flou": appliquer_flou(image_base),
            "pixelisation": appliquer_pixelisation(image_base),
        }

        for variante, image_variante in variantes.items():
            image_path = image_dir / f"{base_nom}-img-{variante}.jpg"
            image_variante.save(image_path, format="JPEG", quality=90)
            metadata_images.append(construire_metadata_image(metadata_pdf, image_path, variante))

    return metadata_images
