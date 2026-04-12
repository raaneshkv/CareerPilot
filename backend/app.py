"""
app.py — CareerPilot Backend API
==================================
Main entry point for the FastAPI server.

REQUEST → RESPONSE FLOW:
─────────────────────────
  1.  Client sends POST /match with JSON { "resume": "...", "job": "..." }
  2.  app.py validates the payload via Pydantic schema
  3.  app.py calls  compute_match_score(resume, job)
        └─ utils/matcher.py encodes both texts with the trained model
        └─ computes cosine similarity → returns score 0–100
  4.  app.py calls  find_missing_skills(resume, job)
        └─ utils/skills.py extracts keywords & returns the gap
  5.  app.py returns JSON { "match_score": 82.5, "missing_skills": [...] }

WHY FastAPI OVER Flask:
  • Async-ready, faster performance out of the box
  • Auto-generated OpenAPI docs at /docs
  • Pydantic validation for request/response schemas
  • Type hints throughout
"""

import logging
import time
from contextlib import asynccontextmanager
from typing import List

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from model.loader import load_model, get_model
from utils.matcher import compute_match_score, rank_candidates, semantic_similarity
from utils.skills import find_missing_skills

# ──────────────────────────────────────────────────────────────
# Logging configuration
# ──────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s — %(message)s",
)
logger = logging.getLogger(__name__)


