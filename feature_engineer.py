"""
FEATURE ENGINEERING MODULE
Combines original symptoms with derived features into a vector
compatible with the trained ML model (expects specific column ordering).
Also handles severity scoring for each symptom.
"""

import numpy as np
from typing import Dict, Any, List, Optional


# ─────────────────────────────────────────────────────────────────────────────
# SEVERITY WEIGHTS
# Maps symptoms/derived features to a 0–1 severity score contribution.
# Used for risk level calculation independent of model confidence.
# ─────────────────────────────────────────────────────────────────────────────

SEVERITY_WEIGHTS: Dict[str, float] = {
    # Raw symptoms
    "chest_pain": 0.95,
    "breathlessness": 0.90,
    "fever": 0.60,
    "vomiting": 0.55,
    "diarrhoea": 0.50,
    "rash": 0.45,
    "headache": 0.40,
    "cough": 0.35,
    "fatigue": 0.30,
    "joint_pain": 0.35,
    "abdominal_pain": 0.50,

    # Derived features (boost severity further)
    "high_fever": 0.30,
    "long_duration_fever": 0.20,
    "crushing_chest_pain": 0.40,
    "radiating_chest_pain": 0.45,
    "resting_breathlessness": 0.35,
    "severe_headache": 0.25,
    "frequent_vomiting": 0.25,
    "severe_diarrhoea": 0.30,
    "persistent_cough": 0.20,
    "severe_fatigue": 0.20,
    "widespread_rash": 0.20,
    "multiple_joint_pain": 0.20,
}

# ─────────────────────────────────────────────────────────────────────────────
# EMERGENCY RULES
# If any of these derived features are True, trigger immediate alert.
# ─────────────────────────────────────────────────────────────────────────────

EMERGENCY_FEATURES = {
    "crushing_chest_pain",
    "radiating_chest_pain",
    "resting_breathlessness",
    "chest_pain",      # raw symptom itself
}


