// server.js (放在 Blog/resource/AI_tools/ASR/ 目录下)
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');

// 初始化 Express 应用
const app = express();
const port = 5501;

// 启用 CORS
app.use(cors());

// 配置 multer 处理文件上传
const upload = multer({ dest: path.join(__dirname, 'wav/') });

// 处理文件上传请求
app.post('/upload', upload.single('audioFile'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: '没有上传文件' });
    }
    res.json({ success: true, file: req.file.filename });
});

// 启动 Express 服务器
app.listen(port, () => {
    console.log(`服务器正在运行在 http://127.0.0.1:${port}/`);
});
