# 📄 DocuQuery AI – Ask Your PDFs Anything

### 🧠 **AI-Powered Document Understanding Assistant**

**DocuQuery AI** is an intelligent assistant that allows users to **ask questions directly from any PDF** — from **insurance policies** to **legal contracts**, **HR manuals**, or **technical guides**.

Powered by **Prompt Engineering**, **Structured Outputs**, **Function Calling**, and **Retrieval-Augmented Generation (RAG)**, DocuQuery AI transforms dense, jargon-heavy documents into simple, precise, and factual answers — instantly.

🔗 **Live Demo:** [https://docuqueryweb.netlify.app/](https://docuqueryweb.netlify.app/)

---

## 🚀 Features at a Glance

| Feature                       | Description                                                               |
| ----------------------------- | ------------------------------------------------------------------------- |
| 📄 **PDF Upload**             | Upload or provide a public URL of any PDF document.                       |
| ❓ **Multi-Question Support**  | Ask multiple questions at once for batch responses.                       |
| 🔍 **Context-Aware Answers**  | Retrieves relevant chunks from the document for precise, factual answers. |
| 🧱 **Structured JSON Output** | Clean, developer-friendly responses for easy API integration.             |
| 📊 **Metadata & Summaries**   | Extract insights and summaries from any document section.                 |

---

## 🏗️ System Architecture

```txt
PDF Upload
   ➜ Text Extraction
   ➜ Chunking
   ➜ Embedding
   ➜ Vector Store
         ⬇
      User Query
         ⬇
  Retrieve Relevant Chunks
         ⬇
   LLM + Prompts + RAG
         ⬇
 Structured JSON Output
```

---

## 🧠 Core AI Concepts

### 1️⃣ **Prompt Engineering**

Prompts ensure that the model **answers only using the uploaded document** — with no hallucinations.

**System Prompt:**

```text
You are a helpful AI assistant.
Answer questions only using information from the provided document.
Do not guess or add details not present in the text.
```

**User Prompt Example:**

```text
What is the grace period for premium payment under this insurance policy?
```

✅ *Ensures responses are relevant, factual, and document-based.*

---

### 2️⃣ **Structured Output**

Responses are returned in a consistent, structured **JSON format** — ideal for UI rendering or backend integration.

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

✅ *Makes the data easy to parse, visualize, or store.*

---

### 3️⃣ **Function Calling**

Uses **OpenAI’s function calling** to extract structured metadata, summaries, and exclusions directly from the PDF.

| Function               | Description                                     |
| ---------------------- | ----------------------------------------------- |
| `extract_metadata`     | Returns document title, author, and page count. |
| `summarize_section`    | Provides a summary of a selected section.       |
| `highlight_exclusions` | Extracts exclusions or special conditions.      |

**Example Function Schema:**

```json
{
  "name": "extract_metadata",
  "description": "Returns the title, number of pages, and author of the uploaded PDF."
}
```

✅ *Enhances modularity and simplifies interaction with document data.*

---

### 4️⃣ **Retrieval-Augmented Generation (RAG)**

**RAG Workflow:**

1. 📄 **Text Extraction** – Converts the uploaded PDF into plain text.
2. 🧩 **Chunking** – Splits text into context-aware sections.
3. 🧠 **Embedding** – Converts chunks into vector embeddings using models like OpenAI or Sentence-BERT.
4. 💾 **Vector Store** – Saves embeddings in a searchable database (FAISS, Pinecone, etc.).
5. ❓ **Querying** – Retrieves top relevant chunks for each user query.
6. 💬 **Answer Generation** – LLM uses retrieved context to generate precise, grounded answers.

✅ *Ensures that answers are always factual, context-rich, and free of hallucinations.*

---

## 🧪 Sample API Usage

**Input:**

```json
{
  "document": "https://example.com/policy.pdf",
  "questions": [
    "What is the waiting period for pre-existing conditions?",
    "Are maternity expenses covered under Plan A?"
  ]
}
```

**Output:**

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

## ⚙️ Tech Stack

| Component           | Technology                                     |
| ------------------- | ---------------------------------------------- |
| **Frontend**        | React.js + Tailwind CSS                        |
| **Backend**         | Node.js / Express                              |
| **AI Engine**       | OpenAI API (GPT-based LLM)                     |
| **Vector Database** | Pinecone / FAISS                               |
| **Storage**         | Cloud-hosted PDFs                              |
| **Deployment**      | Netlify (Frontend) + Render / Vercel (Backend) |

---

## 📈 Evaluation Metrics

| Metric             | Description                                                           |
| ------------------ | --------------------------------------------------------------------- |
| ✔️ **Correctness** | Ensures answers are derived only from retrieved text chunks.          |
| ⚡ **Efficiency**   | Optimized chunking and parallel embeddings for fast retrieval.        |
| 📊 **Scalability** | Supports large PDFs, concurrent queries, and asynchronous processing. |

✅ *Built for both performance and accuracy.*

---

## 🧭 Future Enhancements

* 🗂️ **Multi-file Querying** – Ask across multiple PDFs at once.
* 🗣️ **Voice-based Queries** – Interact with the assistant via speech.
* 🧾 **Citation Mode** – Show page numbers and text sources for each answer.
* 🔒 **Private Uploads** – Secure document handling with authentication.

---

## 💡 Project Vision

> “To make understanding complex documents effortless — one question at a time.”

**DocuQuery AI** aims to be a **universal document intelligence tool**, helping individuals and businesses extract clarity from dense, text-heavy PDFs — quickly, accurately, and interactively.

---

## 👨‍💻 Developer

**🧑‍💻 Name:** Madhav Garg
**📧 Email:** [madhav.garg.s85@kalvium.community](mailto:madhav.garg.s85@kalvium.community)
**🔗 Project:** DocuQuery AI
**🌐 Live Demo:** [https://docuqueryweb.netlify.app/](https://docuqueryweb.netlify.app/)
