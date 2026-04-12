"""
utils/model_inference.py — Enhanced ML Career Prediction Engine
================================================================
Production-grade career prediction combining:
  • XGBoost classifier  (career_model.pkl — 141 features, 14 career classes)
  • Education encoder   (edu_encoder.pkl  — LabelEncoder)
  • Skill normalization  (synonym resolution + fuzzy matching)
  • Confidence calibration  (caps raw predict_proba at 0.85)
  • Explainability engine  (matched/missing/recommendations)
  • Multi-role financial comparison

PIPELINE:
  raw_skills → normalize → vectorize → XGB predict_proba →
  calibrate → top-3 roles → explain → salary/ROI per role → output

CALLED BY:
  app.py → POST /generate-roadmap    (via model_inference)
  app.py → POST /career/predict      (via enhanced_career_analysis)
"""

import os
import logging
import warnings
from typing import Dict, Any, List, Tuple, Optional

import joblib
import numpy as np

logger = logging.getLogger(__name__)


# ══════════════════════════════════════════════════════════════
#  SECTION 1 ─ CONFIGURATION & CONSTANTS
# ══════════════════════════════════════════════════════════════

# Maximum confidence the calibration layer will emit.
# Raw XGBoost probabilities are overconfident on small datasets;
# capping at 0.85 prevents unreasonably high salary boosts and
# readiness inflation.
MAX_CALIBRATED_CONFIDENCE = 0.85

# Number of top career predictions to return
TOP_K_PREDICTIONS = 3

# ── Career model class → human name + salary-predictor category ──
# The XGBClassifier predicts 14 classes (0–13).
# Classes are sorted alphabetically by LabelEncoder.
# salary_category maps each to the salary_predictor's 0–7 encoding
# so we can reuse its RandomForest regressor for salary estimation.
CAREER_MODEL_ROLES: Dict[int, Dict[str, Any]] = {
    0:  {"name": "Backend Developer",           "salary_category": 1, "key": "backend developer"},
    1:  {"name": "Cybersecurity Analyst",       "salary_category": 1, "key": "cybersecurity analyst"},
    2:  {"name": "Data Analyst",                "salary_category": 3, "key": "data analyst"},
    3:  {"name": "Data Engineer",               "salary_category": 3, "key": "data engineer"},
    4:  {"name": "Data Scientist",              "salary_category": 3, "key": "data scientist"},
    5:  {"name": "DevOps / Cloud Engineer",     "salary_category": 1, "key": "devops engineer"},
    6:  {"name": "Digital Marketer / Content",   "salary_category": 2, "key": "digital marketer"},
    7:  {"name": "Frontend Developer",          "salary_category": 6, "key": "frontend developer"},
    8:  {"name": "Full Stack Developer",        "salary_category": 5, "key": "full stack developer"},
    9:  {"name": "HR / Operations Specialist",   "salary_category": 7, "key": "hr manager"},
    10: {"name": "ML/AI Engineer",              "salary_category": 0, "key": "ml engineer"},
    11: {"name": "Mobile Developer",            "salary_category": 5, "key": "mobile developer"},
    12: {"name": "Product / Project Manager",   "salary_category": 5, "key": "product manager"},
    13: {"name": "UI/UX Designer",              "salary_category": 6, "key": "ui/ux designer"},
}


# ══════════════════════════════════════════════════════════════
#  SECTION 2 ─ SKILL NORMALIZATION LAYER  (Task 1)
# ══════════════════════════════════════════════════════════════

