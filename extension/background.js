// Background service worker for Content Saver extension

// Create context menu items
chrome.runtime.onInstalled.addListener(() => {
  // Save selected text as document
  chrome.contextMenus.create({
    id: 'saveDocument',
    title: 'Save as Document',
    contexts: ['selection']
  });

  // Save image
  chrome.contextMenus.create({
    id: 'saveImage',
    title: 'Save Image',
    contexts: ['image']
  });

  // Save page as bookmark
  chrome.contextMenus.create({
    id: 'saveBookmark',
    title: 'Save Page with Scroll Position',
    contexts: ['page']
  });

  // Save as todo
  chrome.contextMenus.create({
    id: 'saveTodo',
    title: 'Save as Todo',
    contexts: ['selection']
  });

  console.log('Content Saver extension installed');
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  switch (info.menuItemId) {
    case 'saveDocument':
      handleSaveDocument(info, tab);
      break;
    case 'saveImage':
      handleSaveImage(info, tab);
      break;
    case 'saveBookmark':
      handleSaveBookmark(info, tab);
      break;
    case 'saveTodo':
      handleSaveTodo(info, tab);
      break;
  }
});

// Handle messages from content script and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'captureScreenshot') {
    chrome.tabs.captureVisibleTab(null, { format: 'png' }, (dataUrl) => {
      sendResponse({ success: true, dataUrl });
    });
    return true; // Keep channel open for async response
  }

  if (request.action === 'savePhoto') {
    savePhoto(request.data)
      .then(result => sendResponse({ success: true, data: result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }

  if (request.action === 'saveProduct') {
    console.log('Background: Saving product', { data: request.data, tabUrl: request.tabUrl });

    if (!request.tabUrl) {
      console.error('Background: tabUrl is missing!');
      sendResponse({ success: false, error: 'Product URL is missing' });
      return true;
    }

    saveProduct(request.data, request.tabUrl)
      .then(result => {
        console.log('Background: Product saved successfully', result);
        sendResponse({ success: true, data: result });
      })
      .catch(error => {
        console.error('Background: Error saving product', error);
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }

  if (request.action === 'saveYouTube') {
    saveYouTube(request.data)
      .then(result => sendResponse({ success: true, data: result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
});

// Handler functions
async function handleSaveDocument(info, tab) {
  const selectedText = info.selectionText;
  const sourceUrl = info.pageUrl;

  try {
    const response = await fetch('http://localhost:5000/api/content/document', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: selectedText,
        sourceUrl: sourceUrl,
        selectionContext: `From: ${tab.title}`
      })
    });

    const result = await response.json();

    if (result.success) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: 'Document Saved',
        message: `"${result.data.title}" has been saved successfully!`
      });
    }
  } catch (error) {
    console.error('Error saving document:', error);
    showErrorNotification('Failed to save document');
  }
}

async function handleSaveImage(info, tab) {
  const imageUrl = info.srcUrl;

  try {
    // Fetch image and convert to base64
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const reader = new FileReader();

    reader.onloadend = async function() {
      const base64data = reader.result.split(',')[1];

      const saveResponse = await fetch('http://localhost:5000/api/content/photo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          imageData: base64data,
          imageType: blob.type
        })
      });

      const result = await saveResponse.json();

      if (result.success) {
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icons/icon48.png',
          title: 'Image Saved',
          message: `"${result.data.title}" - Category: ${result.data.photo.category}`
        });
      }
    };

    reader.readAsDataURL(blob);
  } catch (error) {
    console.error('Error saving image:', error);
    showErrorNotification('Failed to save image');
  }
}

async function handleSaveBookmark(info, tab) {
  // Send message to content script to get scroll position
  chrome.tabs.sendMessage(tab.id, { action: 'getScrollPosition' }, async (response) => {
    try {
      const saveResponse = await fetch('http://localhost:5000/api/content/bookmark', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: tab.url,
          scrollPosition: response.scrollPosition,
          pageTitle: tab.title,
          favicon: tab.favIconUrl,
          metaDescription: response.metaDescription
        })
      });

      const result = await saveResponse.json();

      if (result.success) {
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icons/icon48.png',
          title: 'Bookmark Saved',
          message: `"${result.data.title}" has been bookmarked!`
        });
      }
    } catch (error) {
      console.error('Error saving bookmark:', error);
      showErrorNotification('Failed to save bookmark');
    }
  });
}

async function handleSaveTodo(info, tab) {
  const todoText = info.selectionText;

  try {
    const response = await fetch('http://localhost:5000/api/content/todo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: todoText
      })
    });

    const result = await response.json();

    if (result.success) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: 'Todo Created',
        message: `"${result.data.title}" - Priority: ${result.data.todo.priority}`
      });
    }
  } catch (error) {
    console.error('Error saving todo:', error);
    showErrorNotification('Failed to save todo');
  }
}

async function savePhoto(data) {
  const response = await fetch('http://localhost:5000/api/content/photo', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      imageData: data.imageData.split(',')[1],
      imageType: data.imageType
    })
  });

  return await response.json();
}

async function saveProduct(data, productUrl) {
  console.log('saveProduct called with:', { data, productUrl });

  if (!productUrl) {
    throw new Error('Product URL is required');
  }

  const payload = {
    pageContent: data.pageContent,
    productUrl: productUrl,
    imageUrl: data.imageUrl || ''
  };

  console.log('Sending to backend:', payload);

  const response = await fetch('http://localhost:5000/api/content/product', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const result = await response.json();
  console.log('Backend response:', result);

  return result;
}

async function saveYouTube(data) {
  const response = await fetch('http://localhost:5000/api/content/youtube', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  return await response.json();
}

function showErrorNotification(message) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon48.png',
    title: 'Error',
    message: message
  });
}
