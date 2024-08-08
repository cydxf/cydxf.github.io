document.addEventListener('DOMContentLoaded', function () {
    const uploadForm = document.getElementById('uploadForm');
    const audioFileInput = document.getElementById('audioFile');
    const progressBar = document.getElementById('progressBar');
    const resultText = document.getElementById('resultText');
const cors = require('cors');
app.use(cors());

    uploadForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const file = audioFileInput.files[0];
        if (!file) {
            alert('请先选择一个音频文件！');
            return;
        }

        const formData = new FormData();
        formData.append('audioFile', file);

        // 上传文件
        fetch('http://localhost:5501/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log('文件上传成功:', data.file);

                // 文件上传成功，通知 WebSocket 服务器处理文件
                const ws = new WebSocket('ws://localhost:5501');

                ws.onopen = () => {
                    console.log('WebSocket 连接已建立');
                    ws.send(JSON.stringify({ command: 'start', file: data.file }));
                };

                ws.onmessage = (event) => {
                    const message = JSON.parse(event.data);

                    if (message.progress !== undefined) {
                        progressBar.value = message.progress;
                    }

                    if (message.text) {
                        resultText.textContent = message.text;
                    }

                    if (message.error) {
                        console.error('WebSocket 错误:', message.error);
                    }
                };

                ws.onerror = (error) => {
                    console.error('WebSocket 错误:', error);
                };

                ws.onclose = () => {
                    console.log('WebSocket 连接关闭');
                };
            } else {
                console.error('文件上传失败:', data.message);
            }
        })
        .catch(error => {
            console.error('上传失败:', error);
        });
    });
});