# Comprehensive synonym → canonical mapping.
# When a user lists "ml" we resolve it to "machine learning" BEFORE
# one-hot encoding, so the model sees the correct feature column.
SKILL_SYNONYMS: Dict[str, str] = {
    # ── Programming languages ──
    "py":                   "python",
    "python3":              "python",
    "python 3":             "python",
    "js":                   "javascript",
    "es6":                  "javascript",
    "ecmascript":           "javascript",
    "vanilla js":           "javascript",
    "ts":                   "typescript",
    "cpp":                  "c++",
    "c plus plus":          "c++",
    "csharp":               "c#",
    "c sharp":              "c#",
    "golang":               "go",
    "objective-c":          "swift",
    "rb":                   "ruby",

    # ── Web frameworks / libraries ──
    "reactjs":              "react",
    "react.js":             "react",
    "react js":             "react",
    "angularjs":            "angular",
    "angular.js":           "angular",
    "angular js":           "angular",
    "vuejs":                "vue.js",
    "vue":                  "vue.js",
    "vue js":               "vue.js",
    "nodejs":               "node.js",
    "node":                 "node.js",
    "node js":              "node.js",
    "expressjs":            "express.js",
    "express":              "express.js",
    "express js":           "express.js",
    "nextjs":               "next.js",
    "next js":              "next.js",
    "sveltejs":             "svelte",
    "springboot":           "spring boot",
    "spring-boot":          "spring boot",
    "ror":                  "ruby on rails",
    "rails":                "ruby on rails",
    "tailwind":             "tailwindcss",
    "tailwind css":         "tailwindcss",
    "react-native":         "react native",

    # ── ML / AI ──
    "ml":                   "machine learning",
    "dl":                   "deep learning",
    "tf":                   "tensorflow",
    "tf2":                  "tensorflow",
    "sklearn":              "scikit-learn",
    "sk-learn":             "scikit-learn",
    "sci-kit learn":        "scikit-learn",
    "cv":                   "computer vision",
    "natural language processing": "nlp",
    "large language model":  "llm",
    "large language models": "llm",
    "generative ai":        "llm",
    "gen ai":               "llm",
    "genai":                "llm",
    "rl":                   "reinforcement learning",

    # ── Data / Analytics ──
    "data viz":             "data visualization",
    "data visualization tools": "data visualization",
    "powerbi":              "power bi",
    "power-bi":             "power bi",
    "ms excel":             "excel",
    "microsoft excel":      "excel",
    "maths":                "linear algebra",
    "math":                 "statistics",

    # ── DevOps / Cloud ──
    "k8s":                  "kubernetes",
    "cicd":                 "ci/cd",
    "ci cd":                "ci/cd",
    "continuous integration": "ci/cd",
    "github-actions":       "github actions",
    "amazon web services":  "aws",
    "amazon aws":           "aws",
    "google cloud":         "gcp",
    "google cloud platform": "gcp",
    "microsoft azure":      "azure",
    "shell":                "bash",
    "shell scripting":      "bash",
    "unix":                 "linux",

    # ── Databases ──
    "postgres":             "postgresql",
    "mongo":                "mongodb",
    "mongo db":             "mongodb",
    "elastic search":       "elasticsearch",
    "elastic":              "elasticsearch",
    "dynamo db":            "dynamodb",
    "dynamo":               "dynamodb",

    # ── APIs / Architecture ──
    "restful":              "rest api",
    "restful api":          "rest api",
    "rest":                 "rest api",
    "api":                  "api development",
    "api design":           "api development",
    "micro services":       "microservices",

    # ── CS fundamentals ──
    "dsa":                  "data structures",
    "ds and algo":          "data structures",
    "ds & algo":            "data structures",
    "algo":                 "algorithms",
    "oops":                 "oop",
    "object oriented programming": "oop",
    "solid":                "design patterns",
    "system architecture":  "system design",
    "hld":                  "system design",
    "lld":                  "design patterns",

    # ── Testing ──
    "qa":                   "testing",
    "quality assurance":    "testing",
    "unit testing":         "testing",
    "integration testing":  "testing",
    "e2e testing":          "testing",

    # ── Design ──
    "ux design":            "ui/ux",
    "ui design":            "ui/ux",
    "ux":                   "ui/ux",
    "ui":                   "ui/ux",
    "user experience":      "ui/ux",
    "user interface":       "ui/ux",
    "photoshop":            "adobe xd",
    "illustrator":          "adobe xd",
    "xd":                   "adobe xd",

    # ── Soft skills ──
    "team work":            "teamwork",
    "team player":          "teamwork",
    "public speaking":      "communication",
    "verbal communication": "communication",
    "problem-solving":      "problem solving",
    "analytical skills":    "critical thinking",
    "pm":                   "project management",
    "pmp":                  "project management",
}


def normalize_skills(raw_skills: Dict[str, int]) -> Dict[str, int]:
    """
    TASK 1: Skill Normalization Layer.

    1. Lowercases all skill names.
    2. Resolves synonyms via SKILL_SYNONYMS lookup.
    3. Deduplicates — keeps the HIGHEST proficiency when two raw names
       map to the same canonical skill.

    Args:
        raw_skills: {skill_name: proficiency_0_to_100}

    Returns:
        Cleaned {canonical_skill: proficiency}
    """
    normalized: Dict[str, int] = {}
    for raw_name, proficiency in raw_skills.items():
        key = raw_name.lower().strip()
        # Synonym resolution
        canonical = SKILL_SYNONYMS.get(key, key)
        # Keep highest proficiency on collision
        if canonical in normalized:
            normalized[canonical] = max(normalized[canonical], proficiency)
        else:
            normalized[canonical] = proficiency
    return normalized


