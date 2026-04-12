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
from typing import List, Dict

logger = logging.getLogger(__name__)


def _expand_job_text(job_text: str) -> str:
    """
    If the job text is a short title (e.g. "data scientist"), expand it
    into a skill-rich description so the SentenceTransformer can produce
    a meaningful cosine similarity against a skills list.

    Uses the role_skill_map to look up required skills and constructs a
    fuller job description string.
    """
    # Only expand short inputs (job titles, not full JDs)
    if len(job_text.split()) > 15:
        return job_text

    try:
        from data.role_skill_map import role_skill_map, resolve_role_key
        role_key = resolve_role_key(job_text)
        if role_key and role_key in role_skill_map:
            skills = list(role_skill_map[role_key].keys())
            expanded = (
                f"{job_text}. "
                f"A {job_text} requires skills in: {', '.join(skills)}. "
                f"Key competencies include {', '.join(skills[:6])}."
            )
            logger.debug("Expanded job text: '%s' → '%s'", job_text, expanded[:80])
            return expanded
    except Exception as e:
        logger.debug("Job expansion failed (using original): %s", e)

    return job_text


def _keyword_coverage_score(resume_text: str, job_text: str) -> float:
    """
    Compute what percentage of the job's required skills appear in the
    user's skill list using keyword matching.

    Returns a float 0.0–1.0 representing coverage.
    """
    try:
        from data.role_skill_map import role_skill_map, resolve_role_key
        role_key = resolve_role_key(job_text)
        if not role_key or role_key not in role_skill_map:
            return -1.0  # signal: no role mapping available

        required_skills = role_skill_map[role_key]
        resume_lower = resume_text.lower()

        matched = 0
        total_weight = 0.0
        for skill_name, skill_info in required_skills.items():
            weight = skill_info.get("importance_weight", 0.5)
            total_weight += weight
            # Check if the skill (or a close variant) appears in the resume
            skill_lower = skill_name.lower()
            if skill_lower in resume_lower:
                matched += weight
            else:
                # Check individual words for multi-word skills
                words = skill_lower.split()
                if len(words) > 1 and all(w in resume_lower for w in words):
                    matched += weight * 0.8  # partial credit

        if total_weight == 0:
            return 0.0
        return matched / total_weight
    except Exception as e:
        logger.debug("Keyword coverage failed: %s", e)
        return -1.0


def compute_match_score(resume_text: str, job_text: str) -> float:
    """
    Compute a 0–100 match score between a resume and a job description.

    Uses a HYBRID approach:
      1. **Keyword coverage** (70% weight): What percentage of the job's
         required skills appear in the user's skill list.
      2. **Semantic similarity** (30% weight): SentenceTransformer cosine
         similarity between resume text and expanded job description.

    This gives realistic, interpretable scores:
      - User with 4/14 DS skills → ~40%
      - User with 8/14 DS skills → ~65%
      - User with 12/14 DS skills → ~85%

    Falls back to pure semantic similarity if no role mapping is available.

    Args:
        resume_text: The candidate's skills / resume as plain text.
        job_text:    The target job description or title.

    Returns:
        A float score between 0.0 and 100.0.
    """
    model = get_model()

    # ── 1. Keyword coverage score ────────────────────────────────────
    keyword_score = _keyword_coverage_score(resume_text, job_text)
    has_keyword_score = keyword_score >= 0

    # ── 2. Semantic similarity score ─────────────────────────────────
    expanded_job = _expand_job_text(job_text)
    resume_embedding = model.encode(resume_text, convert_to_tensor=True)
    job_embedding = model.encode(expanded_job, convert_to_tensor=True)
    cosine_sim = st_util.cos_sim(resume_embedding, job_embedding).item()
    semantic_score = max(0.0, min(1.0, cosine_sim))

    # ── 3. Combine scores ────────────────────────────────────────────
    if has_keyword_score:
        # Hybrid: 70% keyword coverage + 30% semantic
        combined = (keyword_score * 0.70) + (semantic_score * 0.30)
    else:
        # Fallback: calibrated semantic-only
        combined = semantic_score

    score = round(min(100.0, max(0.0, combined * 100)), 1)

    logger.info(
        "Match computed  |  keyword=%.2f  semantic=%.4f  →  score=%s",
        keyword_score if has_keyword_score else -1,
        cosine_sim,
        score,
    )
    return score


def semantic_similarity(text_a: str, text_b: str) -> float:
    """
    Compute a 0–100 semantic similarity score between any two text strings.
    Alias of compute_match_score with a more generic name —
    used for role-to-role, skill-to-skill, or profile-to-career comparisons.

    Returns:
        float in [0, 100]
    """
    return compute_match_score(text_a, text_b)


def rank_candidates(query: str, candidates: List[str]) -> List[Dict]:
    """
    Encode `query` once, then encode each candidate and rank them
    by cosine similarity descending.

    Args:
        query:      The reference text (e.g. user profile, current skills).
        candidates: List of texts to compare against the query.

    Returns:
        List of dicts [{"text": str, "score": float}] sorted high→low.
    """
    model = get_model()
    query_emb = model.encode(query, convert_to_tensor=True)

    results = []
    for candidate in candidates:
        cand_emb = model.encode(candidate, convert_to_tensor=True)
        sim  = st_util.cos_sim(query_emb, cand_emb).item()
        score = round(max(0.0, min(1.0, sim)) * 100, 2)
        results.append({"text": candidate, "score": score})

    results.sort(key=lambda x: x["score"], reverse=True)
    logger.info("rank_candidates: query='%s...' | ranked %d candidates", query[:40], len(results))
    return results
