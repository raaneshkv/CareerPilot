"""
utils/roadmap_generator.py — AI Roadmap Computation Engine
============================================================
Pure computation module — NO LLM calls.
Implements Steps 4–9 from the spec:

  Step 4: Skill Gap Calculation
  Step 5: Priority Score
  Step 6: Time Estimation
  Step 7: Roadmap Generation (sort + filter)
  Step 8: Readiness Progression
  Step 9: ROI Impact

Also generates smart alerts based on thresholds.

CALLED BY:
  app.py → POST /generate-roadmap  (Steps 4–9)
"""

import logging
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

# ──────────────────────────────────────────────────────────────
# ALERT THRESHOLDS
# ──────────────────────────────────────────────────────────────
READINESS_WARNING_THRESHOLD = 50       # below this → "not on track"
CRITICAL_GAP_THRESHOLD = 60            # above this → "critical skill missing"
HIGH_ROI_THRESHOLD = 6.0               # above this → "high ROI opportunity"

# Default study hours per week if not provided
DEFAULT_HOURS_PER_WEEK = 20
FULL_TIME_HOURS = 40


def roadmap_generator(
    parsed_resume: Dict[str, Any],
    model_output: Dict[str, Any],
    target_role: str,
    hours_per_week: int = DEFAULT_HOURS_PER_WEEK,
) -> Dict[str, Any]:
    """
    Generate the full roadmap output from parsed resume and model predictions.

    Args:
        parsed_resume:  Output of resume_parser()
        model_output:   Output of model_inference()
        target_role:    The target role string
        hours_per_week: User's available study hours per week (default 20)

    Returns:
        Complete roadmap dict matching the output format spec.
    """
    from data.role_skill_map import get_skills_for_role

    role_skills = get_skills_for_role(target_role)
    user_skills = parsed_resume.get("skills", {})
    roi_score = model_output.get("roi_score", 5.0)
    readiness_score = model_output.get("readiness_score", 50.0)

    if not role_skills:
        logger.warning("No skill map found for role '%s' — returning empty roadmap", target_role)
        return _empty_roadmap(target_role, model_output)

    # ── STEP 4: Skill Gap Calculation ────────────────────────
    skill_gaps = []
    for skill_name, spec in role_skills.items():
        user_level = _find_user_level(user_skills, skill_name)
        required_level = spec["required_level"]
        importance_weight = spec["importance_weight"]
        base_learning_time = spec["base_learning_time"]

        gap_score = max(0, required_level - user_level)
        weighted_gap = gap_score * importance_weight

        # ── STEP 5: Priority Score ───────────────────────────
        priority_raw = (
            (0.5 * weighted_gap)
            + (0.3 * importance_weight * 100)
            + (0.2 * roi_score * 10)
        )
        # We'll normalize after collecting all

        # ── STEP 6: Time Estimation ──────────────────────────
        time_to_learn = (gap_score / 100) * base_learning_time
        actual_duration = time_to_learn * (FULL_TIME_HOURS / hours_per_week)

        skill_gaps.append({
            "skill": skill_name,
            "current_level": user_level,
            "required_level": required_level,
            "gap": gap_score,
            "weighted_gap": weighted_gap,
            "importance_weight": importance_weight,
            "priority_raw": priority_raw,
            "estimated_duration_weeks": round(actual_duration, 2),
            "roi_impact": round(roi_score * importance_weight, 2),
        })

    # ── Normalize priority_score to 0–100 ────────────────────
    max_priority = max((s["priority_raw"] for s in skill_gaps), default=1)
    min_priority = min((s["priority_raw"] for s in skill_gaps), default=0)
    range_priority = max_priority - min_priority if max_priority != min_priority else 1

    for s in skill_gaps:
        s["priority_score"] = round(
            ((s["priority_raw"] - min_priority) / range_priority) * 100, 2
        )

    # ── STEP 7: Sort by priority (desc), exclude gap=0 ──────
    roadmap_items = [s for s in skill_gaps if s["gap"] > 0]
    roadmap_items.sort(key=lambda x: x["priority_score"], reverse=True)

    # ── STEP 8: Readiness Progression ────────────────────────
    total_weighted_gap = sum(s["weighted_gap"] for s in roadmap_items)
    initial_readiness = readiness_score
    cumulative_readiness = initial_readiness

    for item in roadmap_items:
        if total_weighted_gap > 0:
            incremental = (item["weighted_gap"] / total_weighted_gap) * (100 - initial_readiness)
        else:
            incremental = 0
        cumulative_readiness += incremental
        item["expected_readiness_after"] = round(min(100.0, cumulative_readiness), 2)

    final_readiness = round(min(100.0, cumulative_readiness), 2)
    total_duration = round(sum(s["estimated_duration_weeks"] for s in roadmap_items), 2)

    # ── Clean up internal fields ─────────────────────────────
    roadmap_output = []
    for item in roadmap_items:
        roadmap_output.append({
            "skill": item["skill"],
            "current_level": item["current_level"],
            "required_level": item["required_level"],
            "gap": item["gap"],
            "priority_score": item["priority_score"],
            "estimated_duration_weeks": item["estimated_duration_weeks"],
            "roi_impact": item["roi_impact"],
            "expected_readiness_after": item["expected_readiness_after"],
        })

    # ── SMART ALERTS ─────────────────────────────────────────
    alerts = _generate_alerts(
        readiness_score=initial_readiness,
        roi_score=roi_score,
        skill_gaps=skill_gaps,
    )

    result = {
        "target_role": target_role,
        "predicted_salary": model_output.get("predicted_salary", 0),
        "roi_score": roi_score,
        "growth_rate": model_output.get("growth_rate", 0),
        "initial_readiness": round(initial_readiness, 2),
        "final_readiness": final_readiness,
        "total_duration_weeks": total_duration,
        "roadmap": roadmap_output,
        "alerts": alerts,
    }

    logger.info(
        "Roadmap generated: %d skills to learn | %.1f weeks | readiness %.0f%% → %.0f%% | %d alerts",
        len(roadmap_output), total_duration, initial_readiness, final_readiness, len(alerts),
    )
    return result