# ══════════════════════════════════════════════════════════════
#  SECTION 3 ─ MODEL LOADING
# ══════════════════════════════════════════════════════════════

_PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))

_career_model = None
_edu_encoder = None
_tfidf_vectorizer = None


def _load_career_model():
    """Load career_model.pkl, edu_encoder.pkl, and tfidf.pkl from the project root."""
    global _career_model, _edu_encoder, _tfidf_vectorizer
    if _career_model is not None:
        return

    model_path = os.path.join(_PROJECT_ROOT, "career_model.pkl")
    encoder_path = os.path.join(_PROJECT_ROOT, "edu_encoder.pkl")
    tfidf_path = os.path.join(_PROJECT_ROOT, "tfidf.pkl")

    logger.info("Loading career model from %s", model_path)
    _career_model = joblib.load(model_path)
    _edu_encoder = joblib.load(encoder_path)
    _tfidf_vectorizer = joblib.load(tfidf_path)
    logger.info(
        "✅ Career model loaded  (type=%s, features=%s, classes=%s)",
        type(_career_model).__name__,
        _career_model.n_features_in_,
        getattr(_career_model, 'n_classes_', 'N/A'),
    )
    logger.info(
        "✅ Education encoder loaded  (classes=%s)",
        list(_edu_encoder.classes_),
    )
    logger.info(
        "✅ TF-IDF vectorizer loaded  (vocabulary_size=%d)",
        len(_tfidf_vectorizer.vocabulary_),
    )


# ══════════════════════════════════════════════════════════════
#  SECTION 4 ─ EDUCATION ENCODING
# ══════════════════════════════════════════════════════════════

def _map_education_score_to_label(edu_score: int) -> str:
    """Map the numeric education score (0–100) to an education label
    that the edu_encoder understands."""
    if edu_score >= 90:
        return "PhD"
    elif edu_score >= 70:
        return "Masters"
    elif edu_score >= 50:
        return "Bachelors"
    else:
        return "High School"


def _encode_education(edu_score: int) -> int:
    """Encode education level to the integer the career model expects."""
    label = _map_education_score_to_label(edu_score)
    try:
        return int(_edu_encoder.transform([label])[0])
    except (ValueError, KeyError):
        logger.warning("Unknown education label '%s' — defaulting to Bachelors", label)
        return int(_edu_encoder.transform(["Bachelors"])[0])


# ══════════════════════════════════════════════════════════════
#  SECTION 5 ─ FEATURE VECTORISATION (TF-IDF)
# ══════════════════════════════════════════════════════════════
#
# CRITICAL: The career model was TRAINED with TF-IDF vectorized skill
# text, NOT one-hot encoded skill vectors.  The training pipeline was:
#
#   1. Join user skills into a single text string
#   2. TfidfVectorizer.transform(skills_text) → 138 sparse features
#   3. Append [experience_level, projects_count, education_encoded]
#   4. Total: 138 + 3 = 141 features → XGBClassifier
#
# Using one-hot encoding instead of TF-IDF produces a completely
# different feature structure and results in near-random predictions
# (~4% confidence).  The tfidf.pkl vectorizer MUST be used.

_NUM_NUMERIC_FEATURES = 3


def _skills_to_text(user_skills: Dict[str, int]) -> str:
    """
    Convert the skill dict to a space-separated text string suitable
    for TF-IDF transformation.

    Skills with higher proficiency are repeated to give them more
    weight in the TF-IDF calculation, mimicking how a resume with
    extensive Python experience would mention Python multiple times.

    Mapping:
      proficiency >= 80  → skill name appears 3×
      proficiency >= 50  → skill name appears 2×
      proficiency >  0   → skill name appears 1×
    """
    tokens: List[str] = []
    for skill_name, proficiency in user_skills.items():
        if proficiency <= 0:
            continue
        # Determine repetition based on proficiency
        if proficiency >= 80:
            reps = 3
        elif proficiency >= 50:
            reps = 2
        else:
            reps = 1
        tokens.extend([skill_name] * reps)
    return " ".join(tokens)


