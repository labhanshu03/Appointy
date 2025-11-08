# Implementing Embedding-Based Search

This guide shows you how to add semantic search to your Content Saver extension using embeddings.

## What Are Embeddings?

Embeddings are vector representations of text that capture semantic meaning. They allow you to:
- Find similar content even if exact words don't match
- Search by concept rather than keywords
- Get more intelligent, context-aware results

## Current Database Schema

Your MongoDB schema already has embedding support:

```javascript
embedding: {
  type: [Number],
  default: null
},
embeddingModel: {
  type: String,
  default: null
}
```

## Implementation Options

### Option 1: Using Anthropic Claude (Recommended)

While Anthropic doesn't provide a dedicated embeddings endpoint, you can use Claude to generate semantic representations.

However, for production embeddings, consider:

### Option 2: Using OpenAI Embeddings (Best for Search)

1. Install OpenAI SDK:
```bash
npm install openai
```

2. Update `backend/src/services/embeddingService.js`:

```javascript
const OpenAI = require('openai');

class EmbeddingService {
  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async generateEmbedding(text) {
    try {
      const response = await this.client.embeddings.create({
        model: 'text-embedding-3-small', // Cheaper option
        // model: 'text-embedding-3-large', // Better quality
        input: text
      });

      return {
        embedding: response.data[0].embedding,
        model: 'text-embedding-3-small'
      };
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw error;
    }
  }

  // Calculate cosine similarity between two embeddings
  cosineSimilarity(a, b) {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }
}

module.exports = new EmbeddingService();
```

3. Update content controller to generate embeddings:

```javascript
// In contentController.js
const embeddingService = require('../services/embeddingService');

async savePhoto(req, res) {
  try {
    const { imageData, imageType } = req.body;
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

    // Generate embedding
    const searchableText = `${content.title} ${content.description} ${aiAnalysis.extractedText || ''}`;
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
```

4. Implement semantic search:

```javascript
async semanticSearch(req, res) {
  try {
    const { query, limit = 10 } = req.body;

    // Generate embedding for search query
    const { embedding: queryEmbedding } = await embeddingService.generateEmbedding(query);

    // Get all content with embeddings
    const allContent = await Content.find({ embedding: { $exists: true, $ne: null } });

    // Calculate similarity scores
    const results = allContent.map(content => ({
      ...content.toObject(),
      similarity: embeddingService.cosineSimilarity(queryEmbedding, content.embedding)
    }));

    // Sort by similarity and return top results
    results.sort((a, b) => b.similarity - a.similarity);
    const topResults = results.slice(0, limit);

    res.status(200).json({
      success: true,
      data: topResults,
      message: 'Semantic search results'
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
```

### Option 3: Using MongoDB Atlas Vector Search (Production-Ready)

MongoDB Atlas has built-in vector search capabilities:

1. **Enable Atlas Search** in your cluster

2. **Create a Search Index**:

```json
{
  "mappings": {
    "dynamic": true,
    "fields": {
      "embedding": {
        "type": "knnVector",
        "dimensions": 1536,
        "similarity": "cosine"
      }
    }
  }
}
```

3. **Use Atlas Vector Search**:

```javascript
async vectorSearch(req, res) {
  try {
    const { query, limit = 10 } = req.body;

    // Generate embedding for query
    const { embedding } = await embeddingService.generateEmbedding(query);

    // Use MongoDB Atlas vector search
    const results = await Content.aggregate([
      {
        $search: {
          knnBeta: {
            vector: embedding,
            path: 'embedding',
            k: limit
          }
        }
      },
      {
        $limit: limit
      }
    ]);

    res.status(200).json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Error in vector search:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform vector search',
      error: error.message
    });
  }
}
```

## Step-by-Step Implementation

### Step 1: Choose Your Provider

- **OpenAI**: Best embeddings, $0.00002 per 1K tokens
- **Cohere**: Good alternative, similar pricing
- **Sentence Transformers**: Free, self-hosted option

### Step 2: Update Environment Variables

