import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const contentAPI = {
  // Get all content with optional filters
  getAllContent: async (params = {}) => {
    const response = await api.get('/content', { params });
    return response.data;
  },

  // Get content by ID
  getContentById: async (id) => {
    const response = await api.get(`/content/${id}`);
    return response.data;
  },

  // Search content
  searchContent: async (query) => {
    const response = await api.post('/content/search', { query });
    return response.data;
  },

  // Update content
  updateContent: async (id, updates) => {
    const response = await api.put(`/content/${id}`, updates);
    return response.data;
  },

  // Delete content
  deleteContent: async (id) => {
    const response = await api.delete(`/content/${id}`);
    return response.data;
  }
};

export default api;
