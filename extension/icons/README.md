# Extension Icons

This folder should contain the following icon files:

- `icon16.png` - 16x16 pixels (toolbar icon)
- `icon48.png` - 48x48 pixels (extension management page)
- `icon128.png` - 128x128 pixels (Chrome Web Store)

## How to Create Icons

### Option 1: Use an Online Icon Generator

1. Visit [https://www.favicon-generator.org/](https://www.favicon-generator.org/)
2. Upload your logo or design
3. Generate icons in multiple sizes
4. Download and place in this folder

### Option 2: Use Image Editing Software

1. Create a square design in Photoshop, Figma, or Canva
2. Export in three sizes: 16x16, 48x48, 128x128
3. Save as PNG files with transparency
4. Name them exactly as specified above

### Option 3: Use a Placeholder (Temporary)

For development, you can use solid color squares:

1. Create simple colored squares using any image editor
2. Export in the required sizes
3. Replace with professional icons later

## Design Tips

- Use a simple, recognizable symbol
- Ensure the icon is clear at 16x16 pixels
- Use a transparent background
- Choose colors that stand out in the browser toolbar
- Keep the design consistent across all sizes

## Recommended Color Scheme

Based on the extension's purple gradient theme:
- Primary: #667eea
- Secondary: #764ba2
- Accent: #ffffff

## Quick Fix (Command Line)

If you have ImageMagick installed, you can create placeholder icons:

```bash
# Create a simple colored square as placeholder
convert -size 16x16 xc:#667eea icon16.png
convert -size 48x48 xc:#667eea icon48.png
convert -size 128x128 xc:#667eea icon128.png
```

**Note**: The extension will work without icons but will show warnings in the Chrome extensions page. For production, always use proper icons.
