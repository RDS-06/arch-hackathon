import os
import json
from openai import OpenAI

class ReportAgent:
    def __init__(self):
        # Re-use the existing Groq pipeline configurations
        self.client = OpenAI(
            base_url="https://api.groq.com/openai/v1",
            api_key=os.getenv("GROQ_API_KEY")
        )

    def run(self, query: str, answer: str, risk: str) -> dict:
        """
        Extracts unstructured medical text summaries into a strict, 
        machine-readable JSON schema for live dashboard data synchronization.
        """
        try:
            response = self.client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                response_format={"type": "json_object"}, # ⚡ Enforces strict JSON return type
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You are a clinical data extraction agent. Analyze the provided clinical case summary "
                            "and extract the key metrics into a valid JSON object. "
                            "The JSON object MUST strictly follow this keys schema:\n"
                            "{\n"
                            "  \"primary_condition\": \"Asthma\" or \"COPD\" or \"Heart Failure\" or \"Unknown\",\n"
                            "  \"risk_status\": \"HIGH\" or \"LOW\",\n"
                            "  \"vitals_critical_thresholds\": [\"list of strings for vital bounds to watch\"],\n"
                            "  \"recommended_medications\": [\"list of medications mentioned with dosages if available\"],\n"
                            "  \"differential_diagnoses\": [\"list of other conditions to rule out\"]\n"
                            "}"
                        )
                    },
                    {
                        "role": "user",
                        "content": f"Triage Risk Level: {risk}\nUser Question: {query}\nClinical Summary Text: {answer}"
                    }
                ],
                temperature=0.0
            )
            
            # Parse the raw string back into a Python Dictionary
            structured_data = json.loads(response.choices[0].message.content)
            return structured_data
            
        except Exception as e:
            # Safe operational fallback object if JSON decoding loops encounter parsing exceptions
            return {
                "primary_condition": "Unknown",
                "risk_status": risk,
                "vitals_critical_thresholds": ["Monitor standard vitals closely"],
                "recommended_medications": [],
                "differential_diagnoses": []
            }
        
    def analyze_medical_report(self, report_text: str) -> dict:

        response = self.client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        response_format={"type": "json_object"},
        messages=[
            {
                "role": "system",
                "content": f"""
You are a medical report analysis agent.

Analyze the uploaded medical report.

Return ONLY a valid JSON object with this schema:

{{
  "summary": "...",
  "abnormal_findings": [
    "...",
    "..."
  ],
  "possible_conditions": [
    "...",
    "..."
  ],
  "recommendations": [
    "...",
    "..."
  ],
  "follow_up_tests": [
    "...",
    "..."
  ],
  "emergency": "YES or NO"
}}
"""
            },
            {
                "role": "user",
                "content": report_text
            }
        ],
        temperature=0
        )

        return json.loads(response.choices[0].message.content)