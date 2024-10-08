// js/main.js
import { initializeWebSocket, sendMessage } from './wsManager.js';

document.addEventListener('DOMContentLoaded', function () {
    const uploadButton = document.getElementById('uploadButton');
    const audioFileInput = document.getElementById('audioFile');
    const progressBar = document.getElementById('progressBar');
    const resultText = document.getElementById('resultText');
    const downloadButton = document.getElementById('downloadButton');

    initializeWebSocket('ws://localhost:5501', (message) => {
        if (message.progress !== undefined) {
            progressBar.value = message.progress;
        }

        if (message.data && message.data.result && message.data.result.ws) {
            const words = message.data.result.ws.map(item => item.cw.map(word => word.w).join('')).join('');
            resultText.textContent = words;

            downloadButton.style.display = 'block';
            downloadButton.onclick = () => {
                const blob = new Blob([words], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'result.txt';
                a.click();
                URL.revokeObjectURL(url);
            };
        }

        if (message.error) {
            console.error('WebSocket 错误:', message.error);
        }
    }, (error) => {
        console.error('WebSocket 错误:', error);
    }, () => {
        console.log('WebSocket 连接关闭，正在尝试重连');
    });

    uploadButton.addEventListener('click', function () {
        const file = audioFileInput.files[0];
        if (!file) {
            alert('请先选择一个音频文件！');
            return;
        }

        const formData = new FormData();
        formData.append('audioFile', file);

        fetch('http://localhost:5501/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log('文件上传成功:', data.file);
                sendMessage({ command: 'start', file: data.file });
            } else {
                console.error('文件上传失败:', data.message);
            }
        })
        .catch(error => {
            console.error('上传失败:', error);
        });
    });
});
