"""
data/role_skill_map.py — Predefined Role → Skill Requirements Dataset
======================================================================
Contains the REQUIRED skill proficiencies for each target role.
This is NOT about the user — it defines what a role DEMANDS.

Each skill entry:
  • required_level  (0–100)  → target proficiency the role needs
  • importance_weight (0–1)  → how critical this skill is for the role
  • base_learning_time (wks) → time to learn from zero to required_level

Used by:
  • roadmap_generator.py for gap analysis, priority scoring, time estimation
  • model_inference.py for readiness scoring
"""

from __future__ import annotations
import logging
from typing import Dict, Optional

logger = logging.getLogger(__name__)


# ──────────────────────────────────────────────────────────────
# ROLE → SKILL MAP
# ──────────────────────────────────────────────────────────────

role_skill_map: Dict[str, Dict[str, dict]] = {

    # ── ML / AI ──────────────────────────────────────────────
    "ml engineer": {
        "python":             {"required_level": 90, "importance_weight": 0.95, "base_learning_time": 8},
        "machine learning":   {"required_level": 90, "importance_weight": 0.95, "base_learning_time": 14},
        "deep learning":      {"required_level": 80, "importance_weight": 0.85, "base_learning_time": 12},
        "tensorflow":         {"required_level": 75, "importance_weight": 0.70, "base_learning_time": 8},
        "pytorch":            {"required_level": 80, "importance_weight": 0.75, "base_learning_time": 8},
        "numpy":              {"required_level": 80, "importance_weight": 0.60, "base_learning_time": 4},
        "pandas":             {"required_level": 80, "importance_weight": 0.60, "base_learning_time": 4},
        "scikit-learn":       {"required_level": 80, "importance_weight": 0.70, "base_learning_time": 6},
        "statistics":         {"required_level": 75, "importance_weight": 0.65, "base_learning_time": 8},
        "linear algebra":     {"required_level": 70, "importance_weight": 0.55, "base_learning_time": 6},
        "docker":             {"required_level": 60, "importance_weight": 0.45, "base_learning_time": 4},
        "mlops":              {"required_level": 65, "importance_weight": 0.50, "base_learning_time": 6},
        "sql":                {"required_level": 60, "importance_weight": 0.40, "base_learning_time": 4},
        "git":                {"required_level": 70, "importance_weight": 0.40, "base_learning_time": 2},
    },

    "ai engineer": {
        "python":             {"required_level": 90, "importance_weight": 0.95, "base_learning_time": 8},
        "machine learning":   {"required_level": 85, "importance_weight": 0.90, "base_learning_time": 14},
        "deep learning":      {"required_level": 85, "importance_weight": 0.90, "base_learning_time": 12},
        "nlp":                {"required_level": 75, "importance_weight": 0.75, "base_learning_time": 10},
        "computer vision":    {"required_level": 70, "importance_weight": 0.65, "base_learning_time": 10},
        "pytorch":            {"required_level": 80, "importance_weight": 0.80, "base_learning_time": 8},
        "tensorflow":         {"required_level": 75, "importance_weight": 0.70, "base_learning_time": 8},
        "docker":             {"required_level": 65, "importance_weight": 0.50, "base_learning_time": 4},
        "cloud":              {"required_level": 60, "importance_weight": 0.45, "base_learning_time": 6},
        "api development":    {"required_level": 65, "importance_weight": 0.50, "base_learning_time": 4},
        "llm":                {"required_level": 75, "importance_weight": 0.80, "base_learning_time": 8},
        "prompt engineering": {"required_level": 65, "importance_weight": 0.55, "base_learning_time": 4},
    },

    # ── DATA ─────────────────────────────────────────────────
    "data scientist": {
        "python":             {"required_level": 85, "importance_weight": 0.90, "base_learning_time": 8},
        "machine learning":   {"required_level": 80, "importance_weight": 0.85, "base_learning_time": 14},
        "statistics":         {"required_level": 85, "importance_weight": 0.90, "base_learning_time": 10},
        "sql":                {"required_level": 80, "importance_weight": 0.75, "base_learning_time": 6},
        "pandas":             {"required_level": 85, "importance_weight": 0.80, "base_learning_time": 4},
        "numpy":              {"required_level": 80, "importance_weight": 0.70, "base_learning_time": 4},
        "data visualization": {"required_level": 75, "importance_weight": 0.70, "base_learning_time": 6},
        "scikit-learn":       {"required_level": 80, "importance_weight": 0.75, "base_learning_time": 6},
        "r":                  {"required_level": 50, "importance_weight": 0.30, "base_learning_time": 6},
        "jupyter":            {"required_level": 70, "importance_weight": 0.40, "base_learning_time": 2},
        "deep learning":      {"required_level": 65, "importance_weight": 0.55, "base_learning_time": 12},
        "feature engineering": {"required_level": 75, "importance_weight": 0.70, "base_learning_time": 6},
    },

    "data analyst": {
        "sql":                {"required_level": 85, "importance_weight": 0.95, "base_learning_time": 6},
        "excel":              {"required_level": 80, "importance_weight": 0.80, "base_learning_time": 4},
        "python":             {"required_level": 70, "importance_weight": 0.70, "base_learning_time": 8},
        "data visualization": {"required_level": 80, "importance_weight": 0.85, "base_learning_time": 6},
        "tableau":            {"required_level": 75, "importance_weight": 0.70, "base_learning_time": 6},
        "power bi":           {"required_level": 70, "importance_weight": 0.65, "base_learning_time": 6},
        "statistics":         {"required_level": 70, "importance_weight": 0.65, "base_learning_time": 8},
        "pandas":             {"required_level": 70, "importance_weight": 0.60, "base_learning_time": 4},
        "critical thinking":  {"required_level": 75, "importance_weight": 0.55, "base_learning_time": 8},
        "reporting":          {"required_level": 70, "importance_weight": 0.50, "base_learning_time": 4},
    },

    "data engineer": {
        "python":             {"required_level": 85, "importance_weight": 0.90, "base_learning_time": 8},
        "sql":                {"required_level": 90, "importance_weight": 0.95, "base_learning_time": 6},
        "spark":              {"required_level": 80, "importance_weight": 0.80, "base_learning_time": 10},
        "hadoop":             {"required_level": 65, "importance_weight": 0.50, "base_learning_time": 8},
        "etl":                {"required_level": 80, "importance_weight": 0.80, "base_learning_time": 8},
        "airflow":            {"required_level": 75, "importance_weight": 0.70, "base_learning_time": 6},
        "aws":                {"required_level": 75, "importance_weight": 0.70, "base_learning_time": 8},
        "data modeling":      {"required_level": 80, "importance_weight": 0.75, "base_learning_time": 8},
        "kafka":              {"required_level": 70, "importance_weight": 0.60, "base_learning_time": 6},
        "docker":             {"required_level": 70, "importance_weight": 0.55, "base_learning_time": 4},
    },

    # ── BACKEND ──────────────────────────────────────────────
    "backend developer": {
        "python":             {"required_level": 85, "importance_weight": 0.85, "base_learning_time": 8},
        "java":               {"required_level": 75, "importance_weight": 0.70, "base_learning_time": 10},
        "sql":                {"required_level": 80, "importance_weight": 0.80, "base_learning_time": 6},
        "rest api":           {"required_level": 85, "importance_weight": 0.90, "base_learning_time": 6},
        "docker":             {"required_level": 70, "importance_weight": 0.65, "base_learning_time": 4},
        "git":                {"required_level": 75, "importance_weight": 0.55, "base_learning_time": 2},
        "database design":    {"required_level": 80, "importance_weight": 0.75, "base_learning_time": 8},
        "linux":              {"required_level": 70, "importance_weight": 0.55, "base_learning_time": 6},
        "microservices":      {"required_level": 70, "importance_weight": 0.65, "base_learning_time": 8},
        "cloud":              {"required_level": 65, "importance_weight": 0.55, "base_learning_time": 6},
        "system design":      {"required_level": 75, "importance_weight": 0.70, "base_learning_time": 10},
    },

    "software engineer": {
        "python":             {"required_level": 80, "importance_weight": 0.80, "base_learning_time": 8},
        "java":               {"required_level": 75, "importance_weight": 0.70, "base_learning_time": 10},
        "data structures":    {"required_level": 85, "importance_weight": 0.90, "base_learning_time": 10},
        "algorithms":         {"required_level": 85, "importance_weight": 0.90, "base_learning_time": 10},
        "sql":                {"required_level": 75, "importance_weight": 0.65, "base_learning_time": 6},
        "git":                {"required_level": 75, "importance_weight": 0.55, "base_learning_time": 2},
        "oop":                {"required_level": 80, "importance_weight": 0.75, "base_learning_time": 6},
        "system design":      {"required_level": 75, "importance_weight": 0.70, "base_learning_time": 10},
        "testing":            {"required_level": 70, "importance_weight": 0.55, "base_learning_time": 4},
        "agile":              {"required_level": 60, "importance_weight": 0.40, "base_learning_time": 2},
    },

    # ── FRONTEND ─────────────────────────────────────────────
    "frontend developer": {
        "html":               {"required_level": 85, "importance_weight": 0.80, "base_learning_time": 4},
        "css":                {"required_level": 85, "importance_weight": 0.80, "base_learning_time": 6},
        "javascript":         {"required_level": 90, "importance_weight": 0.95, "base_learning_time": 10},
        "react":              {"required_level": 85, "importance_weight": 0.90, "base_learning_time": 10},
        "typescript":         {"required_level": 75, "importance_weight": 0.75, "base_learning_time": 6},
        "responsive design":  {"required_level": 80, "importance_weight": 0.70, "base_learning_time": 4},
        "git":                {"required_level": 70, "importance_weight": 0.45, "base_learning_time": 2},
        "webpack":            {"required_level": 60, "importance_weight": 0.40, "base_learning_time": 4},
        "testing":            {"required_level": 65, "importance_weight": 0.50, "base_learning_time": 4},
        "ui/ux":              {"required_level": 65, "importance_weight": 0.55, "base_learning_time": 6},
        "tailwindcss":        {"required_level": 65, "importance_weight": 0.50, "base_learning_time": 3},
        "next.js":            {"required_level": 70, "importance_weight": 0.60, "base_learning_time": 6},
    },

    # ── FULL STACK ───────────────────────────────────────────
    "full stack developer": {
        "html":               {"required_level": 80, "importance_weight": 0.70, "base_learning_time": 4},
        "css":                {"required_level": 80, "importance_weight": 0.70, "base_learning_time": 6},
        "javascript":         {"required_level": 85, "importance_weight": 0.90, "base_learning_time": 10},
        "react":              {"required_level": 80, "importance_weight": 0.80, "base_learning_time": 10},
        "node.js":            {"required_level": 80, "importance_weight": 0.80, "base_learning_time": 8},
        "python":             {"required_level": 70, "importance_weight": 0.60, "base_learning_time": 8},
        "sql":                {"required_level": 75, "importance_weight": 0.70, "base_learning_time": 6},
        "git":                {"required_level": 75, "importance_weight": 0.50, "base_learning_time": 2},
        "rest api":           {"required_level": 80, "importance_weight": 0.80, "base_learning_time": 6},
        "docker":             {"required_level": 60, "importance_weight": 0.45, "base_learning_time": 4},
        "mongodb":            {"required_level": 65, "importance_weight": 0.55, "base_learning_time": 4},
        "typescript":         {"required_level": 70, "importance_weight": 0.60, "base_learning_time": 6},
    },

    # ── DEVOPS / CLOUD ───────────────────────────────────────
    "devops engineer": {
        "docker":             {"required_level": 90, "importance_weight": 0.95, "base_learning_time": 6},
        "kubernetes":         {"required_level": 85, "importance_weight": 0.90, "base_learning_time": 10},
        "ci/cd":              {"required_level": 85, "importance_weight": 0.90, "base_learning_time": 6},
        "linux":              {"required_level": 85, "importance_weight": 0.85, "base_learning_time": 8},
        "aws":                {"required_level": 80, "importance_weight": 0.80, "base_learning_time": 10},
        "terraform":          {"required_level": 75, "importance_weight": 0.70, "base_learning_time": 8},
        "ansible":            {"required_level": 65, "importance_weight": 0.55, "base_learning_time": 6},
        "git":                {"required_level": 80, "importance_weight": 0.60, "base_learning_time": 2},
        "monitoring":         {"required_level": 70, "importance_weight": 0.60, "base_learning_time": 6},
        "scripting":          {"required_level": 75, "importance_weight": 0.65, "base_learning_time": 6},
        "python":             {"required_level": 65, "importance_weight": 0.50, "base_learning_time": 8},
        "networking":         {"required_level": 70, "importance_weight": 0.60, "base_learning_time": 8},
    },

    "cloud engineer": {
        "aws":                {"required_level": 85, "importance_weight": 0.90, "base_learning_time": 10},
        "azure":              {"required_level": 75, "importance_weight": 0.70, "base_learning_time": 10},
        "gcp":                {"required_level": 70, "importance_weight": 0.60, "base_learning_time": 10},
        "docker":             {"required_level": 80, "importance_weight": 0.80, "base_learning_time": 6},
        "kubernetes":         {"required_level": 75, "importance_weight": 0.75, "base_learning_time": 10},
        "networking":         {"required_level": 75, "importance_weight": 0.70, "base_learning_time": 8},
        "security":           {"required_level": 70, "importance_weight": 0.65, "base_learning_time": 8},
        "terraform":          {"required_level": 75, "importance_weight": 0.70, "base_learning_time": 8},
        "linux":              {"required_level": 80, "importance_weight": 0.75, "base_learning_time": 8},
        "python":             {"required_level": 65, "importance_weight": 0.50, "base_learning_time": 8},
    },

    # ── UI/UX ────────────────────────────────────────────────
    "ui/ux designer": {
        "figma":              {"required_level": 90, "importance_weight": 0.95, "base_learning_time": 8},
        "adobe xd":           {"required_level": 70, "importance_weight": 0.55, "base_learning_time": 6},
        "user research":      {"required_level": 80, "importance_weight": 0.80, "base_learning_time": 8},
        "wireframing":        {"required_level": 85, "importance_weight": 0.85, "base_learning_time": 4},
        "prototyping":        {"required_level": 85, "importance_weight": 0.85, "base_learning_time": 6},
        "design thinking":    {"required_level": 80, "importance_weight": 0.75, "base_learning_time": 6},
        "html":               {"required_level": 60, "importance_weight": 0.40, "base_learning_time": 4},
        "css":                {"required_level": 65, "importance_weight": 0.45, "base_learning_time": 6},
        "typography":         {"required_level": 75, "importance_weight": 0.60, "base_learning_time": 4},
        "color theory":       {"required_level": 75, "importance_weight": 0.60, "base_learning_time": 4},
    },

    # ── PRODUCT MANAGEMENT ───────────────────────────────────
    "product manager": {
        "product strategy":   {"required_level": 85, "importance_weight": 0.95, "base_learning_time": 10},
        "agile":              {"required_level": 80, "importance_weight": 0.80, "base_learning_time": 4},
        "user research":      {"required_level": 80, "importance_weight": 0.80, "base_learning_time": 8},
        "data analysis":      {"required_level": 75, "importance_weight": 0.70, "base_learning_time": 8},
        "communication":      {"required_level": 85, "importance_weight": 0.85, "base_learning_time": 6},
        "wireframing":        {"required_level": 65, "importance_weight": 0.50, "base_learning_time": 4},
        "sql":                {"required_level": 60, "importance_weight": 0.45, "base_learning_time": 6},
        "roadmapping":        {"required_level": 80, "importance_weight": 0.75, "base_learning_time": 4},
        "a/b testing":        {"required_level": 65, "importance_weight": 0.55, "base_learning_time": 4},
        "stakeholder management": {"required_level": 80, "importance_weight": 0.80, "base_learning_time": 6},
    },

    # ── CYBERSECURITY ────────────────────────────────────────
    "cybersecurity analyst": {
        "networking":         {"required_level": 85, "importance_weight": 0.90, "base_learning_time": 10},
        "security":           {"required_level": 90, "importance_weight": 0.95, "base_learning_time": 12},
        "linux":              {"required_level": 80, "importance_weight": 0.80, "base_learning_time": 8},
        "firewalls":          {"required_level": 75, "importance_weight": 0.70, "base_learning_time": 6},
        "siem":               {"required_level": 75, "importance_weight": 0.70, "base_learning_time": 8},
        "penetration testing": {"required_level": 80, "importance_weight": 0.80, "base_learning_time": 10},
        "python":             {"required_level": 65, "importance_weight": 0.55, "base_learning_time": 8},
        "risk assessment":    {"required_level": 75, "importance_weight": 0.65, "base_learning_time": 6},
        "compliance":         {"required_level": 70, "importance_weight": 0.55, "base_learning_time": 6},
        "incident response":  {"required_level": 80, "importance_weight": 0.75, "base_learning_time": 8},
    },

    # ── MOBILE ───────────────────────────────────────────────
    "mobile developer": {
        "java":               {"required_level": 75, "importance_weight": 0.65, "base_learning_time": 10},
        "kotlin":             {"required_level": 80, "importance_weight": 0.80, "base_learning_time": 8},
        "swift":              {"required_level": 70, "importance_weight": 0.60, "base_learning_time": 8},
        "react native":       {"required_level": 75, "importance_weight": 0.70, "base_learning_time": 8},
        "flutter":            {"required_level": 80, "importance_weight": 0.80, "base_learning_time": 8},
        "rest api":           {"required_level": 75, "importance_weight": 0.70, "base_learning_time": 6},
        "git":                {"required_level": 70, "importance_weight": 0.45, "base_learning_time": 2},
        "ui design":          {"required_level": 70, "importance_weight": 0.55, "base_learning_time": 6},
        "testing":            {"required_level": 65, "importance_weight": 0.50, "base_learning_time": 4},
        "performance optimization": {"required_level": 70, "importance_weight": 0.60, "base_learning_time": 6},
    },

    # ── QA ───────────────────────────────────────────────────
    "qa engineer": {
        "testing":            {"required_level": 90, "importance_weight": 0.95, "base_learning_time": 6},
        "selenium":           {"required_level": 80, "importance_weight": 0.80, "base_learning_time": 6},
        "python":             {"required_level": 70, "importance_weight": 0.65, "base_learning_time": 8},
        "java":               {"required_level": 65, "importance_weight": 0.55, "base_learning_time": 10},
        "test automation":    {"required_level": 85, "importance_weight": 0.90, "base_learning_time": 8},
        "ci/cd":              {"required_level": 70, "importance_weight": 0.60, "base_learning_time": 6},
        "api testing":        {"required_level": 80, "importance_weight": 0.75, "base_learning_time": 6},
        "jira":               {"required_level": 65, "importance_weight": 0.40, "base_learning_time": 2},
        "agile":              {"required_level": 65, "importance_weight": 0.45, "base_learning_time": 2},
        "performance testing": {"required_level": 75, "importance_weight": 0.65, "base_learning_time": 6},
    },

    # ── CONTENT / MARKETING ─────────────────────────────────
    "content writer": {
        "writing":            {"required_level": 90, "importance_weight": 0.95, "base_learning_time": 8},
        "seo":                {"required_level": 80, "importance_weight": 0.80, "base_learning_time": 6},
        "research":           {"required_level": 80, "importance_weight": 0.75, "base_learning_time": 6},
        "grammar":            {"required_level": 90, "importance_weight": 0.85, "base_learning_time": 4},
        "creativity":         {"required_level": 80, "importance_weight": 0.70, "base_learning_time": 8},
        "cms":                {"required_level": 70, "importance_weight": 0.55, "base_learning_time": 4},
        "social media":       {"required_level": 65, "importance_weight": 0.50, "base_learning_time": 4},
        "editing":            {"required_level": 80, "importance_weight": 0.70, "base_learning_time": 4},
        "storytelling":       {"required_level": 75, "importance_weight": 0.65, "base_learning_time": 6},
        "analytics":          {"required_level": 60, "importance_weight": 0.40, "base_learning_time": 4},
    },

    "digital marketer": {
        "seo":                {"required_level": 85, "importance_weight": 0.90, "base_learning_time": 8},
        "sem":                {"required_level": 80, "importance_weight": 0.80, "base_learning_time": 8},
        "google analytics":   {"required_level": 80, "importance_weight": 0.80, "base_learning_time": 6},
        "social media":       {"required_level": 80, "importance_weight": 0.75, "base_learning_time": 4},
        "content marketing":  {"required_level": 75, "importance_weight": 0.70, "base_learning_time": 6},
        "email marketing":    {"required_level": 70, "importance_weight": 0.60, "base_learning_time": 4},
        "ppc":                {"required_level": 75, "importance_weight": 0.70, "base_learning_time": 6},
        "copywriting":        {"required_level": 75, "importance_weight": 0.65, "base_learning_time": 6},
        "a/b testing":        {"required_level": 65, "importance_weight": 0.55, "base_learning_time": 4},
        "crm":                {"required_level": 60, "importance_weight": 0.45, "base_learning_time": 4},
    },

    # ── HR ───────────────────────────────────────────────────
    "hr manager": {
        "recruitment":        {"required_level": 85, "importance_weight": 0.90, "base_learning_time": 8},
        "employee relations": {"required_level": 80, "importance_weight": 0.80, "base_learning_time": 8},
        "communication":      {"required_level": 85, "importance_weight": 0.85, "base_learning_time": 6},
        "labor law":          {"required_level": 75, "importance_weight": 0.70, "base_learning_time": 10},
        "hris":               {"required_level": 70, "importance_weight": 0.55, "base_learning_time": 6},
        "conflict resolution": {"required_level": 80, "importance_weight": 0.75, "base_learning_time": 6},
        "performance management": {"required_level": 80, "importance_weight": 0.75, "base_learning_time": 6},
        "onboarding":         {"required_level": 75, "importance_weight": 0.60, "base_learning_time": 4},
        "payroll":            {"required_level": 65, "importance_weight": 0.50, "base_learning_time": 4},
        "leadership":         {"required_level": 80, "importance_weight": 0.70, "base_learning_time": 8},
    },

    # ── BLOCKCHAIN ───────────────────────────────────────────
    "blockchain developer": {
        "solidity":           {"required_level": 85, "importance_weight": 0.95, "base_learning_time": 10},
        "ethereum":           {"required_level": 80, "importance_weight": 0.85, "base_learning_time": 8},
        "smart contracts":    {"required_level": 85, "importance_weight": 0.90, "base_learning_time": 10},
        "web3":               {"required_level": 80, "importance_weight": 0.80, "base_learning_time": 8},
        "javascript":         {"required_level": 75, "importance_weight": 0.65, "base_learning_time": 10},
        "cryptography":       {"required_level": 70, "importance_weight": 0.60, "base_learning_time": 8},
        "distributed systems": {"required_level": 70, "importance_weight": 0.60, "base_learning_time": 10},
        "python":             {"required_level": 65, "importance_weight": 0.50, "base_learning_time": 8},
        "defi":               {"required_level": 65, "importance_weight": 0.55, "base_learning_time": 6},
        "git":                {"required_level": 70, "importance_weight": 0.40, "base_learning_time": 2},
    },
}


