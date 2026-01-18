import axios from 'axios';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = 'https://ai.gateway.lovable.dev/v1/chat/completions';
const MODEL = 'google/gemini-2.0-flash-exp';
const MAX_RETRIES = 2;
const RETRY_DELAY = 2000;

interface GeminiResponse {
  response: string;
  model: string;
  usage?: any;
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export const geminiClient = {
  async chat(prompt: string): Promise<GeminiResponse> {
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    let lastError: any;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`🤖 Gemini attempt ${attempt}/${MAX_RETRIES}...`);

        const response = await axios.post(
          GEMINI_URL,
          {
            model: MODEL,
            messages: [
              {
                role: 'user',
                content: prompt
              }
            ]
          },
          {
            timeout: 30000,
            headers: {
              'Authorization': `Bearer ${GEMINI_API_KEY}`,
              'Content-Type': 'application/json'
            }
          }
        );

        const content = response.data.choices[0].message.content;
        console.log('✅ Gemini success');

        return {
          response: content,
          model: MODEL,
          usage: response.data.usage
        };

      } catch (error: any) {
        lastError = error;
        console.warn(`⚠️ Gemini attempt ${attempt} failed:`, error.message);

        // Check if rate limited
        if (error.response?.status === 429 && attempt < MAX_RETRIES) {
          console.log('Rate limited, waiting...');
          await sleep(RETRY_DELAY * attempt);
        } else if (attempt < MAX_RETRIES) {
          await sleep(RETRY_DELAY);
        }
      }
    }

    throw new Error(`Gemini failed: ${lastError.message}`);
  },

  async analyze(prompt: string, imageUrl: string): Promise<any> {
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    try {
      console.log('🤖 Gemini vision analysis...');

      const response = await axios.post(
        GEMINI_URL,
        {
          model: MODEL,
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                { type: 'image_url', image_url: { url: imageUrl } }
              ]
            }
          ]
        },
        {
          timeout: 30000,
          headers: {
            'Authorization': `Bearer ${GEMINI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const content = response.data.choices[0].message.content;
      console.log('✅ Gemini vision success');

      // Try to parse as JSON
      try {
        return JSON.parse(content);
      } catch {
        return { response: content };
      }

    } catch (error: any) {
      console.error('❌ Gemini vision error:', error.message);
      throw new Error(`Gemini vision failed: ${error.message}`);
    }
  }
};
