require('dotenv').config();
const express = require('express');
const questionsRoutes = require('./routes/questionsRoutes');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use('/api/questions', questionsRoutes);

app.get('/', (req, res) => {
  res.send('Server is running...');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
