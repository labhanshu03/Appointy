// Popup script for Content Saver extension

document.addEventListener('DOMContentLoaded', () => {
  // Get DOM elements
  const capturePhotoBtn = document.getElementById('capturePhotoBtn');
  const saveProductBtn = document.getElementById('saveProductBtn');
  const saveBookmarkBtn = document.getElementById('saveBookmarkBtn');
  const saveYouTubeBtn = document.getElementById('saveYouTubeBtn');
  const createTodoBtn = document.getElementById('createTodoBtn');
  const todoSection = document.getElementById('todoSection');
  const todoInput = document.getElementById('todoInput');
  const submitTodoBtn = document.getElementById('submitTodoBtn');
  const status = document.getElementById('status');
  const viewDashboard = document.getElementById('viewDashboard');

  // Capture photo
  capturePhotoBtn.addEventListener('click', async () => {
    try {
      showStatus('Capturing screenshot...', 'info');

      chrome.runtime.sendMessage({ action: 'captureScreenshot' }, async (response) => {
        if (response.success) {
          showStatus('Analyzing image with AI...', 'info');

          chrome.runtime.sendMessage({
            action: 'savePhoto',
            data: {
              imageData: response.dataUrl,
              imageType: 'image/png'
            }
          }, (result) => {
            if (result.success) {
              showStatus(`Saved as: ${result.data.data.title}`, 'success');
            } else {
              showStatus('Failed to save photo', 'error');
            }
          });
        }
      });
    } catch (error) {
      console.error('Error capturing photo:', error);
      showStatus('Error capturing photo', 'error');
    }
  });

  // Save product
  saveProductBtn.addEventListener('click', async () => {
    try {
      showStatus('Extracting product information...', 'info');

      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      chrome.tabs.sendMessage(tab.id, { action: 'extractProductInfo' }, (productInfo) => {
        if (!productInfo) {
          showStatus('Could not extract product info', 'error');
          return;
        }

        showStatus('Analyzing product with AI...', 'info');

        chrome.runtime.sendMessage({
          action: 'saveProduct',
          data: productInfo
        }, (result) => {
          if (result.success) {
            showStatus(`Product saved: ${result.data.data.title}`, 'success');
          } else {
            showStatus('Failed to save product', 'error');
          }
        });
      });
    } catch (error) {
      console.error('Error saving product:', error);
      showStatus('Error saving product', 'error');
    }
  });

  // Save bookmark
  saveBookmarkBtn.addEventListener('click', async () => {
    try {
      showStatus('Saving bookmark...', 'info');

      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      chrome.tabs.sendMessage(tab.id, { action: 'getScrollPosition' }, async (response) => {
        const bookmarkData = {
          url: tab.url,
          scrollPosition: response.scrollPosition,
          pageTitle: tab.title,
          favicon: tab.favIconUrl,
          metaDescription: response.metaDescription
        };

        const result = await fetch('http://localhost:5000/api/content/bookmark', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(bookmarkData)
        });

        const data = await result.json();

        if (data.success) {
          showStatus(`Bookmark saved: ${data.data.title}`, 'success');
        } else {
          showStatus('Failed to save bookmark', 'error');
        }
      });
    } catch (error) {
      console.error('Error saving bookmark:', error);
      showStatus('Error saving bookmark', 'error');
    }
  });

  // Save YouTube video
  saveYouTubeBtn.addEventListener('click', async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (!tab.url.includes('youtube.com/watch')) {
        showStatus('Please open a YouTube video first', 'error');
        return;
      }

      showStatus('Extracting video information...', 'info');

      chrome.tabs.sendMessage(tab.id, { action: 'getYouTubeInfo' }, (youtubeInfo) => {
        if (!youtubeInfo) {
          showStatus('Could not extract video info', 'error');
          return;
        }

        showStatus('Analyzing video with AI...', 'info');

        chrome.runtime.sendMessage({
          action: 'saveYouTube',
          data: youtubeInfo
        }, (result) => {
          if (result.success) {
            showStatus(`Video saved: ${result.data.data.title}`, 'success');
          } else {
            showStatus('Failed to save video', 'error');
          }
        });
      });
    } catch (error) {
      console.error('Error saving YouTube video:', error);
      showStatus('Error saving YouTube video', 'error');
    }
  });

  // Show todo section
  createTodoBtn.addEventListener('click', () => {
    todoSection.classList.toggle('active');
  });

  // Submit todo
  submitTodoBtn.addEventListener('click', async () => {
    const todoText = todoInput.value.trim();

    if (!todoText) {
      showStatus('Please enter a todo item', 'error');
      return;
    }

    try {
      showStatus('Creating todo with AI...', 'info');

      const result = await fetch('http://localhost:5000/api/content/todo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: todoText })
      });

      const data = await result.json();

      if (data.success) {
        showStatus(`Todo created: ${data.data.title}`, 'success');
        todoInput.value = '';
        setTimeout(() => {
          todoSection.classList.remove('active');
        }, 1500);
      } else {
        showStatus('Failed to create todo', 'error');
      }
    } catch (error) {
      console.error('Error creating todo:', error);
      showStatus('Error creating todo', 'error');
    }
  });

  // View dashboard
  viewDashboard.addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: 'http://localhost:3000' });
  });

  // Helper function to show status
  function showStatus(message, type) {
    status.textContent = message;
    status.className = 'status';

    if (type === 'success') {
      status.classList.add('success');
    } else if (type === 'error') {
      status.classList.add('error');
    } else {
      status.style.display = 'block';
      status.style.color = '#667eea';
      status.style.border = '2px solid #667eea';
    }

    if (type === 'success' || type === 'error') {
      setTimeout(() => {
        status.style.display = 'none';
      }, 3000);
    }
  }
});
