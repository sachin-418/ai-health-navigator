"""
INFERENCE ENGINE MODULE
The brain of the system. Orchestrates all modules:
  1. Question Generator
  2. Answer Processor
  3. Feature Engineer
  4. ML Predictor
  5. Precaution DB

Implements the full interactive diagnostic loop with:
  - Adaptive questioning (stops when confidence is high)
  - Emergency detection
  - Top-3 predictions
  - Structured JSON output
"""

import json
from typing import Dict, Any, List, Optional, Tuple

from question_generator import QuestionGenerator
from answer_processor import AnswerProcessor
from feature_engineer import FeatureEngineer
from ml_predictor import MLPredictor
from precaution_db import PrecautionDB


# ─────────────────────────────────────────────────────────────────────────────
# CONFIDENCE THRESHOLD
# Stop asking questions once top prediction confidence exceeds this value.
# ─────────────────────────────────────────────────────────────────────────────
HIGH_CONFIDENCE_THRESHOLD = 0.80

# Maximum number of follow-up questions to ask (prevents fatigue)
MAX_QUESTIONS = 6

# These columns are used when model.pkl is not found (development mode).
# In production, they come from the trained model's feature_names_in_.
FALLBACK_FEATURE_COLUMNS = [
    "itching", "skin_rash", "nodal_skin_eruptions", "continuous_sneezing",
    "shivering", "chills", "joint_pain", "stomach_pain", "acidity",
    "ulcers_on_tongue", "muscle_wasting", "vomiting", "burning_micturition",
    "fatigue", "weight_gain", "anxiety", "cold_hands_and_feets", "mood_swings",
    "weight_loss", "restlessness", "lethargy", "patches_in_throat",
    "irregular_sugar_level", "cough", "high_fever", "sunken_eyes",
    "breathlessness", "sweating", "dehydration", "indigestion", "headache",
    "yellowish_skin", "dark_urine", "nausea", "loss_of_appetite", "pain_behind_the_eyes",
    "back_pain", "constipation", "abdominal_pain", "diarrhoea", "mild_fever",
    "yellow_urine", "yellowing_of_eyes", "acute_liver_failure", "fluid_overload",
    "swelling_of_stomach", "swelled_lymph_nodes", "malaise", "blurred_and_distorted_vision",
    "phlegm", "throat_irritation", "redness_of_eyes", "sinus_pressure",
    "runny_nose", "congestion", "chest_pain", "weakness_in_limbs",
    "fast_heart_rate", "pain_during_bowel_motions", "pain_in_anal_region",
    "bloody_stool", "irritation_in_anus", "neck_stiffness", "word_finding_difficulty",
    "bladder_discomfort", "foul_smell_of_urine", "continuous_feel_of_urine",
    "passage_of_gases", "internal_itching", "toxic_look_(typhos)",
    "depression", "irritability", "muscle_pain", "altered_sensorium",
    "red_spots_over_body", "belly_pain", "abnormal_menstruation", "watering_from_eyes",
    "increased_appetite", "polyuria", "family_history", "mucoid_sputum",
    "rusty_sputum", "lack_of_concentration", "visual_disturbances",
    "receiving_blood_transfusion", "receiving_unsterile_injections",
    "coma", "stomach_bleeding", "distention_of_abdomen",
    "history_of_alcohol_consumption", "blood_in_sputum",
    "prominent_veins_on_calf", "palpitations", "painful_walking",
    "pus_filled_pimples", "blackheads", "scurring", "skin_peeling",
    "silver_like_dusting", "small_dents_in_nails", "inflammatory_nails",
    "blister", "red_sore_around_nose", "yellow_crust_ooze",
    # Extended derived features from our engine
    "long_duration_fever", "dry_cough", "persistent_cough", "severe_headache",
    "frontal_headache", "frequent_vomiting", "severe_diarrhoea",
    "crushing_chest_pain", "radiating_chest_pain", "resting_breathlessness",
    "severe_fatigue", "widespread_rash", "itchy_rash", "multiple_joint_pain",
    "right_upper_abdomen_pain",
]


