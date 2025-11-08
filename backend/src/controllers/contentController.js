const Content = require('../models/Content');
const aiService = require('../services/aiService');

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
}

module.exports = new ContentController();
