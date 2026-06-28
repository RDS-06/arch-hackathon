import fitz


def extract_text_from_pdf(pdf_path: str) -> str:
    """
    Extract text from an uploaded PDF.
    """

    doc = fitz.open(pdf_path)

    text = ""

    for page in doc:
        text += page.get_text()

    doc.close()

    return text.strip()