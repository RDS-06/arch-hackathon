import os
import json
from openai import OpenAI

class CalculatorAgent:
    def __init__(self):
        self.client = OpenAI(
            base_url="https://api.groq.com/openai/v1",
            api_key=os.getenv("GROQ_API_KEY")
        )

    def run(self, query: str) -> dict:
        """
        Analyzes the query to see if clinical metrics are present.
        Extracts values using LLM parsing, then executes precise Python arithmetic.
        """
        # Quick pre-filter check to prevent wasting cloud API calls if no numbers are present
        if not any(char.isdigit() for char in query):
            return {"requires_calculation": False}

        try:
            # 1. Use the LLM to extract unstructured numbers into standardized metrics
            response = self.client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                response_format={"type": "json_object"},
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You are a clinical data extraction tool. Analyze the user prompt for kidney function parameters. "
                            "Extract the values for age, weight in kg, serum creatinine in mg/dL, and gender. "
                            "If any parameter is missing, set its value to null. "
                            "Respond strictly with a JSON object following this exact structure:\n"
                            "{\n"
                            "  \"has_metrics\": true or false,\n"
                            "  \"age\": integer or null,\n"
                            "  \"weight_kg\": float or null,\n"
                            "  \"creatinine_mgdl\": float or null,\n"
                            "  \"gender\": \"male\" or \"female\" or null\n"
                            "}"
                        )
                    },
                    {"role": "user", "content": query}
                ],
                temperature=0.0
            )

            metrics = json.loads(response.choices[0].message.content)
            
            if not metrics.get("has_metrics") or not all([metrics.get("age"), metrics.get("weight_kg"), metrics.get("creatinine_mgdl")]):
                return {"requires_calculation": False}

            # 2. Extract parsed variables cleanly
            age = float(metrics["age"])
            weight = float(metrics["weight_kg"])
            creat = float(metrics["creatinine_mgdl"])
            gender = metrics.get("gender", "male") or "male"

            # 3. ⚡ EXECUTE PRECISE DETERMINISTIC PYTHON ARITHMETIC 
            # Cockcroft-Gault Equation: (140 - age) * weight / (72 * creatinine)
            crcl = ((140 - age) * weight) / (72 * creat)
            if gender.lower() == "female":
                crcl *= 0.85
                
            crcl = round(crcl, 2)

            # 4. Generate automated guideline safety warnings based on calculated thresholds
            clinical_warning = "Normal renal clearing parameters observed."
            contraindication_flag = False
            
            if crcl < 30:
                clinical_warning = "🚨 CRITICAL RENAL INSUFFICIENCY: Creatinine Clearance is below 30 mL/min. Metformin is contraindicated. ARNI and Spironolactone require immediate discontinuation or severe dose reduction."
                contraindication_flag = True
            elif crcl < 60:
                clinical_warning = "⚠️ MODERATE RENAL IMPAIRMENT: Creatinine Clearance is between 30-60 mL/min. Monitor electrolytes closely and adjust maintenance dosing thresholds down by 50%."

            return {
                "requires_calculation": True,
                "calculated_value": crcl,
                "unit": "mL/min",
                "extracted_parameters": {"age": age, "weight": weight, "creatinine": creat, "gender": gender},
                "clinical_warning": clinical_warning,
                "contraindication_flag": contraindication_flag
            }

        except Exception as e:
            return {"requires_calculation": False, "error": str(e)}