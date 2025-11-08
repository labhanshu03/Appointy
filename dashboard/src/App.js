import React, { useState, useEffect } from 'react';
import ContentCard from './components/ContentCard';
import { contentAPI } from './services/api';
import './App.css';

function App() {
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    contentType: '',
    sortBy: 'timestamp',
    sortOrder: 'desc',
    search: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [useSemanticSearch, setUseSemanticSearch] = useState(true);
  const [useQA, setUseQA] = useState(false);
  const [dateFilter, setDateFilter] = useState('');
  const [qaAnswer, setQaAnswer] = useState(null);

  useEffect(() => {
    fetchContent();
  }, [filters]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const params = {};

      if (filters.contentType) params.contentType = filters.contentType;
      if (filters.sortBy) params.sortBy = filters.sortBy;
      if (filters.sortOrder) params.sortOrder = filters.sortOrder;

      const response = await contentAPI.getAllContent(params);

      if (response.success) {
        setContents(response.data);
      } else {
        setError('Failed to fetch content');
      }
    } catch (err) {
      setError('Error connecting to server. Make sure the backend is running.');
      console.error('Error fetching content:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchContent();
      setQaAnswer(null);
      return;
    }

    try {
      setLoading(true);
      setQaAnswer(null);

      let response;

      if (useQA) {
        // Use Q&A mode - get an answer based on saved content
        response = await contentAPI.askQuestion(searchQuery, {
          contentType: filters.contentType,
          dateFilter: dateFilter,
          limit: 5
        });

        if (response.success) {
          setQaAnswer(response.data);
          // Also show the source documents
          if (response.data.sources && response.data.sources.length > 0) {
            const sourceIds = response.data.sources.map(s => s.id);
            const allContent = await contentAPI.getAllContent();
            if (allContent.success) {
              const filteredContent = allContent.data.filter(c =>
                sourceIds.includes(c._id)
              );
              setContents(filteredContent);
            }
          } else {
            setContents([]);
          }
        } else {
          setError('Failed to answer question');
        }
      } else if (useSemanticSearch) {
        // Use semantic search with natural language understanding
        response = await contentAPI.semanticSearch(searchQuery, {
          contentType: filters.contentType,
          dateFilter: dateFilter,
          limit: 50
        });

        if (response.success) {
          setContents(response.data);
        } else {
          setError('Search failed');
        }
      } else {
        // Use traditional keyword search
        response = await contentAPI.searchContent(searchQuery);

        if (response.success) {
          setContents(response.data);
        } else {
          setError('Search failed');
        }
      }
    } catch (err) {
      setError('Error searching content');
      console.error('Error searching:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      const response = await contentAPI.deleteContent(id);

      if (response.success) {
        setContents(contents.filter(c => c._id !== id));
      } else {
        alert('Failed to delete content');
      }
    } catch (err) {
      alert('Error deleting content');
      console.error('Error deleting:', err);
    }
  };

  const handleToggleFavorite = async (id, isFavorite) => {
    try {
      const response = await contentAPI.updateContent(id, { isFavorite });

      if (response.success) {
        setContents(contents.map(c =>
          c._id === id ? { ...c, isFavorite } : c
        ));
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const stats = {
    total: contents.length,
    photos: contents.filter(c => c.contentType === 'photo').length,
    documents: contents.filter(c => c.contentType === 'document').length,
    todos: contents.filter(c => c.contentType === 'todo').length,
    products: contents.filter(c => c.contentType === 'product').length,
    bookmarks: contents.filter(c => c.contentType === 'bookmark').length,
    youtube: contents.filter(c => c.contentType === 'youtube').length
  };

  return (
    <div className="App">
      <header className="header">
        <h1>Content Saver Dashboard</h1>
        <p>Manage all your saved content in one place</p>
      </header>

      <div className="stats-bar">
        <div className="stat">
          <span className="stat-number">{stats.total}</span>
          <span className="stat-label">Total Items</span>
        </div>
        <div className="stat">
          <span className="stat-number">{stats.photos}</span>
          <span className="stat-label">Photos</span>
        </div>
        <div className="stat">
          <span className="stat-number">{stats.documents}</span>
          <span className="stat-label">Documents</span>
        </div>
        <div className="stat">
          <span className="stat-number">{stats.todos}</span>
          <span className="stat-label">Todos</span>
        </div>
        <div className="stat">
          <span className="stat-number">{stats.products}</span>
          <span className="stat-label">Products</span>
        </div>
        <div className="stat">
          <span className="stat-number">{stats.bookmarks}</span>
          <span className="stat-label">Bookmarks</span>
        </div>
        <div className="stat">
          <span className="stat-number">{stats.youtube}</span>
          <span className="stat-label">Videos</span>
        </div>
      </div>

      <div className="controls">
        <div className="search-section">
          <div className="search-bar">
            <input
              type="text"
              placeholder={useQA ? "Ask me anything... (e.g., 'Who won the 2023 match?')" : useSemanticSearch ? "Search naturally... (e.g., 'articles about AI I saved last month')" : "Search by keywords..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button onClick={handleSearch} className="search-button">
              {useQA ? '💬 Ask' : useSemanticSearch ? '🔍 AI Search' : '🔍 Search'}
            </button>
          </div>

          <div className="search-options">
            <label className="toggle-search">
              <input
                type="checkbox"
                checked={useSemanticSearch}
                onChange={(e) => {
                  setUseSemanticSearch(e.target.checked);
                  if (!e.target.checked) {
                    setUseQA(false);
                  }
                }}
              />
              <span>Semantic Search</span>
            </label>

            <label className="toggle-search">
              <input
                type="checkbox"
                checked={useQA}
                onChange={(e) => {
                  setUseQA(e.target.checked);
                  if (e.target.checked) {
                    setUseSemanticSearch(true);
                  }
                }}
              />
              <span>Q&A Mode (Get Answers)</span>
            </label>

            {(useSemanticSearch || useQA) && (
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="date-filter"
              >
                <option value="">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
            )}
          </div>
        </div>

        <div className="filters">
          <select
            value={filters.contentType}
            onChange={(e) => handleFilterChange('contentType', e.target.value)}
          >
            <option value="">All Types</option>
            <option value="photo">Photos</option>
            <option value="document">Documents</option>
            <option value="todo">Todos</option>
            <option value="product">Products</option>
            <option value="bookmark">Bookmarks</option>
            <option value="youtube">YouTube Videos</option>
          </select>

          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
          >
            <option value="timestamp">Date</option>
            <option value="title">Title</option>
            <option value="accessCount">Most Accessed</option>
          </select>

          <select
            value={filters.sortOrder}
            onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
      </div>

      {qaAnswer && (
        <div className="qa-answer-section">
          <div className="qa-answer-box">
            <div className="qa-header">
              <h3>💬 Answer</h3>
              <span className={`confidence-badge confidence-${qaAnswer.confidence}`}>
                {qaAnswer.confidence} confidence
              </span>
            </div>
            <div className="qa-question">
              <strong>Q:</strong> {qaAnswer.question}
            </div>
            <div className="qa-answer">
              <strong>A:</strong> {qaAnswer.answer}
            </div>
            {qaAnswer.sources && qaAnswer.sources.length > 0 && (
              <div className="qa-sources">
                <strong>📚 Sources ({qaAnswer.sources.length}):</strong>
                <ul>
                  {qaAnswer.sources.map((source, index) => (
                    <li key={source.id}>
                      <span className="source-title">{source.title}</span>
                      <span className="source-type">[{source.contentType}]</span>
                      <span className="source-similarity">
                        {(source.similarity * 100).toFixed(0)}% relevant
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      <main className="content-grid">
        {loading && <div className="loading">Loading...</div>}
        {error && <div className="error">{error}</div>}
        {!loading && !error && contents.length === 0 && (
          <div className="empty-state">
            <h2>No content yet</h2>
            <p>Start saving content using the browser extension!</p>
          </div>
        )}
        {!loading && !error && contents.map(content => (
          <ContentCard
            key={content._id}
            content={content}
            onDelete={handleDelete}
            onToggleFavorite={handleToggleFavorite}
          />
        ))}
      </main>
    </div>
  );
}

export default App;
