"""
MODEL TRAINER — HELPER SCRIPT
Use this to train the Random Forest model from your dataset
and save it as model.pkl, ready for the inference engine.

Expected CSV format (standard Kaggle disease dataset):
  disease_symptoms.csv → columns: Disease, Symptom_1, Symptom_2, ..., Symptom_n
  disease_precaution.csv → columns: Disease, Precaution_1, ..., Precaution_4

Run:
  python train_model.py
"""

import os
import pickle
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
from sklearn.preprocessing import LabelEncoder


def load_and_prepare_dataset(csv_path: str) -> tuple:
    """
    Load symptom dataset and convert to binary feature matrix.

    Expected format:
      Disease, Symptom_1, Symptom_2, Symptom_3, ...
    """
    df = pd.read_csv(csv_path)

    # Normalize column names
    df.columns = [c.strip().lower() for c in df.columns]

    # Identify disease column
    if "disease" not in df.columns:
        raise ValueError("Dataset must have a 'Disease' column.")

    # Collect all unique symptoms across all symptom columns
    symptom_cols = [c for c in df.columns if c != "disease"]
    all_symptoms = set()
    for col in symptom_cols:
        df[col] = df[col].str.strip().str.lower().str.replace(" ", "_")
        all_symptoms.update(df[col].dropna().unique())

    all_symptoms.discard("")
    all_symptoms.discard("nan")
    all_symptoms = sorted(all_symptoms)

    print(f"[Trainer] Unique symptoms found: {len(all_symptoms)}")
    print(f"[Trainer] Unique diseases: {df['disease'].nunique()}")

    # Build binary feature matrix
    rows = []
    for _, row in df.iterrows():
        features = {s: 0 for s in all_symptoms}
        for col in symptom_cols:
            val = row.get(col)
            if pd.notna(val) and val.strip() and val.strip() != "nan":
                clean = val.strip().lower().replace(" ", "_")
                if clean in features:
                    features[clean] = 1
        rows.append(features)

    X = pd.DataFrame(rows, columns=all_symptoms)
    y = df["disease"].str.strip()

    return X, y, all_symptoms


def train_model(
    symptoms_csv: str = "disease_symptoms.csv",
    output_model: str = "model.pkl"
):
    """Train and save the Random Forest model."""

    if not os.path.exists(symptoms_csv):
        print(f"[Trainer] ERROR: '{symptoms_csv}' not found.")
        print("[Trainer] Please provide your symptom-disease CSV.")
        return

    print(f"\n[Trainer] Loading dataset: {symptoms_csv}")
    X, y, symptom_list = load_and_prepare_dataset(symptoms_csv)

    # Split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    print(f"[Trainer] Training on {len(X_train)} samples...")

    # Train Random Forest
    model = RandomForestClassifier(
        n_estimators=200,
        max_depth=None,
        min_samples_split=2,
        class_weight="balanced",    # handles class imbalance
        random_state=42,
        n_jobs=-1                    # use all CPU cores
    )
    model.fit(X_train, y_train)

    # Evaluate
    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"\n[Trainer] Test Accuracy: {acc * 100:.2f}%")
    print("\n[Trainer] Classification Report:")
    print(classification_report(y_test, y_pred))

    # Save model
    with open(output_model, "wb") as f:
        pickle.dump(model, f)

    print(f"\n[Trainer] ✅ Model saved to '{output_model}'")
    print(f"[Trainer] Feature columns: {len(symptom_list)}")


if __name__ == "__main__":
    train_model()
