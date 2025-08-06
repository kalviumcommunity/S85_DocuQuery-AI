# 📄 DocuQuery AI – Ask Your PDFs Anything

## 🧠 Overview

**DocuQuery AI** is an AI-powered assistant designed to answer user queries from **insurance policy PDFs** — with the flexibility to support any document like HR manuals, legal contracts, product guides, and more.

Instead of manually reading through dense, jargon-heavy documents, users can upload a file and ask multiple questions. The system extracts the most relevant information and responds with accurate, structured answers using cutting-edge AI techniques such as **Prompt Engineering**, **Structured Output**, **Function Calling**, and **Retrieval-Augmented Generation (RAG)**.

---

## 🛠️ How It Works (High-Level)

1. **User uploads a PDF** document.
2. The system **extracts text**, splits it into manageable chunks, and **embeds** the chunks into a **vector database**.
3. When the user asks a question, relevant chunks are **retrieved**.
4. The retrieved context is passed along with the question to the **LLM**.
5. The model **generates structured answers** based strictly on the document content.

---

## 🧩 Key AI Concepts Used

### 1️⃣ Prompting

**System Prompt:**
```txt
You are an AI assistant that provides clear, concise, and accurate answers based solely on the content of a given document.
