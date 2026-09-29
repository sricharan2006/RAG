from fastapi import FastAPI #This imports this class which acts as a web API using python.

app = FastAPI(
    title="Research Paper Assistant API",
    description="RAG-based API for research paper analysis",
    version="1.0.0"
)# This creates your actual FastAPI Application and give it name, role and its version.


@app.get("/")#When someone sends a GET request, then it will run the func below it.
def root():
    return {
        "message": "Research Paper Assistant API is running"
    }