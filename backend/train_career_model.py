"""
train_career_model.py
=====================
Trains the CareerPilot career-prediction pipeline from scratch:
  1. Generates a rich synthetic dataset (~3500 profiles, 14 career classes)
  2. Fits a TfidfVectorizer on skills text
  3. Trains an XGBClassifier  (multi:softprob, 500 trees)
  4. Saves  career_model.pkl,  tfidf.pkl,  edu_encoder.pkl

Run:
    cd backend && source venv/bin/activate
    python train_career_model.py

Output files are written to the project root (../career_model.pkl, etc.)
"""

import os
import random
import warnings
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
import joblib

warnings.filterwarnings("ignore")

# ─── Reproducibility ───
SEED = 42
random.seed(SEED)
np.random.seed(SEED)

OUTPUT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

# ══════════════════════════════════════════════════════════════
#  CAREER CLASS DEFINITIONS  (14 classes)
# ══════════════════════════════════════════════════════════════

CAREER_PROFILES = {
    "ML/AI Engineer": {
        "core": ["python", "machine learning", "deep learning", "tensorflow", "pytorch",
                 "keras", "scikit-learn", "numpy", "pandas", "statistics"],
        "secondary": ["nlp", "computer vision", "mlops", "docker", "aws", "linux",
                      "git", "sql", "model deployment", "feature engineering",
                      "reinforcement learning", "data analysis", "jupyter",
                      "cloud computing", "kubernetes", "api", "flask", "research"],
        "edu_dist": {"Masters": 0.45, "Bachelors": 0.35, "PhD": 0.15, "High School": 0.05},
        "exp_range": (1, 8),
        "proj_range": (3, 15),
    },
    "Data Scientist": {
        "core": ["python", "statistics", "machine learning", "sql", "data analysis",
                 "pandas", "numpy", "data visualization", "deep learning"],
        "secondary": ["tensorflow", "scikit-learn", "tableau", "power bi", "jupyter",
                      "r", "excel", "model", "research", "feature engineering",
                      "matplotlib", "seaborn", "hypothesis testing", "regression",
                      "classification", "clustering", "a/b testing", "big data"],
        "edu_dist": {"Masters": 0.40, "Bachelors": 0.30, "PhD": 0.20, "High School": 0.10},
        "exp_range": (0, 7),
        "proj_range": (2, 12),
    },
    "Data Analyst": {
        "core": ["sql", "excel", "data analysis", "data visualization", "statistics",
                 "python", "tableau"],
        "secondary": ["power bi", "pandas", "critical thinking", "communication",
                      "reporting", "google analytics", "business intelligence",
                      "data cleaning", "dashboards", "storytelling", "r",
                      "jupyter", "problem solving", "research"],
        "edu_dist": {"Bachelors": 0.55, "Masters": 0.25, "High School": 0.15, "PhD": 0.05},
        "exp_range": (0, 5),
        "proj_range": (1, 8),
    },
    "Data Engineer": {
        "core": ["python", "sql", "spark", "etl", "airflow", "docker", "aws",
                 "data modeling", "kafka"],
        "secondary": ["linux", "git", "mongodb", "postgresql", "cloud computing",
                      "kubernetes", "hadoop", "databases", "scripting", "ci cd",
                      "terraform", "scheduling", "gcp", "azure", "data pipelines",
                      "redis", "data warehousing", "shell scripting"],
        "edu_dist": {"Bachelors": 0.45, "Masters": 0.40, "PhD": 0.05, "High School": 0.10},
        "exp_range": (1, 8),
        "proj_range": (2, 10),
    },
    "Backend Developer": {
        "core": ["python", "java", "sql", "api", "restful", "docker", "git",
                 "linux", "microservices"],
        "secondary": ["spring", "databases", "mongodb", "postgresql", "redis",
                      "cloud computing", "aws", "system design", "jenkins",
                      "ci cd", "nodejs", "express", "django", "flask",
                      "object oriented", "design patterns", "testing"],
        "edu_dist": {"Bachelors": 0.55, "Masters": 0.30, "High School": 0.10, "PhD": 0.05},
        "exp_range": (1, 8),
        "proj_range": (3, 12),
    },
    "Frontend Developer": {
        "core": ["html", "css", "javascript", "react", "responsive design",
                 "git", "typescript"],
        "secondary": ["angular", "vue", "webpack", "npm", "figma", "ui", "ux",
                      "tailwindcss", "bootstrap", "sass", "next.js", "redux",
                      "testing", "accessibility", "performance", "web development"],
        "edu_dist": {"Bachelors": 0.50, "Masters": 0.20, "High School": 0.25, "PhD": 0.05},
        "exp_range": (0, 6),
        "proj_range": (3, 15),
    },
    "Full Stack Developer": {
        "core": ["html", "css", "javascript", "react", "nodejs", "python",
                 "sql", "git", "api", "docker"],
        "secondary": ["mongodb", "typescript", "express", "responsive design",
                      "databases", "aws", "restful", "microservices", "ci cd",
                      "testing", "agile", "system design", "web development"],
        "edu_dist": {"Bachelors": 0.50, "Masters": 0.25, "High School": 0.20, "PhD": 0.05},
        "exp_range": (1, 7),
        "proj_range": (4, 15),
    },
    "DevOps / Cloud Engineer": {
        "core": ["docker", "kubernetes", "linux", "aws", "ci cd", "terraform",
                 "git", "monitoring", "scripting"],
        "secondary": ["ansible", "jenkins", "azure", "gcp", "networking",
                      "cloud computing", "python", "shell", "devops",
                      "infrastructure", "automation", "security", "helm",
                      "prometheus", "grafana", "bash"],
        "edu_dist": {"Bachelors": 0.50, "Masters": 0.30, "High School": 0.15, "PhD": 0.05},
        "exp_range": (1, 8),
        "proj_range": (2, 10),
    },
    "Mobile Developer": {
        "core": ["java", "kotlin", "swift", "react native", "flutter",
                 "git", "api", "ui"],
        "secondary": ["javascript", "typescript", "firebase", "testing",
                      "performance", "responsive design", "rest api",
                      "android", "ios", "mobile development", "agile",
                      "ci cd", "design patterns"],
        "edu_dist": {"Bachelors": 0.55, "Masters": 0.20, "High School": 0.20, "PhD": 0.05},
        "exp_range": (0, 6),
        "proj_range": (3, 12),
    },
    "UI/UX Designer": {
        "core": ["figma", "wireframing", "prototyping", "user research",
                 "design thinking", "ui", "ux", "typography"],
        "secondary": ["adobe", "xd", "accessibility", "responsive design",
                      "color theory", "html", "css", "interaction design",
                      "usability", "user testing", "information architecture",
                      "visual design", "sketch", "communication"],
        "edu_dist": {"Bachelors": 0.50, "Masters": 0.25, "High School": 0.20, "PhD": 0.05},
        "exp_range": (0, 6),
        "proj_range": (3, 15),
    },
    "Cybersecurity Analyst": {
        "core": ["security", "networking", "linux", "firewalls", "siem",
                 "vulnerability", "risk assessment", "compliance"],
        "secondary": ["incident response", "cryptography", "monitoring",
                      "penetration testing", "python", "scripting",
                      "troubleshooting", "shell", "threat intelligence",
                      "forensics", "nist", "iso", "audit"],
        "edu_dist": {"Bachelors": 0.50, "Masters": 0.30, "High School": 0.10, "PhD": 0.10},
        "exp_range": (1, 7),
        "proj_range": (1, 8),
    },
    "Product / Project Manager": {
        "core": ["agile", "scrum", "stakeholder management", "communication",
                 "leadership", "project management", "jira"],
        "secondary": ["data analysis", "sql", "roadmapping", "user research",
                      "requirements gathering", "risk management", "budgeting",
                      "product strategy", "sprint planning", "teamwork",
                      "problem solving", "critical thinking", "excel",
                      "confluence", "trello", "documentation"],
        "edu_dist": {"Bachelors": 0.40, "Masters": 0.40, "High School": 0.10, "PhD": 0.10},
        "exp_range": (2, 10),
        "proj_range": (2, 8),
    },
    "Digital Marketer / Content": {
        "core": ["seo", "sem", "google analytics", "social media",
                 "content marketing", "communication", "writing"],
        "secondary": ["email marketing", "ppc", "copywriting", "crm",
                      "data analysis", "excel", "wordpress", "canva",
                      "brand strategy", "advertising", "research",
                      "storytelling", "video editing", "analytics"],
        "edu_dist": {"Bachelors": 0.55, "Masters": 0.20, "High School": 0.20, "PhD": 0.05},
        "exp_range": (0, 6),
        "proj_range": (2, 10),
    },
    "HR / Operations Specialist": {
        "core": ["recruitment", "communication", "leadership",
                 "stakeholder management", "teamwork", "excel"],
        "secondary": ["conflict resolution", "performance management",
                      "onboarding", "payroll", "labor law", "hris",
                      "employee relations", "training", "compliance",
                      "documentation", "process improvement", "budgeting",
                      "project management", "data analysis", "microsoft office"],
        "edu_dist": {"Bachelors": 0.55, "Masters": 0.25, "High School": 0.15, "PhD": 0.05},
        "exp_range": (0, 7),
        "proj_range": (1, 6),
    },
}

