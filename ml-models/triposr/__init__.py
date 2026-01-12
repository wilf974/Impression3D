"""TripoSR model wrapper"""

from .model import TripoSRModel
from .inference import run_triposr_inference

__all__ = ["TripoSRModel", "run_triposr_inference"]
