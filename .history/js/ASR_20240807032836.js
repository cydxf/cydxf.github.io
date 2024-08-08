document.getElementById('upload-button').addEventListener('click', () => {
    const fileInput = document.getElementById('audio-upload');
    const file = fileInput.files[0];
    
    if (!file) {
        alert('Please upload an audio file.');
        return;
    }

    const formData = new FormData();
    formData.append('audio', file);

    const progressBar = document.getElementById('progress-bar');
    progressBar.style.width = '0%';

    // 将 URL 修改为你的 Flask 应用的 URL
    const apiUrl = 'https://cydxf.pythonanywhere.com';

    fetch(apiUrl, {
        method: 'POST',
        body: formData
    }).then(response => response.json())
      .then(data => {
          document.getElementById('transcription').textContent = data.transcription;
          progressBar.style.width = '100%';
      })
      .catch(error => {
          console.error('Error:', error);
          alert('Failed to process the audio file.');
      });
});
