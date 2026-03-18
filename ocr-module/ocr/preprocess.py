import cv2
import numpy as np
from PIL import Image

def preprocess_image(pil_image: Image.Image):
    img = cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2GRAY)
    img = cv2.threshold(img, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]
    return img