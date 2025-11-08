const { GoogleGenerativeAI } = require('@google/generative-ai');

class EmbeddingService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Use Gemini's text-embedding model
    this.embeddingModel = 'text-embedding-004';
  }

  /**
   * Generate embedding vector for text
   */
  async generateEmbedding(text) {
    try {
      const model = this.genAI.getGenerativeModel({ model: this.embeddingModel });

      const result = await model.embedContent(text);
      const embedding = result.embedding;

      return {
        embedding: embedding.values,
        model: this.embeddingModel
      };
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw error;
    }
  }

  /**
   * Calculate cosine similarity between two embedding vectors
   * Returns a value between -1 and 1 (1 = identical, 0 = unrelated, -1 = opposite)
   */
  cosineSimilarity(vectorA, vectorB) {
    if (!vectorA || !vectorB || vectorA.length !== vectorB.length) {
      return 0;
    }

    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;

    for (let i = 0; i < vectorA.length; i++) {
      dotProduct += vectorA[i] * vectorB[i];
      magnitudeA += vectorA[i] * vectorA[i];
      magnitudeB += vectorB[i] * vectorB[i];
    }

    magnitudeA = Math.sqrt(magnitudeA);
    magnitudeB = Math.sqrt(magnitudeB);

    if (magnitudeA === 0 || magnitudeB === 0) {
      return 0;
    }

    return dotProduct / (magnitudeA * magnitudeB);
  }

  /**
   * Find most similar content to a query
   */
  async findSimilar(queryEmbedding, contentEmbeddings, limit = 10) {
    const results = contentEmbeddings
      .map(item => ({
        ...item,
        similarity: this.cosineSimilarity(queryEmbedding, item.embedding)
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);

    return results;
  }
}

module.exports = new EmbeddingService();
