# Quick Start Guide

Get your Content Saver Extension up and running in 5 minutes!

## Prerequisites Checklist

- [ ] Node.js installed (v16+)
- [ ] MongoDB installed (or MongoDB Atlas account)
- [ ] Anthropic API key ([Get one here](https://console.anthropic.com/))
- [ ] Chrome or Edge browser

## 5-Minute Setup

### 1. Backend Setup (2 minutes)

```bash
# Navigate to backend
cd content-saver-extension/backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

Edit `.env` file:
```env
MONGODB_URI=mongodb://localhost:27017/content-saver
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

Start the server:
```bash
npm run dev
```

You should see: `MongoDB Connected` and `Server running on port 5000`

### 2. Install Extension (1 minute)

1. Open Chrome: `chrome://extensions/`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select the `extension` folder
5. Done!

### 3. Dashboard Setup (2 minutes)

Open a new terminal:

```bash
# Navigate to dashboard
cd content-saver-extension/dashboard

# Install dependencies
npm install

# Start dashboard
npm start
```

Dashboard opens at: `http://localhost:3000`

## Test It Out!

### Quick Test 1: Capture a Screenshot
1. Click the extension icon
2. Click "Capture Photo"
3. Wait for AI analysis
4. Check the dashboard!

### Quick Test 2: Create a Todo
1. Click the extension icon
2. Click "Create Todo"
3. Type: "Buy groceries tomorrow"
4. Click "Save Todo"
5. Check the dashboard!

### Quick Test 3: Save a YouTube Video
1. Go to any YouTube video
2. Click the extension icon
3. Click "Save YouTube"
4. Check the dashboard!

## Troubleshooting

### "Cannot connect to server"
- Is the backend running? Check terminal
- Is it on port 5000? Check `.env` file
- MongoDB running? Start MongoDB service

### "Failed to save"
- Check your Anthropic API key
- Look at backend terminal for errors
- Verify MongoDB connection

### Extension not showing
- Reload extension at `chrome://extensions/`
- Check for errors in extension details
- Verify all files are present

## What's Next?

1. **Customize**: Modify the extension popup UI
2. **Add Icons**: Create proper extension icons (see extension/icons/README.md)
3. **Explore Features**: Try all 6 content saving features
4. **Add Embeddings**: Implement semantic search
5. **Deploy**: Host on Render/Vercel for production

## Need Help?

- Check the main README.md for detailed docs
- Look at the API endpoints section
- Review the troubleshooting guide
- Check backend logs for errors

## Pro Tips

- Keep all terminals open while developing
- Use MongoDB Compass to view your data
- Check browser console for frontend errors
- Use Postman to test API endpoints directly

---

**You're all set!** Start saving content with AI-powered organization.