# ──────────────────────────────────────────────────────────────
# ALIASES — many roles map to the same skill set
# ──────────────────────────────────────────────────────────────
_ALIASES: Dict[str, str] = {
    "machine learning engineer":    "ml engineer",
    "deep learning engineer":       "ai engineer",
    "nlp engineer":                 "ai engineer",
    "computer vision engineer":     "ai engineer",
    "business analyst":             "data analyst",
    "backend engineer":             "backend developer",
    "software developer":           "software engineer",
    "sre":                          "devops engineer",
    "site reliability engineer":    "devops engineer",
    "full stack engineer":          "full stack developer",
    "web developer":                "full stack developer",
    "mern developer":               "full stack developer",
    "mean developer":               "full stack developer",
    "frontend engineer":            "frontend developer",
    "ui developer":                 "frontend developer",
    "react developer":              "frontend developer",
    "angular developer":            "frontend developer",
    "ux designer":                  "ui/ux designer",
    "graphic designer":             "ui/ux designer",
    "product designer":             "ui/ux designer",
    "project manager":              "product manager",
    "scrum master":                 "product manager",
    "security engineer":            "cybersecurity analyst",
    "network engineer":             "cybersecurity analyst",
    "android developer":            "mobile developer",
    "ios developer":                "mobile developer",
    "flutter developer":            "mobile developer",
    "react native developer":       "mobile developer",
    "game developer":               "full stack developer",
    "marketing analyst":            "digital marketer",
    "seo specialist":               "digital marketer",
    "social media manager":         "digital marketer",
    "hr specialist":                "hr manager",
    "recruiter":                    "hr manager",
    "operations manager":           "hr manager",
    "automation tester":            "qa engineer",
    "manual tester":                "qa engineer",
    "qa tester":                    "qa engineer",
    "embedded engineer":            "backend developer",
    "iot engineer":                 "backend developer",
}


