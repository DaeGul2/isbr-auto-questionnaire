const express = require('express');
const { generateText } = require('../controllers/gptController');

const router = express.Router();

router.post('/generate-text', generateText);

module.exports = router;
