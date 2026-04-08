"""
utils/skills.py — Keyword extraction & skill-gap analysis
==========================================================
Extracts meaningful keywords from raw text and computes the
difference between a job description's skills and a resume's skills.
"""

from __future__ import annotations

import re
import logging
from typing import Set, List

logger = logging.getLogger(__name__)

# ──────────────────────────────────────────────────────────────
# Common stop-words to filter out (keeps skill-related tokens)
# ──────────────────────────────────────────────────────────────
STOP_WORDS: Set[str] = {
    # Articles / prepositions / conjunctions
    "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for",
    "of", "with", "by", "from", "as", "into", "through", "during", "before",
    "after", "above", "below", "between", "under", "over",
    # Pronouns
    "i", "me", "my", "we", "our", "you", "your", "he", "she", "it", "they",
    "them", "his", "her", "its", "their",
    # Common verbs / auxiliaries
    "is", "am", "are", "was", "were", "be", "been", "being", "have", "has",
    "had", "do", "does", "did", "will", "would", "shall", "should", "may",
    "might", "must", "can", "could",
    # Misc filler words
    "that", "this", "these", "those", "not", "no", "so", "if", "then",
    "than", "very", "just", "also", "about", "up", "out", "all", "each",
    "every", "any", "some", "such", "more", "most", "other", "own",
    # Resume / job-description boilerplate
    "experience", "experienced", "work", "job", "role", "position", "company",
    "team", "working", "worked", "using", "used", "responsible", "ability",
    "strong", "good", "excellent", "skills", "skill", "knowledge",
    "understanding", "proficiency", "proficient", "familiar", "years",
    "year", "etc", "including", "include", "required", "requirements",
    "preferred", "plus", "bonus", "minimum", "maximum", "least",
    "looking", "needing", "needed", "seeking", "hiring", "wanted",
    "expertise", "expert", "communication", "leadership", "management",
    "manage", "managed", "managing", "lead", "led", "leading",
    "develop", "developed", "developing", "development", "developer",
    "build", "built", "building", "create", "created", "creating",
    "design", "designed", "designing", "implement", "implemented",
    "deliver", "delivered", "delivering", "maintain", "maintained",
    "deploy", "deployed", "deployment", "deploying",
    "senior", "junior", "mid", "level", "engineer", "engineering",
    "based", "background", "across", "within", "ensure", "well",
    "large", "small", "new", "existing", "high", "low",
    "will", "need", "like", "want", "make", "take",
}


def extract_keywords(text: str) -> Set[str]:
    """
    Extract meaningful lowercase keywords from free-form text.

    Strategy:
      1. Lowercase & strip non-alphanumeric (keep spaces + tech chars).
      2. Tokenise on whitespace.
      3. Strip trailing/leading punctuation from each token.
      4. Drop stop-words and very short tokens (len ≤ 2).

    Returns:
        A set of cleaned keyword strings.
    """
    text = text.lower()
    # Keep letters, digits, spaces, and common tech separators (+, #)
    text = re.sub(r"[^a-z0-9\s\+\#]", " ", text)
    tokens = text.split()

    # Strip any remaining leading/trailing dots, commas, etc.
    cleaned = (tok.strip(".,:;!?()[]{}\"'") for tok in tokens)

    keywords = {
        tok for tok in cleaned
        if tok and tok not in STOP_WORDS and len(tok) > 2
    }
    return keywords


def find_missing_skills(resume_text: str, job_text: str) -> List[str]:
    """
    Identify skills mentioned in the job description but absent from the
    resume.

    Args:
        resume_text: Raw text of the candidate's resume.
        job_text:    Raw text of the job description.

    Returns:
        Sorted list of missing skill keywords.
    """
    resume_keywords = extract_keywords(resume_text)
    job_keywords = extract_keywords(job_text)

    missing = job_keywords - resume_keywords

    logger.debug(
        "Resume keywords (%d) | Job keywords (%d) | Missing (%d)",
        len(resume_keywords), len(job_keywords), len(missing),
    )
    return sorted(missing)
