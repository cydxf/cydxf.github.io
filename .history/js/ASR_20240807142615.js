// ASR.js
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('uploadForm');
    const audioFileInput = document.getElementById('audioFile');
    const progressBar = document.getElementById('progressBar');
    const resultText = document.getElementById('resultText');

    if (!form || !audioFileInput || !progressBar || !resultText) {
        console.error('找不到页面中的必要元素');
        return;
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault(); // 防止默认的表单提交

        const file = audioFileInput.files[0];
        if (!file) {
            alert('请先选择一个音频文件。');
            return;
        }

        // 上传音频文件
        const formData = new FormData();
        formData.append('audioFile', file);

        try {
            const uploadResponse = await fetch('http://127.0.0.1:5501/upload', {
                method: 'POST',
                body: formData
            });

            if (!uploadResponse.ok) {
                throw new Error('文件上传失败');
            }

            const uploadData = await uploadResponse.json();
            if (!uploadData.success) {
                throw new Error(uploadData.message);
            }

            console.log('文件上传成功:', uploadData.file);

            // 开始识别
            await startRecognition(uploadData.file);

        } catch (error) {
            console.error('发生错误:', error);
            alert('文件上传或识别失败: ' + error.message);
        }
    });

    async function startRecognition(fileUrl) {
        try {
            // 创建 WebSocket 连接
            const ws = new WebSocket('ws://127.0.0.1:5501/recognize'); // 假设这个地址是 WebSocket 服务器的地址

            ws.onopen = () => {
                console.log('WebSocket 连接已打开');

                // 发送识别请求
                ws.send(JSON.stringify({ action: 'start', fileUrl }));

                ws.onmessage = (event) => {
                    const data = JSON.parse(event.data);

                    if (data.progress !== undefined) {
                        // 更新进度条
                        progressBar.value = data.progress;
                    }

                    if (data.result) {
                        // 显示识别结果
                        resultText.textContent += data.result + '\n';
                    }

                    if (data.complete) {
                        console.log('识别完成');
                        progressBar.value = 100;
                    }
                };

                ws.onerror = (error) => {
                    console.error('WebSocket 错误:', error);
                    alert('识别过程中发生错误: ' + error.message);
                };

                ws.onclose = () => {
                    console.log('WebSocket 连接关闭');
                };
            };

        } catch (error) {
            console.error('WebSocket 连接或识别失败:', error);
            alert('识别失败: ' + error.message);
        }
    }
});
