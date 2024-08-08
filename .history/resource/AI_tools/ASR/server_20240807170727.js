const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const uuid = require('uuid');

const app = express();
const uploadDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

app.use(express.static(path.join(__dirname, '../../../')));
app.use(fileUpload());

let progressMap = new Map();

app.post('/upload', (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('没有文件被上传');
    }

    const audioFile = req.files.audioFile;
    const fileId = uuid.v4();
    const filePath = path.join(uploadDir, `${fileId}_${audioFile.name}`);
    const resultFilePath = path.join(uploadDir, `${fileId}_result.txt`);

    audioFile.mv(filePath, (err) => {
        if (err) return res.status(500).send(err);

        const progressInterval = setIntervalId();
        progressMap.set(progressInterval, { progress: 0 });

        const process = spawn('python3', ['process_audio.py', filePath, resultFilePath, progressInterval]);

        process.on('close', (code) => {
            progressMap.set(progressInterval, { progress: 100, resultFilePath });
        });

        res.json({ progressInterval, downloadUrl: `/download/${progressInterval}` });
    });
});

app.get('/progress/:interval', (req, res) => {
    const progressInterval = req.params.interval;
    if (progressMap.has(progressInterval)) {
        res.json(progressMap.get(progressInterval));
    } else {
        res.status(404).send('未找到进度');
    }
});

app.get('/download/:interval', (req, res) => {
    const progressInterval = req.params.interval;
    if (progressMap.has(progressInterval)) {
        const { resultFilePath } = progressMap.get(progressInterval);
        if (resultFilePath && fs.existsSync(resultFilePath)) {
            res.download(resultFilePath, 'result.txt');
        } else {
            res.status(404).send('结果文件未生成');
        }
    } else {
        res.status(404).send('未找到进度');
    }
});

const setIntervalId = () => {
    return `${Date.now()}-${uuid.v4()}`;
};

app.listen(3000, () => {
    console.log('服务器已启动，访问 http://localhost:3000');
});
