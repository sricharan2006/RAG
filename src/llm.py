import os
import re
import time
from dotenv import load_dotenv
from google import genai

load_dotenv()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)#Then the key is passed to Gemini's client so your program can communicate with the Gemini API.

MODEL_NAME = "gemini-3.5-flash-lite"

# This func is added in the later stages of testing to prevent the returning of SOURCE 1, SOURCE 2 words and replace it with actual sources.
def replace_citations(answer, retrieved_chunks):

    def replace_match(match):
        # Extract all source numbers from something like:
        # [SOURCE 1], [SOURCE 1, 2], [SOURCE 1, SOURCE 2]
        source_numbers = re.findall(
            r"\b\d+\b",
            match.group(0)
        )

        citations = []

        for number in source_numbers:

            index = int(number) - 1

            if 0 <= index < len(retrieved_chunks):

                result = retrieved_chunks[index]

                source = result["metadata"]["source"]
                page = result["metadata"]["page"]
                section = result["metadata"].get("section")

                if section and section.lower() != "unknown":
                    citation = f"[{source}, Page {page}, Section: {section}]"
                else:
                    citation = f"[{source}, Page {page}]"

                citations.append(citation)

        # Deduplicate citations within this marker while preserving order
        unique_citations = []
        seen = set()
        for c in citations:
            if c not in seen:
                seen.add(c)
                unique_citations.append(c)

        return " ".join(unique_citations)

    # Handles:
    # [SOURCE 1]
    # [SOURCE 1, 2]
    # [SOURCE 1, SOURCE 2]
    # [SOURCE 1, 2, 3]
    answer = re.sub(
        r"\[\s*SOURCE:?\s*\d+(?:[,\s;]+(?:SOURCE:?\s*)?\d+)*\s*\]",
        replace_match,
        answer,
        flags=re.IGNORECASE
    )

    # Collapse consecutive identical citations: [cit] [cit] -> [cit]
    answer = re.sub(r"(\[[^\]]+\])(?:\s*\1)+", r"\1", answer)
    answer = re.sub(r" +([.,;])", r"\1", answer)
    answer = re.sub(r" {2,}", " ", answer)

    return answer

def replace_comparison_citations(
    answer,
    chunks_a,
    chunks_b
):

    def replace_match(match):
        # Extract all marker components: letter (optional) and digits
        # Handles [SOURCE B10, B20], [SOURCE A2, A12], [SOURCE A1, B2], etc.
        tokens = re.findall(
            r"([AB])?\s*(\d+)",
            match.group(0),
            re.IGNORECASE
        )

        citations = []
        current_type = None

        for doc_type, num_str in tokens:
            if doc_type:
                current_type = doc_type.upper()

            if not current_type:
                continue

            chunks = chunks_a if current_type == "A" else chunks_b
            index = int(num_str) - 1

            if 0 <= index < len(chunks):

                result = chunks[index]

                source = result["metadata"]["source"]
                page = result["metadata"]["page"]
                section = result["metadata"].get("section")

                if section and section.lower() != "unknown":
                    citation = (
                        f"[{source}, Page {page}, "
                        f"Section: {section}]"
                    )
                else:
                    citation = (
                        f"[{source}, Page {page}]"
                    )

                citations.append(citation)
            else:
                # Out-of-bounds invalid ID: NEVER map to an incorrect source
                continue

        # Deduplicate citations within this marker while preserving order
        unique_citations = []
        seen = set()
        for c in citations:
            if c not in seen:
                seen.add(c)
                unique_citations.append(c)

        return " ".join(unique_citations)

    # Handles:
    # [SOURCE A1]
    # [SOURCE B10, B20]
    # [SOURCE A1, B2]
    # [SOURCE A1, SOURCE B2]
    answer = re.sub(
        r"\[\s*SOURCE:?\s*[AB]\d+(?:[,\s;]+(?:SOURCE:?\s*)?[AB]?\d+)*\s*\]",
        replace_match,
        answer,
        flags=re.IGNORECASE
    )

    # Collapse consecutive identical citations: [cit] [cit] -> [cit]
    answer = re.sub(r"(\[[^\]]+\])(?:\s*\1)+", r"\1", answer)
    answer = re.sub(r" +([.,;])", r"\1", answer)
    answer = re.sub(r" {2,}", " ", answer)

    return answer