# ──────────────────────────────────────────────────────────────
# Lifespan: load the model ONCE at server startup
# ──────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    FastAPI lifespan event handler.
    The model is loaded here so it is ready BEFORE any request arrives.
    This avoids cold-start latency on the first API call.
    """
    logger.info("🚀 Starting CareerPilot backend …")
    start = time.time()
    load_model()  # loads from <project_root>/careerpilot_model
    elapsed = time.time() - start
    logger.info("🏁 Model ready in %.2f seconds", elapsed)
    yield  # ← server runs and serves requests during this yield
    logger.info("🛑 Shutting down CareerPilot backend …")


# ──────────────────────────────────────────────────────────────
# FastAPI app instance
# ──────────────────────────────────────────────────────────────
app = FastAPI(
    title="CareerPilot API",
    description="Resume ↔ Job matching powered by a fine-tuned SentenceTransformer",
    version="1.0.0",
    lifespan=lifespan,
)

# Allow CORS so the Vite frontend can call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],           # tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ──────────────────────────────────────────────────────────────
# Pydantic schemas
# ──────────────────────────────────────────────────────────────
class MatchRequest(BaseModel):
    """Input schema for the /match endpoint."""
    resume: str = Field(
        ...,
        min_length=10,
        description="Plain-text content of the candidate's resume",
        json_schema_extra={"example": "Experienced Python developer with 5 years in machine learning, NLP, and data engineering. Proficient in TensorFlow, PyTorch, scikit-learn, and SQL."},
    )
    job: str = Field(
        ...,
        min_length=10,
        description="Plain-text content of the job description",
        json_schema_extra={"example": "Looking for a Senior ML Engineer with expertise in Python, deep learning, NLP, Kubernetes, and cloud deployment on AWS."},
    )


class MatchResponse(BaseModel):
    """Output schema for the /match endpoint."""
    match_score: float = Field(
        ...,
        ge=0,
        le=100,
        description="Similarity score between resume and job (0–100)",
    )
    missing_skills: List[str] = Field(
        ...,
        description="Skills found in the job description but missing from the resume",
    )


# ──────────────────────────────────────────────────────────────
# Health check endpoint
# ──────────────────────────────────────────────────────────────
@app.get("/health", tags=["System"])
async def health_check():
    """Quick health check — also confirms the model is loaded."""
    try:
        model = get_model()
        return {
            "status": "healthy",
            "model_loaded": True,
            "embedding_dim": model.get_sentence_embedding_dimension(),
        }
    except RuntimeError:
        return {"status": "unhealthy", "model_loaded": False}


# ──────────────────────────────────────────────────────────────
# POST /match  —  THE CORE ENDPOINT
# ──────────────────────────────────────────────────────────────
@app.post(
    "/match",
    response_model=MatchResponse,
    tags=["Matching"],
    summary="Match a resume against a job description",
)
async def match_resume_to_job(payload: MatchRequest):
    """
    Accepts resume and job text, returns:
      • **match_score** — cosine-similarity-based score (0–100)
      • **missing_skills** — keywords in the job but not in the resume

    ### Where the trained model is used
    `compute_match_score()` calls `model.encode()` on both texts,
    producing 384-dim embeddings, then calculates cosine similarity.
    """
    try:
        start = time.time()

        # ── 1. Semantic match score (uses the trained model) ─────
        score = compute_match_score(payload.resume, payload.job)

        # ── 2. Keyword-based skill gap analysis ─────────────────
        missing = find_missing_skills(payload.resume, payload.job)

        elapsed_ms = round((time.time() - start) * 1000, 1)
        logger.info(
            "POST /match → score=%.2f | missing=%d skills | %s ms",
            score, len(missing), elapsed_ms,
        )

        return MatchResponse(match_score=score, missing_skills=missing)

    except Exception as exc:
        logger.exception("Error in /match endpoint")
        raise HTTPException(status_code=500, detail=str(exc))


# ──────────────────────────────────────────────────────────────
# Pydantic Schemas for Generative AI (Replaces Edge Functions)
# ──────────────────────────────────────────────────────────────
from utils.ai_generative import (
    generate_interview_questions, 
    evaluate_interview_answer, 
    generate_chat_response,
    analyze_finances,
    analyze_edu_investment,
)
from utils.salary_predictor import predict_career_financials
from utils.resume_parser import resume_parser
from utils.model_inference import model_inference, enhanced_career_analysis
from typing import List, Dict, Optional, Any
from utils.roadmap_generator import roadmap_generator

class RoadmapRequest(BaseModel):
    resumeText: Optional[str] = None
    fileName: Optional[str] = None
    roadmapTarget: Optional[str] = None


# ── AI Career Roadmap Generator Schemas ──────────────────────
class AnalyzeResumeRequest(BaseModel):
    """Input schema for POST /analyze-resume."""
    resume_text: str = Field(
        ...,
        min_length=50,
        description="Plain-text content of the candidate's resume",
    )

class GenerateRoadmapRequest(BaseModel):
    """Input schema for POST /generate-roadmap."""
    resume_text: str = Field(
        ...,
        min_length=50,
        description="Plain-text content of the candidate's resume",
    )
    target_role: str = Field(
        ...,
        min_length=2,
        description="The career role the user wants to transition to",
    )
    hours_per_week: int = Field(
        default=20,
        ge=1,
        le=80,
        description="How many hours per week the user can study (default 20)",
    )

class InterviewGenRequest(BaseModel):
    role: str
    skills: List[str] = []
    resumeText: str = ""

class InterviewEvalRequest(BaseModel):
    question: str
    answer: str
    questionType: str
    role: str

class ChatRequest(BaseModel):
    message: str
    conversationHistory: list = []
    userContext: str = ""


# ── Finance Decision Maker Schemas ───────────────────────────
class IncomeSource(BaseModel):
    type: str  # allowance | freelance | internship | part_time | scholarship | none
    amount: float
    stability: str  # low | medium | high

class FinanceProfile(BaseModel):
    age: int
    status: str
    income_sources: List[IncomeSource]
    expected_income_growth_rate: float

class FinanceExpenses(BaseModel):
    fixed: float
    variable: float

class FinanceState(BaseModel):
    current_savings: float
    investments: float
    debt: float
    debt_interest_rate: float
    monthly_debt_payment: float

class FinanceGoal(BaseModel):
    name: str
    target_amount: float
    time_horizon_months: int
    priority: str  # high | medium | low

class FinanceAssumptions(BaseModel):
    expected_return_rate: float
    inflation_rate: float

class FinanceRequest(BaseModel):
    profile: FinanceProfile
    expenses: FinanceExpenses
    financial_state: FinanceState
    goals: List[FinanceGoal]
    assumptions: FinanceAssumptions

# ──────────────────────────────────────────────────────────────
# AI CAREER ROADMAP GENERATOR ENDPOINTS
# ──────────────────────────────────────────────────────────────

@app.post("/analyze-resume", tags=["AI Roadmap Generator"])
async def api_analyze_resume(payload: AnalyzeResumeRequest):
    """
    Step 1: Parse a resume using AI/NLP.
    Extracts structured skill data, experience level, projects, education,
    and domain exposure — all inferred from the resume content.
    """
    try:
        start = time.time()
        parsed = resume_parser(payload.resume_text)
        elapsed_ms = round((time.time() - start) * 1000, 1)
        logger.info("POST /analyze-resume → %d skills extracted | %s ms", len(parsed.get("skills", {})), elapsed_ms)
        return {"parsed_resume": parsed}
    except Exception as exc:
        logger.exception("Error in /analyze-resume")
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/generate-roadmap", tags=["AI Roadmap Generator"])
async def api_generate_roadmap(payload: GenerateRoadmapRequest):
    """
    Full AI Career Roadmap pipeline:
      Resume → Skill Extraction → Model Prediction → AI Roadmap → Insights

    Steps:
      1. Parse resume (LLM-powered skill extraction)
      2. Load role skill map
      3. ML model inference (salary, ROI, growth, readiness)
      4–6. Skill gap + priority score + time estimation
      7–9. Roadmap generation + readiness progression + ROI impact
      + Smart alerts
    """
    try:
        start = time.time()

        # Step 1: Resume Parsing
        parsed = resume_parser(payload.resume_text)

        # Steps 2–3: Model Inference (loads role skill map internally)
        model_out = model_inference(parsed, payload.target_role)

        # Steps 4–9: Roadmap Generation
        roadmap_result = roadmap_generator(
            parsed_resume=parsed,
            model_output=model_out,
            target_role=payload.target_role,
            hours_per_week=payload.hours_per_week,
        )

        elapsed_ms = round((time.time() - start) * 1000, 1)
        logger.info(
            "POST /generate-roadmap → role='%s' | %d steps | readiness %.0f%%→%.0f%% | %s ms",
            payload.target_role,
            len(roadmap_result.get("roadmap", [])),
            roadmap_result.get("initial_readiness", 0),
            roadmap_result.get("final_readiness", 0),
            elapsed_ms,
        )
        return roadmap_result
    except Exception as exc:
        logger.exception("Error in /generate-roadmap")
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/roadmap", tags=["AI Roadmap Generator"])
async def api_roadmap_legacy(payload: RoadmapRequest):
    """
    Roadmap endpoint — uses the new AI pipeline but returns data in the
    format the frontend expects: { roadmap: { nodes, summary, current_skills, ... } }
    """
    try:
        resume_text = payload.resumeText or ""
        target_role = payload.roadmapTarget or ""

        if len(resume_text) < 50 and not target_role:
            raise HTTPException(status_code=400, detail="Please provide resumeText (min 50 chars) or a roadmapTarget.")

        # If only target_role is given, generate a generic roadmap
        if len(resume_text) < 50:
            parsed = {
                "skills": {},
                "experience_level": 20,
                "projects_count": 0,
                "education_level": 50,
                "domain_exposure": [],
            }
        else:
            parsed = resume_parser(resume_text)

        if not target_role:
            target_role = "software engineer"

        model_out = model_inference(parsed, target_role)
        roadmap_result = roadmap_generator(
            parsed_resume=parsed,
            model_output=model_out,
            target_role=target_role,
        )

        # ── Transform new format → old frontend format ────────
        roadmap_steps = roadmap_result.get("roadmap", [])
        alerts = roadmap_result.get("alerts", [])

        # Map skill categories for frontend icons
        _SKILL_CATEGORIES = {
            "python": "backend", "java": "backend", "sql": "backend",
            "javascript": "frontend", "react": "frontend", "html": "frontend",
            "css": "frontend", "typescript": "frontend", "next.js": "frontend",
            "tailwindcss": "frontend", "responsive design": "frontend",
            "node.js": "backend", "rest api": "backend", "docker": "devops",
            "kubernetes": "devops", "ci/cd": "devops", "aws": "devops",
            "azure": "devops", "gcp": "devops", "terraform": "devops",
            "linux": "devops", "git": "devops",
            "machine learning": "data", "deep learning": "data",
            "tensorflow": "data", "pytorch": "data", "pandas": "data",
            "numpy": "data", "scikit-learn": "data", "statistics": "data",
            "data visualization": "data", "spark": "data",
            "figma": "design", "ui/ux": "design", "wireframing": "design",
            "prototyping": "design", "adobe xd": "design",
            "communication": "softskills", "leadership": "softskills",
            "agile": "softskills", "stakeholder management": "softskills",
        }

        nodes = []
        for i, step in enumerate(roadmap_steps):
            skill_name = step["skill"]
            category = _SKILL_CATEGORIES.get(skill_name.lower(), "backend")

            node = {
                "id": f"node-{i+1}",
                "title": f"Learn {skill_name.title()}",
                "description": (
                    f"Bridge your skill gap from {step['current_level']}% to {step['required_level']}%. "
                    f"Estimated {step['estimated_duration_weeks']:.1f} weeks. "
                    f"Priority: {step['priority_score']:.0f}/100. "
                    f"ROI impact: {step['roi_impact']:.1f}."
                ),
                "currentLevel": step["current_level"],
                "targetLevel": step["required_level"],
                "category": category,
                "status": "completed" if step["gap"] == 0 else "pending",
                "concepts": [
                    f"Gap: {step['gap']} points to close",
                    f"Expected readiness after: {step['expected_readiness_after']:.0f}%",
                    f"Duration: ~{step['estimated_duration_weeks']:.1f} weeks",
                ],
                "resources": {
                    "youtube": [],
                    "docs": [],
                    "github": [],
                },
            }
            nodes.append(node)

        # Build current_skills from the parsed resume
        current_skills = [s.title() for s in parsed.get("skills", {}).keys()]

        # Build skill_gaps for the radar chart
        skill_gaps = [
            {
                "skill": step["skill"].title(),
                "current": step["current_level"],
                "required": step["required_level"],
            }
            for step in roadmap_steps[:8]  # limit to 8 for radar chart readability
        ]

        # Build alert summary for the roadmap summary
        alert_texts = [a["message"] for a in alerts]
        summary = (
            f"AI Career Roadmap for {target_role.title()}. "
            f"Predicted salary: ₹{roadmap_result.get('predicted_salary', 0):,.0f}/month. "
            f"Readiness: {roadmap_result.get('initial_readiness', 0):.0f}% → {roadmap_result.get('final_readiness', 0):.0f}% after completion. "
            f"Total duration: ~{roadmap_result.get('total_duration_weeks', 0):.0f} weeks."
        )
        if alert_texts:
            summary += " ⚠ " + " | ".join(alert_texts[:2])

        frontend_roadmap = {
            "summary": summary,
            "current_skills": current_skills,
            "career_roles": [target_role.title()],
            "skill_gaps": skill_gaps,
            "nodes": nodes,
            # Also pass through the new data for any new frontend components
            "_ai_roadmap": roadmap_result,
        }

        logger.info(
            "POST /roadmap → role='%s' | %d nodes | readiness %.0f%%→%.0f%%",
            target_role, len(nodes),
            roadmap_result.get("initial_readiness", 0),
            roadmap_result.get("final_readiness", 0),
        )
        return {"roadmap": frontend_roadmap}
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Error in /roadmap")
        raise HTTPException(status_code=500, detail=str(exc))

@app.post("/interview/generate", tags=["AI Generation"])
async def api_interview_generate(payload: InterviewGenRequest):
    """Generates 8 interview questions."""
    try:
        questions = generate_interview_questions(payload.role, payload.skills, payload.resumeText)
        return {"questions": questions}
    except Exception as exc:
        logger.exception("Error generating interview questions")
        raise HTTPException(status_code=500, detail=str(exc))

@app.post("/interview/evaluate", tags=["AI Generation"])
async def api_interview_evaluate(payload: InterviewEvalRequest):
    """Evaluates an interview answer."""
    try:
        result = evaluate_interview_answer(payload.question, payload.answer, payload.questionType, payload.role)
        return result
    except Exception as exc:
        logger.exception("Error evaluating interview answer")
        raise HTTPException(status_code=500, detail=str(exc))

@app.post("/chat", tags=["AI Generation"])
async def api_chat(payload: ChatRequest):
    """Answers a career query."""
    try:
        response_text = generate_chat_response(payload.message, payload.conversationHistory, payload.userContext)
        return {"response": response_text}
    except Exception as exc:
        logger.exception("Error generating chat response")
        raise HTTPException(status_code=500, detail=str(exc))

@app.post("/finance/analyze", tags=["AI Generation"])
async def api_finance_analyze(payload: FinanceRequest):
    """Runs the AI Financial Decision Maker — returns full analysis JSON."""
    try:
        result = analyze_finances(payload.model_dump())
        return result
    except Exception as exc:
        logger.exception("Error in /finance/analyze")
        raise HTTPException(status_code=500, detail=str(exc))


# ── Educational Investment Analyst Schemas ───────────────────
class EduUserProfile(BaseModel):
    current_status: str          # student | intern | working
    current_skills: List[str]
    target_field: str
    preferred_location: str = ""

class EduIncomePlan(BaseModel):
    job_role: str

class EduEducationPlan(BaseModel):
    type: str                    # course | degree | certification
    name: str
    cost: float
    duration_months: int

class EduMarketData(BaseModel):
    demand_level: str            # low | medium | high
    competition_level: str       # low | medium | high
    trend_growth_rate: float     # annual %

class EduFinanceRequest(BaseModel):
    user_profile: EduUserProfile
    income_plan: EduIncomePlan
    education_plan: EduEducationPlan
    market_data: EduMarketData


@app.post("/finance/edu-analyze", tags=["AI Generation"])
async def api_finance_edu_analyze(payload: EduFinanceRequest):
    """
    AI Educational Investment Analyst.
    Evaluates if a course/degree/certification is financially worthwhile.
    Returns ROI, payback period, verdict, market insights, and recommendations.
    """
    try:
        result = analyze_edu_investment(payload.model_dump())
        logger.info("POST /finance/edu-analyze → verdict=%s", result.get("decision", {}).get("verdict", "?"))
        return result
    except Exception as exc:
        logger.exception("Error in /finance/edu-analyze")
        raise HTTPException(status_code=500, detail=str(exc))


# ── ML Career Financial Analysis Schemas ─────────────────────
class CareerFinanceUserProfile(BaseModel):
    current_status: str          # student | intern | working
    skills: List[str]
    preferred_location: str = ""

class CareerFinanceCareerChoice(BaseModel):
    job_role: str

class CareerFinanceEducationPlan(BaseModel):
    type: str                    # course | degree | certification
    name: str
    cost: float
    duration_months: int

class CareerFinanceRequest(BaseModel):
    user_profile: CareerFinanceUserProfile
    career_choice: CareerFinanceCareerChoice
    education_plan: CareerFinanceEducationPlan


@app.post("/career/financial-analysis", tags=["Career Finance"])
async def api_career_financial_analysis(payload: CareerFinanceRequest):
    """
    ML-backed Career Financial Decision Engine.
    Uses the trained salary model + skill analysis + market heuristics
    to evaluate whether an educational investment is financially worthwhile.

    Returns: skill_analysis, salary_prediction, roi_analysis, decision,
             market_insights, recommendations.
    """
    try:
        result = predict_career_financials(payload.model_dump())
        logger.info(
            "POST /career/financial-analysis → verdict=%s, roi=%.2f",
            result["decision"]["verdict"],
            result["roi_analysis"]["roi_value"],
        )
        return result
    except Exception as exc:
        logger.exception("Error in /career/financial-analysis")
        raise HTTPException(status_code=500, detail=str(exc))


# ──────────────────────────────────────────────────────────────
# ENHANCED CAREER PREDICTION  (XGBoost career_model.pkl)
# ──────────────────────────────────────────────────────────────

class CareerPredictRequest(BaseModel):
    """Input schema for POST /career/predict."""
    resume_text: str = Field(
        ...,
        min_length=50,
        description="Plain-text content of the candidate's resume",
    )
    target_role: str = Field(
        default="",
        description="Optional — the specific career role the user is targeting. "
                    "If empty, the model's top prediction is used.",
    )


@app.post("/career/predict", tags=["Career Prediction"])
async def api_career_predict(payload: CareerPredictRequest):
    """
    Enhanced Career Prediction Engine.

    Uses the XGBoost career model (career_model.pkl) to produce:
      • **Top-3 predicted career roles** with calibrated confidence scores
      • **Explainability** — matched skills, missing skills, recommendations
      • **Multi-role financials** — salary, ROI, growth for each predicted role
      • **Readiness score** — how prepared the user is for each career path

    The pipeline applies:
      1. Skill normalization (synonym resolution)
      2. One-hot feature vectorization (141 features)
      3. XGBoost predict_proba → top-3 predictions
      4. Confidence calibration (capped at 0.85)
      5. Per-role financial analysis & explainability

    ### Response Structure
    ```json
    {
      "predictions": [
        {
          "role": "ML/AI Engineer",
          "confidence": 0.82,
          "readiness_score": 67.5,
          "financials": { "salary_estimate": 85000, "roi": 7.2, ... },
          "explanation": {
            "matched_skills": ["python", "machine learning"],
            "missing_skills": ["pytorch", "docker"],
            "recommendations": ["..."],
            "match_ratio": "8/14"
          }
        },
        ... (up to 3 roles)
      ],
      "primary_prediction": { ... best match ... },
      "skills_normalized": { ... },
      "model_metadata": { ... }
    }
    ```
    """
    try:
        start = time.time()

        # Step 1: Parse resume via LLM
        parsed = resume_parser(payload.resume_text)

        # Step 2: Run enhanced multi-role analysis
        result = enhanced_career_analysis(parsed, payload.target_role)

        elapsed_ms = round((time.time() - start) * 1000, 1)
        primary = result.get("primary_prediction", {})
        logger.info(
            "POST /career/predict → primary=%s (%.3f) | %d predictions | %s ms",
            primary.get("role", "?"),
            primary.get("confidence", 0),
            len(result.get("predictions", [])),
            elapsed_ms,
        )
        return result

    except Exception as exc:
        logger.exception("Error in /career/predict")
        raise HTTPException(status_code=500, detail=str(exc))


# ──────────────────────────────────────────────────────────────
# TRAINED MODEL ENDPOINTS  (use get_model() directly)
# ──────────────────────────────────────────────────────────────
from sentence_transformers import util as st_util

class ATSRequest(BaseModel):
    resume: str       # full resume text (all fields concatenated)
    job_description: str

class RoleSimilarityRequest(BaseModel):
    current_role: str
    target_role: str

class CareerRankRequest(BaseModel):
    user_profile: str      # natural-language description of the user
    careers: List[str]     # career titles to rank


@app.post("/model/ats-score", tags=["Trained Model"])
async def model_ats_score(payload: ATSRequest):
    """
    Uses the trained SentenceTransformer to compute a semantic
    resume ↔ job-description match score (0–100) + missing keywords.
    This is a *semantic* score — it understands synonyms and context,
    not just exact keyword matches.
    """
    try:
        score   = compute_match_score(payload.resume, payload.job_description)
        missing = find_missing_skills(payload.resume, payload.job_description)
        logger.info("POST /model/ats-score → semantic_score=%.2f | missing=%d", score, len(missing))
        return {"semantic_score": score, "missing_skills": missing}
    except Exception as exc:
        logger.exception("Error in /model/ats-score")
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/model/role-similarity", tags=["Trained Model"])
async def model_role_similarity(payload: RoleSimilarityRequest):
    """
    Uses the trained model to measure how semantically close
    a current role is to a target role.  Returns 0–100 score.
    """
    try:
        score = compute_match_score(payload.current_role, payload.target_role)
        logger.info("POST /model/role-similarity → score=%.2f", score)
        return {"similarity_score": score}
    except Exception as exc:
        logger.exception("Error in /model/role-similarity")
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/model/rank-careers", tags=["Trained Model"])
async def model_rank_careers(payload: CareerRankRequest):
    """
    Ranks a list of career titles by semantic similarity to the
    user's profile description using the trained SentenceTransformer.
    Returns careers sorted by score descending.
    """
    try:
        model       = get_model()
        profile_emb = model.encode(payload.user_profile, convert_to_tensor=True)

        results = []
        for career in payload.careers:
            career_emb = model.encode(career, convert_to_tensor=True)
            sim        = st_util.cos_sim(profile_emb, career_emb).item()
            score      = round(max(0.0, min(1.0, sim)) * 100, 2)
            results.append({"career": career, "semantic_score": score})

        results.sort(key=lambda x: x["semantic_score"], reverse=True)
        logger.info("POST /model/rank-careers → ranked %d careers", len(results))
        return {"ranked_careers": results}
    except Exception as exc:
        logger.exception("Error in /model/rank-careers")
        raise HTTPException(status_code=500, detail=str(exc))


# ──────────────────────────────────────────────────────────────
# SEMANTIC CAREER & SKILLS ENDPOINTS  (new, cleaner API surface)
# ──────────────────────────────────────────────────────────────

class CareerMatchRequest(BaseModel):
    profile_text: str           # concatenated user traits/interests/level
    career_titles: List[str]    # list of career titles to rank

class SimulateScoreRequest(BaseModel):
    current_role: str
    target_role: str

class SkillsRankRequest(BaseModel):
    user_skills_text: str       # comma-separated or free-text user skills
    market_skills: List[str]    # list of market skill names to rank

class IncomeMatchRequest(BaseModel):
    profile_text: str           # user status + income sources description
    income_types: List[str]     # income type labels to rank


@app.post("/career/match", tags=["Semantic Model"])
async def career_match(payload: CareerMatchRequest):
    """
    Rank career titles by semantic similarity to the user's profile text.
    Used by Career Discovery to blend model scores with heuristic scores.

    Returns ranked list: [{"career": str, "model_score": float}]
    """
    try:
        ranked = rank_candidates(payload.profile_text, payload.career_titles)
        result = [{"career": r["text"], "model_score": r["score"]} for r in ranked]
        logger.info("POST /career/match → ranked %d careers", len(result))
        return {"matches": result}
    except Exception as exc:
        logger.exception("Error in /career/match")
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/career/simulate-score", tags=["Semantic Model"])
async def career_simulate_score(payload: SimulateScoreRequest):
    """
    Return a Transition Ease Score (0–100) between two career roles.
    Higher score = more semantically similar = easier transition.
    Lower score = bigger career pivot = more effort required.

    Used by the What-If Simulation page.
    """
    try:
        score = semantic_similarity(payload.current_role, payload.target_role)
        # Derive a human-readable effort label from the score
        if score >= 70:
            effort_label = "Low effort — roles are closely related"
        elif score >= 50:
            effort_label = "Moderate effort — some skill overlap"
        elif score >= 30:
            effort_label = "High effort — significant pivot required"
        else:
            effort_label = "Very high effort — completely different domains"
        logger.info("POST /career/simulate-score → score=%.2f", score)
        return {"transition_ease_score": score, "effort_label": effort_label}
    except Exception as exc:
        logger.exception("Error in /career/simulate-score")
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/skills/rank", tags=["Semantic Model"])
async def skills_rank(payload: SkillsRankRequest):
    """
    Rank market skill names by semantic relevance to the user's existing skills.
    Used by the Market Trends page to highlight "Most Relevant to You" column.

    Returns: [{"skill": str, "relevance_score": float}] sorted high→low.
    """
    try:
        ranked = rank_candidates(payload.user_skills_text, payload.market_skills)
        result = [{"skill": r["text"], "relevance_score": r["score"]} for r in ranked]
        logger.info("POST /skills/rank → ranked %d skills", len(result))
        return {"ranked_skills": result}
    except Exception as exc:
        logger.exception("Error in /skills/rank")
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/finance/income-match", tags=["Semantic Model"])
async def finance_income_match(payload: IncomeMatchRequest):
    """
    Rank income types by semantic relevance to the user's profile.
    Used by the Finance page to personalise income suggestions.

    Returns: [{"income_type": str, "relevance_score": float}] sorted high→low.
    """
    try:
        ranked = rank_candidates(payload.profile_text, payload.income_types)
        result = [{"income_type": r["text"], "relevance_score": r["score"]} for r in ranked]
        logger.info("POST /finance/income-match → ranked %d income types", len(result))
        return {"ranked_income_types": result}
    except Exception as exc:
        logger.exception("Error in /finance/income-match")
        raise HTTPException(status_code=500, detail=str(exc))


# ──────────────────────────────────────────────────────────────
# Run with:  python app.py   (development only)
# ──────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info",
    )
