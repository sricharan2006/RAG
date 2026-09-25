from retriever import retrieve_chunks, get_document_chunks
from llm import generate_answer, compare_papers, replace_comparison_citations


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

def compare_two_papers(source_a, source_b, comparison_focus):

    # Get all chunks from both papers
    chunks_a = get_document_chunks(source_a)
    chunks_b = get_document_chunks(source_b)

    # Generate comparison
    comparison = compare_papers(
        chunks_a,
        chunks_b,
        comparison_focus
    )

    # Convert SOURCE A/B markers into real citations
    comparison = replace_comparison_citations(
        comparison,
        chunks_a,
        chunks_b
    )

    return comparison


if __name__ == "__main__":

    choice = input(
        "Enter 1 for Question Answering, 2 for Paper Summary, 3 for comparing docs: "
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

    elif choice == "3":

        source_a = input("Enter first PDF name: ")
        source_b = input("Enter second PDF name: ")

        comparison_focus = input(
            "What do you want to compare? "
        )

        comparison = compare_two_papers(
            source_a,
            source_b,
            comparison_focus
        )

        print("\nComparison:")
        print(comparison)

    else:

        print("Invalid choice.")