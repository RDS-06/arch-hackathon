from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from agents.coordinator import CoordinatorAgent
from rag.rag_pipeline import run_rag_pipeline

app = FastAPI(
    title="Healthcare RAG API",
    version="1.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request schema
class QueryRequest(BaseModel):
    question: str


@app.get("/")
def home():
    return {"message": "Healthcare RAG API running 🚀"}


@app.post("/ask")
def ask(req: QueryRequest):
    question = req.question.strip()

    if not question:
        return {"error": "Question cannot be empty"}

    try:
        
        coordinator = CoordinatorAgent()

        result = coordinator.run(question)

        return {
            "question": question,
            "answer": result["answer"],
            "sources": result.get("sources", [])
        }

    except Exception as e:
        return {
            "error": str(e)
        }