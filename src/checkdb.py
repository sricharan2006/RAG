import chromadb

client = chromadb.PersistentClient(path="chroma_db")
collection = client.get_collection("research_papers")

results = collection.get(
    where={"source": "research paper.pdf"},
    include=["documents", "metadatas"],
)

for document, metadata in zip(
    results["documents"], results["metadatas"]
):
    if metadata.get("page") in [5, 7, 8, 9]:
        print("Page:", metadata.get("page"))
        print("Section:", metadata.get("section"))
        try:
            print("Text:", document[:250])
        except UnicodeEncodeError:
            print("Text:", document[:250].encode("ascii", "replace").decode("ascii"))
        print("-" * 50)