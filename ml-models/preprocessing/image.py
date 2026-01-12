"""
Image Preprocessing Utilities
"""

import numpy as np
from PIL import Image
from typing import Tuple, Union
from pathlib import Path


def load_and_preprocess_image(
    image_path: Union[str, Path, Image.Image],
    target_size: Tuple[int, int] = (512, 512),
    remove_background: bool = False,
) -> np.ndarray:
    """
    Load and preprocess image for 3D generation

    Args:
        image_path: Path to image or PIL Image
        target_size: Target size (width, height)
        remove_background: Remove background (requires rembg)

    Returns:
        Preprocessed image as numpy array
    """
    # Load image
    if isinstance(image_path, (str, Path)):
        image = Image.open(image_path).convert("RGB")
    elif isinstance(image_path, Image.Image):
        image = image.convert("RGB")
    else:
        raise ValueError("Invalid image input")

    # Remove background if requested
    if remove_background:
        try:
            from rembg import remove
            image = remove(image)
        except ImportError:
            print("Warning: rembg not installed, skipping background removal")

    # Resize to target size
    image = image.resize(target_size, Image.LANCZOS)

    # Convert to numpy array
    image_np = np.array(image).astype(np.float32) / 255.0

    return image_np


def center_and_crop_image(
    image: Union[np.ndarray, Image.Image],
    output_size: int = 512,
) -> np.ndarray:
    """
    Center and crop image to square

    Args:
        image: Input image
        output_size: Output size (square)

    Returns:
        Centered and cropped image
    """
    if isinstance(image, np.ndarray):
        image = Image.fromarray((image * 255).astype(np.uint8))

    # Get dimensions
    width, height = image.size

    # Calculate crop box for center square
    size = min(width, height)
    left = (width - size) // 2
    top = (height - size) // 2
    right = left + size
    bottom = top + size

    # Crop to center square
    image = image.crop((left, top, right, bottom))

    # Resize to output size
    image = image.resize((output_size, output_size), Image.LANCZOS)

    return np.array(image).astype(np.float32) / 255.0


def normalize_image(
    image: np.ndarray,
    mean: Tuple[float, float, float] = (0.485, 0.456, 0.406),
    std: Tuple[float, float, float] = (0.229, 0.224, 0.225),
) -> np.ndarray:
    """
    Normalize image with mean and std

    Args:
        image: Input image (0-1 range)
        mean: Mean values for each channel
        std: Standard deviation for each channel

    Returns:
        Normalized image
    """
    mean = np.array(mean).reshape(1, 1, 3)
    std = np.array(std).reshape(1, 1, 3)

    normalized = (image - mean) / std

    return normalized
