# Content Saver Extension and ui dashboard with multiple functionality( The gemini key i have used for rag and embedding has exceeded its limit. if checking in your system use your own gemini key)

A powerful browser extension built with the MERN stack that helps you save, organize, and intelligently retrieve content using AI-powered categorization, semantic search, and RAG-based Q&A.

Easily capture, summarize, and query your digital content — all enhanced by Google Gemini’s multimodal intelligence.

## Features

1. **Photo Capture** -
•	Capture screenshots directly from any webpage
•	Automatic AI categorization (book, recipe, document, etc.)
•	AI-generated captions and descriptions
•	Embedding data stored for every image, enabling semantic search and RAG-based Q&A
•	Example: “Show me the recipe screenshots I captured this week.”


2. **Text Documents** -
•	Save selected text directly from webpages
•	Right-click → Content Saver → Save as Document
•	AI generates title, summary, and category automatically
•	Embeddings generated and stored for each document
•	Supports semantic search and natural language Q&A (e.g., “Find my notes about React hooks”)
•	Enables deep RAG-based querying across your stored text content


3. **Todo Items**
•	Quickly create todos from the extension popup
•	AI automatically suggests titles, priorities, and tags
•	Each todo entry includes semantic embeddings for contextual retrieval
•	Example: “Find todos related to grocery shopping”
•	Fully searchable and queryable through semantic search and RAG Q&A


4. **Product Saving** -
•	Save products directly from e-commerce pages (Amazon, eBay, etc.)
•	AI extracts product details (name, price, description, image)
•	Embedding vectors stored for semantic product search
•	Ask queries like “Find gadgets similar to the smartwatch I saved.”

5. **Page Bookmarking** -
•	Save webpages with scroll position retained
•	AI generates summaries, tags, and categories
•	Embeddings saved for semantic and contextual search
•	Example: “Find the AI research article I was reading last night.”
•	Fully compatible with RAG-based Q&A across your reading list

6. **YouTube Videos** -
•	Save YouTube videos with complete metadata (title, channel, duration, etc.)
•	AI generates summaries and insights from video content
•	Embeddings generated for each video
•	Enables semantic search and RAG-based querying (e.g., “Summarize the videos I saved about MERN stack tutorials”)

7🔍 Semantic Search----------------------------------------------------------------->
•	Perform natural language searches across all content types — text, images, todos, bookmarks, and videos
•	Powered by vector embeddings and semantic similarity matching
•	Understands contextual meaning, not just keywords
•	Examples:
o	“Find all recipes mentioning pasta”
o	“Show my notes about JavaScript performance”
o	“Locate videos related to AI startups”

