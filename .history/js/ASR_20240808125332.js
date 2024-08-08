document.addEventListener('DOMContentLoaded', function () {
    const uploadButton = document.getElementById('uploadButton');
    const audioFileInput = document.getElementById('audioFile');
    const progressBar = document.getElementById('progressBar');
    const resultText = document.getElementById('resultText');
    const downloadButton = document.getElementById('downloadButton');
    let ws;

    uploadButton.addEventListener('click', function () {
        const file = audioFileInput.files[0];
        if (!file) {
            alert('请先选择一个音频文件！');
            return;
        }

        const formData = new FormData();
        formData.append('audioFile', file);

        fetch('http://localhost:5501/api/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log('文件上传成功:', data.file);

                ws = new WebSocket('ws://localhost:5501');

                ws.onopen = () => {
                    console.log('WebSocket 连接已建立');
                    ws.send(JSON.stringify({ command: 'start', file: data.file }));

                    // 定期发送心跳消息
                    setInterval(() => {
                        if (ws.readyState === WebSocket.OPEN) {
                            ws.send(JSON.stringify({ command: 'heartbeat' }));
                        }
                    }, 30000); // 每30秒发送一次心跳
                };

                ws.onmessage = (event) => {
                    const message = JSON.parse(event.data);

                    if (message.progress !== undefined) {
                        progressBar.value = message.progress;
                    }

                    if (message.text) {
                        resultText.textContent = message.text;

                        downloadButton.style.display = 'block';
                        downloadButton.onclick = () => {
                            const blob = new Blob([message.text], { type: 'text/plain' });
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
