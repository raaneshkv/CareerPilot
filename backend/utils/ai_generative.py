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


# ──────────────────────────────────────────────────────────────
# 5. FINANCIAL DECISION MAKER
# ──────────────────────────────────────────────────────────────
FINANCE_SYSTEM_PROMPT = """
You are an expert AI Financial Advisor integrated into a platform called CareerPilot.
Your task is to analyze user financial data, evaluate goal feasibility, and generate structured financial insights.

You MUST strictly follow the input schema, formulas, and output format.

-------------------------------------
⚙️ CALCULATION RULES (MANDATORY)
-------------------------------------

1. total_income = sum of all income_sources[].amount
2. total_expenses = fixed + variable
3. savings = total_income - total_expenses
4. savings_ratio = savings / total_income  (use 0 if total_income == 0)
5. emergency_fund_required = 6 × total_expenses
6. debt_ratio = monthly_debt_payment / total_income  (use 0 if total_income == 0)
7. Inflation Adjustment:
   future_goal_amount = target_amount × (1 + inflation_rate/100)^(time_horizon_months / 12)
8. Monthly Investment Required:
   required_monthly_investment = future_goal_amount / time_horizon_months
9. Compound Growth:
   A = P × (1 + r)^t
   where: r = expected_return_rate / 12 / 100, t = time_horizon_months
10. Goal Feasibility:
   IF required_monthly_investment <= savings: feasible = true ELSE: feasible = false
11. Budget Distribution:
   needs_percent = fixed / total_income × 100  (use 0 if total_income == 0)
   wants_percent = variable / total_income × 100  (use 0 if total_income == 0)
   savings_percent = savings / total_income × 100  (use 0 if total_income == 0)

-------------------------------------
🧠 ZERO-INCOME LOGIC (MANDATORY)
-------------------------------------

IF total_income == 0:
  - savings = -total_expenses
  - savings_ratio = 0
  - debt_ratio = 0
  - needs_percent = 0, wants_percent = 0, savings_percent = 0
  - Add alert: "No income detected. Immediate action required."
  - financial_health_score = 10

IF total_income > 0:
  - Continue normal calculations

-------------------------------------
💡 INCOME SUGGESTION ENGINE (MANDATORY)
-------------------------------------

ALWAYS populate income_suggestions if ANY of:
  - total_income == 0
  - savings < 0
  - any goal has feasible = false

Generate based on profile.status:

IF status == "student":
  Suggest: Freelancing (skills-based), Paid internships, Tutoring/academic help,
           Micro tasks (content/design/coding), Monetize skills via online platforms

IF status == "intern":
  Suggest: Skill upgrade for higher stipend, Freelance side income,
           Weekend consulting, Open-source contributions for visibility

IF status == "working":
  Suggest: Side hustle aligned to current skills, Upskilling for salary hike,
           Consulting/fractional work, Passive income streams

Each suggestion MUST have:
  - "source": specific name of the income source
  - "expected_range": realistic Indian rupee monthly range (e.g. "₹5,000 – ₹20,000/month")
  - "difficulty": "low" | "medium" | "high"
  - "reason": why this fits the user's exact situation

-------------------------------------
📊 OUTPUT FORMAT (STRICT JSON ONLY)
-------------------------------------

Return ONLY valid JSON. No explanations. No extra text.

{
  "financial_health_score": number,
  "summary": {
    "total_income": number,
    "monthly_savings": number,
    "savings_ratio": number,
    "debt_ratio": number,
    "emergency_fund_required": number,
    "emergency_fund_status": "adequate | insufficient"
  },
  "budget_analysis": {
    "needs_percent": number,
    "wants_percent": number,
    "savings_percent": number,
    "rule_followed": true/false
  },
  "goals_analysis": [
    {
      "name": string,
      "future_cost": number,
      "required_monthly_investment": number,
      "feasible": true/false,
      "priority": string,
      "suggestion": string
    }
  ],
  "income_suggestions": [
    {
      "source": string,
      "expected_range": string,
      "difficulty": "low | medium | high",
      "reason": string
    }
  ],
  "recommendations": [string, string, string],
  "alerts": [string]
}

-------------------------------------
📌 DECISION RULES
-------------------------------------

- financial_health_score is out of 100 using:
  - savings_ratio (30%)
  - debt_ratio (25%)
  - emergency fund status (20%)
  - goal feasibility (25%)

- If savings < 0: Add alert: "Negative savings. Immediate expense reduction required."
- If debt_ratio > 0.4: Add alert: "High debt risk."
- If emergency fund is insufficient: Recommend building emergency fund before investments
- If goal is not feasible: Suggest reduce expenses OR increase income OR extend timeline
- Prioritize HIGH priority goals in recommendations
- income_suggestions = [] ONLY when total_income > 0 AND all goals feasible AND savings >= 0
- Be precise and numerical. Round all values to 2 decimal places.
"""