def generate_answer(question, retrieved_chunks):
    context_parts = []

    for i, chunk in enumerate(retrieved_chunks, start=1):
        context_parts.append(
            f"""
SOURCE {i}
Source: {chunk['metadata']['source']}
Page: {chunk['metadata']['page']}
Section: {chunk['metadata'].get('section', 'Unknown')}

{chunk['document']}
"""
        )

    context = "\n".join(context_parts)

    prompt = f"""
You are a research paper assistant.

Answer the user's question using ONLY the information provided
in the retrieved context.

If the answer cannot be found in the context, say:
"I could not find the answer in the provided research papers."

Do not make up information.

If the user asks for a summary, summarize the important
ideas, methods, findings, and conclusions present in
the retrieved context.

If the retrieved context contains conflicting information, do not silently choose one value. 
Clearly mention the conflicting values and identify where each value appears.

Answer every part of the user's question, and ensure the response ends cleanly. Do not leave sentences, bullet points, or citations incomplete.

Avoid repeating the same technical detail across multiple sections when it can be explained clearly onces

Preserve the document's actual terminology and section metadata.

Citation instructions:
- Prefer one citation at the end of a paragraph containing related claims supported by the same source, instead of citing every sentence.
- These [SOURCE N] markers are internal citation markers. Do not write actual page numbers, section names, or filenames yourself. Use only the [SOURCE N] markers in your answer.
- Cite at the end of a sentence or a group of related claims rather than after every individual phrase or clause.
- Use one citation for a group of related claims when that citation clearly supports them.
- Avoid repeating citations unnecessarily. Do not chain multiple citations (e.g. [SOURCE 1][SOURCE 2][SOURCE 3]) when a single source is sufficient.
- Keep citations for distinct claims when different sources or pages are required.
- Return only the answer requested by the user. Do not add a separate source list unless requested.

For comparison questions involving multiple documents, use relevant
evidence from each document when available. Clearly distinguish
which information comes from which document before making the comparison.

Use section names only when they are explicitly present
in the retrieved context or metadata.

User question:
{question}

Retrieved context:
{context}

Answer clearly and concisely.
"""

    # response = client.models.generate_content(
    #     model=MODEL_NAME,
    #     contents=prompt
    # )#This sends the prompt to gemini to answer

    # for attempt in range(3):

    try:
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt
        )
        answer = response.text #This returns an object out of which we need the .text part

        # Replace SOURCE labels with actual page/section citations
        answer = replace_citations(
            answer,
            retrieved_chunks
        )

        return answer
    except Exception as e:
        print("Error:", e)
        raise

def compare_papers(chunks_a, chunks_b, comparison_focus):

    context_a = []

    for i, chunk in enumerate(chunks_a, start=1):

        context_a.append(
            f"""
SOURCE A{i}

Source: {chunk['metadata']['source']}
Page: {chunk['metadata']['page']}
Section: {chunk['metadata'].get('section', 'Unknown')}

{chunk['document']}
"""
        )

    context_a = "\n".join(context_a)

    context_b = []

    for i, chunk in enumerate(chunks_b, start=1):

        context_b.append(
            f"""
SOURCE B{i}

Source: {chunk['metadata']['source']}
Page: {chunk['metadata']['page']}
Section: {chunk['metadata'].get('section', 'Unknown')}

{chunk['document']}
"""
        )

    context_b = "\n".join(context_b)

    prompt = f"""
You are a research paper comparison assistant.

Compare the two provided documents based ONLY on the information
contained in their retrieved contexts.

Comparison focus:
{comparison_focus}

Do not make up information.

First determine whether the two documents contain enough
relevant information to perform the requested comparison.

If the documents are unrelated to the requested comparison focus,
clearly state that a meaningful comparison cannot be made.
Do not force similarities or differences.

If a meaningful comparison is possible, analyze:

1. Similarities
2. Differences
3. Important observations related to the requested focus

Only include information that is supported by the provided contexts.

Citation rules for comparison:
- For factual statements, indicate the supporting source using [SOURCE A1], [SOURCE A2] for Document A, and [SOURCE B1], [SOURCE B2] for Document B.
- SOURCE A refers to the first document. SOURCE B refers to the second document.
- These source markers are internal citation markers. Do not write actual page numbers, filenames, or section names yourself; they will be converted automatically into document citations.
- Cite at the end of a sentence or group of related claims rather than after every individual phrase or clause.
- Use one citation for a group of related claims when that citation clearly supports them. Avoid stacking three or more citations together when a single citation is sufficient.
- When making comparative claims, include supporting citations for both documents (e.g. [SOURCE A1] and [SOURCE B1]) so evidence from each document is clearly represented.
- Maintain citations for distinct claims, but do not repeat identical or unnecessary citations.

If information needed for the comparison is not present in either
document, explicitly state that it is not available in the provided
context.

For documents with different topics, do not repeatedly summarize each document to justify that they are unrelated. 
Briefly identify their different purposes using one citation per document, then assess whether the requested comparison criteria can be compared.
Compare shared high-level aspects only when supported by evidence. If the context lacks sufficient evidence, state which aspects cannot be compared. 
Avoid repeating the same citations across consecutive paragraphs.
When identifying each document's topic, use one relevant citation per document; do not add more citations unless they support a distinct claim


Document A:

{context_a}

Document B:

{context_b}

Provide a clear and concise comparison.
"""

    try:

        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt
        )

        answer = response.text

        # Replace temporary labels with actual document citations
        answer = replace_comparison_citations(
            answer,
            chunks_a,
            chunks_b
        )

        return answer

    except Exception as e:

        print("Error:", e)
        raise