def _build_feature_vector(
    user_skills: Dict[str, int],
    experience_level: int,
    projects_count: int,
    education_encoded: int,
) -> np.ndarray:
    """
    Build an N-dimensional feature vector matching the career model's
    TRAINING pipeline:

    Features:
      [0..V-1] = TF-IDF vectorized skill text (V = vocab size)
      [V]      = experience_level  (normalized by /10)
      [V+1]    = projects_count    (normalized by /15)
      [V+2]    = education_encoded (integer from edu_encoder)

    The training script normalised experience by /10 and projects by /15
    to keep them in a similar range to TF-IDF values (~0–1).
    """
    # Step 1: Convert skills dict → text string
    skills_text = _skills_to_text(user_skills)

    # Step 2: TF-IDF transform (produces sparse matrix)
    tfidf_features = _tfidf_vectorizer.transform([skills_text])

    # Step 3: Convert sparse → dense and append numeric features
    tfidf_dense = tfidf_features.toarray().astype(np.float32)
    n_tfidf = tfidf_dense.shape[1]

    # Step 4: Build full feature vector — normalisation MUST match training
    numeric = np.array([
        experience_level / 10.0,          # training used /10
        min(projects_count, 15) / 15.0,   # training used /15
        float(education_encoded),
    ], dtype=np.float32).reshape(1, -1)

    feature_vector = np.hstack([tfidf_dense, numeric])

    logger.debug(
        "Feature vector: tfidf_dims=%d, numeric_dims=%d, total=%d, "
        "non_zero_tfidf=%d, skills_text_len=%d",
        n_tfidf, _NUM_NUMERIC_FEATURES, feature_vector.shape[1],
        tfidf_features.nnz, len(skills_text),
    )

    return feature_vector


# ══════════════════════════════════════════════════════════════
#  SECTION 6 ─ CONFIDENCE CALIBRATION  (Task 4)
# ══════════════════════════════════════════════════════════════

def _calibrate_confidence(raw_proba: float) -> float:
    """
    TASK 4: Do NOT blindly trust predict_proba().

    XGBoost on small-to-medium datasets emits overconfident softmax
    outputs.  We apply a hard ceiling and a gentle sigmoid squash
    so that an 0.95 raw → 0.85 calibrated, while low values stay low.

    Formula:
        calibrated = min(raw_proba, MAX_CALIBRATED_CONFIDENCE)

    This calibrated value is used for:
      • readiness score computation
      • salary boost factor
      • displayed confidence to the user
    """
    return round(min(raw_proba, MAX_CALIBRATED_CONFIDENCE), 4)


# ══════════════════════════════════════════════════════════════
#  SECTION 7 ─ EXPLAINABILITY ENGINE  (Task 3)
# ══════════════════════════════════════════════════════════════

def _explain_prediction(
    user_skills: Dict[str, int],
    target_role_key: str,
    calibrated_confidence: float,
) -> Dict[str, Any]:
    """
    TASK 3: Generate human-readable explanation.

    Returns:
    {
        "matched_skills":   [skills the user has that the role needs],
        "missing_skills":   [important skills the user lacks],
        "recommendations":  [actionable next-step advice],
        "match_ratio":      "5/10"
    }
    """
    from data.role_skill_map import get_skills_for_role

    role_skills = get_skills_for_role(target_role_key)
    if not role_skills:
        return {
            "matched_skills": [],
            "missing_skills": [],
            "recommendations": [
                "We don't have a detailed skill map for this role yet.",
                "Focus on building projects to demonstrate your abilities.",
                "Network with professionals in this field.",
            ],
            "match_ratio": "0/0",
        }

    matched: List[str] = []
    missing: List[Dict[str, Any]] = []

    for skill_name, spec in role_skills.items():
        user_level = _find_user_skill_level(user_skills, skill_name)
        required = spec["required_level"]
        importance = spec["importance_weight"]

        if user_level > 0:
            matched.append(skill_name)
        else:
            missing.append({
                "skill": skill_name,
                "required_level": required,
                "importance": importance,
            })

    # Sort missing by importance (most critical first)
    missing.sort(key=lambda x: x["importance"], reverse=True)

    # Generate recommendations
    recs = _generate_recommendations(matched, missing, calibrated_confidence, target_role_key)

    return {
        "matched_skills": matched,
        "missing_skills": [m["skill"] for m in missing],
        "missing_skills_detailed": missing,
        "recommendations": recs,
        "match_ratio": f"{len(matched)}/{len(role_skills)}",
    }


