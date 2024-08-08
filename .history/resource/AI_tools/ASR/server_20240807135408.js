const express = require('express');
const WebSocket = require('ws');
const http = require('http');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Set up multer for file upload
const upload = multer({ dest: 'resource/AI_tools/ASR/wav/' });

app.use(express.static('Blog'));

app.post('/upload', upload.single('audioFile'), (req, res) => {
    // Return file info to the frontend
    res.json({ success: true, file: req.file.filename });
});

wss.on('connection', ws => {
    ws.on('message', message => {
        let data = JSON.parse(message);
        if (data.command === 'start' && data.file) {
            let filePath = path.join('resource/AI_tools/ASR/wav', data.file);
            let outputFolder = path.join('resource/AI_tools/ASR/chunks');
            let outputTxtFile = path.join('resource/AI_tools/ASR/txt', data.file.replace('.wav', '.txt'));

            // Call the Python script for processing
            let pythonProcess = spawn('python', ['path/to/your/python_script.py', filePath, outputFolder, outputTxtFile]);

            pythonProcess.stdout.on('data', (data) => {
                ws.send(JSON.stringify({ progress: parseInt(data.toString()) }));
            });

            pythonProcess.on('close', () => {
                fs.readFile(outputTxtFile, 'utf8', (err, data) => {
                    if (err) throw err;
                    ws.send(JSON.stringify({ text: data }));
                });
            });
        }
    });
});

server.listen(8080, () => {
    console.log('Server is listening on port 8080');
});
