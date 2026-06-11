from pathlib import Path
from sentence_transformers import SentenceTransformer

BASE_DIR = Path(__file__).resolve().parent.parent
CHUNKS_DIR = BASE_DIR / "data" / "chunks"

model = SentenceTransformer("all-MiniLM-L6-v2")

chunk_files = list(CHUNKS_DIR.glob("*.txt"))

print(f"Found {len(chunk_files)} chunks")

for chunk_file in chunk_files:

    text = chunk_file.read_text(encoding="utf-8")

    embedding = model.encode(text)

    print(
        f"{chunk_file.name} -> "
        f"{len(embedding)} dimensions"
    )

print("Embedding generation complete!")