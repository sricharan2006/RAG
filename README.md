# Research Paper Analyst

A Retrieval-Augmented Generation (RAG) application that helps users explore research papers by asking questions, generating summaries, and comparing multiple papers. It retrieves relevant information from uploaded PDFs and uses Google Gemini to generate context-aware responses.

## Features

* **PDF Upload:** Upload research papers in PDF format.
* **Paper Management:** View and manage uploaded papers.
* **Question Answering:** Ask questions about the content of research papers.
* **Source Citations:** Display relevant sources and page Iinformation where supported.
* **Paper Summarization:** Generate summaries of research papers.
* **Cross-Paper Comparison:** Compare information across multiple research papers.
* **Persistent Vector Storage:** Store document embeddings and metadata using ChromaDB.
* **Interactive Frontend:** Use a React-based interface to interact with the application.

> Feature availability depends on the current backend implementation and API responses.

## Tech Stack

### Frontend

* React
* JavaScript
* Vite
* HTML
* CSS

### Backend

* Python
* FastAPI
* Uvicorn
* PyMuPDF for PDF text extraction
* Sentence Transformers for text embeddings
* ChromaDB for vector storage and semantic retrieval
* Google Gemini API through `google-genai`
* `python-dotenv` for environment configuration

## How It Works

The application follows a Retrieval-Augmented Generation (RAG) workflow.

1. **Upload:** The user uploads a research paper in PDF format.
2. **Text Extraction:** PyMuPDF extracts text and page information from the PDF.
3. **Chunking:** The extracted text is divided into smaller chunks.
4. **Embedding Generation:** Sentence Transformers converts the chunks into vector embeddings.
5. **Vector Storage:** ChromaDB stores the embeddings, text chunks, and associated metadata.
6. **Retrieval:** When the user asks a question, the system retrieves relevant chunks from the vector database.
7. **Response Generation:** The retrieved context and user question are passed to Google Gemini.
8. **Display:** The frontend displays the generated response and available citation information.

## Project Structure

```text
RAG/
├── src/
│   ├── main.py
│   ├── pdf_loader.py
│   ├── chunking.py
│   ├── embeddings.py
│   ├── vector_store.py
│   ├── retriever.py
│   ├── llm.py
│   ├── query.py
│   └── checkdb.py
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── CitationsPanel.jsx
│   │   │   ├── ClearConfirmModal.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── MarkdownWithCitations.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── Toast.jsx
│   │   ├── views/
│   │   │   ├── AskView.jsx
│   │   │   ├── CompareView.jsx
│   │   │   └── SummaryView.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── utils/
│   │   │   ├── citationParser.js
│   │   │   └── sourceColors.js
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── package-lock.json
├── data/
│   └── papers/
├── chroma_db/
├── requirements.txt
├── .env
├── .gitignore
└── README.md
```

*This is a representative structure based on the project modules. Adjust it to match your actual repository. Local environment files and generated database files should not be committed.*

## Prerequisites

Install the following before running the project:

* Python 3.11 or another Python version supported by your dependencies
* Node.js and npm
* A Google Gemini API key
* Git

## Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/sricharan2006/RAG.git
cd RAG
```

### 2. Set Up the Backend

Create a virtual environment:

```bash
python -m venv venv
```

Activate it on Windows using Git Bash:

```bash
source venv/Scripts/activate
```

Alternatively, use Command Prompt:

```bat
venv\Scripts\activate
```

Install the Python dependencies:

```bash
python -m pip install -r requirements.txt
```

### 3. Configure Environment Variables

Create a `.env` file in the project root and add your Gemini API key:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

Replace the placeholder with your actual API key. Never commit the `.env` file or expose your API key publicly.

### 4. Start the Backend

From the project root, run:

```bash
python -m uvicorn src.main:app --reload --host 127.0.0.1 --port 8001
```

The backend should be available at:

* API base URL: `http://127.0.0.1:8001`
* Interactive API documentation: `http://127.0.0.1:8001/docs`

### 5. Set Up the Frontend

Open a second terminal:

```bash
cd frontend
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local URL printed by Vite in your terminal, commonly `http://localhost:5173`.

Ensure the frontend is configured to communicate with the backend running on port `8001`.

## API Endpoints

The following table describes the endpoints discussed during development. Confirm their paths, HTTP methods, and request formats in the current FastAPI application.

| Method   | Endpoint             | Purpose                              |
| -------- | -------------------- | ------------------------------------ |
| `POST`   | `/upload`            | Upload and process a research paper  |
| `GET`    | `/papers`            | Retrieve the uploaded paper list     |
| `POST`   | `/ask`               | Ask a question about research papers |
| `POST`   | `/summarize`         | Generate a paper summary             |
| `POST`   | `/compare`           | Compare research papers              |
| `DELETE` | `/papers/{filename}` | Delete a paper                       |

Use the interactive API documentation at `http://127.0.0.1:8001/docs` to inspect the available endpoints and test requests.

## Configuration and Storage

* **Environment variables:** Store API keys and configuration in `.env`.
* **Vector database:** ChromaDB can persist document embeddings and metadata locally.
* **Uploaded papers:** PDF files may be stored under `data/papers/`, depending on the current backend configuration.
* **Frontend dependencies:** Managed through `frontend/package.json` and `frontend/package-lock.json`.
* **Backend dependencies:** Listed in `requirements.txt`.

Back up important paper files and vector data if you need to preserve them. Avoid committing sensitive documents or generated database contents unless intended.

## Error Handling and Limitations

* Responses depend on the content extracted from the uploaded PDFs.
* Poorly scanned or image-only PDFs may require OCR support.
* Generated answers can contain errors, so verify important claims against the original paper.
* Citations are useful for locating evidence but should be checked against the actual source text.
* Upload limits, duplicate-file handling, and supported PDF features depend on the current implementation.
* A valid Gemini API key and network connectivity are required for Gemini-powered features.

## Future Improvements

Potential improvements include:

* Improved retrieval and reranking strategies
* Better citation validation and source highlighting
* Enhanced document processing and error reporting
* Evaluation of retrieval quality and answer accuracy
* Implementing authentication and user based access.

These are possible future enhancements, not claims about features already implemented.

## Security

* Never commit API keys or credentials.
* Keep `.env`, virtual environments, and generated files out of version control where appropriate.
* Review uploaded documents before sharing them with an external AI service.
* Do not rely solely on generated answers for critical academic or professional decisions.

## Note - API key required
This project uses the Google Gemini API. Each developer must obtain their own API key and configure it in a local .env file. API keys are not included in this repository.

## Author

**Sri Charan**

GitHub: [@sricharan2006](https://github.com/sricharan2006)
