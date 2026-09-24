import chromadb

client = chromadb.PersistentClient(path="chroma_db")
collection = client.get_collection("research_papers")

results = collection.get(
    include=["metadatas"]
)

sources = {}

for metadata in results["metadatas"]:
    source = metadata["source"]
    sources[source] = sources.get(source, 0) + 1

print("\nChunks by source:")
for source, count in sources.items():
    print(source, "->", count)