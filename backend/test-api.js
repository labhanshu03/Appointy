require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

async function testAPI() {
  console.log('Testing Anthropic API...');
  console.log('API Key (first 20 chars):', process.env.ANTHROPIC_API_KEY?.substring(0, 20) + '...');

  try {
    // Test with simple text completion
    const message = await client.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 50,
      messages: [{
        role: 'user',
        content: 'Say hello!'
      }]
    });

    console.log('✅ API Key is valid!');
    console.log('Response:', message.content[0].text);

    // Now test available models
    console.log('\nTrying different vision models...');
    const models = [
      'claude-3-opus-20240229',
      'claude-3-sonnet-20240229',
      'claude-3-5-sonnet-20240620',
      'claude-3-5-sonnet-20241022'
    ];

    for (const model of models) {
      console.log(`\nTesting model: ${model}`);
      try {
        await client.messages.create({
          model: model,
          max_tokens: 10,
          messages: [{ role: 'user', content: 'test' }]
        });
        console.log(`✅ ${model} works!`);
      } catch (e) {
        console.log(`❌ ${model} failed:`, e.message);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  }
}

testAPI();
