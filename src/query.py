from retriever import retrieve_chunks, get_document_chunks
from llm import generate_answer


def ask_question(question, top_k=10):

    # Retrieve relevant chunks
    results = retrieve_chunks(question, top_k=top_k)

    # Generate answer using retrieved chunks
    answer = generate_answer(question, results)

    return answer


def summarize_paper(source):

    # Get all chunks from the selected paper
    chunks = get_document_chunks(source)

    # Generate summary using the complete paper
    summary = generate_answer(
        "Summarize this research paper, including its main problem, "
        "approach, key findings, and conclusion.",
        chunks
    )

    return summary


if __name__ == "__main__":

    choice = input(
        "Enter 1 for Question Answering or 2 for Paper Summary: "
    )

    if choice == "1":

        question = input("Ask a question: ")

        answer = ask_question(question)

        print("\nAnswer:")
        print(answer)

    elif choice == "2":

        source = input("Enter PDF name: ")

        summary = summarize_paper(source)

        print("\nSummary:")
        print(summary)

    else:

        print("Invalid choice.")