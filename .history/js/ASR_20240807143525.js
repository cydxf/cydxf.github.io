document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('uploadForm');
    const progressBar = document.getElementById('progressBar');
    const resultText = document.getElementById('resultText');

    form.addEventListener('submit', (event) => {
        event.preventDefault(); // 阻止默认表单提交

        const formData = new FormData(form);

        fetch('http://127.0.0.1:5501/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                resultText.textContent = `文件上传成功！路径: ${data.file}`;
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
