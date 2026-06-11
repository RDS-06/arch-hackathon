import fitz  # PyMuPDF
from pathlib import Path

# backend folder
BASE_DIR = Path(__file__).resolve().parent.parent

RAW_DIR = BASE_DIR / "data" / "raw"
PROCESSED_DIR = BASE_DIR / "data" / "processed"

PROCESSED_DIR.mkdir(exist_ok=True)

pdf_files = list(RAW_DIR.glob("*.pdf"))

print(f"Found {len(pdf_files)} PDF(s)\n")

for pdf_path in pdf_files:
    print(f"Processing: {pdf_path.name}")

    try:
        doc = fitz.open(pdf_path)

        text = ""

        for page in doc:
            text += page.get_text()

        output_file = PROCESSED_DIR / f"{pdf_path.stem}.txt"

        with open(output_file, "w", encoding="utf-8") as f:
            f.write(text)

        print(f"Saved: {output_file.name}")

    except Exception as e:
        print(f"Error processing {pdf_path.name}: {e}")

print("\nAll PDFs processed successfully!")