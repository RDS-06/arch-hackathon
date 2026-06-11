import chromadb
from sentence_transformers import SentenceTransformer

print("Loading embedding model...")
model = SentenceTransformer("all-MiniLM-L6-v2")

print("Connecting to ChromaDB...")
client = chromadb.PersistentClient(path="chroma_db")

collection = client.get_collection("medical_docs")

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