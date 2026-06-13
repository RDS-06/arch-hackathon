from agents.retrieval import RetrievalAgent
from agents.risk_agent import RiskAgent
from rag.rag_pipeline import run_rag_pipeline

class CoordinatorAgent:

    def __init__(self):
        self.retriever = RetrievalAgent()
        self.risk = RiskAgent()

    def run(self, query):

        risk_result = self.risk.run(query)

        rag_result = run_rag_pipeline(query)

        return {
            "question": query,
            "risk": risk_result["risk"],
            "answer": rag_result["answer"],
            "sources": rag_result["sources"]
        }