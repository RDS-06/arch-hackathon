import os
import time

from dotenv import load_dotenv
from google import genai

from rag.retriever import get_relevant_chunks

# Load .env
load_dotenv()

# Gemini Client
client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)

# Models
PRIMARY_MODEL = "gemini-2.0-flash"
FALLBACK_MODEL = "gemini-flash-latest"


def build_prompt(context: str, question: str) -> str:
    return f"""
You are a medical question-answering system.

CRITICAL RULES:
- Answer ONLY using the provided context.
- Do NOT act like an AI assistant.
- Do NOT mention pipelines, telemetry, agents, analysis, evaluation, or internal processing.
- Do NOT invent information.

If the answer is not present in the context, respond EXACTLY:
Not enough information in the provided documents.

OUTPUT FORMAT:
- Bullet points only
- Concise medical facts only
- No headings
- No narration

CONTEXT:
{context}

QUESTION:
{question}

ANSWER:
"""


def call_gemini(prompt: str, model: str):
    response = client.models.generate_content(
        model=model,
        contents=prompt,
    )

    return response.text


def safe_generate(prompt: str):

    models = [PRIMARY_MODEL, FALLBACK_MODEL]

    for model in models:

        for attempt in range(3):

            try:
                print(f"Trying model: {model}")

                answer = call_gemini(prompt, model)

                print("Gemini succeeded")

                return answer
                

            except Exception as e:

                err = str(e)

                # Quota exceeded
                if "429" in err or "RESOURCE_EXHAUSTED" in err:
                    return (
                        "Gemini API quota exceeded. "
                        "Please try again later."
                    )

                # Temporary overload
                if "503" in err or "UNAVAILABLE" in err:
                    print(
                        f"Model overloaded ({model}), "
                        f"retry {attempt + 1}/3..."
                    )
                    time.sleep(2)
                    continue

                # Model unavailable
                if "not found" in err.lower():
                    print(f"Switching from {model}...")
                    break

                return f"Error generating response: {err}"

    return "Error: Gemini unavailable after retries."


def run_rag_pipeline(user_query: str) -> dict:

    # Retrieve relevant chunks
    chunks = get_relevant_chunks(
        user_query,
        top_k=8
    )

    # Remove tiny chunks
    chunks = [
        c for c in chunks
        if len(c["text"].strip()) > 50
    ]

    # Build context
    context = "\n\n---\n\n".join(
        [
            f"[Source {c['id']}]\n{c['text']}"
            for c in chunks
        ]
    )

    # Build prompt
    prompt = build_prompt(
        context,
        user_query
    )

    # Generate answer
    answer = safe_generate(prompt)

    return {
        "question": user_query,
        "answer": answer,
        "sources": chunks
    }