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
from utils.matcher import compute_match_score
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
    generate_roadmap, 
    generate_interview_questions, 
    evaluate_interview_answer, 
    generate_chat_response
)

class RoadmapRequest(BaseModel):
    resumeText: str = None
    fileName: str = None
    roadmapTarget: str = None

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

# ──────────────────────────────────────────────────────────────
# GENERATIVE AI ENDPOINTS
# ──────────────────────────────────────────────────────────────
@app.post("/roadmap", tags=["AI Generation"])
async def api_roadmap(payload: RoadmapRequest):
    """Generates a structured career roadmap from Gemini API."""
    try:
        roadmap = generate_roadmap(payload.resumeText, payload.roadmapTarget)
        # Ensure nodes have an ID and status, just like the old Edge Function
        if "nodes" in roadmap:
            for i, node in enumerate(roadmap["nodes"]):
                node["id"] = node.get("id", f"node-{i+1}")
                node["status"] = node.get("status", "pending")
        return {"roadmap": roadmap}
    except Exception as exc:
        logger.exception("Error generating roadmap")
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
