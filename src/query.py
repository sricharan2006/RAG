from src.retriever import retrieve_chunks, get_document_chunks
from src.llm import generate_answer, compare_papers, replace_comparison_citations


def ask_question(question, top_k=10, source=None):

    # Retrieve relevant chunks
    results = retrieve_chunks(question, top_k=top_k, source=source)

    print("\n--- RETRIEVED CHUNKS ---")
    for i, result in enumerate(results, start=1):
        print(f"\nChunk {i}")
        print("Metadata:", result["metadata"])
        print("Distance:", result["distance"])
        try:
            print("Text:", result["document"][:300])
        except UnicodeEncodeError:
            print("Text:", result["document"][:300].encode("ascii", "replace").decode("ascii"))

    # Generate answer using retrieved chunks
    answer = generate_answer(question, results)

    return answer


def summarize_paper(source):

    # Get all chunks from the selected paper
    chunks = get_document_chunks(source)

    # Generate summary using the complete paper
    summary = generate_answer(
        "When summarizing a document, identify its central purpose, main ideas, key evidence, and overall conclusions, where applicable. Adapt the summary to the document's actual content and structure rather than forcing a fixed set of categories. Include only the most relevant details and statistics. Avoid repetition and unnecessary explanations. Preserve the source's meaning and distinguish established facts from opinions, interpretations, and claims that the evidence does not fully support. Place citations close to the claims they support, use accurate source metadata, and avoid redundant citations. Do not invent information to fill gaps when a topic is absent or not addressed in the document.",
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