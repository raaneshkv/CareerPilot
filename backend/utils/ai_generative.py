import os
import json
import logging
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GROQ_API_KEY")
if api_key:
    client = Groq(api_key=api_key)
else:
    logging.warning("GROQ_API_KEY not found in environment variables. Generative endpoints will fail.")
    client = None

# Using the powerful Llama 3.3 70b model which is excellent for structured JSON output
MODEL_NAME = "llama-3.3-70b-versatile"

# ──────────────────────────────────────────────────────────────
# 1. ROADMAP GENERATION
# ──────────────────────────────────────────────────────────────
def generate_roadmap(resume_text: str = None, roadmap_target: str = None) -> dict:
    if not client:
        raise ValueError("Groq client not initialized")
        
    system_prompt = """You are a career advisor AI. Analyze the candidate's background and return a structured JSON career roadmap. Return ONLY a valid JSON object matching this schema exactly:
{
  "summary": "Brief 1-2 sentence summary",
  "current_skills": ["skill1", "skill2"],
  "career_roles": ["role1", "role2"],
  "nodes": [
    {
      "id": "node-1",
      "title": "Short title",
      "description": "Why this matters",
      "currentLevel": 30,
      "targetLevel": 80,
      "category": "frontend|backend|devops|softskills|data|design",
      "status": "pending",
      "concepts": ["concept1", "concept2", "concept3"],
      "resources": {
        "youtube": [{"label": "Name", "url": "https://..."}],
        "docs": [{"label": "Name", "url": "https://..."}],
        "github": []
      }
    }
  ]
}

Provide 6-10 highly relevant nodes. Ensure valid JSON output."""

    user_input = f"Target Role: {roadmap_target}" if roadmap_target else f"Resume:\n{resume_text}"

    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_input}
        ],
        response_format={"type": "json_object"},
        temperature=0.7,
    )
    
    try:
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        logging.error(f"JSON Parse Error: {e}")
        raise ValueError("Failed to parse AI response into JSON")


# ──────────────────────────────────────────────────────────────
# 2. MOCK INTERVIEW GENERATION
# ──────────────────────────────────────────────────────────────
def generate_interview_questions(role: str, skills: list, resume_text: str) -> list:
    if not client:
        raise ValueError("Groq client not initialized")
        
    system_prompt = f"""You are an experienced interviewer for the role: {role}.
Skills: {', '.join(skills)}

Generate exactly 8 structured interview questions (mix of technical, behavioral, hr). Mix difficulties (easy, medium, hard). 
Return ONLY a valid JSON object with a single 'questions' array:
{{
  "questions": [
    {{
      "question": "The text",
      "type": "technical",
      "difficulty": "medium"
    }}
  ]
}}"""

    user_input = f"Candidate Resume:\n{resume_text}" if resume_text else "No resume provided."

    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_input}
        ],
        response_format={"type": "json_object"},
        temperature=0.8,
    )
    
    try:
        data = json.loads(response.choices[0].message.content)
        return data.get("questions", [])
    except Exception as e:
        logging.error(f"JSON Parse Error: {e}")
        raise ValueError("Failed to parse AI response")


# ──────────────────────────────────────────────────────────────
# 3. MOCK INTERVIEW EVALUATION
# ──────────────────────────────────────────────────────────────
def evaluate_interview_answer(question: str, answer: str, q_type: str, role: str) -> dict:
    if not client:
        raise ValueError("Groq client not initialized")
        
    system_prompt = f"""You are a senior {role} interviewer. Evaluate the candidate's answer to this {q_type} question.
Score from 1 to 10. Return ONLY a JSON object:
{{
  "technical_score": 8,
  "clarity_score": 7,
  "structure_score": 9,
  "feedback": "Your answer was good because... but improve..."
}}"""

    user_input = f"Question: {question}\nAnswer: {answer}"

    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_input}
        ],
        response_format={"type": "json_object"},
        temperature=0.4,
    )
    
    try:
        return json.loads(response.choices[0].message.content)
    except Exception:
        raise ValueError("Evaluation failed")


# ──────────────────────────────────────────────────────────────
# 4. CAREER CHAT
# ──────────────────────────────────────────────────────────────
def generate_chat_response(message: str, history: list, context: str) -> str:
    if not client:
        raise ValueError("Groq client not initialized")
        
    system_prompt = f"""You are an expert AI Career Mentor for Indian tech professionals.
You are professional, encouraging, and provide highly actionable, specific advice based on the 2025 tech market.
Keep responses concise but detailed using bullet points when necessary. Do not use overly fluffy language.

User Context:
{context if context else 'No context available.'}"""

    messages = [{"role": "system", "content": system_prompt}]
    
    for msg in history:
        messages.append({"role": msg.get("role", "user"), "content": msg.get("content", "")})
        
    messages.append({"role": "user", "content": message})

    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=messages,
        temperature=0.7,
    )
    
    return response.choices[0].message.content
