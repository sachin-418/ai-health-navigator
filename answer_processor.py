"""
ANSWER PROCESSING MODULE
Converts raw user answers into structured feature key-value pairs.
Handles numeric, choice, and boolean question types.
"""

from typing import Any, Dict, Optional, Tuple
import re


class AnswerProcessor:
    """
    Processes raw user answers and extracts derived features.
    """

    def process_answer(self, question: Dict[str, Any], raw_answer: str) -> Optional[Tuple[str, Any]]:
        """
        Given a question dict and a raw string answer, return a (feature_key, value) tuple.
        Returns None if the answer cannot be interpreted.
        """
        q_type = question.get("type")
        feature_map = question.get("feature_map", {})

        if q_type == "numeric":
            return self._process_numeric(raw_answer, feature_map)

        elif q_type == "choice":
            return self._process_choice(raw_answer, feature_map)

        elif q_type == "boolean":
            return self._process_boolean(raw_answer, feature_map)

        return None  # unknown type

    # ─────────────────────────────────────────────────────────────────────────
    # PRIVATE HELPERS
    # ─────────────────────────────────────────────────────────────────────────

    def _process_numeric(self, raw_answer: str, feature_map: Dict) -> Optional[Tuple[str, Any]]:
        """
        Extract a number from the answer string.
        Compare against threshold to produce a boolean feature.
        """
        numbers = re.findall(r"\d+(?:\.\d+)?", raw_answer)
        if not numbers:
            return None  # could not parse

        value = float(numbers[0])
        threshold = feature_map.get("threshold", 0)

        if value >= threshold:
            feat_key, feat_val = feature_map["high"]
        else:
            feat_key, feat_val = feature_map["low"]

        return (feat_key, feat_val)

    def _process_choice(self, raw_answer: str, feature_map: Dict) -> Optional[Tuple[str, Any]]:
        """
        Match the raw answer to one of the choice options (fuzzy, case-insensitive).
        """
        answer_lower = raw_answer.strip().lower()

        # Try exact match first
        for option_key, (feat_key, feat_val) in feature_map.items():
            if answer_lower == option_key.lower():
                return (feat_key, feat_val)

        # Try partial / substring match
        for option_key, (feat_key, feat_val) in feature_map.items():
            if answer_lower in option_key.lower() or option_key.lower() in answer_lower:
                return (feat_key, feat_val)

        return None  # no match

    def _process_boolean(self, raw_answer: str, feature_map: Dict) -> Optional[Tuple[str, Any]]:
        """
        Interpret yes/no answers. Handles various affirmative/negative phrasings.
        """
        answer_lower = raw_answer.strip().lower()
        yes_phrases = {"yes", "y", "yeah", "yep", "yup", "sure", "correct", "true", "1", "of course"}
        no_phrases = {"no", "n", "nope", "nah", "not", "false", "0", "never"}

        if answer_lower in yes_phrases or any(p in answer_lower for p in yes_phrases):
            return feature_map.get("yes")
        elif answer_lower in no_phrases or any(p in answer_lower for p in no_phrases):
            return feature_map.get("no")

        return None  # ambiguous answer

    def handle_unknown(self, question: Dict[str, Any]) -> Optional[Tuple[str, Any]]:
        """
        For unanswerable questions (user says 'not sure', 'don't know'),
        return a None-valued feature so the engine knows data is missing.
        """
        # Try to extract a sensible default feature key
        feature_map = question.get("feature_map", {})
        # Use the first available feature key
        for val in feature_map.values():
            if isinstance(val, tuple) and len(val) == 2:
                return (val[0], None)  # None = unknown
        return None
