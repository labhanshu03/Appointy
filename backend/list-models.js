require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels() {
  console.log('Listing available Gemini models...\n');

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // List all available models
    const models = await genAI.listModels();

    console.log('Available models:');
    console.log('================\n');

    for await (const model of models) {
      console.log(`Name: ${model.name}`);
      console.log(`Display Name: ${model.displayName}`);
      console.log(`Supported methods: ${model.supportedGenerationMethods.join(', ')}`);
      console.log('---');
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

listModels();
