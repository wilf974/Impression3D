"""Shap-E model wrapper"""

from .model import ShapEModel
from .inference import run_shap_e_inference

__all__ = ["ShapEModel", "run_shap_e_inference"]
