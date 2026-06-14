import os
import chromadb
from sentence_transformers import SentenceTransformer

_MODEL_CACHE = None
_COLLECTION_CACHE = None

def _get_resources():
    global _MODEL_CACHE, _COLLECTION_CACHE
    if _MODEL_CACHE is None:
        _MODEL_CACHE = SentenceTransformer("all-MiniLM-L6-v2")
    if _COLLECTION_CACHE is None:
        base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
        db_path = os.path.join(base_dir, "chroma_db")
        client = chromadb.PersistentClient(path=db_path)
        _COLLECTION_CACHE = client.get_collection("medical_docs")
    return _MODEL_CACHE, _COLLECTION_CACHE

def get_relevant_chunks(query: str, top_k: int = 3) -> list:
    if not query.strip():
        return []
    model, collection = _get_resources()
    query_embedding = model.encode(query, convert_to_numpy=True).tolist()
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k
    )
    if not results or "documents" not in results or not results["documents"]:
        return []
    return results["documents"][0]