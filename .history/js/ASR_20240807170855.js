document.addEventListener('DOMContentLoaded', function () {
    const uploadForm = document.getElementById('uploadForm');
    const audioFileInput = document.getElementById('audioFile');
    const progressBar = document.getElementById('progressBar');
    const resultText = document.getElementById('resultText');
    const progressContainer = document.getElementById('progressContainer');
    let progressInterval;

    uploadForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const file = audioFileInput.files[0];
        if (!file) {
            alert('请先选择一个音频文件！');
            return;
        }

        const formData = new FormData();
        formData.append('audioFile', file);

        fetch('/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.progressInterval) {
                progressInterval = data.progressInterval;
                const downloadUrl = data.downloadUrl;

                // 初始化进度条
                progressBar.value = 0;
                progressBar.max = 100;

                // 定期获取进度
                const checkProgress = () => {
                    fetch(`/progress/${progressInterval}`)
                        .then(response => response.json())
                        .then(progressData => {
                            if (progressData.progress < 100) {
                                progressBar.value = progressData.progress;
                                setTimeout(checkProgress, 1000); // 每秒检查一次
                            } else {
                                progressBar.value = 100;
                                resultText.innerHTML = `<a href="${downloadUrl}" download>点击下载识别结果</a>`;
                            }
                        });
                };

                checkProgress();
            }
        })
        .catch(error => {
            console.error('上传失败:', error);
        });
    });
});
