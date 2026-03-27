"""
QUESTION GENERATOR MODULE
Dynamically generates follow-up questions based on symptoms provided.
Uses a rule-based + dynamic approach — not fully hardcoded.
"""

from typing import List, Dict, Any


# ─────────────────────────────────────────────────────────────────────────────
# SYMPTOM QUESTION BANK
# Each symptom maps to a list of question objects.
# "feature_key" is what will be stored after the user answers.
# "type": "choice" | "numeric" | "boolean"
# "options": for choice-type questions
# "mapping": maps answer → feature key/value pair
# ─────────────────────────────────────────────────────────────────────────────

SYMPTOM_QUESTION_BANK: Dict[str, List[Dict[str, Any]]] = {
    "fever": [
        {
            "id": "fever_duration",
            "question": "How many days have you had the fever?",
            "type": "numeric",
            "unit": "days",
            "feature_map": {
                "low": ("long_duration_fever", False),   # < 2 days
                "high": ("long_duration_fever", True),   # >= 2 days
                "threshold": 2
            }
        },
        {
            "id": "fever_severity",
            "question": "How would you describe the fever?",
            "type": "choice",
            "options": ["mild (< 100°F)", "moderate (100–102°F)", "high (> 102°F)"],
            "feature_map": {
                "mild (< 100°F)": ("high_fever", False),
                "moderate (100–102°F)": ("high_fever", False),
                "high (> 102°F)": ("high_fever", True),
            }
        }
    ],
    "cough": [
        {
            "id": "cough_type",
            "question": "Is your cough dry or wet (with mucus)?",
            "type": "choice",
            "options": ["dry", "wet", "not sure"],
            "feature_map": {
                "dry": ("dry_cough", True),
                "wet": ("dry_cough", False),
                "not sure": ("dry_cough", None),
            }
        },
        {
            "id": "cough_duration",
            "question": "How long have you had the cough?",
            "type": "numeric",
            "unit": "days",
            "feature_map": {
                "low": ("persistent_cough", False),
                "high": ("persistent_cough", True),
                "threshold": 7
            }
        }
    ],
    "headache": [
        {
            "id": "headache_severity",
            "question": "How severe is the headache?",
            "type": "choice",
            "options": ["mild", "moderate", "severe"],
            "feature_map": {
                "mild": ("severe_headache", False),
                "moderate": ("severe_headache", False),
                "severe": ("severe_headache", True),
            }
        },
        {
            "id": "headache_location",
            "question": "Where is the headache located?",
            "type": "choice",
            "options": ["forehead", "back of head", "behind eyes", "all over"],
            "feature_map": {
                "forehead": ("frontal_headache", True),
                "back of head": ("frontal_headache", False),
                "behind eyes": ("frontal_headache", False),
                "all over": ("frontal_headache", False),
            }
        }
    ],
    "vomiting": [
        {
            "id": "vomiting_frequency",
            "question": "How many times have you vomited in the past 24 hours?",
            "type": "numeric",
            "unit": "times",
            "feature_map": {
                "low": ("frequent_vomiting", False),
                "high": ("frequent_vomiting", True),
                "threshold": 3
            }
        }
    ],
    "chest_pain": [
        {
            "id": "chest_pain_type",
            "question": "How would you describe the chest pain?",
            "type": "choice",
            "options": ["sharp", "pressure/tightness", "burning", "dull ache"],
            "feature_map": {
                "sharp": ("crushing_chest_pain", False),
                "pressure/tightness": ("crushing_chest_pain", True),
                "burning": ("crushing_chest_pain", False),
                "dull ache": ("crushing_chest_pain", False),
            }
        },
        {
            "id": "chest_pain_radiation",
            "question": "Does the pain spread to your arm, jaw, or shoulder?",
            "type": "boolean",
            "feature_map": {
                "yes": ("radiating_chest_pain", True),
                "no": ("radiating_chest_pain", False),
            }
        }
    ],
    "fatigue": [
        {
            "id": "fatigue_severity",
            "question": "Does fatigue prevent you from doing daily activities?",
            "type": "boolean",
            "feature_map": {
                "yes": ("severe_fatigue", True),
                "no": ("severe_fatigue", False),
            }
        }
    ],
    "rash": [
        {
            "id": "rash_location",
            "question": "Where is the rash located?",
            "type": "choice",
            "options": ["face", "body/trunk", "limbs", "all over"],
            "feature_map": {
                "face": ("widespread_rash", False),
                "body/trunk": ("widespread_rash", True),
                "limbs": ("widespread_rash", False),
                "all over": ("widespread_rash", True),
            }
        },
        {
            "id": "rash_itching",
            "question": "Is the rash itchy?",
            "type": "boolean",
            "feature_map": {
                "yes": ("itchy_rash", True),
                "no": ("itchy_rash", False),
            }
        }
    ],
    "breathlessness": [
        {
            "id": "breath_severity",
            "question": "Do you feel short of breath even while resting?",
            "type": "boolean",
            "feature_map": {
                "yes": ("resting_breathlessness", True),
                "no": ("resting_breathlessness", False),
            }
        }
    ],
    "abdominal_pain": [
        {
            "id": "abdomen_location",
            "question": "Where is the abdominal pain?",
            "type": "choice",
            "options": ["upper right", "upper left", "lower right", "lower left", "central"],
            "feature_map": {
                "upper right": ("right_upper_abdomen_pain", True),
                "upper left": ("right_upper_abdomen_pain", False),
                "lower right": ("right_upper_abdomen_pain", False),
                "lower left": ("right_upper_abdomen_pain", False),
                "central": ("right_upper_abdomen_pain", False),
            }
        }
    ],
    "diarrhoea": [
        {
            "id": "diarrhoea_frequency",
            "question": "How many times per day are you having loose stools?",
            "type": "numeric",
            "unit": "times",
            "feature_map": {
                "low": ("severe_diarrhoea", False),
                "high": ("severe_diarrhoea", True),
                "threshold": 5
            }
        }
    ],
    "joint_pain": [
        {
            "id": "joint_count",
            "question": "How many joints are affected?",
            "type": "choice",
            "options": ["one joint", "two to three joints", "many joints"],
            "feature_map": {
                "one joint": ("multiple_joint_pain", False),
                "two to three joints": ("multiple_joint_pain", True),
                "many joints": ("multiple_joint_pain", True),
            }
        }
    ],
}