def analyze_finances(financial_data: dict) -> dict:
    """Analyzes user financial data and returns structured JSON insights."""
    if not client:
        raise ValueError("Groq client not initialized")

    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=[
            {"role": "system", "content": FINANCE_SYSTEM_PROMPT},
            {"role": "user", "content": json.dumps(financial_data)}
        ],
        response_format={"type": "json_object"},
        temperature=0.2,
    )

    try:
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        logging.error(f"Finance JSON Parse Error: {e}")
        raise ValueError("Failed to parse financial analysis response")


# ──────────────────────────────────────────────────────────────
# 6. EDUCATIONAL INVESTMENT ANALYST
# ──────────────────────────────────────────────────────────────
EDU_FINANCE_PROMPT = """
You are an AI Financial Decision Analyst in CareerPilot.

Your task is to evaluate whether an educational investment (course/degree/certification) is financially worthwhile based on estimated salary, ROI, payback period, and market trends.

-------------------------------------
⚙️ INTERNAL ESTIMATION (MANDATORY)
-------------------------------------

1. Estimate expected_starting_salary (monthly, in INR) using job_role and preferred_location.

2. Adjust salary:
   - If current_status = "student" → use fresher-level salary (lower range)
   - If user has relevant skills → increase salary estimate
   - If demand_level = high → increase salary by 10–20%

3. Estimate salary_growth_rate (%/year):
   - Tech roles → 10–15%
   - Core roles → 5–8%
   - Creative roles → 7–10%
   - If demand_level = high → +2%
   - If competition_level = high → −2%

-------------------------------------
📐 FORMULAS (STRICTLY APPLY)
-------------------------------------

1. annual_salary = expected_starting_salary × 12

2. ROI = annual_salary / education_cost

3. payback_period_months = education_cost / expected_starting_salary

4. future_salary_3y = annual_salary × (1 + salary_growth_rate/100)^3

5. opportunity_cost = duration_months × expected_starting_salary

-------------------------------------
📊 OUTPUT (STRICT JSON ONLY)
-------------------------------------

{
  "estimated_salary": number,
  "salary_growth_rate": number,
  "roi_analysis": {
    "annual_salary": number,
    "roi_value": number,
    "payback_period_months": number,
    "future_salary_3y": number,
    "opportunity_cost": number
  },
  "decision": {
    "verdict": "good | moderate | risky",
    "reason": string
  },
  "market_insights": {
    "demand_level": string,
    "competition_level": string,
    "trend_growth_rate": number,
    "interpretation": string
  },
  "recommendations": [string, string, string]
}

-------------------------------------
📌 DECISION RULES
-------------------------------------

- If ROI > 1.5 → verdict = "good"
- If ROI between 1.0 and 1.5 → verdict = "moderate"
- If ROI < 1.0 → verdict = "risky"

- If payback_period_months > 36 → Add warning in recommendations

- If demand_level = high AND trend_growth_rate > 10 → Add strong positive recommendation

- If competition_level = high → Suggest skill differentiation

-------------------------------------
📌 OUTPUT RULES
-------------------------------------

- Return ONLY valid JSON
- Round all numbers to 2 decimal places
- Do NOT add extra text
- Do NOT skip any field
"""

def analyze_edu_investment(payload: dict) -> dict:
    """
    Evaluates an educational investment (course/degree/certification)
    for financial worthiness.  Returns structured JSON with ROI, payback
    period, verdict, market insights, and recommendations.
    """
    if not client:
        raise ValueError("Groq client not initialized")

    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=[
            {"role": "system", "content": EDU_FINANCE_PROMPT},
            {"role": "user",   "content": json.dumps(payload)},
        ],
        response_format={"type": "json_object"},
        temperature=0.2,
    )

    try:
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        logging.error(f"Edu-Finance JSON Parse Error: {e}")
        raise ValueError("Failed to parse educational investment analysis response")
