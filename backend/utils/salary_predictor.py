"""
salary_predictor.py — ML-backed Career Financial Decision Engine
================================================================
Combines:
  • Trained RandomForest salary model  (career_pilot_salary/)
  • Skill analysis against predefined role requirements
  • Market estimation heuristics (demand, competition, growth)
  • Financial formulas (ROI, payback, opportunity cost, 3-yr projection)

The SentenceTransformer (careerpilot_model/) is used for *fuzzy role matching*
when the user's free-text job_role doesn't match a trained role exactly.
"""

import os
import logging
import warnings
from typing import Dict, List, Tuple

import joblib
import numpy as np

logger = logging.getLogger(__name__)

# ──────────────────────────────────────────────────────────────
# 1. LOAD ML ARTIFACTS
# ──────────────────────────────────────────────────────────────
_BASE = os.path.join(os.path.dirname(__file__), "..", "..", "career_pilot_salary")

_salary_model = None
_location_encoder = None


def _load_artifacts():
    global _salary_model, _location_encoder
    if _salary_model is not None:
        return
    model_path = os.path.abspath(os.path.join(_BASE, "salary_model.pkl"))
    loc_path = os.path.abspath(os.path.join(_BASE, "location_encoder.pkl"))
    logger.info("Loading salary model from %s", model_path)
    _salary_model = joblib.load(model_path)
    _location_encoder = joblib.load(loc_path)
    logger.info("✅ Salary model loaded  (features=%s)", _salary_model.n_features_in_)


# ──────────────────────────────────────────────────────────────
# 2. ROLE MAPPING  (label-encoded 0–7, matching the training data)
# ──────────────────────────────────────────────────────────────
# Based on salary spread from the model predictions:
#   0 → ₹91–108K  (ML/AI Engineer)
#   1 → ₹55–61K   (Backend Developer)
#   2 → ₹32–38K   (Content/Marketing Analyst)
#   3 → ₹76–90K   (Data Scientist)
#   4 → ₹27–33K   (Customer Support / Admin)
#   5 → ₹55–66K   (Full Stack Developer)
#   6 → ₹44–52K   (Frontend Developer / Designer)
#   7 → ₹33–39K   (HR / Non-Tech Specialist)

ROLE_ENCODING: Dict[str, int] = {
    "ml engineer":          0,
    "ai engineer":          0,
    "machine learning engineer": 0,
    "deep learning engineer":    0,
    "nlp engineer":         0,
    "computer vision engineer":  0,
    "data scientist":       3,
    "data analyst":         3,
    "data engineer":        3,
    "business analyst":     3,
    "backend developer":    1,
    "backend engineer":     1,
    "software engineer":    1,
    "software developer":   1,
    "devops engineer":      1,
    "cloud engineer":       1,
    "sre":                  1,
    "full stack developer": 5,
    "full stack engineer":  5,
    "web developer":        5,
    "mern developer":       5,
    "mean developer":       5,
    "frontend developer":   6,
    "frontend engineer":    6,
    "ui developer":         6,
    "react developer":      6,
    "angular developer":    6,
    "ui/ux designer":       6,
    "ux designer":          6,
    "graphic designer":     6,
    "product designer":     6,
    "product manager":      5,
    "project manager":      5,
    "scrum master":         5,
    "cybersecurity analyst":1,
    "security engineer":    1,
    "network engineer":     1,
    "content writer":       2,
    "marketing analyst":    2,
    "digital marketer":     2,
    "seo specialist":       2,
    "social media manager": 2,
    "hr manager":           7,
    "hr specialist":        7,
    "recruiter":            7,
    "operations manager":   7,
    "customer support":     4,
    "technical support":    4,
    "qa tester":            4,
    "manual tester":        4,
    "qa engineer":          6,
    "automation tester":    6,
    "mobile developer":     5,
    "android developer":    5,
    "ios developer":        5,
    "flutter developer":    5,
    "game developer":       5,
    "blockchain developer": 0,
    "embedded engineer":    1,
    "iot engineer":         1,
}

