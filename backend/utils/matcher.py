"""
utils/matcher.py — Resume ↔ Job matching with the trained model
================================================================
This is where the trained SentenceTransformer model is ACTIVELY USED:

  1. Encode the resume text  → 384-dim embedding vector
  2. Encode the job text     → 384-dim embedding vector
  3. Compute cosine similarity between the two vectors
  4. Scale the raw similarity (–1 … 1) to a human-friendly 0–100 score

FLOW:
  request JSON  →  app.py  →  compute_match_score()  →  model.encode()
                                                       →  cosine_similarity
                                                       →  score 0–100
"""

from sentence_transformers import util as st_util
from model.loader import get_model
import logging

logger = logging.getLogger(__name__)


def compute_match_score(resume_text: str, job_text: str) -> float:
    """
    Compute a 0–100 match score between a resume and a job description.

    Under the hood:
      • The trained SentenceTransformer encodes both texts into dense
        384-dimensional vectors.
      • Cosine similarity measures directional alignment of the two
        vectors (–1 = opposite, 0 = orthogonal, 1 = identical).
      • We clamp and rescale this to a 0–100 percentage.

    Args:
        resume_text: The candidate's resume as plain text.
        job_text:    The target job description as plain text.

    Returns:
        A float score between 0.0 and 100.0.
    """
    model = get_model()

    # ── Step 1 & 2: Encode both texts into embedding vectors ─────────
    # model.encode() tokenises the text, runs it through the fine-tuned
    # BERT backbone, applies mean-pooling, and L2-normalises the result.
    resume_embedding = model.encode(resume_text, convert_to_tensor=True)
    job_embedding = model.encode(job_text, convert_to_tensor=True)

    # ── Step 3: Cosine similarity ────────────────────────────────────
    cosine_sim = st_util.cos_sim(resume_embedding, job_embedding).item()

    # ── Step 4: Scale to 0–100 ───────────────────────────────────────
    # Clamp first (similarity can theoretically be negative)
    clamped = max(0.0, min(1.0, cosine_sim))
    score = round(clamped * 100, 2)

    logger.info(
        "Match computed  |  raw_cosine=%.4f  →  score=%s",
        cosine_sim, score,
    )
    return score
