import time
import re
from rag.retriever import get_relevant_chunks

class RetrievalAgent:
    def _heal_text_structure(self, text: str) -> str:
        """
        Advanced text-healing algorithm to repair fragmented lines,
        fix sentence capitalization, and elegantly handle word truncation.
        """
        if not text:
            return ""

        # 1. Repair column hyphenation split-errors (e.g., "vaso-\ndilator" -> "vasodilator")
        text = re.sub(r'(\w+)-\s*\n\s*(\w+)', r'\1\2', text)

        # 2. Smash hard carriage breaks into standard single spaces
        text = re.sub(r'\r?\n', ' ', text)

        # 3. Squeeze double/triple consecutive spaces down to single spaces
        text = re.sub(r'\s+', ' ', text)

        # 🌟 STRIP FOOTNOTE ASTERISKS: Erases raw textbook footnote table coordinates (*, **, etc.)
        text = re.sub(r'\*+', '', text)

        # 4. Standardize old custom bullet text artifacts (e.g., raw "z z")
        text = re.sub(r'(?:\s|^)z\s+z\s+', ' • ', text)

        # 5. Sentence Capitalization Healer
        text = text.strip()
        if text:
            text = text[0].upper() + text[1:]

        def capitalize_sentence(match):
            return match.group(1) + match.group(2).upper()
        
        text = re.sub(r'([.!?]\s+)([a-z])', capitalize_sentence, text)

        # 6. Trailing Truncation Fixer: Handles string length constraints gracefully
        text = text.strip()
        if text and not text.endswith(('.', '!', '?', '"', ')', ']', '•', '...')):
            text += "..."

        return text.strip()

    def run(self, query: str) -> dict:
        """
        Searches ChromaDB, profiles execution latency, and sanitizes 
        raw chunk anomalies before returning inference blocks.
        """
        start_time = time.time()
        raw_chunks = get_relevant_chunks(query)
        end_time = time.time()
        
        latency_ms = round((end_time - start_time) * 1000)
        
        context_texts = []
        for chunk in raw_chunks:
            raw_text = ""
            if hasattr(chunk, 'page_content'):
                raw_text = chunk.page_content
            elif isinstance(chunk, dict) and 'text' in chunk:
                raw_text = chunk['text']
            elif isinstance(chunk, dict) and 'page_content' in chunk:
                raw_text = chunk['page_content']
            else:
                raw_text = str(chunk)
            
            sanitized_text = self._heal_text_structure(raw_text)
            if sanitized_text:
                context_texts.append(sanitized_text)
                
        return {
            "context_texts": context_texts,
            "context_block": "\n---\n".join(context_texts),
            "chunk_count": len(context_texts),
            "latency_ms": latency_ms if latency_ms > 0 else 1
        }