class InferenceEngine:
    """
    Main diagnostic engine. Manages the interactive session and produces
    a structured diagnostic output.
    """

    def __init__(
        self,
        model_path: str = "model.pkl",
        precaution_csv: str = "disease_precaution.csv"
    ):
        print("\n" + "="*60)
        print("  AI-BASED EARLY DISEASE DETECTION SYSTEM")
        print("  Initializing inference engine...")
        print("="*60)

        # Initialize all sub-modules
        self.predictor = MLPredictor(model_path=model_path)
        self.precaution_db = PrecautionDB(csv_path=precaution_csv)
        self.question_gen = QuestionGenerator()
        self.answer_proc = AnswerProcessor()

        # Resolve feature columns
        model_columns = self.predictor.get_feature_columns()
        feature_columns = model_columns if model_columns else FALLBACK_FEATURE_COLUMNS
        self.feature_eng = FeatureEngineer(model_feature_columns=feature_columns)

        print(f"[Engine] Feature space: {len(feature_columns)} features")
        print("[Engine] Ready.\n")

        # Session state
        self._reset_session()

    def _reset_session(self):
        """Reset all session state for a new patient."""
        self.raw_symptoms: List[str] = []
        self.derived_features: Dict[str, Any] = {}
        self.question_gen.reset()
        self.question_count = 0
        self.current_confidence = 0.0
        self.top_predictions: List[Tuple[str, float]] = []

    # ─────────────────────────────────────────────────────────────────────────
    # STEP 1: Accept initial symptoms
    # ─────────────────────────────────────────────────────────────────────────

    def accept_symptoms(self, symptoms_input: str) -> List[str]:
        """
        Parse comma/space separated symptom string.
        Normalize and store.
        """
        raw = [s.strip() for s in symptoms_input.replace(",", " ").split() if s.strip()]
        # Also split on common separators
        parsed = []
        for item in symptoms_input.split(","):
            item = item.strip()
            if item:
                parsed.append(item)

        self.raw_symptoms = self.question_gen.normalize_symptoms(parsed)
        print(f"\n[Engine] Normalized symptoms: {self.raw_symptoms}")
        return self.raw_symptoms

    # ─────────────────────────────────────────────────────────────────────────
    # STEP 2 & 3: Interactive Q&A loop
    # ─────────────────────────────────────────────────────────────────────────

    def get_next_question(self) -> Optional[Dict[str, Any]]:
        """
        Return the next follow-up question, or None if we should stop.
        Stops if:
          - Confidence exceeds HIGH_CONFIDENCE_THRESHOLD
          - MAX_QUESTIONS reached
          - No more questions available
        """
        # Check if we should stop early
        if self.question_count >= MAX_QUESTIONS:
            return None
        if self.current_confidence >= HIGH_CONFIDENCE_THRESHOLD:
            return None

        # Get unanswered questions for current symptoms
        pending = self.question_gen.get_questions_for_symptoms(self.raw_symptoms)
        if not pending:
            return None

        next_q = pending[0]
        self.question_gen.mark_asked(next_q["id"])
        return next_q

    def submit_answer(self, question: Dict[str, Any], raw_answer: str) -> bool:
        """
        Process a user's answer to a follow-up question.
        Updates derived_features and re-evaluates confidence.
        Returns True if answer was understood, False otherwise.
        """
        # Handle "don't know" / "skip" answers
        skip_phrases = {"skip", "don't know", "not sure", "idk", "unknown", "dk", "?", "na", "n/a"}
        if raw_answer.strip().lower() in skip_phrases:
            result = self.answer_proc.handle_unknown(question)
        else:
            result = self.answer_proc.process_answer(question, raw_answer)

        if result is not None:
            feat_key, feat_val = result
            self.derived_features[feat_key] = feat_val
            self.question_count += 1
            # Re-evaluate confidence after each answer
            self._update_confidence()
            return True
        else:
            # Could not interpret answer
            return False

    def _update_confidence(self):
        """Run a quick intermediate prediction to update current confidence."""
        vector = self.feature_eng.build_feature_vector(
            self.raw_symptoms, self.derived_features
        )
        predictions = self.predictor.predict_top_n(vector, top_n=3)
        if predictions:
            self.top_predictions = predictions
            self.current_confidence = predictions[0][1]

    # ─────────────────────────────────────────────────────────────────────────
    # STEP 5 & 6: Final prediction and output generation
    # ─────────────────────────────────────────────────────────────────────────

    def generate_diagnosis(self) -> Dict[str, Any]:
        """
        Generate the final structured diagnostic output.
        This is the main output of the entire engine.
        """
        # Final feature vector
        vector = self.feature_eng.build_feature_vector(
            self.raw_symptoms, self.derived_features
        )

        # Get top-3 predictions
        top_predictions = self.predictor.predict_top_n(vector, top_n=3)

        if not top_predictions:
            return {"error": "Could not generate prediction from given symptoms."}

        # Primary prediction
        primary_disease, primary_confidence = top_predictions[0]

        # Severity and risk
        severity_score = self.feature_eng.compute_severity_score(
            self.raw_symptoms, self.derived_features
        )
        risk_level = self.feature_eng.compute_risk_level(severity_score, primary_confidence)

        # Emergency check
        is_emergency = self.feature_eng.check_emergency(
            self.raw_symptoms, self.derived_features
        )

        # Reasoning
        reasons = self.feature_eng.build_reasoning(
            self.raw_symptoms, self.derived_features, primary_disease
        )

        # Precautions
        precautions = self.precaution_db.get_precautions(primary_disease)

        # Build alternate predictions list
        alternate_predictions = [
            {"disease": d, "confidence": round(c, 4)}
            for d, c in top_predictions[1:]
        ]

        # Final output
        output = {
            "disease": primary_disease,
            "confidence": round(primary_confidence, 4),
            "risk_level": risk_level,
            "severity_score": round(severity_score, 4),
            "is_emergency": is_emergency,
            "reason": reasons,
            "precautions": precautions,
            "alternate_predictions": alternate_predictions,
            "symptoms_analyzed": self.raw_symptoms,
            "derived_features": {
                k: v for k, v in self.derived_features.items() if v is not None
            },
            "questions_asked": self.question_count,
        }

        # Add emergency alert message
        if is_emergency:
            output["emergency_alert"] = (
                "⚠️  EMERGENCY: Your symptoms suggest a potentially life-threatening "
                "condition. Please call emergency services (108/112) or go to the "
                "nearest hospital IMMEDIATELY."
            )

        return output


