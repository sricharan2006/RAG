from sentence_transformers import SentenceTransformer
#It allows us to run an embedding model locally.
from sklearn.metrics.pairwise import cosine_similarity


model = SentenceTransformer("BAAI/bge-base-en-v1.5")
#This is an pre trained model of sentence transformer 



def create_embeddings(texts):
    return model.encode(
        texts,
        normalize_embeddings=True
    )

if __name__ == "__main__":
    texts = [
        "The model uses self-attention.",
        "Attention allows tokens to interact with each other.",
        "The cat is sitting on the table."
    ]

    embeddings = create_embeddings(texts)

    # print("Number of embeddings:", len(embeddings))
    # print("Embedding dimensions:", len(embeddings[0]))

    # print("\nFirst embedding:")
    # print(embeddings[0])


    similarity = cosine_similarity(embeddings)

    print(similarity)