# Reverse mapping for display
ROLE_NAMES = {
    0: "ML/AI Engineer",
    1: "Backend / Infrastructure Engineer",
    2: "Content / Marketing Analyst",
    3: "Data Scientist / Analyst",
    4: "Support / QA (Entry-level)",
    5: "Full Stack / Product Developer",
    6: "Frontend / UI Developer",
    7: "HR / Operations Specialist",
}


# ──────────────────────────────────────────────────────────────
# 3. REQUIRED SKILLS PER ROLE
# ──────────────────────────────────────────────────────────────
REQUIRED_SKILLS: Dict[str, List[str]] = {
    "ml engineer":          ["python", "machine learning", "deep learning", "tensorflow", "pytorch", "numpy", "pandas", "scikit-learn", "statistics", "linear algebra"],
    "ai engineer":          ["python", "machine learning", "deep learning", "tensorflow", "pytorch", "nlp", "computer vision", "docker", "api", "cloud"],
    "data scientist":       ["python", "machine learning", "statistics", "sql", "pandas", "numpy", "data visualization", "scikit-learn", "r", "jupyter"],
    "data analyst":         ["sql", "excel", "python", "data visualization", "tableau", "power bi", "statistics", "pandas", "critical thinking", "reporting"],
    "data engineer":        ["python", "sql", "spark", "hadoop", "etl", "airflow", "aws", "data modeling", "kafka", "docker"],
    "backend developer":    ["python", "java", "sql", "rest api", "docker", "git", "database design", "linux", "microservices", "cloud"],
    "software engineer":    ["python", "java", "data structures", "algorithms", "sql", "git", "oop", "system design", "testing", "agile"],
    "frontend developer":   ["html", "css", "javascript", "react", "typescript", "responsive design", "git", "webpack", "testing", "ui/ux"],
    "full stack developer": ["html", "css", "javascript", "react", "node.js", "python", "sql", "git", "rest api", "docker"],
    "ui/ux designer":       ["figma", "adobe xd", "user research", "wireframing", "prototyping", "design thinking", "html", "css", "typography", "color theory"],
    "devops engineer":      ["docker", "kubernetes", "ci/cd", "linux", "aws", "terraform", "ansible", "git", "monitoring", "scripting"],
    "cloud engineer":       ["aws", "azure", "gcp", "docker", "kubernetes", "networking", "security", "terraform", "linux", "python"],
    "product manager":      ["product strategy", "agile", "user research", "data analysis", "communication", "wireframing", "sql", "roadmapping", "a/b testing", "stakeholder management"],
    "cybersecurity analyst":["networking", "security", "linux", "firewalls", "siem", "penetration testing", "python", "risk assessment", "compliance", "incident response"],
    "mobile developer":     ["java", "kotlin", "swift", "react native", "flutter", "rest api", "git", "ui design", "testing", "performance optimization"],
    "content writer":       ["writing", "seo", "research", "grammar", "creativity", "cms", "social media", "editing", "storytelling", "analytics"],
    "digital marketer":     ["seo", "sem", "google analytics", "social media", "content marketing", "email marketing", "ppc", "copywriting", "a/b testing", "crm"],
    "hr manager":           ["recruitment", "employee relations", "communication", "labor law", "hris", "conflict resolution", "performance management", "onboarding", "payroll", "leadership"],
    "qa engineer":          ["testing", "selenium", "python", "java", "test automation", "ci/cd", "api testing", "jira", "agile", "performance testing"],
    "blockchain developer": ["solidity", "ethereum", "smart contracts", "web3", "javascript", "cryptography", "distributed systems", "python", "defi", "git"],
}

# Fallback: if a role isn't in the dict above, use a generic set
_GENERIC_SKILLS = ["communication", "problem solving", "teamwork", "time management",
                   "critical thinking", "adaptability", "leadership", "technical skills",
                   "analytical skills", "project management"]


