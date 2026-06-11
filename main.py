from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware  # <-- ADD THIS IMPORT
from pydantic import BaseModel
from rag.retriever import get_relevant_chunks

app = FastAPI()

# ---- ADD CORS MIDDLEWARE CONFIGURATION HERE ----
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins, change to your frontend URL later
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)

class QueryRequest(BaseModel):
    question: str

@app.get("/")
def home():
    return {"message": "Healthcare RAG API is running"}

@app.post("/ask")
def ask(req: QueryRequest):
    question = req.question
    results = get_relevant_chunks(question)
    return {
        "question": question,
        "results": results
    }
