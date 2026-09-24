from retriever import retrieve_chunks
from llm import generate_answer


def ask_question(question, top_k=10):

    # Retrieve relevant chunks
    results = retrieve_chunks(question, top_k=top_k)

    print("\n===== RETRIEVED CHUNKS =====\n")

    for i, result in enumerate(results, start=1):
        print(f"--- RESULT {i} ---")
        print("Source:", result["metadata"]["source"])
        print("Page:", result["metadata"]["page"])
        print("Section:", result["metadata"].get("section"))
        print("Distance:", result["distance"])
        print("Text:")
        print(result["document"])
        print()

    # Generate answer using retrieved chunks
    answer = generate_answer(question, results)

    return answer


if __name__ == "__main__":

    question = input("Ask a question: ")

    answer = ask_question(question)

    print("\nAnswer:")
    print(answer)