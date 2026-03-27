"""
PRECAUTION LOOKUP MODULE
Loads the disease-precaution dataset and retrieves precautions for a given disease.
Expects a CSV with columns: disease, Precaution_1, Precaution_2, Precaution_3, Precaution_4
(standard Kaggle disease dataset format)
"""

import os
import csv
from typing import Dict, List

# ─────────────────────────────────────────────────────────────────────────────
# BUILT-IN FALLBACK PRECAUTIONS
# Used when dataset CSV is not available. Covers common diseases.
# ─────────────────────────────────────────────────────────────────────────────

FALLBACK_PRECAUTIONS: Dict[str, List[str]] = {
    "Dengue": [
        "Drink plenty of fluids to stay hydrated",
        "Take complete rest and avoid exertion",
        "Use mosquito repellent and avoid mosquito bites",
        "Consult a doctor immediately — do not take aspirin or ibuprofen",
    ],
    "Malaria": [
        "Consult a doctor immediately for anti-malarial medication",
        "Drink fluids and rest",
        "Use mosquito nets and repellents",
        "Complete the full course of prescribed medication",
    ],
    "Typhoid": [
        "Drink boiled or purified water only",
        "Eat freshly cooked, hot food",
        "Maintain strict hand hygiene",
        "Consult a doctor for antibiotic treatment",
    ],
    "Influenza": [
        "Get adequate rest and sleep",
        "Stay hydrated with water, soups, and juices",
        "Take antipyretics for fever as directed",
        "Avoid contact with others to prevent spread",
    ],
    "Common Cold": [
        "Rest well and stay warm",
        "Drink warm fluids (tea, soups)",
        "Use saline nasal drops for congestion",
        "Over-the-counter cold medications may help symptoms",
    ],
    "Pneumonia": [
        "Seek medical attention immediately",
        "Complete full course of prescribed antibiotics",
        "Rest and stay hydrated",
        "Avoid smoking and polluted environments",
    ],
    "COVID-19": [
        "Isolate yourself from others",
        "Rest and stay well hydrated",
        "Monitor oxygen levels — seek emergency care if below 94%",
        "Follow current government health guidelines",
    ],
    "Heart Disease": [
        "Seek emergency medical care immediately",
        "Do not drive yourself to the hospital",
        "Chew aspirin (325 mg) if not allergic and advised by doctor",
        "Avoid physical exertion",
    ],
    "Hepatitis A": [
        "Rest and avoid alcohol completely",
        "Eat light, easily digestible foods",
        "Maintain strict hygiene to prevent spread",
        "Consult a doctor and monitor liver function",
    ],
    "default": [
        "Consult a qualified doctor for proper diagnosis",
        "Rest and stay hydrated",
        "Avoid self-medication",
        "Monitor your symptoms and seek emergency care if they worsen",
    ]
}


class PrecautionDB:
    """Retrieves precautions for a predicted disease."""

    def __init__(self, csv_path: str = "disease_precaution.csv"):
        self.data: Dict[str, List[str]] = {}
        self._load_csv(csv_path)

    def _load_csv(self, csv_path: str):
        """Load precautions from CSV file if available."""
        if not os.path.exists(csv_path):
            print(f"[PrecautionDB] '{csv_path}' not found — using built-in fallback data.")
            return

        with open(csv_path, newline="", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                disease = row.get("Disease", row.get("disease", "")).strip()
                if not disease:
                    continue
                precautions = [
                    row.get(f"Precaution_{i}", "").strip()
                    for i in range(1, 5)
                ]
                precautions = [p for p in precautions if p]  # remove blanks
                if precautions:
                    self.data[disease.lower()] = precautions

        print(f"[PrecautionDB] Loaded precautions for {len(self.data)} diseases from CSV.")

    def get_precautions(self, disease: str) -> List[str]:
        """Return precautions for a disease. Falls back gracefully."""
        # Try exact match (case-insensitive)
        lower_disease = disease.lower().strip()
        if lower_disease in self.data:
            return self.data[lower_disease]

        # Try fallback dict (handles mock predictions)
        for key, val in FALLBACK_PRECAUTIONS.items():
            if key.lower() == lower_disease:
                return val

        # Partial match in CSV data
        for key, val in self.data.items():
            if lower_disease in key or key in lower_disease:
                return val

        # Ultimate fallback
        return FALLBACK_PRECAUTIONS["default"]
