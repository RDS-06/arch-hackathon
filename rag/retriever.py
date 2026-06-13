import chromadb
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("all-MiniLM-L6-v2")

client = chromadb.PersistentClient(path="chroma_db")
collection = client.get_collection("medical_docs")


def get_relevant_chunks(query, top_k=5):
    query_embedding = model.encode(query).tolist()

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=10,
        include=["documents", "distances"]
    )

    docs = results["documents"][0]
    distances = results["distances"][0]

    chunks = []

    for i, (doc, dist) in enumerate(zip(docs, distances)):
        chunks.append({
            "id": i,
            "text": doc.strip(),
            "score": round(dist, 4)
        })

    return chunks[:top_k]