const express = require('express');
const WebSocket = require('ws');
const http = require('http');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cors = require('cors'); 
const { spawn } = require('child_process');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// 使用 cors 中间件
app.use(cors());

const upload = multer({ dest: 'resource/AI_tools/ASR/wav/' });

app.use('/css', express.static(path.join(__dirname, '../../../css')));
app.use('/js', express.static(path.join(__dirname, '../../../js')));
app.use('/resource', express.static(path.join(__dirname, '../../../resource')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'ASR.html'));
});

app.post('/upload', upload.single('audioFile'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: '请上传文件' });
    }
    res.json({ success: true, file: req.file.filename });
});

wss.on('connection', ws => {
    ws.on('message', message => {
        let data;
        try {
            data = JSON.parse(message);
        } catch (error) {
            ws.send(JSON.stringify({ error: '无效的 JSON 格式' }));
            return;
        }

        if (data.command === 'start' && data.file) {
            let filePath = path.join('resource/AI_tools/ASR/wav', data.file);
            let outputFolder = path.join('resource/AI_tools/ASR/chunks');
            let outputTxtFile = path.join('resource/AI_tools/ASR/txt', data.file.replace('.wav', '.txt'));

            let pythonProcess = spawn('python', ['process_audio.py', filePath, outputFolder, outputTxtFile]);

            pythonProcess.stdout.on('data', (data) => {
                ws.send(JSON.stringify({ progress: parseInt(data.toString()) }));
            });

            pythonProcess.on('close', () => {
                fs.readFile(outputTxtFile, 'utf8', (err, data) => {
                    if (err) {
                        ws.send(JSON.stringify({ error: '读取文件失败' }));
                        return;
                    }
                    ws.send(JSON.stringify({ text: data }));
                });
            });
        } else {
            ws.send(JSON.stringify({ error: '无效的命令或文件' }));
        }
    });
});

server.listen(5501, () => {
    console.log('服务器正在监听端口 5501');
});
