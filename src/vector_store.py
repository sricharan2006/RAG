import chromadb
import os 

from src.pdf_loader import load_pdf
from src.chunking import chunk_pages
from src.embeddings import create_embeddings


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
            "section": chunk.get("section") or "Unknown"
        })
    
    # Remove old chunks for this PDF first.
    collection.delete(
        where={"source": source}
    )

    # Store the newly generated chunks.
    if ids:
        collection.upsert(
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

def delete_pdf(source):
    # Delete all chunks belonging to this PDF from ChromaDB
    collection.delete(
        where={"source": source}
    )

    # Delete the actual PDF file
    papers_folder = "data/papers"
    file_path = os.path.join(papers_folder, source) #Constructs the file path for deletion. It also needs to know the location of the file present.

    if os.path.exists(file_path):
        os.remove(file_path)

    print(f"Deleted: {source}")


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