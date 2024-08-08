// server.js
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const WebSocket = require('ws');
const fs = require('fs');

// Initialize Express app
const app = express();
const port = 5501;

// Enable CORS
app.use(cors());

// Set up multer for file upload
const upload = multer({ dest: path.join(__dirname, 'resource/AI_tools/ASR/wav/') });

// Handle file upload
app.post('/upload', upload.single('audioFile'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    res.json({ success: true, file: req.file.filename });
});

// Start the Express server
app.listen(port, () => {
    console.log(`Server running at http://127.0.0.1:${port}/`);
});

// WebSocket server code can be added here
