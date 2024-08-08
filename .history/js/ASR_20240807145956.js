document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('uploadForm');
    const progressBar = document.getElementById('progressBar');
    const resultText = document.getElementById('resultText');

    const ws = new WebSocket('ws://127.0.0.1:5501');

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.progress !== undefined) {
            progressBar.value = data.progress;
        } else if (data.text) {
            resultText.textContent = data.text;
        } else if (data.error) {
            resultText.textContent = `错误: ${data.error}`;
        }
    };

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        const formData = new FormData(form);

        fetch('http://127.0.0.1:5501/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                resultText.textContent = `文件上传成功！路径: ${data.file}`;
                // 发送 WebSocket 消息以开始处理
                ws.send(JSON.stringify({ command: 'start', file: data.file }));
            } else {
                resultText.textContent = '文件上传失败！';
            }
        })
        .catch(error => {
            console.error('发生错误:', error);
            resultText.textContent = '文件上传失败！';
        });
    });
});
