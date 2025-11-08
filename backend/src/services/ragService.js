const { GoogleGenerativeAI } = require('@google/generative-ai');
const embeddingService = require('./embeddingService');
const Content = require('../models/Content');

class RAGService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
  }

  /**
   * Answer a question using content from the database (RAG)
   */
  async answerQuestion(question, options = {}) {
    try {
      console.log(`\n🤔 Question: "${question}"`);

      // Step 1: Generate embedding for the question
      const { embedding: queryEmbedding } = await embeddingService.generateEmbedding(question);

      // Step 2: Find relevant content using semantic search
      const filter = { embedding: { $exists: true, $ne: null } };

      if (options.contentType) {
        filter.contentType = options.contentType;
      }

      if (options.dateFilter) {
        const now = new Date();
        const pastDate = new Date();

        switch(options.dateFilter) {
          case 'today':
            pastDate.setDate(now.getDate() - 1);
            break;
          case 'week':
            pastDate.setDate(now.getDate() - 7);
            break;
          case 'month':
            pastDate.setMonth(now.getMonth() - 1);
            break;
          case 'year':
            pastDate.setFullYear(now.getFullYear() - 1);
            break;
        }

        filter.timestamp = { $gte: pastDate };
      }

      const allContent = await Content.find(filter);
      console.log(`📚 Found ${allContent.length} items to search through`);

      // Calculate similarities
      const results = allContent.map(content => ({
        ...content.toObject(),
        similarity: embeddingService.cosineSimilarity(queryEmbedding, content.embedding)
      }));

      // Get top 5 most relevant items
      results.sort((a, b) => b.similarity - a.similarity);
      const topResults = results.slice(0, options.limit || 5);

      console.log(`🎯 Top ${topResults.length} relevant items found`);
      topResults.forEach((item, i) => {
        console.log(`  ${i + 1}. [${item.contentType}] ${item.title} (similarity: ${item.similarity.toFixed(4)})`);
      });

      if (topResults.length === 0) {
        return {
          answer: "I couldn't find any relevant content in your saved items to answer this question. Try saving some content related to this topic first!",
          sources: [],
          confidence: 'low'
        };
      }

      // Step 3: Build context from retrieved content
      const context = this.buildContext(topResults);

      // Step 4: Generate answer using Gemini
      const prompt = this.buildPrompt(question, context);
      const result = await this.model.generateContent(prompt);
      const answer = result.response.text();

      console.log(`✅ Answer generated successfully\n`);

      return {
        answer: answer,
        sources: topResults.map(item => ({
          id: item._id,
          title: item.title,
          contentType: item.contentType,
          similarity: item.similarity,
          timestamp: item.timestamp,
          url: item.bookmark?.url || item.product?.productUrl || item.youtube?.videoUrl
        })),
        confidence: topResults[0].similarity > 0.7 ? 'high' : topResults[0].similarity > 0.5 ? 'medium' : 'low'
      };

    } catch (error) {
      console.error('Error in RAG question answering:', error);
      throw error;
    }
  }

  /**
   * Build context string from retrieved content
   */
  buildContext(contentItems) {
    let context = '';

    contentItems.forEach((item, index) => {
      context += `\n--- Source ${index + 1}: ${item.title} (${item.contentType}) ---\n`;
      context += `Description: ${item.description}\n`;

      // Add specific content based on type
      switch (item.contentType) {
        case 'document':
          if (item.document?.content) {
            context += `Content: ${item.document.content.substring(0, 1000)}\n`;
          }
          break;

        case 'photo':
          if (item.photo?.extractedText) {
            context += `Extracted Text: ${item.photo.extractedText}\n`;
          }
          break;

        case 'product':
          if (item.product) {
            context += `Product: ${item.product.productName}\n`;
            if (item.product.price) {
              context += `Price: ${item.product.price.amount} ${item.product.price.currency}\n`;
            }
            if (item.product.vendor) {
              context += `Vendor: ${item.product.vendor}\n`;
            }
          }
          break;

        case 'youtube':
          if (item.youtube) {
            context += `Channel: ${item.youtube.channelName}\n`;
            context += `Duration: ${item.youtube.duration}\n`;
          }
          break;

        case 'bookmark':
          if (item.bookmark) {
            context += `URL: ${item.bookmark.url}\n`;
            if (item.bookmark.metaDescription) {
              context += `Meta: ${item.bookmark.metaDescription}\n`;
            }
          }
          break;

        case 'todo':
          if (item.todo) {
            context += `Todo: ${item.todo.content}\n`;
            context += `Priority: ${item.todo.priority}\n`;
          }
          break;
      }

      // Add tags
      if (item.tags && item.tags.length > 0) {
        context += `Tags: ${item.tags.join(', ')}\n`;
      }

      context += `Saved on: ${new Date(item.timestamp).toLocaleDateString()}\n`;
    });

    return context;
  }

  /**
   * Build prompt for Gemini
   */
  buildPrompt(question, context) {
    return `You are an intelligent assistant that answers questions based on the user's saved content.

USER'S SAVED CONTENT:
${context}

USER'S QUESTION:
${question}

INSTRUCTIONS:
1. Answer the question ONLY using information from the saved content provided above
2. If the content contains the answer, provide a clear and concise response
3. Cite which sources you used (e.g., "According to Source 1..." or "Based on the article about...")
4. If the saved content doesn't contain enough information to answer the question, clearly state that
5. Be conversational and natural in your response
6. If you're inferring or making assumptions, mention that clearly

ANSWER:`;
  }

  /**
   * Get a summary of all saved content on a topic
   */
  async summarizeTopic(topic, options = {}) {
    try {
      // Use the same retrieval mechanism
      const result = await this.answerQuestion(`Summarize everything I've saved about: ${topic}`, options);
      return result;
    } catch (error) {
      console.error('Error summarizing topic:', error);
      throw error;
    }
  }
}

module.exports = new RAGService();
