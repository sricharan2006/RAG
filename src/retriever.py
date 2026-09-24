import chromadb
import re
from embeddings import create_embeddings

client = chromadb.PersistentClient(path="chroma_db")
collection = client.get_collection(name="research_papers")


def retrieve_chunks(question, top_k=10):
    question_embedding = create_embeddings([question])[0]

    results = collection.query(
        query_embeddings=[question_embedding.tolist()],
        n_results=top_k,
        include=["documents", "metadatas", "distances"]
    )

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


if __name__ == "__main__":

    # Normal retrieval test
    question = input("Ask a question: ")

    results = retrieve_chunks(question)

    print("\nRetrieved chunks:")

    for i, result in enumerate(results, start=1):

        print("\n" + "=" * 60)
        print(f"Result {i}")
        print("Source:", result["metadata"].get("source"))
        print("Page:", result["metadata"].get("page"))
        print("Distance:", result["distance"])

        print("\nText:")
        print(result["document"])
