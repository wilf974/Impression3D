"""
STL Export Utilities
"""

import numpy as np
import trimesh
from pathlib import Path
from typing import Union


def export_to_stl(
    vertices: np.ndarray,
    faces: np.ndarray,
    output_path: Union[str, Path],
    binary: bool = True,
) -> Path:
    """
    Export mesh to STL file

    Args:
        vertices: Vertex coordinates (N, 3)
        faces: Face indices (M, 3)
        output_path: Path to save STL file
        binary: Save as binary STL (smaller file size)

    Returns:
        Path: Path to saved STL file
    """
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    # Ensure output has .stl extension
    if output_path.suffix.lower() != ".stl":
        output_path = output_path.with_suffix(".stl")

    # Create trimesh object
    mesh = trimesh.Trimesh(vertices=vertices, faces=faces)

    # Clean mesh
    mesh.remove_duplicate_faces()
    mesh.remove_degenerate_faces()
    mesh.fix_normals()

    # Export to STL
    mesh.export(str(output_path), file_type="stl_ascii" if not binary else "stl")

    return output_path


def validate_stl(file_path: Union[str, Path]) -> dict:
    """
    Validate STL file

    Args:
        file_path: Path to STL file

    Returns:
        dict: Validation results
    """
    mesh = trimesh.load(str(file_path))

    is_watertight = mesh.is_watertight
    is_valid = mesh.is_valid
    volume = mesh.volume if is_watertight else None
    bounds = mesh.bounds.tolist()

    return {
        "is_watertight": is_watertight,
        "is_valid": is_valid,
        "volume": volume,
        "bounds": bounds,
        "num_vertices": len(mesh.vertices),
        "num_faces": len(mesh.faces),
    }
