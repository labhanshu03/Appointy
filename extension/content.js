// Content script that runs on all pages

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getScrollPosition') {
    const scrollPosition = {
      x: window.scrollX,
      y: window.scrollY,
      percentage: (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
    };

    // Get meta description
    const metaDescription = document.querySelector('meta[name="description"]')?.content || '';

    sendResponse({
      scrollPosition,
      metaDescription
    });
  }

  if (request.action === 'extractProductInfo') {
    const productInfo = extractProductInfo();
    sendResponse(productInfo);
  }

  if (request.action === 'getYouTubeInfo') {
    const youtubeInfo = extractYouTubeInfo();
    sendResponse(youtubeInfo);
  }

  return true; // Keep channel open
});

// Extract product information from the current page
function extractProductInfo() {
  let productInfo = {
    pageContent: '',
    imageUrl: ''
  };

  // Try to find product image
  const productImage = document.querySelector('[data-testid="product-image"], .product-image, [itemprop="image"]');
  if (productImage) {
    productInfo.imageUrl = productImage.src || productImage.dataset.src;
  }

  // Try to find product name
  const productName = document.querySelector('h1, [itemprop="name"], .product-title, .product-name');

  // Try to find product price
  const productPrice = document.querySelector('[itemprop="price"], .price, .product-price');

  // Try to find product description
  const productDescription = document.querySelector('[itemprop="description"], .product-description, .description');

  // Compile page content
  productInfo.pageContent = `
    Product Name: ${productName?.textContent?.trim() || 'N/A'}
    Price: ${productPrice?.textContent?.trim() || 'N/A'}
    Description: ${productDescription?.textContent?.trim() || 'N/A'}
  `;

  return productInfo;
}

// Extract YouTube video information
function extractYouTubeInfo() {
  if (!window.location.hostname.includes('youtube.com')) {
    return null;
  }

  // Get video ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const videoId = urlParams.get('v');

  if (!videoId) {
    return null;
  }

  // Extract video information from page
  const videoTitle = document.querySelector('h1.ytd-video-primary-info-renderer, h1.title')?.textContent?.trim();
  const channelName = document.querySelector('#channel-name a, ytd-channel-name a')?.textContent?.trim();
  const thumbnailUrl = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;

  // Try to get description
  const descriptionElement = document.querySelector('#description, .description');
  const videoDescription = descriptionElement?.textContent?.trim()?.substring(0, 500) || '';

  return {
    videoId,
    videoUrl: window.location.href,
    videoTitle,
    videoDescription,
    channelName,
    thumbnailUrl,
    duration: document.querySelector('.ytp-time-duration')?.textContent || 'N/A'
  };
}

// Detect if we're on a product page and show a subtle indicator
function detectProductPage() {
  // Common indicators of product pages
  const indicators = [
    '[itemprop="product"]',
    '[data-testid="product"]',
    '.product-page',
    '[itemtype*="Product"]'
  ];

  for (const selector of indicators) {
    if (document.querySelector(selector)) {
      return true;
    }
  }

  // Check for price patterns
  const pricePattern = /\$\d+\.\d{2}|€\d+\.\d{2}|£\d+\.\d{2}/;
  const bodyText = document.body.textContent;

  if (pricePattern.test(bodyText) && document.querySelector('h1')) {
    return true;
  }

  return false;
}

// Auto-detect YouTube videos
if (window.location.hostname.includes('youtube.com') && window.location.pathname === '/watch') {
  console.log('YouTube video detected');
}

// Auto-detect product pages
if (detectProductPage()) {
  console.log('Product page detected');
}
