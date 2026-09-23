from retriever import retrieve_chunks
from llm import generate_answer


def ask_question(question, top_k=5):

    # Retrieve relevant chunks
    results = retrieve_chunks(question, top_k=top_k)

    # Generate answer using retrieved chunks
    answer = generate_answer(question, results)

    return answer


if __name__ == "__main__":

    question = input("Ask a question: ")

    answer = ask_question(question)

    print("\nAnswer:")
    print(answer)