from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

PROCESSED_DIR = BASE_DIR / "data" / "processed"
CHUNKS_DIR = BASE_DIR / "data" / "chunks"

CHUNKS_DIR.mkdir(exist_ok=True)

# Better settings for medical documents
CHUNK_SIZE = 800
OVERLAP = 150

total_chunks = 0


def chunk_text(text, chunk_size=CHUNK_SIZE, overlap=OVERLAP):
    chunks = []

    start = 0
    text_length = len(text)

    while start < text_length:

        end = start + chunk_size

        chunk = text[start:end].strip()

        # Skip tiny useless chunks
        if len(chunk) >= 100:
            chunks.append(chunk)

        start += chunk_size - overlap

    return chunks


for txt_file in PROCESSED_DIR.glob("*.txt"):

    with open(txt_file, "r", encoding="utf-8") as f:
        text = f.read()

    chunks = chunk_text(text)

    for i, chunk in enumerate(chunks, start=1):

        chunk_filename = (
            CHUNKS_DIR /
            f"{txt_file.stem}_chunk_{i}.txt"
        )

        with open(chunk_filename, "w", encoding="utf-8") as cf:
            cf.write(chunk)

        total_chunks += 1

    print(f"{txt_file.name} -> {len(chunks)} chunks")

print(f"\nTotal chunks created: {total_chunks}")