# ─────────────────────────────────────────────────────────────────────────────
# INTERACTIVE CLI SESSION
# Runs the full chatbot loop in the terminal.
# ─────────────────────────────────────────────────────────────────────────────

def run_interactive_session(engine: Optional[InferenceEngine] = None):
    """
    Full interactive command-line diagnostic session.
    Can accept a pre-configured engine (useful for testing).
    """
    if engine is None:
        engine = InferenceEngine()

    engine._reset_session()

    print("\n" + "─"*60)
    print("  DIAGNOSTIC ASSISTANT — TYPE 'quit' TO EXIT")
    print("─"*60)

    # ── Step 1: Get initial symptoms ──
    print("\nPlease enter your symptoms (comma separated).")
    print("Example: fever, cough, headache\n")

    symptoms_input = input("Your symptoms: ").strip()
    if symptoms_input.lower() in ("quit", "exit"):
        print("Session ended.")
        return None

    engine.accept_symptoms(symptoms_input)

    print("\nThank you. I will now ask a few follow-up questions.")
    print("Type 'skip' if you are unsure about any question.\n")

    # ── Steps 2 & 3: Follow-up questions ──
    while True:
        question = engine.get_next_question()

        if question is None:
            print("\n[Engine] Sufficient information collected. Generating diagnosis...")
            break

        # Display the question
        print(f"\n❓ {question['question']}")

        if question["type"] == "choice":
            options = question.get("options", [])
            for i, opt in enumerate(options, 1):
                print(f"   {i}. {opt}")
            print("   (You can type the number or the full option)")

        elif question["type"] == "boolean":
            print("   (yes / no)")

        elif question["type"] == "numeric":
            unit = question.get("unit", "")
            print(f"   (Enter a number in {unit})")

        raw_answer = input("\nYour answer: ").strip()

        if raw_answer.lower() in ("quit", "exit"):
            print("Session ended.")
            return None

        # Handle numeric-by-index for choice questions
        if question["type"] == "choice":
            options = question.get("options", [])
            try:
                idx = int(raw_answer) - 1
                if 0 <= idx < len(options):
                    raw_answer = options[idx]
            except ValueError:
                pass  # user typed text, use as is

        # Process the answer
        understood = engine.submit_answer(question, raw_answer)
        if not understood:
            print("   [!] I didn't quite understand that answer. Moving on...")

    # ── Steps 5 & 6: Generate and display diagnosis ──
    result = engine.generate_diagnosis()

    print("\n" + "="*60)
    print("  DIAGNOSTIC REPORT")
    print("="*60)
    print(json.dumps(result, indent=2))
    print("="*60)

    # Show emergency alert prominently
    if result.get("is_emergency"):
        print(f"\n{result.get('emergency_alert', '')}\n")

    return result


# ─────────────────────────────────────────────────────────────────────────────
# PROGRAMMATIC API (for integration with web/mobile backend)
# ─────────────────────────────────────────────────────────────────────────────

def run_programmatic_session(
    symptoms: List[str],
    answers: Dict[str, str],   # question_id → answer
    engine: Optional[InferenceEngine] = None
) -> Dict[str, Any]:
    """
    Non-interactive version. Accepts symptoms and pre-collected answers.
    Returns the full diagnostic JSON.

    Useful for API/backend integration.

    Args:
        symptoms: List of symptom strings, e.g. ["fever", "cough"]
        answers:  Dict mapping question_id to answer string,
                  e.g. {"fever_duration": "3", "fever_severity": "high (> 102°F)"}
        engine:   Optional pre-initialized engine

    Returns:
        Structured diagnostic dict
    """
    if engine is None:
        engine = InferenceEngine()

    engine._reset_session()

    # Step 1: Accept symptoms
    engine.raw_symptoms = engine.question_gen.normalize_symptoms(symptoms)

    # Step 2+3: Process provided answers
    all_questions = engine.question_gen.get_questions_for_symptoms(engine.raw_symptoms)

    for question in all_questions:
        qid = question["id"]
        if qid in answers:
            engine.question_gen.mark_asked(qid)
            raw_answer = answers[qid]
            engine.submit_answer(question, raw_answer)

    # Generate diagnosis
    return engine.generate_diagnosis()
