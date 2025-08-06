# 📄 DocuQuery AI – Ask Your PDFs Anything

## 🧠 Overview

**DocuQuery AI** is a smart, AI-powered assistant that answers user questions directly from **insurance policy PDFs**, and it’s built to be adaptable to **any type of document** — including HR manuals, legal contracts, and user guides.

By leveraging modern AI capabilities such as **Prompt Engineering**, **Structured Output**, **Function Calling**, and **Retrieval-Augmented Generation (RAG)**, the tool simplifies the process of understanding dense, jargon-heavy documents.

Users no longer need to read through entire policies — they can simply upload a PDF, ask questions, and receive clear, structured answers instantly.

---

## 🚀 Core Features

* 📄 **PDF Upload**: Accepts any public PDF document URL.
* ❓ **Multi-question Input**: Users can input several questions at once.
* 🔍 **Accurate Answers**: Uses retrieval + generation to ensure factual, document-based responses.
* 🧱 **JSON Output**: Clean, developer-friendly format.
* 📊 **Metadata & Summaries**: Access high-level document insights through function calling.

---

## 🔧 System Architecture

```
txt
PDF Upload ➔ Text Extraction ➔ Chunking ➔ Embedding ➔ Vector Store
                      ⬇
               Question from User
                      ⬇
              Relevant Chunks Retrieved
                      ⬇
           Passed to LLM with Prompts
                      ⬇
              Structured JSON Output
```

---

## 🧹 AI Concepts Implementation

### 1️⃣ Prompting

Prompts guide the model to focus only on the uploaded content.

* **System Prompt** (LLM Role):

  ```
  You are a helpful AI assistant. Answer questions only using the information from the provided document.
  Do not guess or add information not found in the text.
  ```

* **User Prompt** (Actual Query):

  ```
  What is the grace period for premium payment under this insurance policy?
  ```

✅ This ensures relevance, accuracy, and strict adherence to document content.

---

### 2️⃣ Structured Output

The model returns answers in a structured JSON format, ensuring consistency and ease of integration.

**Example Output:**

```json
[
  {
    "question": "What is the waiting period for cataract surgery?",
    "answer": "The waiting period is 24 months from the start of the policy."
  },
  {
    "question": "Is maternity covered under this policy?",
    "answer": "Yes, maternity is covered after a 9-month waiting period under Plan B and C."
  }
]
```

✅ This structured format helps with UI rendering, database storage, or API consumption.

---

### 3️⃣ Function Calling

Uses **OpenAI’s function calling** to perform utility operations on the PDF:

| Function Name          | Purpose                                                 |
| ---------------------- | ------------------------------------------------------- |
| `extract_metadata`     | Returns title, page count, size, and author of document |
| `summarize_section`    | Provides a TL;DR for a given section of the document    |
| `highlight_exclusions` | Lists exclusions, conditions, or legal clauses          |

**Example Function Definition:**

```json
{
  "name": "extract_metadata",
  "description": "Returns the title, number of pages, and author of the uploaded PDF."
}
```

✅ Function calling ensures modularity and better interaction with document features.

---

### 4️⃣ RAG – Retrieval-Augmented Generation

**RAG Workflow Steps:**

1. 📄 **Text Extraction**: The PDF is converted to raw text.
2. 🧩 **Chunking**: Text is split into meaningful, context-aware segments.
3. 🧠 **Embedding**: Each chunk is converted into vector embeddings using a model like `OpenAI`, `Cohere`, or `Sentence-BERT`.
4. 💃 **Vector Store**: Stored in a fast search index like `Pinecone`, `FAISS`, or `Weaviate`.
5. ❓ **Querying**: When a question is asked, the top-k most relevant chunks are retrieved.
6. 🧠 **Answer Generation**: LLM uses only those chunks to answer.

✅ This ensures that answers are **fact-based**, **context-aware**, and **non-hallucinatory**.

---

## 🧪 Sample Request & Response

**Input JSON:**

```json
{
  "document": "https://example.com/policy.pdf",
  "questions": [
    "What is the waiting period for pre-existing conditions?",
    "Are maternity expenses covered under Plan A?"
  ]
}
```

**Output JSON:**

```json
[
  {
    "question": "What is the waiting period for pre-existing conditions?",
    "answer": "48 months from the date of policy inception."
  },
  {
    "question": "Are maternity expenses covered under Plan A?",
    "answer": "No, maternity expenses are not covered under Plan A."
  }
]
```

---

## 📈 Evaluation Criteria

### ✔️ Correctness

* Answers are strictly derived from document content via **retrieval**.
* No hallucinations — only grounded and verifiable information.

### ⚡ Efficiency

* PDF parsing and chunking optimized for performance.
* Embeddings and retrieval done using scalable tools (e.g., FAISS, Pinecone).
* Uses fast API calls with streaming or batching support.

### 📊 Scalability

* Supports large PDFs through chunked vector storage.
* Handles concurrent requests through async processing.
* Easily deployable as a scalable microservice (Docker + FastAPI or Express backend).

---

## 🎯 Final Goal

By the end of this project, DocuQuery AI will provide:

* A fully functional frontend for PDF upload and question entry.
* Backend processing using RAG and function calling.
* Reliable, structured answers for any uploaded document.
* Tools to help users extract insights from complex policies — instantly and accurately.

---

## 📬 Contact

**🧑‍💻 Developer:** Madhav Garg
**📧 Email:** [madhav.garg.s85@kalvium.community](mailto:madhav.garg.s85@kalvium.community)
**🔗 Project Name:** DocuQuery AI

---
