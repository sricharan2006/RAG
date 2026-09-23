import chromadb

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


if __name__ == "__main__":

    pdf_path = "data/papers/paper1.pdf"

    pages = load_pdf(pdf_path)

    chunks = chunk_pages(pages)

    print("Chunks:", len(chunks))

    store_chunks(
        chunks,
        source="paper1.pdf"
    )

    print("Chunks stored in ChromaDB.")