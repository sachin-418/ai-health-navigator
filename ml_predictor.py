"""
ML PREDICTION MODULE
Loads the trained Random Forest model (model.pkl) and wraps prediction
into a clean interface returning top-N predictions with confidence scores.
"""

import pickle
import numpy as np
from typing import List, Tuple, Optional
import os


class MLPredictor:
    """
    Wraps the trained sklearn model (RandomForestClassifier).
    Provides top-N predictions with probability scores.
    """

    def __init__(self, model_path: str = "model.pkl"):
        self.model = None
        self.classes = None
        self.model_path = model_path
        self._load_model()

    def _load_model(self):
        """Load model from disk. Fails gracefully if not found."""
        if os.path.exists(self.model_path):
            with open(self.model_path, "rb") as f:
                self.model = pickle.load(f)
            # sklearn classifiers expose .classes_ attribute
            self.classes = self.model.classes_
            print(f"[MLPredictor] Model loaded from '{self.model_path}'")
            print(f"[MLPredictor] Classes: {len(self.classes)} diseases")
        else:
            print(f"[MLPredictor] WARNING: '{self.model_path}' not found. Using mock predictor.")
            self.model = None

    def predict_top_n(
        self,
        feature_vector: np.ndarray,
        top_n: int = 3
    ) -> List[Tuple[str, float]]:
        """
        Returns a sorted list of (disease_name, probability) tuples.
        If real model not available, returns a mock result for testing.
        """
        if self.model is not None:
            return self._real_predict(feature_vector, top_n)
        else:
            return self._mock_predict(feature_vector, top_n)

    def _real_predict(
        self,
        feature_vector: np.ndarray,
        top_n: int
    ) -> List[Tuple[str, float]]:
        """Use the actual trained model."""
        proba = self.model.predict_proba(feature_vector)[0]
        # Get indices of top N probabilities
        top_indices = np.argsort(proba)[::-1][:top_n]
        results = [
            (self.classes[i], round(float(proba[i]), 4))
            for i in top_indices
            if proba[i] > 0  # exclude zero-probability classes
        ]
        return results

    def _mock_predict(
        self,
        feature_vector: np.ndarray,
        top_n: int
    ) -> List[Tuple[str, float]]:
        """
        Mock prediction used when model.pkl is not present.
        Simulates realistic output based on a simple heuristic on feature vector.
        Used for development/testing only.
        """
        # The mock maps feature sums to plausible diseases
        feature_sum = int(np.sum(feature_vector))

        mock_results = {
            0: [("Common Cold", 0.72), ("Influenza", 0.15), ("Allergic Rhinitis", 0.08)],
            1: [("Common Cold", 0.65), ("Influenza", 0.20), ("Bronchitis", 0.10)],
            2: [("Influenza", 0.70), ("Dengue", 0.15), ("Malaria", 0.10)],
            3: [("Dengue", 0.68), ("Malaria", 0.18), ("Typhoid", 0.10)],
            4: [("Dengue", 0.72), ("Typhoid", 0.15), ("Malaria", 0.09)],
            5: [("Typhoid", 0.65), ("Hepatitis A", 0.20), ("Dengue", 0.10)],
            6: [("Pneumonia", 0.70), ("COVID-19", 0.15), ("Bronchitis", 0.10)],
            7: [("COVID-19", 0.75), ("Pneumonia", 0.15), ("Influenza", 0.07)],
            8: [("Heart Disease", 0.80), ("Angina", 0.12), ("GERD", 0.05)],
        }

        key = min(feature_sum, max(mock_results.keys()))
        return mock_results.get(key, [("Unknown", 0.50)])[:top_n]

    def get_feature_columns(self) -> Optional[List[str]]:
        """
        Return the feature column names the model was trained on.
        For sklearn pipelines, this is typically stored as model.feature_names_in_
        """
        if self.model is not None:
            if hasattr(self.model, "feature_names_in_"):
                return list(self.model.feature_names_in_)
        return None
