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

app.use(cors());

const upload = multer({ dest: 'uploads/' });

app.use('/static', express.static(path.join(__dirname, 'static')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/upload', upload.single('audioFile'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: '请上传文件' });
    }
    res.json({ success: true, file: req.file.filename });
});

wss.on('connection', ws => {
    console.log('WebSocket 连接已建立');

    ws.on('message', message => {
        let data;
        try {
            data = JSON.parse(message);
        } catch (error) {
            ws.send(JSON.stringify({ error: '无效的 JSON 格式' }));
            return;
        }

        if (data.command === 'start' && data.file) {
            let filePath = path.join('uploads', data.file);
            let outputTxtFile = path.join('output_file_txt', data.file.replace('.wav', '.txt'));

            if (!fs.existsSync('output_file_txt')) {
                fs.mkdirSync('output_file_txt');
            }

            console.log(`处理文件: ${filePath}`);

            let pythonProcess = spawn('python', ['process_audio.py', filePath, outputTxtFile]);

            pythonProcess.stdout.on('data', (data) => {
                console.log(`进度数据: ${data.toString()}`);
                ws.send(JSON.stringify({ progress: data.toString().trim() }));
            });

            pythonProcess.stderr.on('data', (data) => {
                console.error(`Python 错误: ${data.toString()}`);
                ws.send(JSON.stringify({ error: '处理音频文件时出错' }));
            });

            pythonProcess.on('close', (code) => {
                console.log('Python 进程关闭，退出码:', code);
                if (code !== 0) {
                    ws.send(JSON.stringify({ error: '处理音频文件时出错' }));
                    return;
                }

                fs.readFile(outputTxtFile, 'utf8', (err, data) => {
                    if (err) {
                        console.error('读取文本文件失败:', err);
                        ws.send(JSON.stringify({ error: '读取文件失败' }));
                        return;
                    }
                    ws.send(JSON.stringify({ text: data }));
                });
            });

            setTimeout(() => {
                pythonProcess.kill();
                ws.send(JSON.stringify({ error: '处理音频文件超时' }));
            }, 150000);
        } else {
            ws.send(JSON.stringify({ error: '无效的命令或文件' }));
        }
    });

    ws.on('error', (error) => {
        console.error('WebSocket 错误:', error);
    });

    ws.on('close', () => {
        console.log('WebSocket 连接关闭');
    });
});

server.listen(5501, () => {
    console.log('服务器正在监听端口 5501');
});
