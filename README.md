# 🏥 MediAssist AI – Agentic Healthcare RAG Assistant

An AI-powered healthcare question-answering system built using **Retrieval-Augmented Generation (RAG)**, **Multi-Agent Architecture**, **FastAPI**, **ChromaDB**, and **Google Gemini**.

---

## 🚀 Features

- 🧠 Agentic AI Architecture
- 📄 Medical PDF Knowledge Base
- 🔍 Semantic Search using ChromaDB
- 🤖 Gemini-powered Medical Responses
- ⚠️ Risk Assessment Agent
- 📋 Medical Report Generation
- 📚 Source-Grounded Answers
- ⚡ FastAPI Backend
- 💬 React Chat Interface
- 🔒 Secure API Key Management

---

## 🏗️ Architecture

```text
User Query
    │
    ▼
Coordinator Agent
    │
 ┌──┼─────────────┬───────────┐
 ▼  ▼             ▼           ▼

Retrieval      Risk       Report
 Agent         Agent      Agent

    │
    ▼
RAG Pipeline
    │
    ▼
ChromaDB
    │
    ▼
Gemini LLM
    │
    ▼
Final Response
```

---

## 🤖 Agents

### 🎯 Coordinator Agent
Manages workflow and coordinates all agents.

### 🔍 Retrieval Agent
Retrieves relevant medical information from the vector database.

### ⚠️ Risk Assessment Agent
Classifies medical queries into:

- LOW
- MEDIUM
- HIGH

based on detected symptoms.

### 📋 Report Agent
Generates structured healthcare reports.

### ✔️ Verification Agent
Validates retrieved information before response generation.

---

## 🧠 RAG Pipeline

### 1️⃣ PDF Loading
Medical PDFs are loaded from the knowledge base.

### 2️⃣ Chunking
Documents are split into semantic chunks.

### 3️⃣ Embeddings
Sentence Transformers generate vector embeddings.

### 4️⃣ Vector Storage
Embeddings are stored in ChromaDB.

### 5️⃣ Retrieval
Relevant chunks are retrieved based on user queries.

### 6️⃣ Response Generation
Gemini generates answers using retrieved context.

---

## 🛠️ Tech Stack

### Backend
- Python
- FastAPI
- ChromaDB
- Sentence Transformers
- Google Gemini API

### Frontend
- React
- Vite
- JavaScript

### AI & RAG
- Agentic AI
- Retrieval-Augmented Generation
- ChromaDB
- all-MiniLM-L6-v2
- Gemini 2.0 Flash

---

## 📂 Project Structure

```text
backend/
│
├── agents/
│   ├── coordinator.py
│   ├── retrieval.py
│   ├── risk_agent.py
│   ├── report_agent.py
│   ├── verification_agent.py
│   └── calculator_agent.py
│
├── rag/
│   ├── pdf_loader.py
│   ├── chunking.py
│   ├── embedder.py
│   ├── vectordb.py
│   ├── retriever.py
│   └── rag_pipeline.py
│
├── chroma_db/
├── data/
├── src/
├── public/
├── main.py
└── requirements.txt
```

---

## ⚙️ Installation

### Clone Repository

```bash
git clone <repo-url>
cd arch-hackathon
```

### Install Backend Dependencies

```bash
pip install -r requirements.txt
```

### Install Frontend Dependencies

```bash
npm install
```

### Create .env

```env
GEMINI_API_KEY=your_api_key_here
```

### Run Backend

```bash
uvicorn main:app --reload
```

### Run Frontend

```bash
npm run dev
```

---

## 📊 Example Query

**User:**

```text
I have chest pain and difficulty breathing
```

**Output:**

```json
{
  "risk": "HIGH",
  "answer": "...",
  "sources": [...]
}
```

---

## 🔮 Future Improvements

- PDF Export Reports
- Follow-up Question Agent
- Medical Image Analysis
- Doctor Recommendation System
- Voice Assistant Integration

---

## ⚠️ Disclaimer

This project is intended for educational and research purposes only. It does not replace professional medical advice, diagnosis, or treatment.
