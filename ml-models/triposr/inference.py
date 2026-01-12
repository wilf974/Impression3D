"""
TripoSR Inference Pipeline
"""

from pathlib import Path
from typing import Union
import numpy as np
from PIL import Image


def run_triposr_inference(
    image_path: Union[str, Path],
    output_path: Union[str, Path],
    quality: str = "medium",
    device: str = "cuda:0",
) -> dict:
    """
    Run TripoSR inference and export STL

    Args:
        image_path: Path to input image
        output_path: Path to save STL file
        quality: Generation quality
        device: Device to run on

    Returns:
        dict: Result metadata
    """
    from .model import TripoSRModel
    from ..postprocessing.stl_export import export_to_stl

    # Initialize model
    model = TripoSRModel(device=device)

    # Load image
    image = Image.open(image_path).convert("RGB")

    # Generate 3D mesh
    vertices, faces = model.generate(image, quality=quality)

    # Export to STL
    stl_path = export_to_stl(vertices, faces, output_path)

    # Calculate statistics
    num_vertices = len(vertices)
    num_faces = len(faces)
    file_size = Path(stl_path).stat().st_size

    return {
        "stl_path": str(stl_path),
        "num_vertices": num_vertices,
        "num_faces": num_faces,
        "file_size_bytes": file_size,
    }
