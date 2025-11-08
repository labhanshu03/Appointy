const { GoogleGenerativeAI } = require('@google/generative-ai');

class AIService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Use gemini-2.5-flash for vision (image analysis) - supports both text and images
    this.visionModel = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    // Use gemini-2.5-flash for text analysis (fast and efficient)
    this.textModel = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  }

  /**
   * Extract JSON from response text (handles markdown code blocks)
   */
  extractJSON(responseText) {
    // Remove markdown code blocks if present
    const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/) || responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const jsonStr = jsonMatch[1] || jsonMatch[0];
      return JSON.parse(jsonStr.trim());
    }
    return JSON.parse(responseText);
  }

  /**
   * Analyze image and generate title, description, and category
   */
  async analyzeImage(imageData, imageType = 'image/jpeg') {
    try {
      const prompt = `Analyze this image and provide:
1. A concise title (max 60 characters)
2. A detailed description (2-3 sentences)
3. A category: choose ONE from: book, recipe, document, screenshot, other

Also, if there's any text visible in the image, extract it.

Respond in JSON format:
{
  "title": "...",
  "description": "...",
  "category": "...",
  "extractedText": "..."
}`;

      const imagePart = {
        inlineData: {
          data: imageData,
          mimeType: imageType
        }
      };

      const result = await this.visionModel.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text();

      return this.extractJSON(text);
    } catch (error) {
      console.error('Error analyzing image:', error);
      throw error;
    }
  }

  /**
   * Generate title and description for text content
   */
  async analyzeText(text, contentType) {
    try {
      let prompt = '';

      switch(contentType) {
        case 'document':
          prompt = `Analyze this selected text and provide:
1. A concise title that captures the main topic (max 60 characters)
2. A brief description summarizing the key points (2-3 sentences)
3. Suggested tags (3-5 relevant keywords)

Text: "${text}"

Respond in JSON format:
{
  "title": "...",
  "description": "...",
  "tags": ["tag1", "tag2", "tag3"]
}`;
          break;

        case 'todo':
          prompt = `Analyze this todo item and provide:
1. A clear, actionable title (max 60 characters)
2. A description with more context if needed (1-2 sentences)
3. Suggested priority (low, medium, high)
4. Suggested tags

Todo text: "${text}"

Respond in JSON format:
{
  "title": "...",
  "description": "...",
  "priority": "medium",
  "tags": ["tag1", "tag2"]
}`;
          break;

        default:
          prompt = `Analyze this text and create a title and description for it.

Text: "${text}"

Respond in JSON format:
{
  "title": "...",
  "description": "..."
}`;
      }

      const result = await this.textModel.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();

      return this.extractJSON(responseText);
    } catch (error) {
      console.error('Error analyzing text:', error);
      throw error;
    }
  }

  /**
   * Extract and analyze product information from page content
   */
  async analyzeProduct(pageContent, productUrl) {
    try {
      const prompt = `Extract product information from this webpage content:

${pageContent}

URL: ${productUrl}

Provide:
1. Product name/title
2. Description (2-3 sentences highlighting key features)
3. Price (if available)
4. Currency (if available)
5. Vendor/brand name
6. Suggested tags

Respond in JSON format:
{
  "title": "...",
  "description": "...",
  "productName": "...",
  "price": 0.00,
  "currency": "USD",
  "vendor": "...",
  "tags": ["tag1", "tag2"]
}`;

      const result = await this.textModel.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();

      return this.extractJSON(responseText);
    } catch (error) {
      console.error('Error analyzing product:', error);
      throw error;
    }
  }

  /**
   * Analyze YouTube video metadata
   */
  async analyzeYouTubeVideo(videoTitle, videoDescription, channelName) {
    try {
      const prompt = `Analyze this YouTube video and create a better title and description for saving:

Title: ${videoTitle}
Description: ${videoDescription}
Channel: ${channelName}

Provide:
1. A concise, searchable title (max 60 characters)
2. A brief, informative description (2-3 sentences)
3. Suggested tags for categorization

Respond in JSON format:
{
  "title": "...",
  "description": "...",
  "tags": ["tag1", "tag2", "tag3"]
}`;

      const result = await this.textModel.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();

      return this.extractJSON(responseText);
    } catch (error) {
      console.error('Error analyzing YouTube video:', error);
      throw error;
    }
  }

  /**
   * Analyze webpage for bookmark
   */
  async analyzeWebpage(pageTitle, metaDescription, url) {
    try {
      const prompt = `Analyze this webpage and create a title and description for bookmarking:

Page Title: ${pageTitle}
Meta Description: ${metaDescription || 'N/A'}
URL: ${url}

Provide:
1. A concise title (max 60 characters)
2. A useful description (2-3 sentences)
3. Suggested tags

Respond in JSON format:
{
  "title": "...",
  "description": "...",
  "tags": ["tag1", "tag2"]
}`;

      const result = await this.textModel.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();

      return this.extractJSON(responseText);
    } catch (error) {
      console.error('Error analyzing webpage:', error);
      throw error;
    }
  }
}

module.exports = new AIService();
