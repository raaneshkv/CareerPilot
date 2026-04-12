
import joblib

model = joblib.load('salary_model.pkl')
le_role = joblib.load('role_encoder.pkl')
le_location = joblib.load('location_encoder.pkl')

def analyze_career(job_role, skills_score, demand_level, location, course_cost):

    role_enc = le_role.transform([job_role])[0]
    loc_enc = le_location.transform([location])[0]

    salary = model.predict([[role_enc, skills_score, demand_level, loc_enc]])[0]
    salary = round(salary, 2)

    annual_salary = salary * 12
    roi = round(annual_salary / course_cost, 2)
    payback = round(course_cost / salary, 2)

    if roi > 1.5:
        decision = "good"
    elif roi >= 1.0:
        decision = "moderate"
    else:
        decision = "risky"

    return {
        "salary": salary,
        "roi": roi,
        "payback_months": payback,
        "decision": decision
    }
