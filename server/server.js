// server/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const uploadImageRoute = require('./upload-image');

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', uploadImageRoute);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
