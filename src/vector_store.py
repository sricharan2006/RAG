import chromadb
import os 

from pdf_loader import load_pdf
from chunking import chunk_pages
from embeddings import create_embeddings


client = chromadb.PersistentClient(
    path="chroma_db"
)

collection = client.get_or_create_collection(
    name="research_papers",
    metadata={"hnsw:space": "cosine"}
)


def store_chunks(chunks, source):
    texts = [chunk["text"] for chunk in chunks]

    embeddings = create_embeddings(texts)

    ids = []
    metadatas = []

    for i, chunk in enumerate(chunks):
        ids.append(f"{source}_chunk_{i}")

        metadatas.append({
            "source": source,
            "page": chunk["page"],
            "section": chunk.get("section")
        })

    collection.upsert( #Here we are doing upsert instead of add bcz, upsert replaces or updates if the same ID is present, so running this file multiple times,
        #does not affect but adds litrelly adds it everytime leading to duplicates
        ids=ids,
        documents=texts,
        embeddings=embeddings.tolist(),
        metadatas=metadatas
    )

def process_pdf(file_path):

    source = os.path.basename(file_path)

    print(f"\nProcessing: {source}")

    pages = load_pdf(file_path)

    chunks = chunk_pages(pages)

    print(f"Pages: {len(pages)}")
    print(f"Chunks: {len(chunks)}")

    store_chunks(chunks, source)

    print(f"Stored: {source}")


if __name__ == "__main__":

    papers_folder = "data/papers"

    for filename in os.listdir(papers_folder):

        if filename.lower().endswith(".pdf"):

            file_path = os.path.join(
                papers_folder,
                filename
            )

            process_pdf(file_path)

    print("\nAll papers processed successfully.")