# ──────────────────────────────────────────────────────────────
# 4. MARKET ESTIMATION HEURISTICS
# ──────────────────────────────────────────────────────────────
# Category → (demand_level, competition_level, trend_growth_rate)
_MARKET_DEFAULTS: Dict[int, Tuple[float, float, float]] = {
    0: (0.92, 0.55, 14.0),   # ML/AI — high demand, moderate comp, high growth
    1: (0.85, 0.65, 10.0),   # Backend / Infra
    2: (0.55, 0.75, 6.0),    # Content / Marketing
    3: (0.88, 0.60, 12.0),   # Data Science
    4: (0.50, 0.80, 4.0),    # Support / QA entry
    5: (0.82, 0.68, 11.0),   # Full Stack / Product
    6: (0.75, 0.70, 9.0),    # Frontend / UI
    7: (0.45, 0.72, 5.0),    # HR / Ops
}


# ──────────────────────────────────────────────────────────────
# 5. CORE PREDICTION FUNCTION
# ──────────────────────────────────────────────────────────────

def _resolve_role(job_role: str) -> Tuple[int, str]:
    """
    Map a free-text job role to a label-encoded integer.
    Falls back to a fuzzy match via the SentenceTransformer if no exact match.
    """
    normalized = job_role.strip().lower()
    if normalized in ROLE_ENCODING:
        return ROLE_ENCODING[normalized], normalized

    # Fuzzy: try partial substring matching first
    for known_role, enc in ROLE_ENCODING.items():
        if known_role in normalized or normalized in known_role:
            return enc, known_role

    # Word-overlap scoring: handle "MERN Stack Developer" → "mern developer"
    input_words = set(normalized.split())
    best_overlap, best_role_overlap = 0.0, None
    for known_role, enc in ROLE_ENCODING.items():
        known_words = set(known_role.split())
        overlap = len(input_words & known_words)
        # Score: fraction of known role words found in input
        score = overlap / len(known_words) if known_words else 0
        if score > best_overlap:
            best_overlap = score
            best_role_overlap = known_role
    if best_overlap >= 0.5 and best_role_overlap:  # at least half the words match
        return ROLE_ENCODING[best_role_overlap], best_role_overlap

    # Fallback: use the SentenceTransformer for semantic matching
    try:
        from model.loader import get_model
        from sentence_transformers import util as st_util

        model = get_model()
        role_emb = model.encode(normalized, convert_to_tensor=True)
        best_score, best_role = -1.0, "software engineer"
        for known_role in ROLE_ENCODING:
            known_emb = model.encode(known_role, convert_to_tensor=True)
            sim = st_util.cos_sim(role_emb, known_emb).item()
            if sim > best_score:
                best_score = sim
                best_role = known_role
        logger.info("Fuzzy role match: '%s' → '%s' (sim=%.3f)", normalized, best_role, best_score)
        return ROLE_ENCODING[best_role], best_role
    except Exception:
        logger.warning("SentenceTransformer unavailable for fuzzy match — defaulting to 'software engineer'")
        return ROLE_ENCODING["software engineer"], "software engineer"


def _resolve_location(preferred_location: str) -> Tuple[int, str]:
    """Map location string to the label encoder. Falls back to average."""
    _load_artifacts()
    if not preferred_location:
        return 0, "India_Average"  # default: Bangalore as proxy

    loc = preferred_location.strip().title()
    known = list(_location_encoder.classes_)

    if loc in known:
        return int(_location_encoder.transform([loc])[0]), loc

    # Partial match
    for k in known:
        if k.lower() in loc.lower() or loc.lower() in k.lower():
            return int(_location_encoder.transform([k])[0]), k

    # Average across all locations (midpoint encoding)
    avg_enc = len(known) // 2
    return avg_enc, "India_Average"


