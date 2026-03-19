from PIL import Image, ImageEnhance, ImageFilter

def enhance_contrast(img: Image.Image, factor: float = 1.5) -> Image.Image:
    """
    Augmente le contraste de l'image.
    """
    enhancer = ImageEnhance.Contrast(img)
    return enhancer.enhance(factor)


def enhance_sharpness(img: Image.Image, factor: float = 2.0) -> Image.Image:
    """
    Augmente la netteté de l'image.
    """
    enhancer = ImageEnhance.Sharpness(img)
    return enhancer.enhance(factor)


def denoise(img: Image.Image) -> Image.Image:
    """
    Réduit le bruit avec un filtre médian.
    """
    return img.filter(ImageFilter.MedianFilter(size=3))