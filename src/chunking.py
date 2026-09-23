import re


class ResearchPaperChunker:

    def __init__(self, chunk_size=1000, chunk_overlap=100):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

    def is_section_heading(self, line):
        """
        Detect common research-paper section headings.

        Examples:
        1 Introduction
        2 Related Work
        3 Model Architecture
        3.1 Encoder and Decoder Stacks
        Abstract
        Conclusion
        References
        """

        line = line.strip()

        if not line:
            return False

        # Common unnumbered research-paper sections
        common_sections = {
            "abstract",
            "introduction",
            "background",
            "related work",
            "methodology",
            "methods",
            "model",
            "experiments",
            "experimental setup",
            "results",
            "discussion",
            "conclusion",
            "future work",
            "acknowledgements",
            "acknowledgments",
            "references",
        }

        if line.lower() in common_sections:
            return True

        # Numbered sections:
        #
        # 1 Introduction
        # 2 Related Work
        # 3 Model Architecture
        # 3.1 Encoder and Decoder Stacks
        # 3.2 Attention
        #
        # Important:
        # Don't treat things such as
        # "2014 English-French dataset..."
        # or
        # "1.0 · 10^20"
        # as headings.

        pattern = r"^\d{1,2}(?:\.\d{1,2})*\s+[A-Za-z][A-Za-z0-9 ,:;()'\"/\-–]*$"

        if re.match(pattern, line):
            return True

        return False

    def clean_text(self, text):
        """
        Clean extracted PDF text without changing its meaning.
        """

        # Remove excessive whitespace
        text = re.sub(r"\s+", " ", text)

        # Fix words broken across lines/hyphenated extraction
        text = re.sub(r"(\w)-\s+(\w)", r"\1\2", text)

        return text.strip()

    def split_text(self, text):
        """
        Split long text into overlapping chunks.

        This is only a fallback for unusually long paragraphs.
        Normal paragraphs remain intact.
        """

        text = self.clean_text(text)

        if len(text) <= self.chunk_size:
            return [text]

        chunks = []

        start = 0

        while start < len(text):

            end = start + self.chunk_size

            # Try to end at a sentence boundary
            if end < len(text):
                sentence_end = text.rfind(". ", start, end)

                if sentence_end > start:
                    end = sentence_end + 1
                else:
                    # Otherwise try a word boundary
                    space = text.rfind(" ", start, end)

                    if space > start:
                        end = space

            chunk = text[start:end].strip()

            if chunk:
                chunks.append(chunk)

            # Move backwards slightly for overlap
            next_start = end - self.chunk_overlap

            if next_start <= start:
                next_start = end

            start = next_start

        return chunks

    def chunk_page(self, page_text, page_number, current_section):
        """
        Convert one page into paragraph/section-based chunks.
        """

        lines = page_text.splitlines()

        chunks = []
        current_paragraph = []

        section = current_section

        def save_paragraph():
            if not current_paragraph:
                return

            text = self.clean_text(" ".join(current_paragraph))

            if not text:
                return

            # Normally one paragraph = one chunk.
            # Only split if the paragraph is unusually large.
            split_chunks = self.split_text(text)

            for chunk_text in split_chunks:
                chunks.append({
                    "text": chunk_text,
                    "page": page_number,
                    "section": section
                })

        i = 0

        while i < len(lines):

            line = lines[i].strip()

            # Ignore empty lines
            if not line:
                save_paragraph()
                current_paragraph = []
                i += 1
                continue

            # Detect section heading
            if self.is_section_heading(line):

                # Save previous paragraph
                save_paragraph()
                current_paragraph = []

                # Update current section
                section = line

                i += 1
                continue

            # Normal text
            current_paragraph.append(line)

            i += 1

        # Save final paragraph on page
        save_paragraph()

        return chunks, section

    def chunk_document(
        self,
        document_id,
        document_name,
        source_file,
        pages_data
    ):
        """
        Chunk the complete research paper.

        pages_data format:

        [
            {
                "page": 1,
                "text": "..."
            },
            {
                "page": 2,
                "text": "..."
            }
        ]
        """

        all_chunks = []

        current_section = None
        chunk_number = 1

        for page_data in pages_data:

            page_number = page_data["page"]
            page_text = page_data["text"]

            page_chunks, current_section = self.chunk_page(
                page_text,
                page_number,
                current_section
            )

            for chunk in page_chunks:

                all_chunks.append({
                    "chunk_id": f"{document_id}-CH-{chunk_number:03d}",
                    "document_id": document_id,
                    "document_name": document_name,
                    "source_file": source_file,
                    "page": chunk["page"],
                    "section": chunk["section"],
                    "text": chunk["text"]
                })

                chunk_number += 1

        return all_chunks


# ---------------------------------------------------------
# Existing interface used by vector_store.py
# ---------------------------------------------------------

def chunk_pages(pages):
    """
    Compatibility function.

    Existing code can continue using:

        pages = load_pdf(file_path)
        chunks = chunk_pages(pages)
    """

    chunker = ResearchPaperChunker()

    return chunker.chunk_document(
        document_id="paper1",
        document_name="Research Paper",
        source_file="paper1.pdf",
        pages_data=pages
    )


# ---------------------------------------------------------
# Test
# ---------------------------------------------------------

if __name__ == "__main__":

    from pdf_loader import load_pdf

    file_path = "data/papers/paper1.pdf"

    pages = load_pdf(file_path)

    chunks = chunk_pages(pages)

    print("Number of pages:", len(pages))
    print("Number of chunks:", len(chunks))

    for chunk in chunks:

        print("\n" + "=" * 70)

        print("Chunk ID:", chunk["chunk_id"])
        print("Page:", chunk["page"])
        print("Section:", chunk["section"])

        print("-" * 70)

        print(chunk["text"])