CAREER_LABELS = list(CAREER_PROFILES.keys())


# ══════════════════════════════════════════════════════════════
#  SYNTHETIC DATA GENERATION
# ══════════════════════════════════════════════════════════════

def generate_skill_text(profile: dict, noise: float = 0.15) -> str:
    """Generate a realistic skills text for a career profile.

    - Always includes most core skills
    - Randomly picks some secondary skills
    - Adds slight noise (random unrelated skills) for realism
    """
    # Core skills: include 70-100% of them
    n_core = max(3, int(len(profile["core"]) * random.uniform(0.7, 1.0)))
    skills = random.sample(profile["core"], n_core)

    # Secondary skills: include 30-70%
    n_sec = max(1, int(len(profile["secondary"]) * random.uniform(0.3, 0.7)))
    skills += random.sample(profile["secondary"], n_sec)

    # Noise: add 0-2 random skills from other profiles
    if random.random() < noise:
        all_skills = set()
        for p in CAREER_PROFILES.values():
            all_skills.update(p["core"])
            all_skills.update(p["secondary"])
        noise_skills = random.sample(list(all_skills - set(skills)), min(2, len(all_skills)))
        skills += noise_skills

    random.shuffle(skills)
    return " ".join(skills)


def weighted_choice(dist: dict) -> str:
    """Pick from a weighted distribution dict."""
    labels = list(dist.keys())
    weights = list(dist.values())
    return random.choices(labels, weights=weights, k=1)[0]


