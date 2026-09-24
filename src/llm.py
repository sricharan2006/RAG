import os
import re
import time
from dotenv import load_dotenv
from google import genai

load_dotenv()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)#Then the key is passed to Gemini's client so your program can communicate with the Gemini API.

MODEL_NAME = "gemini-3.5-flash"

# This func is added in the later stages of testing to prevent the returning of SOURCE 1, SOURCE 2 words and replace it with actual sources.
def replace_citations(answer, retrieved_chunks):

    def replace_match(match):
        # Extract all source numbers from something like:
        # [SOURCE 1, SOURCE 2, SOURCE 3]
        source_numbers = re.findall(
            r"SOURCE\s+(\d+)",
            match.group(0)
        )

        citations = []

        for number in source_numbers:

            index = int(number) - 1

            if 0 <= index < len(retrieved_chunks):

                result = retrieved_chunks[index]

                page = result["metadata"]["page"]
                section = result["metadata"].get("section")

                if section:
                    citation = f"[Page {page}, Section: {section}]"
                else:
                    citation = f"[Page {page}]"

                citations.append(citation)

        return " ".join(citations)

    # Handles:
    # [SOURCE 1]
    # [SOURCE 1, SOURCE 2]
    # [SOURCE 1, SOURCE 2, SOURCE 3]
    return re.sub(
        r"\[SOURCE\s+\d+(?:\s*,\s*SOURCE\s+\d+)*\]",
        replace_match,
        answer
    )


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

If the retrieved context contains conflicting information, do not silently choose one value. 
Clearly mention the conflicting values and identify where each value appears.

For every factual statement, indicate the supporting source
using [SOURCE 1], [SOURCE 2], etc.

These [SOURCE N] markers are internal citation markers.
Do not write actual page numbers, section names, or filenames yourself.
Use only the [SOURCE N] markers in your answer.
They will be automatically converted into the corresponding
document, page, and section citations after the answer is generated.

Use the smallest number of sources needed to support a statement.
If one source is sufficient, use only one source.
Do not repeat the same source unnecessarily.

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
        answer = response.text #This returns an object out of which we need the .text par

        # Replace SOURCE labels with actual page/section citations
        answer = replace_citations(
            answer,
            retrieved_chunks
        )

        return answer
    except Exception as e:
        print("Error:", e)
        raise