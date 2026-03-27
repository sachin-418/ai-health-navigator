"""
MAIN ENTRY POINT
Run the AI-Based Early Disease Detection System.

Usage:
  python main.py                  → Interactive CLI chatbot
  python main.py --demo           → Run built-in example demo
  python main.py --demo-emergency → Run emergency scenario demo
  python main.py --api-demo       → Run programmatic API demo
"""

import sys
import json
from inference_engine import InferenceEngine, run_interactive_session, run_programmatic_session


def demo_dengue_scenario():
    """
    Demo: Dengue-like symptoms.
    Simulates a full Q&A session automatically.
    """
    print("\n" + "━"*60)
    print("  DEMO: DENGUE SCENARIO")
    print("━"*60)

    engine = InferenceEngine()

    result = run_programmatic_session(
        symptoms=["fever", "headache", "vomiting", "joint_pain", "rash"],
        answers={
            "fever_duration": "4",              # 4 days → long_duration_fever = True
            "fever_severity": "high (> 102°F)", # → high_fever = True
            "headache_severity": "severe",       # → severe_headache = True
            "vomiting_frequency": "4",           # 4x/day → frequent_vomiting = True
            "rash_location": "body/trunk",       # → widespread_rash = True
            "rash_itching": "yes",               # → itchy_rash = True
            "joint_count": "many joints",        # → multiple_joint_pain = True
        },
        engine=engine
    )

    print("\n📋 DIAGNOSIS REPORT:")
    print(json.dumps(result, indent=2))
    return result


def demo_emergency_scenario():
    """
    Demo: Cardiac emergency scenario.
    Should trigger emergency alert.
    """
    print("\n" + "━"*60)
    print("  DEMO: EMERGENCY — CARDIAC SCENARIO")
    print("━"*60)

    engine = InferenceEngine()

    result = run_programmatic_session(
        symptoms=["chest_pain", "breathlessness", "fatigue"],
        answers={
            "chest_pain_type": "pressure/tightness",  # → crushing_chest_pain = True
            "chest_pain_radiation": "yes",             # → radiating_chest_pain = True
            "breath_severity": "yes",                  # → resting_breathlessness = True
            "fatigue_severity": "yes",                 # → severe_fatigue = True
        },
        engine=engine
    )

    print("\n📋 DIAGNOSIS REPORT:")
    print(json.dumps(result, indent=2))

    if result.get("is_emergency"):
        print(f"\n🚨 {result['emergency_alert']}")

    return result


def demo_cold_scenario():
    """
    Demo: Common cold / mild respiratory infection.
    Low severity, quick questions.
    """
    print("\n" + "━"*60)
    print("  DEMO: COMMON COLD SCENARIO")
    print("━"*60)

    engine = InferenceEngine()

    result = run_programmatic_session(
        symptoms=["cough", "fever", "fatigue"],
        answers={
            "cough_type": "dry",           # → dry_cough = True
            "cough_duration": "3",         # 3 days → persistent_cough = False
            "fever_duration": "1",         # 1 day → long_duration_fever = False
            "fever_severity": "mild (< 100°F)",  # → high_fever = False
            "fatigue_severity": "no",      # → severe_fatigue = False
        },
        engine=engine
    )

    print("\n📋 DIAGNOSIS REPORT:")
    print(json.dumps(result, indent=2))
    return result


if __name__ == "__main__":
    args = sys.argv[1:]

    if "--demo" in args:
        demo_dengue_scenario()

    elif "--demo-emergency" in args:
        demo_emergency_scenario()

    elif "--demo-cold" in args:
        demo_cold_scenario()

    elif "--demo-all" in args:
        demo_cold_scenario()
        print("\n" + "─"*60 + "\n")
        demo_dengue_scenario()
        print("\n" + "─"*60 + "\n")
        demo_emergency_scenario()

    else:
        # Default: interactive CLI chatbot
        run_interactive_session()
