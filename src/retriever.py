import chromadb
import re
from embeddings import create_embeddings

client = chromadb.PersistentClient(path="chroma_db")
collection = client.get_collection(name="research_papers")


def retrieve_chunks(question, top_k=10, source=None):
    question_embedding = create_embeddings([question])[0]

    # results = collection.query(
    #     query_embeddings=[question_embedding.tolist()],
    #     n_results=top_k,
    #     include=["documents", "metadatas", "distances"]
    # )

    query_args = {
        "query_embeddings": [question_embedding.tolist()],
        "n_results": top_k,
        "include": [
            "documents",
            "metadatas",
            "distances"
        ]
    }# you first create a dictionary containing the query settings, This is useful because you can add another option later like source.

    if source:
        query_args["where"] = {
            "source": source
    }
        
    results = collection.query(**query_args)
    # This is useful beacuse it searches a particular source when there is a source or else it will search the full pdfs chunks.

    documents = results["documents"][0]
    metadatas = results["metadatas"][0]
    distances = results["distances"][0]

    retrieved_results = []

    for i in range(len(documents)):
        retrieved_results.append({
            "document": documents[i],
            "metadata": metadatas[i],
            "distance": distances[i]
        })

    return retrieved_results

def get_document_chunks(source):

    results = collection.get(
        where={
            "source": source
        },
        include=[
            "documents",
            "metadatas"
        ]
    )

    documents = results["documents"]
    metadatas = results["metadatas"]

    chunks = []

    for i in range(len(documents)):

        chunks.append({
            "document": documents[i],
            "metadata": metadatas[i]
        })

    # Keep chunks in page order
    chunks.sort(
        key=lambda x: x["metadata"]["page"]
    )

    return chunks

if __name__ == "_main_":

    # Normal retrieval test
    question = input("Ask a question: ")

    results = retrieve_chunks(question, source="paper1.pdf")

    print("\nRetrieved chunks:")

    for i, result in enumerate(results, start=1):

        print("\n" + "=" * 60)
        print(f"Result {i}")
        print("Source:", result["metadata"].get("source"))
        print("Page:", result["metadata"].get("page"))
        print("Distance:", result["distance"])

        print("\nText:")
        print(result["document"])
   
