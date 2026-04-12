"""
utils/resume_parser.py — AI-powered Resume Parsing Module
==========================================================
Uses the Groq LLM (Llama 3.3 70B) to extract structured data from raw
resume text.  All skill proficiency values are INFERRED from context —
nothing is hardcoded.

OUTPUT SCHEMA:
{
  "skills":            { skill_name: proficiency (0–100) },
  "experience_level":  number (0–100),
  "projects_count":    number,
  "education_level":   number (mapped score),
  "domain_exposure":   [list of domain strings]
}

CALLED BY:
  app.py → POST /analyze-resume
  app.py → POST /generate-roadmap  (Step 1)
"""

import json
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)


# ──────────────────────────────────────────────────────────────
# LLM PROMPT — enforces the exact proficiency inference rules
# ──────────────────────────────────────────────────────────────
RESUME_PARSE_PROMPT = """You are an expert resume analysis engine.  Your task is to parse the raw resume text and extract structured data.

────────────────────────────────────
PROFICIENCY SCORING RULES (MANDATORY)
────────────────────────────────────

For each skill found in the resume, assign a proficiency score (0–100) based on HOW the skill appears:

• Skill is used extensively in projects with measurable outcomes → 80–95
• Skill mentioned in project descriptions or work experience → 70–85
• Skill mentioned in a dedicated skills section AND in experience → 65–80
• Skill listed only in the skills section without context → 50–70
• Skill mentioned in passing or only once → 30–50
• Skill implied but not directly stated → 20–40

Additional boosters:
• +5–10 if the person has 3+ years using the skill
• +5 if the skill appears in multiple projects
• +5 if there are certifications for the skill
• −10 if the skill is only listed as "familiar with" or "basic knowledge"

────────────────────────────────────
EXPERIENCE LEVEL RULES
────────────────────────────────────

Map total professional experience to 0–100:
• 0 years (fresh graduate) → 10–20
• < 1 year (intern/entry) → 20–35
• 1–2 years → 35–50
• 3–5 years → 50–70
• 5–8 years → 70–85
• 8–12 years → 85–95
• 12+ years → 95–100

Include internship and freelance experience in the calculation.

────────────────────────────────────
EDUCATION LEVEL MAPPING
────────────────────────────────────

• PhD / Doctorate → 100
• Master's / M.Tech / MS / MBA → 80
• Bachelor's / B.Tech / B.E. / B.Sc → 60
• Diploma / Associate → 40
• High School / 12th → 20
• If unclear → 50

────────────────────────────────────
DOMAIN EXPOSURE
────────────────────────────────────

Extract the domains/industries the candidate has worked in.
Examples: "web development", "machine learning", "e-commerce", "fintech",
          "healthcare", "education", "embedded systems", "mobile apps"

────────────────────────────────────
OUTPUT (STRICT JSON ONLY)
────────────────────────────────────

Return ONLY valid JSON matching this exact schema. No extra text.

{
  "skills": {
    "skill_name_lowercase": proficiency_score_integer,
    "another_skill": score,
    ...
  },
  "experience_level": integer_0_to_100,
  "projects_count": integer,
  "education_level": integer_mapped_score,
  "domain_exposure": ["domain1", "domain2", ...]
}

RULES:
- Skill names MUST be lowercase
- Include ALL skills found (technical + tools + soft skills if prominent)
- projects_count = count of distinct projects mentioned
- If a field cannot be determined, use a reasonable default (e.g. 0 for projects_count, 50 for education_level)
- Round all scores to integers
- Do NOT add explanations, only JSON
"""


def resume_parser(resume_text: str) -> Dict[str, Any]:
    """
    Parse raw resume text into structured skill/experience data using
    the Groq LLM.

    Args:
        resume_text: Plain-text content of the candidate's resume.

    Returns:
        Dict with keys: skills, experience_level, projects_count,
        education_level, domain_exposure.

    Raises:
        ValueError: If the LLM client is not initialized or response
                    cannot be parsed.
    """
    # Import the shared Groq client (already initialized in ai_generative.py)
    from utils.ai_generative import client, MODEL_NAME

    if not client:
        raise ValueError("Groq client not initialized — check GROQ_API_KEY")

    logger.info("Parsing resume (%d chars) via LLM …", len(resume_text))

    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=[
            {"role": "system", "content": RESUME_PARSE_PROMPT},
            {"role": "user",   "content": f"RESUME TEXT:\n\n{resume_text}"},
        ],
        response_format={"type": "json_object"},
        temperature=0.2,  # low temperature for consistent extraction
    )

    try:
        parsed = json.loads(response.choices[0].message.content)
    except (json.JSONDecodeError, IndexError, AttributeError) as e:
        logger.error("Failed to parse LLM resume response: %s", e)
        raise ValueError("Failed to parse resume analysis response from AI")

    # ── Validate & sanitize ──────────────────────────────────
    result = _sanitize(parsed)

    logger.info(
        "Resume parsed → %d skills | exp=%d | projects=%d | edu=%d | domains=%s",
        len(result["skills"]),
        result["experience_level"],
        result["projects_count"],
        result["education_level"],
        result["domain_exposure"],
    )
    return result


def _sanitize(raw: dict) -> Dict[str, Any]:
    """Ensure the parsed output conforms to expected types and ranges."""

    # Skills
    skills = {}
    raw_skills = raw.get("skills", {})
    if isinstance(raw_skills, dict):
        for name, score in raw_skills.items():
            try:
                s = int(score)
            except (ValueError, TypeError):
                s = 50  # default
            skills[str(name).lower().strip()] = max(0, min(100, s))

    # Experience level
    try:
        exp = int(raw.get("experience_level", 30))
    except (ValueError, TypeError):
        exp = 30
    exp = max(0, min(100, exp))

    # Projects count
    try:
        projects = int(raw.get("projects_count", 0))
    except (ValueError, TypeError):
        projects = 0
    projects = max(0, projects)

    # Education level
    try:
        edu = int(raw.get("education_level", 50))
    except (ValueError, TypeError):
        edu = 50
    edu = max(0, min(100, edu))

    # Domain exposure
    domains = raw.get("domain_exposure", [])
    if not isinstance(domains, list):
        domains = []
    domains = [str(d).lower().strip() for d in domains if d]

    return {
        "skills": skills,
        "experience_level": exp,
        "projects_count": projects,
        "education_level": edu,
        "domain_exposure": domains,
    }
