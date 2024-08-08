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

    fetch('/upload', {
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

document.getElementById('download-button').addEventListener('click', () => {
    const transcription = document.getElementById('transcription').value;
    const blob = new Blob([transcription], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transcription.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
});