def _find_user_level(user_skills: Dict[str, int], target_skill: str) -> int:
    """Find user's proficiency for a skill via fuzzy matching."""
    target = target_skill.lower().strip()

    # Exact
    if target in user_skills:
        return user_skills[target]

    # Substring
    for name, level in user_skills.items():
        if target in name or name in target:
            return level

    # Word overlap
    target_words = set(target.split())
    best_score, best_level = 0.0, 0
    for name, level in user_skills.items():
        words = set(name.split())
        if not target_words or not words:
            continue
        overlap = len(target_words & words)
        score = overlap / max(len(target_words), len(words))
        if score > best_score:
            best_score = score
            best_level = level

    return best_level if best_score >= 0.5 else 0


def _generate_alerts(
    readiness_score: float,
    roi_score: float,
    skill_gaps: List[dict],
) -> List[Dict[str, str]]:
    """Generate smart alerts based on thresholds."""
    alerts = []

    # Alert 1: Low readiness
    if readiness_score < READINESS_WARNING_THRESHOLD:
        alerts.append({
            "type": "warning",
            "message": f"You are not on track — your current readiness is {readiness_score:.0f}%, which is below the 50% threshold. Significant upskilling is needed.",
        })

    # Alert 2: Critical skill gaps
    critical_skills = [
        s["skill"] for s in skill_gaps
        if s["gap"] > CRITICAL_GAP_THRESHOLD
    ]
    if critical_skills:
        if len(critical_skills) <= 3:
            skills_str = ", ".join(critical_skills)
        else:
            skills_str = ", ".join(critical_skills[:3]) + f" (+{len(critical_skills) - 3} more)"
        alerts.append({
            "type": "critical",
            "message": f"Critical skill gaps detected: {skills_str}. These skills have gaps exceeding {CRITICAL_GAP_THRESHOLD} points and require immediate attention.",
        })

    # Alert 3: High ROI opportunity
    if roi_score > HIGH_ROI_THRESHOLD:
        alerts.append({
            "type": "opportunity",
            "message": f"High ROI opportunity detected — this career path has an ROI score of {roi_score:.1f}/10. Investing in these skills could yield significant returns.",
        })

    return alerts


def _empty_roadmap(target_role: str, model_output: Dict[str, Any]) -> Dict[str, Any]:
    """Return an empty roadmap when the role can't be resolved."""
    return {
        "target_role": target_role,
        "predicted_salary": model_output.get("predicted_salary", 0),
        "roi_score": model_output.get("roi_score", 0),
        "growth_rate": model_output.get("growth_rate", 0),
        "initial_readiness": model_output.get("readiness_score", 0),
        "final_readiness": model_output.get("readiness_score", 0),
        "total_duration_weeks": 0,
        "roadmap": [],
        "alerts": [{
            "type": "warning",
            "message": f"Could not find skill requirements for role '{target_role}'. Please try a more common role title.",
        }],
    }
