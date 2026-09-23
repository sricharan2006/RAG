import fitz


def load_pdf(file_path):
    document = fitz.open(file_path)

    pages = []

    for page_number, page in enumerate(document):
        text = page.get_text()

        pages.append({
            "text": text,
            "page": page_number + 1
        })

    document.close()

    return pages


if __name__ == "__main__":
    pages = load_pdf("data/papers/paper1.pdf")

    print("Number of pages:", len(pages))

    for page in pages:
        print("\nPage:", page["page"])
        print(page["text"][:1000])