def _get_required_skills(job_role_key: str) -> List[str]:
    """Get the required skill list for a role. Falls back to generic skills."""
    # Try exact
    if job_role_key in REQUIRED_SKILLS:
        return REQUIRED_SKILLS[job_role_key]
    # Try partial
    for key in REQUIRED_SKILLS:
        if key in job_role_key or job_role_key in key:
            return REQUIRED_SKILLS[key]
    return _GENERIC_SKILLS


def _compute_skills_score(user_skills: List[str], required_skills: List[str]) -> Tuple[float, int, int]:
    """
    Returns (score, matched_count, total_required).
    Matching is case-insensitive substring-based.
    """
    user_lower = [s.strip().lower() for s in user_skills if s.strip()]
    matched = 0
    for req in required_skills:
        req_l = req.lower()
        for us in user_lower:
            if req_l in us or us in req_l:
                matched += 1
                break
    total = len(required_skills)
    score = round(matched / total, 2) if total > 0 else 0.0
    return score, matched, total


def predict_career_financials(payload: dict) -> dict:
    """
    The main entry point. Accepts the user payload and returns the
    full financial analysis JSON matching the spec.

    Input schema:
    {
      "user_profile": { "current_status", "skills", "preferred_location" },
      "career_choice": { "job_role" },
      "education_plan": { "type", "name", "cost", "duration_months" }
    }
    """
    _load_artifacts()

    # ── Extract input ──────────────────────────────────────────
    user = payload["user_profile"]
    career = payload["career_choice"]
    edu = payload["education_plan"]

    current_status = user.get("current_status", "student")
    user_skills = user.get("skills", [])
    preferred_location = user.get("preferred_location", "")
    job_role = career["job_role"]
    edu_cost = float(edu["cost"])
    duration_months = int(edu["duration_months"])

    # ── 1. Resolve role & location ─────────────────────────────
    role_enc, role_key = _resolve_role(job_role)
    loc_enc, loc_used = _resolve_location(preferred_location)

    # ── 2. Skill analysis ──────────────────────────────────────
    required = _get_required_skills(role_key)
    skills_score, matched, total = _compute_skills_score(user_skills, required)

    # ── 3. Market estimation ───────────────────────────────────
    demand, competition, growth = _MARKET_DEFAULTS.get(role_enc, (0.65, 0.65, 8.0))

    # ── 4. ML salary prediction ────────────────────────────────
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        predicted_salary = float(
            _salary_model.predict([[role_enc, skills_score, demand, loc_enc]])[0]
        )

    # ── 5. Salary adjustment ──────────────────────────────────
    if current_status == "student":
        pass  # keep fresher estimate as-is
    elif current_status == "intern":
        predicted_salary *= 1.05  # slight bump for intern experience
    elif current_status == "working":
        predicted_salary *= 1.15  # working professional premium

    if skills_score > 0.8:
        boost = 1.05 + (skills_score - 0.8) * 0.25  # 5–10% boost
        predicted_salary *= boost

    predicted_salary = round(predicted_salary, 2)

    # ── 6. Financial formulas ──────────────────────────────────
    annual_salary = round(predicted_salary * 12, 2)
    roi_value = round(annual_salary / edu_cost, 2) if edu_cost > 0 else 999.99
    payback_months = round(edu_cost / predicted_salary, 2) if predicted_salary > 0 else 999.99
    opportunity_cost = round(duration_months * predicted_salary, 2)
    future_salary_3y = round(annual_salary * ((1 + growth / 100) ** 3), 2)

    # ── 7. Decision rules ──────────────────────────────────────
    if roi_value > 1.5:
        verdict = "good"
    elif roi_value >= 1.0:
        verdict = "moderate"
    else:
        verdict = "risky"

    # Confidence
    base_conf = min(1.0, roi_value / 2.0)  # scale ROI into 0–1
    demand_boost = demand * 0.2
    comp_penalty = competition * 0.15
    confidence = round(min(1.0, max(0.0, base_conf + demand_boost - comp_penalty)), 2)

    # Reason
    reasons = []
    if verdict == "good":
        reasons.append(f"Your ROI of {roi_value}× indicates a strong return on a ₹{edu_cost:,.0f} investment.")
    elif verdict == "moderate":
        reasons.append(f"An ROI of {roi_value}× is decent but not outstanding for ₹{edu_cost:,.0f}.")
    else:
        reasons.append(f"An ROI of {roi_value}× suggests the education cost may outweigh near-term salary gains.")

    if skills_score >= 0.7:
        reasons.append(f"You already possess {matched}/{total} required skills, giving you a head start.")
    elif skills_score < 0.4:
        reasons.append(f"With only {matched}/{total} required skills matched, significant upskilling is needed.")

    reason = " ".join(reasons)

    # ── 8. Market interpretation ───────────────────────────────
    if demand >= 0.8 and competition < 0.6:
        interpretation = f"Excellent market conditions — high demand ({demand:.0%}) with manageable competition ({competition:.0%}). Growth trend at {growth}%/yr makes this a prime time to enter."
    elif demand >= 0.7:
        interpretation = f"Solid demand ({demand:.0%}) in this field with {competition:.0%} competition. A {growth}%/yr growth rate indicates steady expansion."
    else:
        interpretation = f"Moderate demand ({demand:.0%}) with {competition:.0%} competition. The {growth}%/yr growth rate suggests limited but stable opportunities."

    # ── 9. Recommendations ─────────────────────────────────────
    recs = []
    if roi_value > 1.5:
        recs.append(f"The ROI of {roi_value}× is strong — proceeding with '{edu['name']}' is financially sound.")
    if payback_months > 36:
        recs.append(f"⚠ Payback period of {payback_months:.0f} months is long. Consider cheaper alternatives or part-time study to earn while learning.")
    if competition > 0.7:
        recs.append("High competition in this field — differentiate yourself with niche skills, open-source contributions, or real-world projects.")
    if skills_score < 0.6:
        missing_count = total - matched
        recs.append(f"You're missing {missing_count} key skills. Focus on upskilling in: {', '.join(required[matched:matched+3])} before or during the program.")
    if demand >= 0.8:
        recs.append(f"Demand is strong ({demand:.0%}) — this is an opportune time to invest in this career path.")
    if skills_score >= 0.8:
        recs.append(f"Excellent skill match ({skills_score:.0%}) — you're well-positioned to negotiate a higher starting salary.")
    if current_status == "student" and roi_value >= 1.0:
        recs.append("As a student, consider internships or part-time roles alongside education to build experience and offset costs.")

    # Ensure at least 3 recommendations
    if len(recs) < 3:
        recs.append("Build a portfolio of projects to demonstrate practical competence to employers.")
    if len(recs) < 3:
        recs.append("Network with professionals in the target role through LinkedIn, meetups, and tech communities.")
    recs = recs[:5]  # cap at 5

    # ── 10. Assemble output ────────────────────────────────────
    return {
        "skill_analysis": {
            "skills_score": skills_score,
            "matched_skills": matched,
            "total_required_skills": total,
        },
        "salary_prediction": {
            "monthly_salary": predicted_salary,
            "annual_salary": annual_salary,
            "location_used": loc_used,
        },
        "roi_analysis": {
            "roi_value": roi_value,
            "payback_period_months": payback_months,
            "opportunity_cost": opportunity_cost,
            "future_salary_3y": future_salary_3y,
        },
        "decision": {
            "verdict": verdict,
            "confidence": confidence,
            "reason": reason,
        },
        "market_insights": {
            "demand_level": round(demand, 2),
            "competition_level": round(competition, 2),
            "trend_growth_rate": round(growth, 2),
            "interpretation": interpretation,
        },
        "recommendations": recs,
    }
