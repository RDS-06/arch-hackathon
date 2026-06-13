class RiskAgent:

    def run(self, query):

        high_risk_words = [
            "chest pain",
            "stroke",
            "unconscious",
            "difficulty breathing"
        ]

        for word in high_risk_words:
            if word in query.lower():
                return {
                    "risk": "HIGH"
                }

        return {
            "risk": "LOW"
        }