def resolve_role_key(target_role: str) -> Optional[str]:
    """
    Resolve a free-text target role to a key in role_skill_map.

    Resolution order:
      1. Exact match (lowercased)
      2. Alias lookup
      3. Substring match (either direction)
      4. Word-overlap scoring (≥50% match)
      5. None (caller should use SentenceTransformer fallback)
    """
    normalized = target_role.strip().lower()

    # 1. Exact match
    if normalized in role_skill_map:
        return normalized

    # 2. Alias
    if normalized in _ALIASES:
        return _ALIASES[normalized]

    # 3. Substring
    for key in role_skill_map:
        if key in normalized or normalized in key:
            return key
    for alias, canonical in _ALIASES.items():
        if alias in normalized or normalized in alias:
            return canonical

    # 4. Word overlap
    input_words = set(normalized.split())
    best_overlap, best_key = 0.0, None
    for key in role_skill_map:
        key_words = set(key.split())
        overlap = len(input_words & key_words)
        score = overlap / len(key_words) if key_words else 0
        if score > best_overlap:
            best_overlap = score
            best_key = key
    if best_overlap >= 0.5 and best_key:
        return best_key

    # 5. Not found — caller uses semantic fallback
    logger.warning("Could not resolve role '%s' via text matching", target_role)
    return None


def get_skills_for_role(target_role: str) -> Dict[str, dict]:
    """
    Get the skill requirements dict for a target role.
    Returns empty dict if the role cannot be resolved.
    """
    key = resolve_role_key(target_role)
    if key:
        return role_skill_map[key]
    return {}


def get_all_role_names() -> list:
    """Return all known role names (canonical + aliases)."""
    return sorted(set(list(role_skill_map.keys()) + list(_ALIASES.keys())))