```env
OPENAI_API_KEY=sk-your-openai-key-here
```

### Step 3: Create Embedding Service

Create `backend/src/services/embeddingService.js` (see code above)

### Step 4: Update All Save Methods

Add embedding generation to all content types:
- savePhoto
- saveDocument
- saveTodo
- saveProduct
- saveBookmark
- saveYouTube

### Step 5: Add Search Endpoint

```javascript
// In routes/contentRoutes.js
router.post('/semantic-search', contentController.semanticSearch);
```

### Step 6: Update Dashboard

Add semantic search to your React dashboard:

```javascript
const handleSemanticSearch = async () => {
  try {
    setLoading(true);
    const response = await fetch('http://localhost:5000/api/content/semantic-search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: searchQuery,
        limit: 20
      })
    });

    const data = await response.json();

    if (data.success) {
      setContents(data.data);
    }
  } catch (err) {
    setError('Semantic search failed');
  } finally {
    setLoading(false);
  }
};
```

## Performance Considerations

### Database Indexing

For basic similarity search (without Atlas), queries can be slow. Consider:

1. **Limit search scope**: Only search recent items
2. **Cache embeddings**: Don't regenerate unless content changes
3. **Use pagination**: Don't load all embeddings at once

### Costs

**OpenAI Embeddings** (text-embedding-3-small):
- $0.00002 per 1K tokens
- ~1000 embeddings = $0.02
- Very affordable for most use cases

### Storage

Each embedding is ~1536 numbers (floats):
- 1536 * 4 bytes = 6KB per embedding
- 10,000 items = ~60MB of embedding data

MongoDB can handle this easily.

## Migration Strategy

If you already have content without embeddings:

```javascript
// Create a migration script
async function migrateExistingContent() {
  const contents = await Content.find({ embedding: null });

  for (const content of contents) {
    const searchableText = content.searchableText; // Virtual field
    const { embedding, model } = await embeddingService.generateEmbedding(searchableText);

    content.embedding = embedding;
    content.embeddingModel = model;
    await content.save();

    console.log(`Migrated: ${content.title}`);
  }

  console.log('Migration complete!');
}
```

## Testing Semantic Search

Test queries that should work:

1. **Concept matching**:
   - Query: "cooking" → Should find "recipe" photos
   - Query: "learning" → Should find "book" photos

2. **Semantic similarity**:
   - Query: "things to buy" → Should find shopping-related todos
   - Query: "tutorial" → Should find educational videos

3. **Cross-language concepts**:
   - Query: "visual guide" → Should find infographic images

## Advanced Features

### Hybrid Search

Combine keyword search with semantic search:

```javascript
async hybridSearch(query) {
  // 1. Keyword search results
  const keywordResults = await Content.find({
    $text: { $search: query }
  }).limit(20);

  // 2. Semantic search results
  const semanticResults = await this.semanticSearch(query);

  // 3. Merge and re-rank
  const merged = this.mergeResults(keywordResults, semanticResults);

  return merged;
}
```

### Category-Specific Search

Search within specific content types:

```javascript
async searchPhotos(query) {
  return this.semanticSearch(query, { contentType: 'photo' });
}
```

### Similar Items Recommendation

"Find similar content" feature:

```javascript
async findSimilar(contentId, limit = 5) {
  const content = await Content.findById(contentId);

  // Find items with similar embeddings
  const allContent = await Content.find({
    _id: { $ne: contentId },
    embedding: { $exists: true }
  });

  const results = allContent.map(item => ({
    ...item.toObject(),
    similarity: this.cosineSimilarity(content.embedding, item.embedding)
  }));

  results.sort((a, b) => b.similarity - a.similarity);
  return results.slice(0, limit);
}
```

## Next Steps

1. Choose an embedding provider
2. Create the embedding service
3. Update save functions to generate embeddings
4. Implement semantic search endpoint
5. Update dashboard UI
6. Test thoroughly
7. Monitor costs and performance

---

**Embeddings will make your search incredibly powerful!** Users will be able to find content by meaning, not just keywords.
