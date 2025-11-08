const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');

// Save content endpoints
router.post('/photo', contentController.savePhoto);
router.post('/document', contentController.saveDocument);
router.post('/todo', contentController.saveTodo);
router.post('/product', contentController.saveProduct);
router.post('/bookmark', contentController.saveBookmark);
router.post('/youtube', contentController.saveYouTube);

// Get content endpoints
router.get('/', contentController.getAllContent);
router.get('/:id', contentController.getContentById);

// Update and delete
router.put('/:id', contentController.updateContent);
router.delete('/:id', contentController.deleteContent);

// Search
router.post('/search', contentController.searchContent);

module.exports = router;
