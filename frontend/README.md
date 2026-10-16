# PaperMind AI — Research Paper Analyst Frontend

A clean, modern, and responsive React frontend for the RAG-based Research Paper Analyst project.

Built with **React**, **Vite**, **Vanilla CSS Design Tokens**, **Lucide Icons**, and **React Markdown**.

---

## 🌟 Key Features

1. **Sidebar Paper Management**:
   - **Live Paper Library**: Lists all indexed papers (`GET /papers`).
   - **Drag & Drop PDF Uploader**: Uploads and triggers vector chunking & ChromaDB storage (`POST /upload`).
   - **Paper Deletion**: Deletes PDF file and its ChromaDB embeddings with confirmation modal (`DELETE /papers/{filename}`).
   - **Target Scope Selection**: Switch between Global RAG (querying across all documents) or single-paper focus.
   - **Fast Search Filter**: Real-time filtering for large paper collections.

2. **Q&A Assistant (`POST /ask`)**:
   - Natural language inquiries backed by vector chunk retrieval.
   - Structured markdown rendering with code blocks and bullet points.
   - Interactive inline citation pills jumping directly into the citation explorer.
   - Quick prompt suggestions for academic analysis.
   - Copy-to-clipboard action.

3. **Deep Document Summary (`POST /summarize`)**:
   - Comprehensive synthesis of problem statements, novel methodology, key findings, and conclusions.
   - Quick-summarize action directly from sidebar or summary workspace.
   - Markdown export and copy actions.

4. **Cross-Paper Comparison (`POST /compare`)**:
   - Compare two distinct research papers (Document A vs. Document B) with 1-click swap.
   - Customizable comparison focus (architecture, performance, compute, limitations).
   - Preset criteria shortcuts for rapid analysis.

5. **Sources & Citations Side Panel**:
   - Parses backend citation formats: `[filename.pdf, Page X, Section: Y]` and `[Page X]`.
   - Displays page number chips, section badges, source file tags, and occurrence counters.
   - Filter citations by paper for multi-document answers.
   - Highlight citation cards when clicked in answers.

6. **Backend Health Indicator**:
   - Real-time status indicator (`GET /`) showing API connectivity with one-click reconnect.

---

## 🚀 Running Locally

### 1. Start the FastAPI Backend (Port 8000)
From the project root:
```bash
.\venv\Scripts\python.exe -m uvicorn src.main:app --port 8000
```

### 2. Start the React Frontend (Port 3000)
From the `frontend/` directory:
```bash
cd frontend
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

> **Note on CORS**: The Vite dev server includes a built-in reverse proxy forwarding `/ask`, `/summarize`, `/compare`, `/upload`, and `/papers` directly to `http://127.0.0.1:8000`. This allows seamless operation without modifying any backend code.