def _generate_recommendations(
    matched: List[str],
    missing: List[Dict[str, Any]],
    confidence: float,
    role_key: str,
) -> List[str]:
    """Build contextual, actionable recommendations."""
    recs: List[str] = []
    total = len(matched) + len(missing)
    match_pct = len(matched) / total * 100 if total > 0 else 0

    # ── Skill-gap advice ──
    if missing:
        top3 = [m["skill"].title() for m in missing[:3]]
        recs.append(
            f"🎯 Priority upskilling: focus on {', '.join(top3)} — "
            f"these are the most critical gaps for {role_key.title()}."
        )
    if len(missing) > 5:
        recs.append(
            f"📋 You're missing {len(missing)} skills. "
            f"Create a 3-month learning plan tackling 2 skills per month."
        )

    # ── Strength reinforcement ──
    if match_pct >= 70:
        recs.append(
            f"💪 Strong foundation — {len(matched)}/{total} skills matched. "
            f"Focus on deepening expertise in advanced topics."
        )
    elif match_pct >= 40:
        recs.append(
            f"📈 Decent coverage ({len(matched)}/{total}). "
            f"Bridge the remaining gaps with project-based learning."
        )
    else:
        recs.append(
            f"🚀 Significant skill gap ({len(matched)}/{total}). "
            f"Consider a structured bootcamp or certification program."
        )

    # ── Confidence-based advice ──
    if confidence >= 0.7:
        recs.append(
            "✅ High model confidence indicates your profile aligns well "
            "with this career path. Start applying for entry-level positions."
        )
    elif confidence >= 0.4:
        recs.append(
            "⚡ Moderate alignment — build 2–3 portfolio projects "
            "demonstrating your skills in this domain."
        )
    else:
        recs.append(
            "🔄 This is a significant career pivot. Consider transitional "
            "roles or internships to build domain experience."
        )

    # ── Universal advice ──
    recs.append(
        "🌐 Engage with the community: contribute to open-source, "
        "attend meetups, and build a public portfolio."
    )

    return recs[:5]  # Cap at 5


# ══════════════════════════════════════════════════════════════
#  SECTION 8 ─ SALARY & FINANCIAL ENGINE (per role)
# ══════════════════════════════════════════════════════════════

def _compute_financials_for_role(
    role_enc: int,
    avg_skill_score: float,
    experience_level: int,
    calibrated_confidence: float,
) -> Dict[str, Any]:
    """
    Run the salary predictor + heuristics for a single role encoding.

    Returns salary estimate, ROI score, growth rate, and payback estimate.
    """
    import utils.salary_predictor as salary_mod

    salary_mod._load_artifacts()

    # Market heuristics
    demand, competition, growth_rate = salary_mod._MARKET_DEFAULTS.get(
        role_enc, (0.65, 0.65, 8.0)
    )

    # ML salary prediction (salary regressor from career_pilot_salary)
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        predicted_salary = float(
            salary_mod._salary_model.predict(
                [[role_enc, avg_skill_score, demand, 0]]
            )[0]
        )

    # Experience adjustment
    if experience_level >= 70:
        predicted_salary *= 1.15
    elif experience_level >= 50:
        predicted_salary *= 1.05

    # Skill-match boost
    if avg_skill_score > 0.8:
        predicted_salary *= 1.0 + (avg_skill_score - 0.8) * 0.25

    # Confidence boost (uses CALIBRATED confidence, not raw)
    if calibrated_confidence > 0.3:
        confidence_boost = 1.0 + (calibrated_confidence - 0.3) * 0.15
        predicted_salary *= confidence_boost

    predicted_salary = round(predicted_salary, 2)

    # ROI score (0–10 scale)
    salary_roi = min(10.0, (predicted_salary / 30000) * 5)
    demand_factor = demand * 3
    growth_factor = (growth_rate / 15) * 2
    roi_score = round(
        min(10.0, salary_roi + demand_factor * 0.3 + growth_factor * 0.2), 2
    )

    # Payback period estimate (assuming ₹50K avg education cost)
    avg_edu_cost = 50000
    payback_months = round(avg_edu_cost / predicted_salary, 2) if predicted_salary > 0 else 999

    return {
        "salary_estimate": predicted_salary,
        "annual_salary": round(predicted_salary * 12, 2),
        "roi": roi_score,
        "growth_rate": round(growth_rate, 2),
        "demand_level": round(demand, 2),
        "competition_level": round(competition, 2),
        "payback_period_months": payback_months,
    }


# ══════════════════════════════════════════════════════════════
#  SECTION 9 ─ TOP-K PREDICTIONS  (Task 2)
# ══════════════════════════════════════════════════════════════

def _get_top_k_predictions(
    career_proba: np.ndarray,
    k: int = TOP_K_PREDICTIONS,
) -> List[Dict[str, Any]]:
    """
    TASK 2: Return top-K predicted roles with calibrated probabilities.

    Args:
        career_proba: 1-D array of class probabilities from predict_proba.
        k: Number of top predictions to return.

    Returns:
        [{"class_id": int, "role": str, "confidence": float}, ...]
        Sorted by confidence descending.
    """
    n_classes = len(career_proba)
    top_indices = np.argsort(career_proba)[::-1][:k]

    predictions = []
    for idx in top_indices:
        idx_int = idx.item() if hasattr(idx, 'item') else int(idx)
        raw_conf = float(career_proba[idx_int])
        calibrated = _calibrate_confidence(raw_conf)

        role_info = CAREER_MODEL_ROLES.get(idx_int, {
            "name": f"Career Class {idx_int}",
            "salary_category": 1,
            "key": "software engineer",
        })

        predictions.append({
            "class_id": idx_int,
            "role": role_info["name"],
            "role_key": role_info["key"],
            "salary_category": role_info["salary_category"],
            "raw_confidence": round(raw_conf, 4),
            "confidence": calibrated,
        })

    return predictions