8💬 **RAG-Based Q&A (Retrieval-Augmented Generation **------------------------------------>
•	Ask natural language questions across all your saved content
•	Combines semantic retrieval + AI generation for intelligent, context-aware answers
•	Example queries:
o	“Summarize everything I’ve saved about neural networks.”
o	“What did I learn about financial planning last week?”
o	“List my todos and bookmarks related to web development.”
•	Integrates directly with the dashboard — enabling conversational exploration of your content library
•	Powered by Google Gemini 2.5 Flash for real-time, multimodal reasoning




All content is analyzed by AI to generate meaningful titles, descriptions, and categorizations. The system uses Google Gemini for intelligent analysis with automatic fallback mechanisms for reliability. Data is stored in MongoDB with vector embeddings for semantic search.

## Tech Stack

- **Frontend Extension**: Vanilla JavaScript (Chrome Extension Manifest V3)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with vector embeddings
- **AI**:
  - Google Gemini 2.5 Flash (text & vision analysis)
  - Vector embeddings for semantic search
  - RAG (Retrieval Augmented Generation) for Q&A
- **Dashboard**: React.js

## Project Structure

```
content-saver-extension/
├── backend/                 # Express.js backend
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── controllers/    # Request handlers
│   │   ├── models/         # MongoDB schemas
│   │   ├── routes/         # API routes
│   │   ├── services/       # AI service
│   │   └── server.js       # Main server file
│   └── package.json
│
├── extension/              # Chrome extension
│   ├── manifest.json       # Extension manifest
│   ├── background.js       # Service worker
│   ├── content.js          # Content script
│   ├── popup.html          # Extension popup UI
│   ├── popup.js            # Popup logic
│   └── api.js              # API communication
│
└── dashboard/              # React dashboard
    ├── public/
    ├── src/
    │   ├── components/     # React components
    │   ├── services/       # API services
    │   ├── App.js
    │   └── index.js
    └── package.json
```

## Setup Instructions

### Prerequisites

1. **Node.js** (v16 or higher)
2. **MongoDB** (local or cloud instance)
3. **Anthropic API Key** - Get one from [https://console.anthropic.com/](https://console.anthropic.com/)
4. **Chrome or Edge browser**

### Step 1: Clone/Navigate to the Project

```bash
cd content-saver-extension
```

### Step 2: Set Up the Backend

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```bash
cp .env.example .env
```

4. Edit the `.env` file with your configuration:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=MONGODB_URL
ANTHROPIC_API_KEY=sk-JkOY9l0DrdPBQL8EUJMA2g
GEMINI_API_KEY=YOUR_GEMENI_API_KEY
```



5. Start the backend server:
```bash
npm run dev
```

The server should now be running on `http://localhost:5000`

### Step 3: Set Up MongoDB

#### Option A: Local MongoDB

1. Install MongoDB locally: [https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)

2. Start MongoDB:
```bash
# Windows
net start MongoDB

# Mac/Linux
sudo systemctl start mongod
```

#### Option B: MongoDB Atlas (Cloud)

1. Create a free account at [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)

2. Create a new cluster

3. Get your connection string and update the `.env` file:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/content-saver?retryWrites=true&w=majority
```

### Step 4: Set Up the Dashboard

1. Open a new terminal and navigate to the dashboard directory:
```bash
cd dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Start the React development server:
```bash
npm start
```

The dashboard should open at `http://localhost:3000`

### Step 5: Load the Extension in Chrome/Edge

1. Open Chrome/Edge and navigate to:
   - Chrome: `chrome://extensions/`
   - Edge: `edge://extensions/`

2. Enable **Developer mode** (toggle in the top-right corner)

3. Click **Load unpacked**

4. Navigate to and select the `extension` folder inside your project

5. The Content Saver extension should now appear in your extensions list

6. Pin the extension to your toolbar for easy access

### Step 6: Create Extension Icons (Optional)

The extension requires icon files. You can either:

1. Create your own icons and place them in `extension/icons/`:
   - `icon16.png` (16x16 pixels)
   - `icon48.png` (48x48 pixels)
   - `icon128.png` (128x128 pixels)

2. Or use placeholder icons temporarily (the extension will work without them but show warnings)

## Usage Guide

### Using the Extension

#### 1. Capture a Photo
- Click the extension icon
- Click "Capture Photo"
- The current tab will be captured and analyzed by AI
- It will be categorized (book, recipe, document, etc.)

#### 2. Save Selected Text as Document
- Select any text on a webpage
- Right-click and choose "Save as Document"
- AI will generate a title and description

#### 3. Create a Todo
- Click the extension icon
- Click "Create Todo"
- Enter your todo text
- AI will suggest a title, priority, and tags

#### 4. Save a Product
- Visit any product page (Amazon, eBay, etc.)
- Click the extension icon
- Click "Save Product"
- Product details will be auto-extracted

#### 5. Save a Bookmark with Scroll Position
- On any page, click the extension icon
- Click "Save Page"
- The page URL and your current scroll position will be saved

#### 6. Save a YouTube Video
- Visit a YouTube video
- Click the extension icon
- Click "Save YouTube"
- Video metadata will be saved with AI-generated description

### Using the Dashboard

1. Open `http://localhost:3000`

2. View all saved content with stats

3. Filter by content type (photos, documents, todos, etc.)

4. Search across all your content

5. Sort by date, title, or access count

6. Mark items as favorites

7. Delete items you no longer need

## API Endpoints

### Content Endpoints

- `POST /api/content/photo` - Save a photo
- `POST /api/content/document` - Save a document
- `POST /api/content/todo` - Save a todo
- `POST /api/content/product` - Save a product
- `POST /api/content/bookmark` - Save a bookmark
- `POST /api/content/youtube` - Save a YouTube video
- `GET /api/content` - Get all content (with filters)
- `GET /api/content/:id` - Get single content item
- `PUT /api/content/:id` - Update content
- `DELETE /api/content/:id` - Delete content
- `POST /api/content/search` - Search content

## Future Enhancements



### Additional Features

- User authentication and multi-user support
- Browser sync across devices
- Export content to various formats (PDF, JSON, CSV)
- OCR for extracting text from images
- Smart collections and auto-categorization
- Browser history integration
- Collaborative sharing

## Troubleshooting

### Backend won't start

- Check if MongoDB is running
- Verify your `.env` file has the correct configuration
- Make sure port 5000 is not already in use

### Extension not loading

- Check that all required files are present
- Look for errors in Chrome DevTools (Extensions page)
- Verify manifest.json is valid

### AI features not working

- Verify your Anthropic API key is valid
- Check your API usage limits
- Look at backend console for error messages

### Dashboard not connecting to backend

- Ensure backend is running on port 5000
- Check CORS settings in backend
- Look at browser console for errors

## Development Tips

### Testing the Extension

1. Make changes to extension files
2. Click the refresh icon on the extension in `chrome://extensions/`
3. Test the functionality

### Backend Development

- Use `npm run dev` to run with nodemon (auto-restart on changes)
- Check logs in the terminal for debugging
- Use MongoDB Compass to inspect your database

### Dashboard Development

- React hot reload is enabled automatically
- Use React DevTools for debugging
- Check Network tab for API call issues

## Cost Considerations

- **MongoDB Atlas**: Free tier available (512MB)
- **Anthropic API**: Pay per use (~$3-15 per million tokens)
- **Hosting**: Can be deployed to free tiers (Vercel, Render, etc.)

Estimated cost for moderate use: $5-20/month

## Security Notes

1. **Never commit your `.env` file** - It contains sensitive API keys
2. Add `.env` to `.gitignore`
3. For production, implement user authentication
4. Use environment variables for all secrets
5. Implement rate limiting on API endpoints

## License

MIT License - Feel free to use and modify as needed.

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review API documentation
3. Check browser console for errors
4. Verify all services are running

## Deployment (Production)

### Backend Deployment (Render/Railway)

1. Push code to GitHub
2. Connect to Render/Railway
3. Set environment variables
4. Deploy

### Dashboard Deployment (Vercel/Netlify)

1. Push code to GitHub
2. Connect to Vercel/Netlify
3. Set build command: `npm run build`
4. Deploy

### Extension Publishing

1. Create icons and screenshots
2. Write store description
3. Submit to Chrome Web Store
4. Wait for review (usually 1-3 days)

---

**Built with Claude Code** - Happy saving!
