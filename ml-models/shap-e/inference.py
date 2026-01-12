"""
Shap-E Inference Pipeline
"""

from pathlib import Path
from typing import Union


def run_shap_e_inference(
    prompt: str,
    output_path: Union[str, Path],
    quality: str = "medium",
    device: str = "cuda:0",
) -> dict:
    """
    Run Shap-E inference and export STL

    Args:
        prompt: Text description
        output_path: Path to save STL file
        quality: Generation quality
        device: Device to run on

    Returns:
        dict: Result metadata
    """
    from .model import ShapEModel
    from ..postprocessing.stl_export import export_to_stl

    # Initialize model
    model = ShapEModel(device=device)

    # Generate 3D mesh
    vertices, faces = model.generate(prompt, quality=quality)

    # Export to STL
    stl_path = export_to_stl(vertices, faces, output_path)

    # Calculate statistics
    num_vertices = len(vertices)
    num_faces = len(faces)
    file_size = Path(stl_path).stat().st_size

    return {
        "stl_path": str(stl_path),
        "prompt": prompt,
        "num_vertices": num_vertices,
        "num_faces": num_faces,
        "file_size_bytes": file_size,
    }