# ══════════════════════════════════════════════════════════════
#  SECTION 10 ─ READINESS SCORE
# ══════════════════════════════════════════════════════════════

def _compute_readiness(
    user_skills: Dict[str, int],
    role_skills: Dict[str, dict],
    experience_level: int,
    education_level: int,
    calibrated_confidence: float,
    avg_skill_score: float,
) -> float:
    """
    Compute readiness score (0–100) blending:
      60% skill coverage
      15% experience
      10% education
      15% calibrated model confidence
    """
    if role_skills:
        total_weight = 0.0
        ready_sum = 0.0
        for skill_name, spec in role_skills.items():
            user_level = _find_user_skill_level(user_skills, skill_name)
            required = spec["required_level"]
            weight = spec["importance_weight"]
            coverage = min(1.0, user_level / required) if required > 0 else 1.0
            ready_sum += coverage * weight
            total_weight += weight
        skill_readiness = (ready_sum / total_weight) * 100 if total_weight > 0 else 0.0
    else:
        skill_readiness = avg_skill_score * 100

    readiness = (
        skill_readiness * 0.60
        + experience_level * 0.15
        + education_level * 0.10
        + calibrated_confidence * 100 * 0.15
    )
    return round(max(0.0, min(100.0, readiness)), 2)


# ══════════════════════════════════════════════════════════════
#  SECTION 11 ─ MAIN INFERENCE  (backward-compatible)
# ══════════════════════════════════════════════════════════════

def model_inference(parsed_resume: Dict[str, Any], target_role: str) -> Dict[str, Any]:
    """
    Run ML model inference on the parsed resume data for a target role.

    This function is backward-compatible with the roadmap pipeline.
    It now includes skill normalization, confidence calibration, and
    top-3 predictions alongside the existing output keys.

    Args:
        parsed_resume: Output of resume_parser() — must have:
            skills, experience_level, projects_count, education_level
        target_role: The role the user wants to transition to.

    Returns:
        {
            "predicted_salary": float,
            "roi_score": float,
            "growth_rate": float,
            "readiness_score": float (0–100),
            "career_confidence": float (calibrated, 0–0.85),
            "role_key_used": str,
            "role_encoding": int,
            "top_predictions": [...],
            "explanation": {...},
        }
    """
    import utils.salary_predictor as salary_mod
    from data.role_skill_map import get_skills_for_role, resolve_role_key

    # ── 1. Load ML artifacts ─────────────────────────────────
    _load_career_model()
    salary_mod._load_artifacts()

    # ── 2. SKILL NORMALIZATION (Task 1) ──────────────────────
    raw_skills = parsed_resume.get("skills", {})
    user_skills = normalize_skills(raw_skills)

    experience_level = parsed_resume.get("experience_level", 30)
    projects_count = parsed_resume.get("projects_count", 0)
    education_level = parsed_resume.get("education_level", 50)

    # ── 3. Resolve the target role ───────────────────────────
    role_enc, role_key = salary_mod._resolve_role(target_role)
    skill_map_key = resolve_role_key(target_role) or role_key
    role_skills = get_skills_for_role(target_role)

    logger.info(
        "model_inference: target='%s' → role_enc=%d, skill_map_key='%s', "
        "skills_count=%d, normalized_user_skills=%d",
        target_role, role_enc, skill_map_key, len(role_skills), len(user_skills),
    )

    # ── 4. Compute avg_skill_score ───────────────────────────
    avg_skill_score = _compute_avg_skill_score(user_skills, role_skills)

    # ── 5. CAREER MODEL PREDICTION (XGBoost) ─────────────────
    education_encoded = _encode_education(education_level)
    feature_vector = _build_feature_vector(
        user_skills, experience_level, projects_count, education_encoded,
    )

    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        career_proba = _career_model.predict_proba(feature_vector)[0]

    # ── 6. TOP-3 PREDICTIONS (Task 2) ────────────────────────
    top_predictions = _get_top_k_predictions(career_proba, TOP_K_PREDICTIONS)

    # ── 7. CONFIDENCE CALIBRATION (Task 4) ───────────────────
    raw_target_conf = float(career_proba[role_enc]) if role_enc < len(career_proba) else 0.0
    calibrated_confidence = _calibrate_confidence(raw_target_conf)

    logger.info(
        "Career model: top1=%s (%.3f) | target=%s raw=%.3f → calibrated=%.3f",
        top_predictions[0]["role"], top_predictions[0]["confidence"],
        target_role, raw_target_conf, calibrated_confidence,
    )

    # ── 8. FINANCIALS ────────────────────────────────────────
    financials = _compute_financials_for_role(
        role_enc, avg_skill_score, experience_level, calibrated_confidence,
    )

    # ── 9. READINESS ─────────────────────────────────────────
    readiness_score = _compute_readiness(
        user_skills, role_skills,
        experience_level, education_level,
        calibrated_confidence, avg_skill_score,
    )

    # ── 10. EXPLAINABILITY (Task 3) ──────────────────────────
    explanation = _explain_prediction(user_skills, skill_map_key, calibrated_confidence)

    # ── 11. Assemble result (backward-compatible keys first) ─
    result = {
        # Backward-compatible keys (used by roadmap_generator)
        "predicted_salary": financials["salary_estimate"],
        "roi_score": financials["roi"],
        "growth_rate": financials["growth_rate"],
        "readiness_score": readiness_score,
        "role_key_used": skill_map_key,
        "role_encoding": role_enc,
        # Enhanced output
        "career_confidence": calibrated_confidence,
        "top_predictions": top_predictions,
        "explanation": explanation,
    }

    logger.info(
        "model_inference complete → salary=₹%.2f | roi=%.2f | "
        "growth=%.1f%% | readiness=%.1f%% | confidence=%.3f",
        financials["salary_estimate"], financials["roi"],
        financials["growth_rate"], readiness_score, calibrated_confidence,
    )
    return result


