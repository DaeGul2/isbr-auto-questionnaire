
const OpenAIApi = require('openai');

const openai = new OpenAIApi.OpenAI({ apiKey: process.env.OPENAI_API_KEY });

exports.createQuestions = async (prompt) => {
  try {
    const response = await openai.createCompletion({
      model: "text-davinci-004", // GPT-4 모델 사용
      prompt: prompt,
      max_tokens: 500
    });
    return response.data;
  } catch (error) {
    console.error('Error in OpenAI Service:', error);
    throw error;
  }
};
