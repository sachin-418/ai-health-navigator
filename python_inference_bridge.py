import json
import sys
from typing import Any, Dict, List
from contextlib import redirect_stdout
from io import StringIO

from inference_engine import InferenceEngine, run_programmatic_session


def to_level(risk_level: str) -> str:
    normalized = str(risk_level or "").strip().lower()
    if normalized == "high":
        return "severe"
    if normalized == "medium":
        return "moderate"
    return "mild"


def to_consult_text(level: str, is_emergency: bool) -> str:
    if is_emergency or level == "severe":
        return "Urgent consultation required"
    if level == "moderate":
        return "Consult doctor within 24 hours"
    return "Routine consultation recommended"


def build_follow_up_questions(
    engine: InferenceEngine,
    symptoms: List[str],
    answered_question_ids: List[str] | None = None,
    limit: int = 10,
) -> List[Dict[str, Any]]:
    canonical_symptoms = engine.question_gen.normalize_symptoms(symptoms)
    raw_questions = engine.question_gen.get_questions_for_symptoms(canonical_symptoms)
    answered_set = set(answered_question_ids or [])

    primary_symptom = canonical_symptoms[0].replace("_", " ") if canonical_symptoms else "symptom"
    clinical_questions = [
        {
            "id": "clinical_onset",
            "question": f"When did the {primary_symptom} start?",
            "type": "choice",
            "options": ["today", "1-2 days ago", "3-7 days ago", "more than a week"],
        },
        {
            "id": "clinical_severity_scale",
            "question": "On a scale of 1-10, how severe is it right now?",
            "type": "numeric",
            "options": [],
        },
        {
            "id": "clinical_pattern",
            "question": "Is it constant or does it come and go?",
            "type": "choice",
            "options": ["constant", "comes and goes", "worse at night", "worse in morning"],
        },
        {
            "id": "clinical_progression",
            "question": "Compared to when it started, is it improving, same, or worsening?",
            "type": "choice",
            "options": ["improving", "same", "worsening"],
        },
        {
            "id": "clinical_triggers",
            "question": "Does anything make it worse?",
            "type": "choice",
            "options": ["activity", "food", "stress", "weather", "nothing specific"],
        },
        {
            "id": "clinical_relief",
            "question": "Does anything make it better?",
            "type": "choice",
            "options": ["rest", "hydration", "medication", "nothing helps"],
        },
        {
            "id": "clinical_associated",
            "question": "Any associated symptoms (for example fever, nausea, breathlessness, dizziness)?",
            "type": "choice",
            "options": ["yes", "no", "not sure"],
        },
        {
            "id": "clinical_past_history",
            "question": "Have you had a similar episode before?",
            "type": "boolean",
            "options": ["yes", "no"],
        },
        {
            "id": "clinical_meds",
            "question": "Have you taken any medicine for this already?",
            "type": "boolean",
            "options": ["yes", "no"],
        },
        {
            "id": "clinical_red_flags",
            "question": "Any danger signs like chest pain, fainting, confusion, or severe breathing difficulty?",
            "type": "boolean",
            "options": ["yes", "no"],
        },
    ]

    combined_questions = list(raw_questions)
    existing_ids = {str(item.get("id") or "") for item in combined_questions}
    for question in clinical_questions:
        if question["id"] not in existing_ids:
            combined_questions.append(question)
            existing_ids.add(question["id"])

    follow_up_questions = []
    for question in combined_questions:
        question_id = str(question.get("id") or "")
        if question_id in answered_set:
            continue

        follow_up_questions.append(
            {
                "id": question_id,
                "question": str(question.get("question") or ""),
                "type": str(question.get("type") or "text"),
                "options": [str(item) for item in (question.get("options") or [])],
            }
        )

        if len(follow_up_questions) >= limit:
            break

    return follow_up_questions


def extract_additional_symptoms_from_answers(
    engine: InferenceEngine,
    answers: Dict[str, str],
) -> List[str]:
    phrases: List[str] = []

    for value in answers.values():
        text = str(value).strip().lower()
        if not text:
            continue

        # Keep full phrase and also split by common separators to capture symptom mentions.
        phrases.append(text)
        tokens = [text]
        for separator in [",", ";", "|", "/", " and ", " with ", " plus "]:
            next_tokens: List[str] = []
            for token in tokens:
                next_tokens.extend(token.split(separator))
            tokens = next_tokens

        for token in tokens:
            cleaned = token.strip()
            if cleaned:
                phrases.append(cleaned)

    normalized = engine.question_gen.normalize_symptoms(phrases)
    return [item for item in normalized if item]


