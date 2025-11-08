require('dotenv').config();
const https = require('https');

const API_KEY = process.env.GEMINI_API_KEY;

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    }).on('error', reject);
  });
}

async function checkAPI() {
  console.log('Checking Gemini API access...\n');
  console.log('API Key:', API_KEY?.substring(0, 20) + '...\n');

  try {
    // Try to list models
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
    console.log('Fetching models list...');

    const result = await makeRequest(url);

    if (result.models && result.models.length > 0) {
      console.log('\n✅ API key is valid! Available models:\n');
      result.models.forEach(model => {
        console.log(`- ${model.name}`);
        console.log(`  Display Name: ${model.displayName || 'N/A'}`);
        console.log(`  Supported: ${model.supportedGenerationMethods?.join(', ') || 'N/A'}`);
        console.log('');
      });
    } else if (result.error) {
      console.log('\n❌ API Error:');
      console.log(JSON.stringify(result.error, null, 2));

      if (result.error.message?.includes('API key not valid')) {
        console.log('\nThe API key is invalid or not properly configured.');
        console.log('Please check:');
        console.log('1. You copied the full API key');
        console.log('2. The key is from https://aistudio.google.com/app/apikey');
        console.log('3. The Generative Language API is enabled');
      }
    } else {
      console.log('Unexpected response:', result);
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkAPI();
