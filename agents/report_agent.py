class ReportAgent:

    def run(self, query, answer, risk):

        return {
            "query": query,
            "risk": risk,
            "answer": answer
        }