# ══════════════════════════════════════════════════════════════
#  SECTION 12 ─ ENHANCED MULTI-ROLE ANALYSIS  (Tasks 5 & 6)
# ══════════════════════════════════════════════════════════════

def enhanced_career_analysis(parsed_resume: Dict[str, Any], target_role: str = "") -> Dict[str, Any]:
    """
    TASKS 5 & 6: Full multi-role career analysis.

    1. Normalizes skills
    2. Runs XGBoost → top-3 predictions
    3. For each top role: compute salary, ROI, readiness, explanation
    4. If target_role is given, ensure it's included even if not in top-3
    5. Returns clean structured output for API consumption

    Args:
        parsed_resume: Output of resume_parser()
        target_role:   Optional — the specific role the user is targeting.
                       If empty, uses the model's #1 prediction.

    Returns:
        {
            "predictions": [
                {
                    "role": str,
                    "confidence": float,
                    "financials": { salary, roi, growth, payback },
                    "readiness_score": float,
                    "explanation": { matched, missing, recommendations }
                },
                ... (up to 3)
            ],
            "primary_prediction": { ... same as predictions[0] ... },
            "skills_normalized": { ... },
            "education_level": str,
            "model_metadata": { ... }
        }
    """
    import utils.salary_predictor as salary_mod
    from data.role_skill_map import get_skills_for_role, resolve_role_key

    # ── 1. Load artifacts ────────────────────────────────────
    _load_career_model()
    salary_mod._load_artifacts()

    # ── 2. Normalize skills ──────────────────────────────────
    raw_skills = parsed_resume.get("skills", {})
    user_skills = normalize_skills(raw_skills)

    experience_level = parsed_resume.get("experience_level", 30)
    projects_count = parsed_resume.get("projects_count", 0)
    education_level = parsed_resume.get("education_level", 50)

    # ── 3. Build features & predict ──────────────────────────
    education_encoded = _encode_education(education_level)
    feature_vector = _build_feature_vector(
        user_skills, experience_level, projects_count, education_encoded,
    )

    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        career_proba = _career_model.predict_proba(feature_vector)[0]

    # ── 4. Top-K predictions ─────────────────────────────────
    top_preds = _get_top_k_predictions(career_proba, TOP_K_PREDICTIONS)

    # ── 5. Ensure target_role is included ────────────────────
    target_role_enc = None
    if target_role:
        role_enc, role_key = salary_mod._resolve_role(target_role)
        target_role_enc = role_enc
        # If target not already in top-K, append it
        top_class_ids = {p["class_id"] for p in top_preds}
        if role_enc not in top_class_ids:
            raw_conf = float(career_proba[role_enc]) if role_enc < len(career_proba) else 0.0
            role_info = CAREER_MODEL_ROLES.get(role_enc, {
                "name": target_role.title(),
                "salary_category": 1,
                "key": role_key,
            })
            top_preds.append({
                "class_id": role_enc,
                "role": role_info["name"],
                "role_key": role_info["key"],
                "salary_category": role_info["salary_category"],
                "raw_confidence": round(raw_conf, 4),
                "confidence": _calibrate_confidence(raw_conf),
            })

    # ── 6. Multi-role analysis (Task 5) ──────────────────────
    predictions = []
    for pred in top_preds:
        role_key_for_pred = pred["role_key"]
        role_skills = get_skills_for_role(role_key_for_pred)
        avg_ss = _compute_avg_skill_score(user_skills, role_skills)

        # Financials
        fin = _compute_financials_for_role(
            pred["salary_category"],
            avg_ss,
            experience_level,
            pred["confidence"],
        )

        # Readiness
        readiness = _compute_readiness(
            user_skills, role_skills,
            experience_level, education_level,
            pred["confidence"], avg_ss,
        )

        # Explainability
        skill_map_key = resolve_role_key(role_key_for_pred) or role_key_for_pred
        explanation = _explain_prediction(user_skills, skill_map_key, pred["confidence"])

        predictions.append({
            "role": pred["role"],
            "role_key": pred["role_key"],
            "class_id": pred["class_id"],
            "confidence": pred["confidence"],
            "raw_confidence": pred["raw_confidence"],
            "readiness_score": readiness,
            "financials": fin,
            "explanation": explanation,
            "is_target": (pred["class_id"] == target_role_enc) if target_role_enc is not None else False,
        })

    # Sort: target role first (if present), then by confidence
    predictions.sort(
        key=lambda p: (p["is_target"], p["confidence"]),
        reverse=True,
    )

    # ── 7. Identify the primary prediction ───────────────────
    primary = predictions[0] if predictions else None

    # ── 8. CLEAN API OUTPUT (Task 6) ─────────────────────────
    result = {
        "predictions": predictions,
        "primary_prediction": primary,
        "skills_normalized": user_skills,
        "normalization_applied": len(raw_skills) != len(user_skills) or set(raw_skills.keys()) != set(user_skills.keys()),
        "education_level": _map_education_score_to_label(education_level),
        "model_metadata": {
            "model_type": type(_career_model).__name__,
            "n_features": _career_model.n_features_in_,
            "n_classes": getattr(_career_model, 'n_classes_', len(career_proba)),
            "calibration_cap": MAX_CALIBRATED_CONFIDENCE,
            "top_k": TOP_K_PREDICTIONS,
        },
    }

    logger.info(
        "enhanced_career_analysis → %d predictions | primary=%s (%.3f)",
        len(predictions),
        primary["role"] if primary else "None",
        primary["confidence"] if primary else 0,
    )
    return result