class FeatureEngineer:
    """
    Converts symptom lists + derived Q&A features into a model-ready feature vector.
    """

    def __init__(self, model_feature_columns: List[str]):
        """
        model_feature_columns: ordered list of feature names the trained model expects.
        This is typically derived from training data columns (all symptom columns).
        """
        self.model_feature_columns = model_feature_columns

    def build_feature_vector(
        self,
        raw_symptoms: List[str],
        derived_features: Dict[str, Any]
    ) -> np.ndarray:
        """
        Build the feature vector that the ML model expects.

        Strategy:
        1. Start with all zeros for each model column.
        2. Set 1 for each raw symptom present.
        3. Set 1 for each derived feature that is True.
        4. Leave 0 for unknown (None) derived features — safer than guessing.
        """
        feature_dict: Dict[str, float] = {col: 0.0 for col in self.model_feature_columns}

        # Mark raw symptoms
        for symptom in raw_symptoms:
            clean = symptom.strip().lower().replace(" ", "_")
            if clean in feature_dict:
                feature_dict[clean] = 1.0

        # Mark derived features
        for feat_key, feat_val in derived_features.items():
            if feat_key in feature_dict:
                if feat_val is True:
                    feature_dict[feat_key] = 1.0
                elif feat_val is False:
                    feature_dict[feat_key] = 0.0
                # None = leave as 0 (unknown → assume absent, conservative)

        # Convert to ordered numpy array
        vector = np.array(
            [feature_dict[col] for col in self.model_feature_columns],
            dtype=np.float32
        )
        return vector.reshape(1, -1)  # shape (1, n_features) for sklearn predict

    def compute_severity_score(
        self,
        raw_symptoms: List[str],
        derived_features: Dict[str, Any]
    ) -> float:
        """
        Aggregate severity score in [0, 1] based on symptoms + derived features.
        Uses capped additive scoring.
        """
        score = 0.0
        seen = set()

        for symptom in raw_symptoms:
            clean = symptom.strip().lower().replace(" ", "_")
            w = SEVERITY_WEIGHTS.get(clean, 0.1)
            if clean not in seen:
                score += w
                seen.add(clean)

        for feat_key, feat_val in derived_features.items():
            if feat_val is True and feat_key not in seen:
                w = SEVERITY_WEIGHTS.get(feat_key, 0.05)
                score += w
                seen.add(feat_key)

        return min(score, 1.0)  # cap at 1.0

    def compute_risk_level(self, severity_score: float, confidence: float) -> str:
        """
        Determine risk level from severity score and model confidence.
        """
        combined = 0.6 * severity_score + 0.4 * confidence

        if combined >= 0.70:
            return "High"
        elif combined >= 0.40:
            return "Medium"
        else:
            return "Low"

    def check_emergency(self, raw_symptoms: List[str], derived_features: Dict[str, Any]) -> bool:
        """
        Return True if any emergency-level symptom/feature is present and active.
        """
        for symptom in raw_symptoms:
            clean = symptom.strip().lower().replace(" ", "_")
            if clean in EMERGENCY_FEATURES:
                return True

        for feat_key, feat_val in derived_features.items():
            if feat_key in EMERGENCY_FEATURES and feat_val is True:
                return True

        return False

    def build_reasoning(
        self,
        raw_symptoms: List[str],
        derived_features: Dict[str, Any],
        predicted_disease: str
    ) -> List[str]:
        """
        Generate human-readable reasoning statements explaining the prediction.
        Dynamically constructed from present symptoms and features.
        """
        reasons = []

        # Symptom-to-reason templates
        symptom_reasons = {
            "fever": "Presence of fever",
            "cough": "Persistent cough reported",
            "headache": "Headache present",
            "vomiting": "Vomiting reported",
            "rash": "Skin rash observed",
            "fatigue": "Fatigue / weakness reported",
            "chest_pain": "Chest pain reported — serious indicator",
            "breathlessness": "Difficulty breathing reported",
            "diarrhoea": "Diarrhoea present",
            "joint_pain": "Joint pain reported",
            "abdominal_pain": "Abdominal pain present",
        }

        derived_reasons = {
            "high_fever": "High-grade fever (> 102°F) — significantly elevated",
            "long_duration_fever": "Fever lasting more than 2 days",
            "dry_cough": "Dry cough characteristic of respiratory infection",
            "persistent_cough": "Cough persisting more than 7 days",
            "severe_headache": "Severe headache — may indicate neurological involvement",
            "frontal_headache": "Frontal headache pattern noted",
            "frequent_vomiting": "Frequent vomiting (3+ times/day)",
            "severe_diarrhoea": "Severe diarrhoea (5+ times/day) — dehydration risk",
            "crushing_chest_pain": "Crushing/pressure chest pain — cardiac involvement possible",
            "radiating_chest_pain": "Pain radiating to arm/jaw/shoulder — cardiac red flag",
            "resting_breathlessness": "Breathlessness at rest — urgent evaluation needed",
            "severe_fatigue": "Fatigue severe enough to limit daily activities",
            "widespread_rash": "Widespread rash pattern on body/trunk",
            "itchy_rash": "Pruritic (itchy) rash",
            "multiple_joint_pain": "Multiple joints affected",
            "right_upper_abdomen_pain": "Right upper abdominal pain — possible hepatic involvement",
        }

        # Add reasons for raw symptoms present
        for symptom in raw_symptoms:
            clean = symptom.strip().lower().replace(" ", "_")
            if clean in symptom_reasons:
                reasons.append(symptom_reasons[clean])

        # Add reasons for True derived features
        for feat_key, feat_val in derived_features.items():
            if feat_val is True and feat_key in derived_reasons:
                reasons.append(derived_reasons[feat_key])

        if not reasons:
            reasons.append(f"Symptom pattern matches {predicted_disease}")

        return reasons
