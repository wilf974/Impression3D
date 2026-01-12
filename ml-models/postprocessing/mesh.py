"""
Mesh Processing Utilities
"""

import numpy as np
import trimesh
from typing import Tuple, Optional


def clean_mesh(
    vertices: np.ndarray,
    faces: np.ndarray,
    remove_duplicates: bool = True,
    fix_normals: bool = True,
    fill_holes: bool = True,
) -> Tuple[np.ndarray, np.ndarray]:
    """
    Clean and repair mesh

    Args:
        vertices: Vertex coordinates
        faces: Face indices
        remove_duplicates: Remove duplicate vertices and faces
        fix_normals: Fix face normals
        fill_holes: Fill small holes

    Returns:
        Tuple of cleaned vertices and faces
    """
    mesh = trimesh.Trimesh(vertices=vertices, faces=faces)

    # Remove duplicate vertices and faces
    if remove_duplicates:
        mesh.merge_vertices()
        mesh.remove_duplicate_faces()

    # Remove degenerate faces
    mesh.remove_degenerate_faces()

    # Fix normals
    if fix_normals:
        mesh.fix_normals()

    # Fill holes
    if fill_holes:
        mesh.fill_holes()

    return mesh.vertices, mesh.faces


def simplify_mesh(
    vertices: np.ndarray,
    faces: np.ndarray,
    target_faces: Optional[int] = None,
    target_percent: Optional[float] = None,
) -> Tuple[np.ndarray, np.ndarray]:
    """
    Simplify mesh by reducing polygon count

    Args:
        vertices: Vertex coordinates
        faces: Face indices
        target_faces: Target number of faces
        target_percent: Target percentage of original faces (0-1)

    Returns:
        Tuple of simplified vertices and faces
    """
    mesh = trimesh.Trimesh(vertices=vertices, faces=faces)

    if target_faces is not None:
        simplified = mesh.simplify_quadric_decimation(target_faces)
    elif target_percent is not None:
        target = int(len(mesh.faces) * target_percent)
        simplified = mesh.simplify_quadric_decimation(target)
    else:
        # Default: reduce to 50% of faces
        target = len(mesh.faces) // 2
        simplified = mesh.simplify_quadric_decimation(target)

    return simplified.vertices, simplified.faces


def ensure_watertight(
    vertices: np.ndarray,
    faces: np.ndarray,
) -> Tuple[np.ndarray, np.ndarray]:
    """
    Ensure mesh is watertight

    Args:
        vertices: Vertex coordinates
        faces: Face indices

    Returns:
        Tuple of watertight mesh vertices and faces
    """
    mesh = trimesh.Trimesh(vertices=vertices, faces=faces)

    if not mesh.is_watertight:
        # Fill holes
        mesh.fill_holes()

        # If still not watertight, try convex hull as last resort
        if not mesh.is_watertight:
            mesh = mesh.convex_hull

    return mesh.vertices, mesh.faces


def scale_mesh(
    vertices: np.ndarray,
    faces: np.ndarray,
    target_size_mm: float = 100.0,
) -> Tuple[np.ndarray, np.ndarray]:
    """
    Scale mesh to target size in millimeters

    Args:
        vertices: Vertex coordinates
        faces: Face indices
        target_size_mm: Target size in mm (largest dimension)

    Returns:
        Tuple of scaled vertices and faces
    """
    mesh = trimesh.Trimesh(vertices=vertices, faces=faces)

    # Get current largest dimension
    current_size = max(mesh.extents)

    # Calculate scale factor
    scale_factor = target_size_mm / current_size

    # Scale mesh
    mesh.apply_scale(scale_factor)

    return mesh.vertices, mesh.faces
