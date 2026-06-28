from agents.retrieval import RetrievalAgent
from agents.risk_agent import RiskAgent
from rag.rag_pipeline import run_rag_pipeline
from agents.followup_agent import FollowUpAgent

class CoordinatorAgent:

    def __init__(self):
        self.retriever = RetrievalAgent()
        self.risk = RiskAgent()
        self.followup = FollowUpAgent()

    def run(self, query):

        followup = self.followup.run(query)

        if followup["needs_followup"]:
            return {
                "status": "followup",
                "questions": followup["questions"]
            }

        risk_result = self.risk.run(query)

        rag_result = run_rag_pipeline(query)

        return {
        "status": "completed",
        "question": query,
        "risk": risk_result["risk"],
        "answer": rag_result["answer"],
        "sources": rag_result["sources"]
        }