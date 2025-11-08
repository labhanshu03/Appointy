require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGeminiAPI() {
  console.log('Testing Gemini API with gemini-2.5-flash...');
  console.log('API Key (first 20 chars):', process.env.GEMINI_API_KEY?.substring(0, 20) + '...\n');

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // Test 1: Simple text generation
    console.log('1. Testing text generation...');
    const textModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const textResult = await textModel.generateContent('Say hello in JSON format: {"message": "..."}');
    const textResponse = await textResult.response;
    console.log('✅ Text generation works!');
    console.log('Response:', textResponse.text());

    // Test 2: Vision (image analysis)
    console.log('\n2. Testing image analysis...');
    const visionModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Create a simple test image (1x1 red pixel PNG in base64)
    const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';

    const prompt = 'Describe this image and provide a JSON response: {"title": "...", "description": "...", "category": "other"}';
    const imagePart = {
      inlineData: {
        data: testImageBase64,
        mimeType: 'image/png'
      }
    };

    const visionResult = await visionModel.generateContent([prompt, imagePart]);
    const visionResponse = await visionResult.response;
    console.log('✅ Image analysis works!');
    console.log('Response:', visionResponse.text());

    console.log('\n✅ ALL TESTS PASSED!');
    console.log('\nYour Gemini API key is working perfectly!');
    console.log('Model: gemini-2.5-flash');
    console.log('\nYou can now use:');
    console.log('- Photo capture with AI analysis');
    console.log('- Text extraction from images');
    console.log('- Auto-generated titles and descriptions');
    console.log('- Product analysis');
    console.log('- And all other AI features');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
}

testGeminiAPI();