# ══════════════════════════════════════════════════════════════
#  SECTION 13 ─ HELPER FUNCTIONS
# ══════════════════════════════════════════════════════════════

def _compute_avg_skill_score(
    user_skills: Dict[str, int],
    role_skills: Dict[str, dict],
) -> float:
    """Weighted average of user skill coverage against role requirements."""
    if role_skills:
        total_weight = 0.0
        weighted_sum = 0.0
        for skill_name, spec in role_skills.items():
            user_level = _find_user_skill_level(user_skills, skill_name)
            required = spec["required_level"]
            weight = spec["importance_weight"]
            coverage = min(1.0, user_level / required) if required > 0 else 1.0
            weighted_sum += coverage * weight
            total_weight += weight
        return round(weighted_sum / total_weight, 4) if total_weight > 0 else 0.0
    else:
        vals = list(user_skills.values())
        return round(sum(vals) / (len(vals) * 100), 4) if vals else 0.0


def _find_user_skill_level(user_skills: Dict[str, int], target_skill: str) -> int:
    """
    Find the user's proficiency for a target skill.
    Uses fuzzy matching: exact → substring → word overlap.

    Returns 0 if no match found.
    """
    target_lower = target_skill.lower().strip()

    # Exact match
    if target_lower in user_skills:
        return user_skills[target_lower]

    # Substring match (either direction)
    for skill_name, level in user_skills.items():
        if target_lower in skill_name or skill_name in target_lower:
            return level

    # Word overlap (at least 50%)
    target_words = set(target_lower.split())
    best_score, best_level = 0.0, 0
    for skill_name, level in user_skills.items():
        skill_words = set(skill_name.split())
        if not target_words or not skill_words:
            continue
        overlap = len(target_words & skill_words)
        score = overlap / max(len(target_words), len(skill_words))
        if score > best_score:
            best_score = score
            best_level = level

    return best_level if best_score >= 0.5 else 0
