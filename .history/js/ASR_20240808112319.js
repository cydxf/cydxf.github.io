document.addEventListener('DOMContentLoaded', function () {
    const uploadForm = document.getElementById('uploadForm');
    const audioFileInput = document.getElementById('audioFile');
    const progressBar = document.getElementById('progressBar');
    const resultText = document.getElementById('resultText');
    const downloadButton = document.getElementById('downloadButton');

    // 处理表单提交事件
    uploadForm.addEventListener('submit', function (event) {
        console.log('Form submit prevented');
    });
});
