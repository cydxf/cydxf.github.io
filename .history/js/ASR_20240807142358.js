// ASR.js
document.getElementById('uploadButton').addEventListener('click', () => {
    const fileInput = document.getElementById('fileInput');
    const formData = new FormData();
    formData.append('audioFile', fileInput.files[0]);

    fetch('http://127.0.0.1:5501/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log('文件上传成功:', data.file);
            // 在这里添加调用语音识别功能的代码
        } else {
            console.error('文件上传失败:', data.message);
        }
    })
    .catch(error => {
        console.error('发生错误:', error);
    });
});
