"""
model/loader.py — Singleton model loader
=========================================
Loads the fine-tuned SentenceTransformer model ONCE at application startup
and exposes it via `get_model()`.

WHERE THE MODEL IS USED:
  - This module is the ONLY place the trained model is loaded from disk.
  - Other modules import `get_model()` to obtain the already-loaded instance.
"""

from __future__ import annotations

from typing import Optional
from sentence_transformers import SentenceTransformer
import os
import logging

logger = logging.getLogger(__name__)

# ──────────────────────────────────────────────────────────────
# Module-level singleton: the model is loaded exactly once when
# this module is first imported and then reused for every request.
# ──────────────────────────────────────────────────────────────
_model: Optional[SentenceTransformer] = None


def load_model(model_path: Optional[str] = None) -> SentenceTransformer:
    """
    Load the SentenceTransformer model from `model_path`.

    Args:
        model_path: Absolute or relative path to the model directory.
                    Defaults to  "../careerpilot_model"  (relative to *this* file),
                    which points to <project_root>/careerpilot_model.

    Returns:
        A ready-to-use SentenceTransformer instance.
    """
    global _model

    if _model is not None:
        logger.info("Model already loaded — returning cached instance.")
        return _model

    if model_path is None:
        # Resolve: backend/model/loader.py  →  ../../careerpilot_model
        model_path = os.path.join(
            os.path.dirname(__file__),  # backend/model/
            "..",                        # backend/
            "..",                        # project root
            "careerpilot_model",
        )

    model_path = os.path.abspath(model_path)
    logger.info("Loading SentenceTransformer model from: %s", model_path)

    if not os.path.isdir(model_path):
        raise FileNotFoundError(
            f"Model directory not found at '{model_path}'. "
            "Make sure your trained model is placed there."
        )

    _model = SentenceTransformer(model_path)
    logger.info("✅ Model loaded successfully  (embedding dim = %s)", _model.get_sentence_embedding_dimension())
    return _model


def get_model() -> SentenceTransformer:
    """
    Return the already-loaded model singleton.
    Raises RuntimeError if load_model() has not been called yet.
    """
    if _model is None:
        raise RuntimeError(
            "Model not loaded. Call load_model() at app startup first."
        )
    return _model
