// API Service for communicating with the backend
const API_BASE_URL = 'http://localhost:5000/api';

class APIService {
  async savePhoto(imageData, imageType = 'image/jpeg') {
    try {
      const response = await fetch(`${API_BASE_URL}/content/photo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          imageData: imageData.split(',')[1], // Remove data URL prefix
          imageType
        })
      });

      return await response.json();
    } catch (error) {
      console.error('Error saving photo:', error);
      throw error;
    }
  }

  async saveDocument(content, sourceUrl, selectionContext) {
    try {
      const response = await fetch(`${API_BASE_URL}/content/document`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content,
          sourceUrl,
          selectionContext
        })
      });

      return await response.json();
    } catch (error) {
      console.error('Error saving document:', error);
      throw error;
    }
  }

  async saveTodo(content) {
    try {
      const response = await fetch(`${API_BASE_URL}/content/todo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content })
      });

      return await response.json();
    } catch (error) {
      console.error('Error saving todo:', error);
      throw error;
    }
  }

  async saveProduct(pageContent, productUrl, imageUrl) {
    try {
      const response = await fetch(`${API_BASE_URL}/content/product`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          pageContent,
          productUrl,
          imageUrl
        })
      });

      return await response.json();
    } catch (error) {
      console.error('Error saving product:', error);
      throw error;
    }
  }

  async saveBookmark(url, scrollPosition, pageTitle, favicon, metaDescription) {
    try {
      const response = await fetch(`${API_BASE_URL}/content/bookmark`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url,
          scrollPosition,
          pageTitle,
          favicon,
          metaDescription
        })
      });

      return await response.json();
    } catch (error) {
      console.error('Error saving bookmark:', error);
      throw error;
    }
  }

  async saveYouTube(videoData) {
    try {
      const response = await fetch(`${API_BASE_URL}/content/youtube`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(videoData)
      });

      return await response.json();
    } catch (error) {
      console.error('Error saving YouTube video:', error);
      throw error;
    }
  }

  async getAllContent(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`${API_BASE_URL}/content?${queryString}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching content:', error);
      throw error;
    }
  }

  async searchContent(query) {
    try {
      const response = await fetch(`${API_BASE_URL}/content/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query })
      });

      return await response.json();
    } catch (error) {
      console.error('Error searching content:', error);
      throw error;
    }
  }
}

// Export for use in other files
const apiService = new APIService();
