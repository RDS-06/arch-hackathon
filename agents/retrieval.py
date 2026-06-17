import time
import re
from rag.retriever import get_relevant_chunks

class RetrievalAgent:
    def _heal_text_structure(self, text: str) -> str:
        if not text:
            return ""

        # 1. Structural repairs and spacing optimizations
        text = re.sub(r'(\w+)-\s*\n\s*(\w+)', r'\1\2', text)
        text = re.sub(r'\r?\n', ' ', text)
        text = re.sub(r'\s+', ' ', text)
        text = re.sub(r'\*+', '', text)
        text = re.sub(r'(?:\s|^)z\s+z\s+', ' • ', text)

        # 2. Sentence Case Healing
        text = text.strip()
        if text:
            text = text[0].upper() + text[1:]

        def capitalize_sentence(match):
            return match.group(1) + match.group(2).upper()
        text = re.sub(r'([.!?]\s+)([a-z])', capitalize_sentence, text)

        # 3. 🌟 WORD-SAFE TRUNCATION FIX: Cuts strings at space boundaries rather than splitting words in half
        text = text.strip()
        if text and not text.endswith(('.', '!', '?', '"', ')', ']', '•', '...')):
            # If the text was truncated abruptly by length limits, roll back to the last complete word
            if len(text) > 10:
                space_index = text.rfind(' ')
                if space_index != -1:
                    text = text[:space_index]
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