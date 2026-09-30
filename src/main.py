import os
from fastapi import FastAPI, UploadFile, File

from pydantic import BaseModel #This defines the structure of the data of how API expects.
from src.query import ask_question, summarize_paper, compare_two_papers
from src.vector_store import process_pdf, delete_pdf

app = FastAPI(
    title="Research Paper Assistant API",
    description="RAG-based API for research paper analysis",
    version="1.0.0"
)# This creates your actual FastAPI Application and give it name, role and its version.

# This defines what the request from the frontend should look like.
class QuestionRequest(BaseModel):
    question: str #Here we create this object and we mention the string feild as string to ask question.
    source: str | None = None

# This is the request model
class SummaryRequest(BaseModel):
    source: str

class ComparisonRequest(BaseModel):
    source_a: str
    source_b: str
    comparison_focus: str


@app.get("/")#When someone sends a GET request, then it will run the func below it.
def root():
    return {
        "message": "Research Paper Assistant API is running"
    }


@app.post("/ask") # The frontend can now send a question to this endpoint.
def ask(request: QuestionRequest):

    answer = ask_question(request.question, source = request.source)#This is where it connects to the backend, we are accessing the question feild from the object.

    return {
        "question": request.question,
        "source": request.source,
        "answer": answer
    }

@app.post("/summarize")
def summarize(request: SummaryRequest):

    summary = summarize_paper(request.source)

    return {
        "source": request.source,
        "summary": summary
    }

@app.post("/compare")
def compare(request: ComparisonRequest):

    comparison = compare_two_papers(
        request.source_a,
        request.source_b,
        request.comparison_focus
    )

    return {
        "source_a": request.source_a,
        "source_b": request.source_b,
        "comparison_focus": request.comparison_focus,
        "comparison": comparison
    }

@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):

    if not file.filename.lower().endswith(".pdf"):
        return {
            "error": "Only PDF files are supported."
        }

    papers_folder = "data/papers"

    os.makedirs(papers_folder, exist_ok=True)

    file_path = os.path.join(
        papers_folder,
        file.filename
    )

    contents = await file.read()

    with open(file_path, "wb") as f:
        f.write(contents)

    process_pdf(file_path)

    return {
        "message": "PDF uploaded and processed successfully.",
        "filename": file.filename
    }

# /ask uses a Pydantic model because it receives JSON, while /upload uses UploadFile = File(...) because it receives a file through multipart/form-data

@app.get("/papers")
def get_papers():

    papers_folder = "data/papers"

    if not os.path.exists(papers_folder):
        return {
            "papers": []
        }

    papers = []

    for filename in os.listdir(papers_folder):

        if filename.lower().endswith(".pdf"):
            papers.append(filename)

    return {
        "papers": papers
    }

@app.delete("/papers/{filename}")
def delete_paper(filename: str):

    papers_folder = "data/papers"
    file_path = os.path.join(papers_folder, filename)

    if not os.path.exists(file_path):
        return {
            "error": "Paper not found."
        }

    delete_pdf(filename)

    return {
        "message": "Paper deleted successfully.",
        "filename": filename
    }