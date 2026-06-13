from rag.retriever import get_relevant_chunks

class RetrievalAgent:

    def run(self, query):
        chunks = get_relevant_chunks(query)

        return {
            "context": get_relevant_chunks(query)
        }