def normalize_prediction(
    raw: Dict[str, Any],
    input_symptoms: List[str],
    follow_up_questions: List[Dict[str, Any]],
) -> Dict[str, Any]:
    disease = str(raw.get("disease") or "No strong disease match found")
    confidence = float(raw.get("confidence") or 0.0)
    score = max(0, min(100, int(round(confidence * 100))))
    risk_level = str(raw.get("risk_level") or "Low")
    level = to_level(risk_level)
    is_emergency = bool(raw.get("is_emergency"))

    alternate_predictions = raw.get("alternate_predictions") or []
    top_predictions = [
        {
            "diseaseName": disease,
            "score": score,
            "level": level,
        }
    ]

    for item in alternate_predictions[:2]:
        alt_name = str(item.get("disease") or "Unknown")
        alt_conf = float(item.get("confidence") or 0.0)
        alt_score = max(0, min(100, int(round(alt_conf * 100))))
        top_predictions.append(
            {
                "diseaseName": alt_name,
                "score": alt_score,
                "level": "moderate",
            }
        )

    precautions = raw.get("precautions") or [
        "Monitor symptoms",
        "Stay hydrated",
        "Rest well",
        "Consult a doctor for confirmation",
    ]

    return {
        "diseaseName": disease,
        "precautions": precautions,
        "score": score,
        "level": level,
        "consultDoctorLevel": to_consult_text(level, is_emergency),
        "symptoms": [str(s).replace("_", " ") for s in input_symptoms],
        "matchedSymptoms": [str(s).replace("_", " ") for s in input_symptoms],
        "topPredictions": top_predictions,
        "followUpQuestions": follow_up_questions,
        "meta": {
            "engine": "python",
            "riskLevel": risk_level,
            "severityScore": raw.get("severity_score"),
            "isEmergency": is_emergency,
            "reason": raw.get("reason") or [],
            "emergencyAlert": raw.get("emergency_alert"),
        },
    }


def read_input() -> Dict[str, Any]:
    if len(sys.argv) > 1:
        try:
            return json.loads(sys.argv[1])
        except Exception:
            return {}

    payload = sys.stdin.read().strip()
    if not payload:
        return {}

    try:
        return json.loads(payload)
    except Exception:
        return {}


def main() -> int:
    payload = read_input()
    symptoms = payload.get("symptoms") if isinstance(payload.get("symptoms"), list) else []
    text = str(payload.get("text") or "").strip()
    answers_payload = payload.get("answers") if isinstance(payload.get("answers"), dict) else {}
    answers = {str(key): str(value) for key, value in answers_payload.items()}

    normalized_symptoms = [str(item).strip() for item in symptoms if str(item).strip()]

    if not normalized_symptoms and text:
        separators = [",", ";", "|", "\n"]
        split_items = [text]
        for separator in separators:
            next_items = []
            for value in split_items:
                next_items.extend(value.split(separator))
            split_items = next_items
        normalized_symptoms = [value.strip() for value in split_items if value.strip()]

    if not normalized_symptoms:
        result = {
            "diseaseName": "Insufficient symptom information",
            "precautions": [
                "Describe more symptoms for better analysis",
                "Monitor your condition",
                "Stay hydrated",
                "Consult a doctor if symptoms worsen",
            ],
            "score": 0,
            "level": "mild",
            "consultDoctorLevel": "Routine consultation recommended",
            "symptoms": [],
            "matchedSymptoms": [],
            "topPredictions": [],
            "followUpQuestions": [],
            "meta": {"engine": "python"},
        }
        sys.stdout.write(json.dumps(result))
        return 0

    with redirect_stdout(StringIO()):
        engine = InferenceEngine()
        inferred_symptoms = extract_additional_symptoms_from_answers(engine, answers)
        combined_symptoms = list(dict.fromkeys([*normalized_symptoms, *inferred_symptoms]))
        raw_prediction = run_programmatic_session(symptoms=combined_symptoms, answers=answers, engine=engine)
        follow_up_questions = build_follow_up_questions(engine, combined_symptoms, list(answers.keys()))
    normalized_prediction = normalize_prediction(raw_prediction, combined_symptoms, follow_up_questions)
    sys.stdout.write(json.dumps(normalized_prediction))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        sys.stderr.write(f"python_inference_bridge error: {exc}\n")
        raise
