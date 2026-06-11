import chromadb
from sentence_transformers import SentenceTransformer

print("Loading embedding model...")
model = SentenceTransformer("all-MiniLM-L6-v2")

print("Connecting to ChromaDB...")
client = chromadb.PersistentClient(path="chroma_db")

collection = client.get_collection("medical_docs")

# 1. Keep your function right here so FastAPI can import it
def get_relevant_chunks(query, top_k=3):
    query_embedding = model.encode(query).tolist()

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k
    )

    chunks = results["documents"][0]
    return chunks

# 2. This block prevents the loop from hijacking FastAPI on import
if __name__ == "__main__":
    while True:
        query = input("\nAsk a medical question (or type exit): ")

        if query.lower() == "exit":
            break

        query_embedding = model.encode(query).tolist()

        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=3
        )

        print("\nTop Results:\n")

        for i, doc in enumerate(results["documents"][0], start=1):
            print(f"Result {i}:")
            print(doc[:500])  # first 500 chars
            print("-" * 50)
