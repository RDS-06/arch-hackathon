from pathlib import Path
import chromadb
from sentence_transformers import SentenceTransformer

BASE_DIR = Path(__file__).resolve().parent.parent
CHUNKS_DIR = BASE_DIR / "data" / "chunks"

print("Loading embedding model...")
model = SentenceTransformer("all-MiniLM-L6-v2")

print("Starting ChromaDB...")
client = chromadb.PersistentClient(path="chroma_db")

collection = client.get_or_create_collection(
    name="medical_docs"
)

chunk_files = list(CHUNKS_DIR.glob("*.txt"))

print(f"Found {len(chunk_files)} chunks")

for i, chunk_file in enumerate(chunk_files):

    text = chunk_file.read_text(
        encoding="utf-8",
        errors="ignore"
    )

    embedding = model.encode(text).tolist()

    collection.add(
        ids=[str(i)],
        documents=[text],
        embeddings=[embedding]
    )

print(f"Stored {len(chunk_files)} chunks!")