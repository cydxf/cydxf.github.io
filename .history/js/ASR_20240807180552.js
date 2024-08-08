document.addEventListener('DOMContentLoaded', function () {
    const uploadForm = document.getElementById('uploadForm');
    const audioFileInput = document.getElementById('audioFile');
    const progressBar = document.getElementById('progressBar');
    const resultText = document.getElementById('resultText');

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
        fetch('/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // 文件上传成功，通知 WebSocket 服务器处理文件
                fetch(`/upload?file=${encodeURIComponent(data.file)}`)
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            // 使用 WebSocket 来处理文件
                            const ws = new WebSocket('ws://localhost:5501');

                            ws.onopen = () => {
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
                                    console.error(message.error);
                                }
                            };
                        } else {
                            console.error('文件处理失败:', data.message);
                        }
                    })
                    .catch(error => {
                        console.error('通知处理失败:', error);
                    });
            } else {
                console.error('文件上传失败:', data.message);
            }
        })
        .catch(error => {
            console.error('上传失败:', error);
        });
    });
});