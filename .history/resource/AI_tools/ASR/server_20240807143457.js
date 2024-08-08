const express = require('express');
const multer = require('multer');
const cors = require('cors');
const app = express();
const port = 5501;

// 设置 CORS 中间件来处理跨域问题
app.use(cors()); // 允许所有来源的请求

// 设置 Multer 中间件来处理文件上传
const upload = multer({ dest: 'Blog/uploads/' }); // 文件将被存储在 Blog/uploads 文件夹中

// 处理文件上传的路由
app.post('/upload', upload.single('audioFile'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: '请上传文件' });
    }

    // 在这里，你可以进一步处理文件
    console.log('文件上传成功:', req.file);

    // 返回文件信息
    res.json({ success: true, file: req.file.path });
});

// 启动服务器
app.listen(port, () => {
    console.log(`服务器正在监听 http://127.0.0.1:${port}`);
});
