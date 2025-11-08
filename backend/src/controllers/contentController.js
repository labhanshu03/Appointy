const Content = require('../models/Content');
const aiService = require('../services/aiService');
const embeddingService = require('../services/embeddingService');
const ragService = require('../services/ragService');

class ContentController {
  /**
   * Save a photo
   */
  async savePhoto(req, res) {
    try {
      const { imageData, imageType } = req.body;

      // Analyze image with Claude
      const aiAnalysis = await aiService.analyzeImage(imageData, imageType);

      const content = new Content({
        contentType: 'photo',
        title: aiAnalysis.title,
        description: aiAnalysis.description,
        tags: aiAnalysis.tags || [],
        photo: {
          imageData: imageData,
          category: aiAnalysis.category || 'other',
          extractedText: aiAnalysis.extractedText || null
        }
      });

      // Generate embedding for semantic search
      const searchableText = `${content.title} ${content.description} ${aiAnalysis.extractedText || ''} ${(aiAnalysis.tags || []).join(' ')}`;
      const { embedding, model } = await embeddingService.generateEmbedding(searchableText);
      content.embedding = embedding;
      content.embeddingModel = model;

      await content.save();

      res.status(201).json({
        success: true,
        message: 'Photo saved successfully',
        data: content
      });
    } catch (error) {
      console.error('Error saving photo:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to save photo',
        error: error.message
      });
    }
  }

  /**
   * Save selected text as document
   */
  async saveDocument(req, res) {
    try {
      const { content: textContent, sourceUrl, selectionContext } = req.body;

      // Analyze text with Claude
      const aiAnalysis = await aiService.analyzeText(textContent, 'document');

      const content = new Content({
        contentType: 'document',
        title: aiAnalysis.title,
        description: aiAnalysis.description,
        tags: aiAnalysis.tags || [],
        document: {
          content: textContent,
          sourceUrl: sourceUrl,
          selectionContext: selectionContext,
          wordCount: textContent.split(/\s+/).length
        }
      });

      // Generate embedding for semantic search
      const searchableText = `${content.title} ${content.description} ${textContent} ${(aiAnalysis.tags || []).join(' ')}`;
      const { embedding, model } = await embeddingService.generateEmbedding(searchableText);
      content.embedding = embedding;
      content.embeddingModel = model;

      await content.save();

      res.status(201).json({
        success: true,
        message: 'Document saved successfully',
        data: content
      });
    } catch (error) {
      console.error('Error saving document:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to save document',
        error: error.message
      });
    }
  }

  /**
   * Save a todo item
   */
  async saveTodo(req, res) {
    try {
      const { content: todoText } = req.body;

      // Use simple defaults (AI disabled for now)
      const title = todoText.length > 60 ? todoText.substring(0, 60) + '...' : todoText;
      const description = `Todo: ${todoText}`;

      const content = new Content({
        contentType: 'todo',
        title: title,
        description: description,
        tags: ['todo'],
        todo: {
          content: todoText,
          completed: false,
          priority: 'medium'
        }
      });

      // Generate embedding for semantic search
      const searchableText = `${content.title} ${content.description} ${todoText}`;
      const { embedding, model } = await embeddingService.generateEmbedding(searchableText);
      content.embedding = embedding;
      content.embeddingModel = model;

      await content.save();

      res.status(201).json({
        success: true,
        message: 'Todo saved successfully',
        data: content
      });
    } catch (error) {
      console.error('Error saving todo:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to save todo',
        error: error.message
      });
    }
  }

  /**
   * Save a product
   */
  async saveProduct(req, res) {
    try {
      const { pageContent, productUrl, imageUrl } = req.body;

      // Analyze product with Claude
      const aiAnalysis = await aiService.analyzeProduct(pageContent, productUrl);

      const content = new Content({
        contentType: 'product',
        title: aiAnalysis.title,
        description: aiAnalysis.description,
        tags: aiAnalysis.tags || [],
        product: {
          productName: aiAnalysis.productName,
          price: {
            amount: aiAnalysis.price,
            currency: aiAnalysis.currency || 'USD'
          },
          productUrl: productUrl,
          imageUrl: imageUrl,
          vendor: aiAnalysis.vendor
        }
      });

      // Generate embedding for semantic search
      const searchableText = `${content.title} ${content.description} ${aiAnalysis.productName} ${aiAnalysis.vendor || ''} ${(aiAnalysis.tags || []).join(' ')} ${pageContent}`;
      const { embedding, model } = await embeddingService.generateEmbedding(searchableText);
      content.embedding = embedding;
      content.embeddingModel = model;

      await content.save();

      res.status(201).json({
        success: true,
        message: 'Product saved successfully',
        data: content
      });
    } catch (error) {
      console.error('Error saving product:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to save product',
        error: error.message
      });
    }
  }

  /**
   * Save a bookmark with scroll position
   */
  async saveBookmark(req, res) {
    try {
      const { url, scrollPosition, pageTitle, favicon, metaDescription } = req.body;

      // Analyze webpage with Claude
      const aiAnalysis = await aiService.analyzeWebpage(pageTitle, metaDescription, url);

      const content = new Content({
        contentType: 'bookmark',
        title: aiAnalysis.title,
        description: aiAnalysis.description,
        tags: aiAnalysis.tags || [],
        bookmark: {
          url: url,
          scrollPosition: scrollPosition,
          pageTitle: pageTitle,
          favicon: favicon,
          metaDescription: metaDescription
        }
      });

      // Generate embedding for semantic search
      const searchableText = `${content.title} ${content.description} ${pageTitle} ${metaDescription || ''} ${url} ${(aiAnalysis.tags || []).join(' ')}`;
      const { embedding, model } = await embeddingService.generateEmbedding(searchableText);
      content.embedding = embedding;
      content.embeddingModel = model;

      await content.save();

      res.status(201).json({
        success: true,
        message: 'Bookmark saved successfully',
        data: content
      });
    } catch (error) {
      console.error('Error saving bookmark:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to save bookmark',
        error: error.message
      });
    }
  }

  /**
   * Save a YouTube video
   */
  async saveYouTube(req, res) {
    try {
      const { videoId, videoUrl, videoTitle, videoDescription, channelName, thumbnailUrl, duration } = req.body;

      // Analyze video with Claude
      const aiAnalysis = await aiService.analyzeYouTubeVideo(videoTitle, videoDescription, channelName);

      const content = new Content({
        contentType: 'youtube',
        title: aiAnalysis.title,
        description: aiAnalysis.description,
        tags: aiAnalysis.tags || [],
        youtube: {
          videoId: videoId,
          videoUrl: videoUrl,
          channelName: channelName,
          thumbnailUrl: thumbnailUrl,
          duration: duration
        }
      });

      // Generate embedding for semantic search
      const searchableText = `${content.title} ${content.description} ${videoTitle} ${videoDescription || ''} ${channelName} ${(aiAnalysis.tags || []).join(' ')}`;
      const { embedding, model } = await embeddingService.generateEmbedding(searchableText);
      content.embedding = embedding;
      content.embeddingModel = model;

      await content.save();

      res.status(201).json({
        success: true,
        message: 'YouTube video saved successfully',
        data: content
      });
    } catch (error) {
      console.error('Error saving YouTube video:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to save YouTube video',
        error: error.message
      });
    }
  }

  /**
   * Get all content with filtering and pagination
   */
  async getAllContent(req, res) {
    try {
      const {
        contentType,
        page = 1,
        limit = 20,
        sortBy = 'timestamp',
        sortOrder = 'desc',
        search
      } = req.query;

      const query = {};

      if (contentType) {
        query.contentType = contentType;
      }

      if (search) {
        query.$text = { $search: search };
      }

      const skip = (page - 1) * limit;
      const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

      const contents = await Content.find(query)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Content.countDocuments(query);

      res.status(200).json({
        success: true,
        data: contents,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error fetching content:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch content',
        error: error.message
      });
    }
  }

  /**
   * Get single content by ID
   */
  async getContentById(req, res) {
    try {
      const { id } = req.params;

      const content = await Content.findById(id);

      if (!content) {
        return res.status(404).json({
          success: false,
          message: 'Content not found'
        });
      }

      // Update access count and last accessed
      content.accessCount += 1;
      content.lastAccessed = new Date();
      await content.save();

      res.status(200).json({
        success: true,
        data: content
      });
    } catch (error) {
      console.error('Error fetching content:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch content',
        error: error.message
      });
    }
  }

  /**
   * Update content
   */
  async updateContent(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const content = await Content.findByIdAndUpdate(
        id,
        { $set: updates },
        { new: true, runValidators: true }
      );

      if (!content) {
        return res.status(404).json({
          success: false,
          message: 'Content not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Content updated successfully',
        data: content
      });
    } catch (error) {
      console.error('Error updating content:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update content',
        error: error.message
      });
    }
  }

  /**
   * Delete content
   */
  async deleteContent(req, res) {
    try {
      const { id } = req.params;

      const content = await Content.findByIdAndDelete(id);

      if (!content) {
        return res.status(404).json({
          success: false,
          message: 'Content not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Content deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting content:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete content',
        error: error.message
      });
    }
  }

  /**
   * Search content (for future embedding-based search)
   */
  async searchContent(req, res) {
    try {
      const { query } = req.body;

      // For now, use text search
      // Later, you can implement embedding-based search here
      const results = await Content.find(
        { $text: { $search: query } },
        { score: { $meta: 'textScore' } }
      ).sort({ score: { $meta: 'textScore' } });

      res.status(200).json({
        success: true,
        data: results,
        message: 'Note: Using text search. Implement embeddings for semantic search.'
      });
    } catch (error) {
      console.error('Error searching content:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to search content',
        error: error.message
      });
    }
  }

  /**
   * Semantic search using embeddings
   * Allows natural language queries like "articles about AI agents I saved last month"
   */
  async semanticSearch(req, res) {
    try {
      const { query, limit = 20, contentType, dateFilter } = req.body;

      console.log(`Semantic search query: "${query}"`);

      // Generate embedding for the search query
      const { embedding: queryEmbedding } = await embeddingService.generateEmbedding(query);

      // Build filter for content type and date if provided
      const filter = { embedding: { $exists: true, $ne: null } };

      if (contentType) {
        filter.contentType = contentType;
      }

      if (dateFilter) {
        const now = new Date();
        const pastDate = new Date();

        switch(dateFilter) {
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

      // Get all content with embeddings that match the filter
      const allContent = await Content.find(filter);

      console.log(`Found ${allContent.length} items with embeddings`);

      // Calculate similarity scores
      const results = allContent.map(content => {
        const similarity = embeddingService.cosineSimilarity(queryEmbedding, content.embedding);
        return {
          ...content.toObject(),
          similarity: similarity
        };
      });

      // Sort by similarity (highest first) and return top results
      results.sort((a, b) => b.similarity - a.similarity);
      const topResults = results.slice(0, limit);

      console.log(`Returning ${topResults.length} results. Top similarity: ${topResults[0]?.similarity?.toFixed(4)}`);

      res.status(200).json({
        success: true,
        data: topResults,
        message: `Found ${topResults.length} results using semantic search`,
        searchType: 'semantic'
      });
    } catch (error) {
      console.error('Error in semantic search:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to perform semantic search',
        error: error.message
      });
    }
  }

  /**
   * Answer a question using RAG (Retrieval Augmented Generation)
   * Example: "Who won the 2023 match?" - answers based on saved content
   */
  async answerQuestion(req, res) {
    try {
      const { question, contentType, dateFilter, limit } = req.body;

      if (!question || !question.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Question is required'
        });
      }

      console.log(`\n📨 Received Q&A request: "${question}"`);

      // Use RAG service to answer the question
      const result = await ragService.answerQuestion(question, {
        contentType,
        dateFilter,
        limit: limit || 5
      });

      res.status(200).json({
        success: true,
        data: {
          question: question,
          answer: result.answer,
          sources: result.sources,
          confidence: result.confidence
        },
        message: 'Question answered using your saved content'
      });
    } catch (error) {
      console.error('Error answering question:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to answer question',
        error: error.message
      });
    }
  }
}

module.exports = new ContentController();