# Synonyms map — normalizes various user spellings to canonical symptom keys
SYMPTOM_SYNONYMS: Dict[str, str] = {
    "fever": "fever", "temperature": "fever", "high temperature": "fever",
    "cough": "cough", "coughing": "cough",
    "headache": "headache", "head pain": "headache", "head ache": "headache",
    "vomiting": "vomiting", "nausea": "vomiting", "vomit": "vomiting",
    "chest pain": "chest_pain", "chest ache": "chest_pain",
    "fatigue": "fatigue", "tiredness": "fatigue", "weakness": "fatigue",
    "rash": "rash", "skin rash": "rash", "spots": "rash",
    "breathlessness": "breathlessness", "shortness of breath": "breathlessness",
    "difficulty breathing": "breathlessness",
    "abdominal pain": "abdominal_pain", "stomach pain": "abdominal_pain",
    "stomach ache": "abdominal_pain",
    "diarrhoea": "diarrhoea", "diarrhea": "diarrhoea", "loose stools": "diarrhoea",
    "joint pain": "joint_pain", "body ache": "joint_pain",
}


class QuestionGenerator:
    """
    Generates follow-up questions for a given list of symptoms.
    Tracks which questions have already been asked to avoid repetition.
    """

    def __init__(self):
        self.asked_question_ids = set()

    def normalize_symptoms(self, raw_symptoms: List[str]) -> List[str]:
        """Convert user-entered symptoms to canonical keys."""
        normalized = []
        for s in raw_symptoms:
            s_lower = s.strip().lower()
            canonical = SYMPTOM_SYNONYMS.get(s_lower, s_lower.replace(" ", "_"))
            normalized.append(canonical)
        return list(set(normalized))  # deduplicate

    def get_questions_for_symptoms(self, symptoms: List[str]) -> List[Dict[str, Any]]:
        """
        Return a list of unanswered follow-up questions for the given symptoms.
        Priority: emergency symptoms first, then by symptom order.
        """
        questions = []
        # Emergency symptoms get priority only when they are present.
        priority_order: List[str] = []
        for emergency_symptom in ("chest_pain", "breathlessness"):
            if emergency_symptom in symptoms:
                priority_order.append(emergency_symptom)

        for symptom in symptoms:
            if symptom not in priority_order:
                priority_order.append(symptom)

        for symptom in priority_order:
            if symptom in SYMPTOM_QUESTION_BANK:
                for q in SYMPTOM_QUESTION_BANK[symptom]:
                    if q["id"] not in self.asked_question_ids:
                        questions.append({**q, "symptom": symptom})

        return questions

    def mark_asked(self, question_id: str):
        """Mark a question as already asked."""
        self.asked_question_ids.add(question_id)

    def reset(self):
        """Reset state for a new session."""
        self.asked_question_ids.clear()
