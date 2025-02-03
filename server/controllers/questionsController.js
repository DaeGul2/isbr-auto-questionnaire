const openaiService = require('../services/openaiService');

exports.generateQuestions = async (req, res) => {
  try {
    const prompt = req.body.prompt;
    const questions = await openaiService.createQuestions(prompt);
    res.json(questions);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error processing your request');
  }
};
