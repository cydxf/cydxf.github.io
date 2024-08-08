const express = require('express');
const WebSocket = require('ws');
const http = require('http');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { URL } = require('url');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// 设置 multer 用于文件上传
const upload = multer({ dest: 'resource/AI_tools/ASR/wav/' }); // 上传文件存储路径

// 静态文件托管目录
app.use('/css', express.static(path.join(__dirname, '../../../css')));
app.use('/js', express.static(path.join(__dirname, '../../../js')));
app.use('/resource', express.static(path.join(__dirname, '../../../resource')));


// 处理文件上传请求 (POST 方法)
app.post('/upload', upload.single('audioFile'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: '请上传文件' });
    }
    // 返回文件信息到前端
    res.json({ success: true, file: req.file.filename });
});


// 处理 WebSocket 连接
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

            // 调用 Python 脚本处理音频文件
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

// 启动服务器
server.listen(5501, () => {
    console.log('服务器正在监听端口 5501');
});