def generate_dataset(samples_per_class: int = 250) -> pd.DataFrame:
    """Generate the full synthetic dataset."""
    rows = []
    for label, profile in CAREER_PROFILES.items():
        for _ in range(samples_per_class):
            skills_text = generate_skill_text(profile)
            education = weighted_choice(profile["edu_dist"])
            experience = random.randint(*profile["exp_range"])
            projects = random.randint(*profile["proj_range"])
            rows.append({
                "skills": skills_text,
                "education": education,
                "experience": experience,
                "projects": projects,
                "career": label,
            })
    df = pd.DataFrame(rows)
    return df.sample(frac=1, random_state=SEED).reset_index(drop=True)


# ══════════════════════════════════════════════════════════════
#  TRAINING PIPELINE
# ══════════════════════════════════════════════════════════════

def main():
    print("=" * 60)
    print("  CareerPilot — Career Model Training Pipeline")
    print("=" * 60)

    # ── 1. Generate data ──
    print("\n[1/5] Generating synthetic dataset…")
    df = generate_dataset(samples_per_class=250)
    print(f"      Total samples: {len(df)}")
    print(f"      Classes: {df['career'].nunique()}")
    print(f"      Distribution:\n{df['career'].value_counts().to_string()}\n")

    # ── 2. Encode education ──
    print("[2/5] Fitting education encoder…")
    edu_encoder = LabelEncoder()
    df["education_encoded"] = edu_encoder.fit_transform(df["education"])
    print(f"      Classes: {list(edu_encoder.classes_)}")
    print(f"      Mapping: {dict(zip(edu_encoder.classes_, edu_encoder.transform(edu_encoder.classes_)))}")

    # ── 3. TF-IDF on skills ──
    print("\n[3/5] Fitting TF-IDF vectorizer on skills…")
    tfidf = TfidfVectorizer(
        max_features=1000,    # let it pick naturally
        lowercase=True,
        ngram_range=(1, 1),   # unigrams only (matches original)
        sublinear_tf=False,
    )
    tfidf_matrix = tfidf.fit_transform(df["skills"])
    vocab_size = len(tfidf.vocabulary_)
    print(f"      Vocabulary size: {vocab_size}")
    print(f"      Sample terms: {list(tfidf.vocabulary_.keys())[:20]}")

    # ── 4. Build feature matrix ──
    print("\n[4/5] Building feature matrix…")
    # Numeric features: experience (normalized), projects (normalized), education_encoded
    numeric_features = np.column_stack([
        df["experience"].values / 10.0,           # normalize to ~0–1
        df["projects"].values / 15.0,             # normalize to ~0–1
        df["education_encoded"].values.astype(float),
    ])
    X = np.hstack([tfidf_matrix.toarray(), numeric_features]).astype(np.float32)
    n_features = X.shape[1]
    print(f"      TF-IDF features: {vocab_size}")
    print(f"      Numeric features: 3")
    print(f"      Total features: {n_features}")

    # Encode target
    label_encoder = LabelEncoder()
    y = label_encoder.fit_transform(df["career"])
    print(f"      Target classes: {list(label_encoder.classes_)}")

    # ── 5. Train/test split ──
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=SEED, stratify=y,
    )
    print(f"      Train: {len(X_train)}, Test: {len(X_test)}")

    # ── 6. Train XGBClassifier ──
    print("\n[5/5] Training XGBClassifier…")
    try:
        from xgboost import XGBClassifier
    except ImportError:
        print("ERROR: xgboost not installed. Run: pip install xgboost")
        return

    model = XGBClassifier(
        n_estimators=500,
        max_depth=7,
        learning_rate=0.05,
        subsample=0.7,
        colsample_bytree=0.7,
        objective="multi:softprob",
        num_class=len(label_encoder.classes_),
        use_label_encoder=False,
        eval_metric="mlogloss",
        random_state=SEED,
        verbosity=0,
    )
    model.fit(
        X_train, y_train,
        eval_set=[(X_test, y_test)],
        verbose=False,
    )

    # ── Evaluate ──
    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"\n      ✅ Test Accuracy: {acc:.4f} ({acc*100:.1f}%)")
    print("\n      Classification Report:")
    print(classification_report(
        y_test, y_pred,
        target_names=label_encoder.classes_,
        digits=3,
    ))

    # ── Confidence check on known profiles ──
    print("=" * 60)
    print("  Confidence Validation")
    print("=" * 60)
    test_profiles = {
        "Data Scientist": "python statistics machine learning sql data analysis pandas numpy data visualization deep learning tensorflow scikit-learn research model",
        "Frontend Developer": "html css javascript react typescript responsive design webpack npm figma ui ux tailwindcss angular vue",
        "DevOps / Cloud Engineer": "docker kubernetes linux aws ci cd terraform ansible jenkins monitoring scripting devops cloud gcp azure networking",
        "Cybersecurity Analyst": "security networking linux firewalls siem vulnerability risk assessment compliance incident response cryptography monitoring penetration testing",
        "Backend Developer": "python java sql api restful docker git linux microservices spring databases mongodb postgresql system design",
    }
    for role, skills in test_profiles.items():
        vec = tfidf.transform([skills])
        fv = np.hstack([vec.toarray(), [[0.5, 0.4, 2.0]]]).astype(np.float32)
        proba = model.predict_proba(fv)[0]
        pred_idx = np.argmax(proba)
        pred_role = label_encoder.classes_[pred_idx]
        confidence = proba[pred_idx] * 100
        match = "✅" if pred_role == role else "❌"
        print(f"  {match} {role:30s} → predicted: {pred_role:30s} ({confidence:.1f}%)")

    # ── Save artifacts ──
    print(f"\n{'=' * 60}")
    print("  Saving artifacts")
    print(f"{'=' * 60}")

    model_path = os.path.join(OUTPUT_DIR, "career_model.pkl")
    tfidf_path = os.path.join(OUTPUT_DIR, "tfidf.pkl")
    edu_path = os.path.join(OUTPUT_DIR, "edu_encoder.pkl")

    joblib.dump(model, model_path)
    joblib.dump(tfidf, tfidf_path)
    joblib.dump(edu_encoder, edu_path)

    print(f"  ✅ {model_path}")
    print(f"  ✅ {tfidf_path}")
    print(f"  ✅ {edu_path}")
    print(f"\n  Model: {n_features} features, {len(label_encoder.classes_)} classes")
    print(f"  TF-IDF vocab: {vocab_size} terms")
    print(f"  Education: {list(edu_encoder.classes_)}")

    # Save class mapping for reference
    print(f"\n  Class index → Role mapping:")
    for i, cls in enumerate(label_encoder.classes_):
        print(f"    {i:2d} → {cls}")

    print(f"\n{'=' * 60}")
    print("  Done! All artifacts saved.")
    print(f"{'=' * 60}")


if __name__ == "__main__":
    main()
