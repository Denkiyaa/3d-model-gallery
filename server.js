// server.js
const express = require('express');
const path = require('path');

// Initialize Express app
const app = express();
const PORT = 4000;

// Serve static files from the React build directory
app.use(express.static(path.join(__dirname, 'build')));

// Public dosyalarını sun
app.use('/game', express.static(path.join(__dirname, 'public/game')));

// Route all requests to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
