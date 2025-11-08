const mongoose = require('mongoose');

// Base schema for all content types
const contentSchema = new mongoose.Schema({
  // Common fields for all content types
  contentType: {
    type: String,
    enum: ['photo', 'document', 'todo', 'product', 'bookmark', 'youtube'],
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    index: 'text'
  },
  description: {
    type: String,
    required: true,
    index: 'text'
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },

  // For embedding-based search
  embedding: {
    type: [Number],
    default: null
  },
  embeddingModel: {
    type: String,
    default: null
  },

  // Photo-specific fields
  photo: {
    imageUrl: String,
    imageData: String, // Base64 or file path
    category: {
      type: String,
      enum: ['book', 'recipe', 'document', 'screenshot', 'other'],
      default: 'other'
    },
    width: Number,
    height: Number,
    extractedText: String // OCR text if available
  },

  // Document-specific fields (selected text)
  document: {
    content: String,
    sourceUrl: String,
    selectionContext: String, // Text around the selection
    wordCount: Number
  },

  // Todo-specific fields
  todo: {
    content: String,
    completed: {
      type: Boolean,
      default: false
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    dueDate: Date,
    tags: [String]
  },

  // Product-specific fields
  product: {
    productName: String,
    price: {
      amount: Number,
      currency: String
    },
    productUrl: String,
    sourceUrl: String,
    imageUrl: String,
    vendor: String,
    availability: String
  },

  // Bookmark-specific fields
  bookmark: {
    url: String,
    scrollPosition: {
      x: Number,
      y: Number,
      percentage: Number
    },
    pageTitle: String,
    favicon: String,
    metaDescription: String
  },

  // YouTube-specific fields
  youtube: {
    videoId: String,
    videoUrl: String,
    channelName: String,
    thumbnailUrl: String,
    duration: String,
    viewCount: Number,
    uploadDate: Date
  },

  // Metadata
  userId: {
    type: String,
    default: 'default_user' // For now, can add auth later
  },
  tags: [String],
  isFavorite: {
    type: Boolean,
    default: false
  },
  lastAccessed: Date,
  accessCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for better search performance
contentSchema.index({ title: 'text', description: 'text', tags: 'text' });
contentSchema.index({ contentType: 1, timestamp: -1 });
contentSchema.index({ userId: 1, contentType: 1 });

// Virtual for searchable text (for embedding generation)
contentSchema.virtual('searchableText').get(function() {
  let text = `${this.title} ${this.description}`;

  switch(this.contentType) {
    case 'photo':
      if (this.photo?.extractedText) text += ` ${this.photo.extractedText}`;
      break;
    case 'document':
      if (this.document?.content) text += ` ${this.document.content}`;
      break;
    case 'todo':
      if (this.todo?.content) text += ` ${this.todo.content}`;
      break;
    case 'product':
      if (this.product?.productName) text += ` ${this.product.productName}`;
      break;
    case 'bookmark':
      if (this.bookmark?.url) text += ` ${this.bookmark.url}`;
      break;
    case 'youtube':
      if (this.youtube?.channelName) text += ` ${this.youtube.channelName}`;
      break;
  }

  if (this.tags?.length) text += ` ${this.tags.join(' ')}`;

  return text;
});

// Ensure virtuals are included in JSON
contentSchema.set('toJSON', { virtuals: true });
contentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Content', contentSchema);
