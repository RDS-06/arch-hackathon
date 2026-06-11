from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

PROCESSED_DIR = BASE_DIR / "data" / "processed"
CHUNKS_DIR = BASE_DIR / "data" / "chunks"

CHUNKS_DIR.mkdir(exist_ok=True)

CHUNK_SIZE = 1000
OVERLAP = 200

total_chunks = 0

for txt_file in PROCESSED_DIR.glob("*.txt"):

    with open(txt_file, "r", encoding="utf-8") as f:
        text = f.read()

    start = 0
    chunk_num = 1

    while start < len(text):

        end = start + CHUNK_SIZE
        chunk = text[start:end]

        chunk_filename = (
            CHUNKS_DIR /
            f"{txt_file.stem}_chunk_{chunk_num}.txt"
        )

        with open(chunk_filename, "w", encoding="utf-8") as cf:
            cf.write(chunk)

        chunk_num += 1
        total_chunks += 1

        start += CHUNK_SIZE - OVERLAP

    print(f"{txt_file.name} -> {chunk_num-1} chunks")

print(f"\nTotal chunks created: {total_chunks}")