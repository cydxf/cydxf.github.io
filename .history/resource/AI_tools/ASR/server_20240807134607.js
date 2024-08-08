const express = require('express');
const WebSocket = require('ws');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// 初始化 Express 应用
const app = express();
const port = 3000;

// 文件上传配置
const upload = multer({ dest: 'uploads/' });

// 前端资源静态文件服务
app.use(express.static('public'));

// 语音识别处理
app.post('/upload', upload.single('audioFile'), (req, res) => {
    const inputFile = req.file.path;
    const outputFile = `output/${path.basename(req.file.originalname, path.extname(req.file.originalname))}.txt`;

    // 调用 Python 脚本进行语音识别
    exec(`python process_audio.py ${inputFile} ${outputFile}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return res.status(500).send('Internal Server Error');
        }

        // 识别完成后返回结果文件
        res.download(outputFile, () => {
            fs.unlinkSync(inputFile); // 删除上传的文件
            fs.unlinkSync(outputFile); // 删除识别后的文本文件
        });
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
