import os
from dotenv import load_dotenv
from google import genai
from rag.retriever import get_relevant_chunks

load_dotenv()  # 🔥 loads .env file

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# 🔥 stable setup
PRIMARY_MODEL = "gemini-2.0-flash"
FALLBACK_MODEL = "gemini-flash-latest"


def build_prompt(context: str, question: str) -> str:
    return f"""
You are a medical question-answering system.

CRITICAL RULES (must follow):
- Answer ONLY using the provided context.
- Do NOT act like an AI system or assistant.
- Do NOT include meta commentary.
- Do NOT mention pipelines, telemetry, agents, or evaluation steps.
- Do NOT add fictional or system-like text.

If the answer is not in the context:
Return EXACTLY:
Not enough information in the provided documents.

OUTPUT FORMAT:
- Only medical facts
- Bullet points only
- No headings, no narration

CONTEXT:
{context}

QUESTION:
{question}

ANSWER:
"""


def call_gemini(prompt: str, model: str):
    return client.models.generate_content(
        model=model,
        contents=prompt,
    )


def safe_generate(prompt: str):
    models = [PRIMARY_MODEL, FALLBACK_MODEL]

    for model in models:
        for attempt in range(3):
            try:
                response = call_gemini(prompt, model)
                return response.text

            except Exception as e:
                err = str(e)

                # 🔁 retry on overload
                if "503" in err or "UNAVAILABLE" in err:
                    time.sleep(2)
                    continue

                # 🔁 fallback model switch
                if "not found" in err.lower():
                    break

                # ❌ other errors
                return f"Error generating response: {err}"

    return "Error: Gemini unavailable after retries."


def run_rag_pipeline(user_query: str) -> dict:

    # 1. retrieve
    chunks = get_relevant_chunks(user_query, top_k=5)

    # 2. clean weak chunks
    chunks = [c for c in chunks if len(c["text"].strip()) > 50]

    # 3. context formatting (better readability for LLM)
    context = "\n\n---\n\n".join(
        [f"[Source {c['id']}]\n{c['text']}" for c in chunks]
    )

    # 4. prompt
    prompt = build_prompt(context, user_query)

    # 5. safe Gemini call
    answer = safe_generate(prompt)

    return {
        "question": user_query,
        "answer": answer,
        "sources": chunks
    }