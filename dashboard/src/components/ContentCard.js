import React from 'react';

const ContentCard = ({ content, onDelete, onToggleFavorite }) => {
  const renderContentSpecific = () => {
    switch (content.contentType) {
      case 'photo':
        return (
          <div className="content-details">
            <img
              src={`data:image/jpeg;base64,${content.photo.imageData}`}
              alt={content.title}
              style={{ maxWidth: '100%', borderRadius: '8px', marginBottom: '10px' }}
            />
            <span className="badge">{content.photo.category}</span>
            {content.photo.extractedText && (
              <p className="extracted-text">
                <strong>Extracted Text:</strong> {content.photo.extractedText.substring(0, 100)}...
              </p>
            )}
          </div>
        );

      case 'document':
        return (
          <div className="content-details">
            <p className="document-content">{content.document.content.substring(0, 200)}...</p>
            <p className="source-url">
              <strong>Source:</strong> <a href={content.document.sourceUrl} target="_blank" rel="noopener noreferrer">
                {new URL(content.document.sourceUrl).hostname}
              </a>
            </p>
            <span className="badge">Words: {content.document.wordCount}</span>
          </div>
        );

      case 'todo':
        return (
          <div className="content-details">
            <p className="todo-content">{content.todo.content}</p>
            <div className="todo-meta">
              <span className={`badge priority-${content.todo.priority}`}>
                {content.todo.priority}
              </span>
              <span className={`badge ${content.todo.completed ? 'completed' : 'pending'}`}>
                {content.todo.completed ? 'Completed' : 'Pending'}
              </span>
            </div>
          </div>
        );

      case 'product':
        return (
          <div className="content-details">
            {content.product.imageUrl && (
              <img
                src={content.product.imageUrl}
                alt={content.product.productName}
                style={{ maxWidth: '100%', borderRadius: '8px', marginBottom: '10px' }}
              />
            )}
            <p className="product-name"><strong>{content.product.productName}</strong></p>
            <p className="product-price">
              {content.product.price.currency} {content.product.price.amount}
            </p>
            <a
              href={content.product.productUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="product-link"
            >
              View Product
            </a>
          </div>
        );

      case 'bookmark':
        return (
          <div className="content-details">
            <p className="bookmark-url">
              <a href={content.bookmark.url} target="_blank" rel="noopener noreferrer">
                {content.bookmark.url}
              </a>
            </p>
            <p className="scroll-info">
              Scroll: {content.bookmark.scrollPosition.percentage.toFixed(1)}%
            </p>
          </div>
        );

      case 'youtube':
        return (
          <div className="content-details">
            <img
              src={content.youtube.thumbnailUrl}
              alt={content.title}
              style={{ width: '100%', borderRadius: '8px', marginBottom: '10px' }}
            />
            <p className="youtube-channel">
              <strong>Channel:</strong> {content.youtube.channelName}
            </p>
            <p className="youtube-duration">
              <strong>Duration:</strong> {content.youtube.duration}
            </p>
            <a
              href={content.youtube.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="youtube-link"
            >
              Watch Video
            </a>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="content-card">
      <div className="card-header">
        <div className="content-type-badge">{content.contentType}</div>
        <button
          className={`favorite-btn ${content.isFavorite ? 'active' : ''}`}
          onClick={() => onToggleFavorite(content._id, !content.isFavorite)}
        >
          {content.isFavorite ? '★' : '☆'}
        </button>
      </div>

      <h3 className="content-title">{content.title}</h3>
      <p className="content-description">{content.description}</p>

      {renderContentSpecific()}

      <div className="content-tags">
        {content.tags && content.tags.map((tag, index) => (
          <span key={index} className="tag">{tag}</span>
        ))}
      </div>

      <div className="card-footer">
        <span className="timestamp">
          {new Date(content.timestamp).toLocaleDateString()}
        </span>
        <button
          className="delete-btn"
          onClick={() => onDelete(content._id)}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default ContentCard;
