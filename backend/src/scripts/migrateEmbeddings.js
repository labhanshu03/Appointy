const mongoose = require('mongoose');
const Content = require('../models/Content');
const embeddingService = require('../services/embeddingService');
require('dotenv').config();

async function migrateEmbeddings() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB Connected');

    // Find all content without embeddings
    const contentsWithoutEmbeddings = await Content.find({
      $or: [
        { embedding: null },
        { embedding: { $exists: false } }
      ]
    });

    console.log(`Found ${contentsWithoutEmbeddings.length} items without embeddings`);

    if (contentsWithoutEmbeddings.length === 0) {
      console.log('All content already has embeddings!');
      process.exit(0);
    }

    let successCount = 0;
    let errorCount = 0;

    // Process each content item
    for (let i = 0; i < contentsWithoutEmbeddings.length; i++) {
      const content = contentsWithoutEmbeddings[i];

      try {
        console.log(`\nProcessing ${i + 1}/${contentsWithoutEmbeddings.length}: ${content.contentType} - "${content.title}"`);

        // Build searchable text based on content type
        let searchableText = `${content.title} ${content.description}`;

        switch (content.contentType) {
          case 'photo':
            if (content.photo?.extractedText) {
              searchableText += ` ${content.photo.extractedText}`;
            }
            break;

          case 'document':
            if (content.document?.content) {
              searchableText += ` ${content.document.content}`;
            }
            break;

          case 'todo':
            if (content.todo?.content) {
              searchableText += ` ${content.todo.content}`;
            }
            break;

          case 'product':
            if (content.product?.productName) {
              searchableText += ` ${content.product.productName}`;
            }
            if (content.product?.vendor) {
              searchableText += ` ${content.product.vendor}`;
            }
            break;

          case 'bookmark':
            if (content.bookmark?.pageTitle) {
              searchableText += ` ${content.bookmark.pageTitle}`;
            }
            if (content.bookmark?.metaDescription) {
              searchableText += ` ${content.bookmark.metaDescription}`;
            }
            if (content.bookmark?.url) {
              searchableText += ` ${content.bookmark.url}`;
            }
            break;

          case 'youtube':
            if (content.youtube?.channelName) {
              searchableText += ` ${content.youtube.channelName}`;
            }
            break;
        }

        // Add tags
        if (content.tags && content.tags.length > 0) {
          searchableText += ` ${content.tags.join(' ')}`;
        }

        // Generate embedding
        console.log(`  Generating embedding...`);
        const { embedding, model } = await embeddingService.generateEmbedding(searchableText);

        // Update content
        content.embedding = embedding;
        content.embeddingModel = model;
        await content.save();

        successCount++;
        console.log(`  ✅ Success! (${successCount}/${contentsWithoutEmbeddings.length})`);

        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        errorCount++;
        console.error(`  ❌ Error: ${error.message}`);
        console.error(`  Skipping this item...`);
      }
    }

    console.log('\n=================================');
    console.log('Migration Complete!');
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Failed: ${errorCount}`);
    console.log(`📊 Total: ${contentsWithoutEmbeddings.length}`);
    console.log('=================================\n');

    process.exit(0);

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrateEmbeddings();
