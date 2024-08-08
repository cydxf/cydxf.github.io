document.getElementById('uploadForm').addEventListener('submit', function(event) {
    event.preventDefault();
    let fileInput = document.getElementById('audioFile');
    let file = fileInput.files[0];
    if (file) {
        let formData = new FormData();
        formData.append('audioFile', file);
        fetch('/upload', {
            method: 'POST',
            body: formData
        }).then(response => response.json())
          .then(data => {
              if (data.success) {
                  let ws = new WebSocket('ws://localhost:8080');
                  ws.onopen = function() {
                      ws.send(JSON.stringify({ command: 'start', file: data.file }));
                  };
                  ws.onmessage = function(event) {
                      let result = JSON.parse(event.data);
                      if (result.progress !== undefined) {
                          document.getElementById('progressBar').value = result.progress;
                      } else if (result.text !== undefined) {
                          document.getElementById('resultText').textContent = result.text;
                      }
                  };
                  ws.onclose = function() {
                      console.log('WebSocket connection closed');
                  };
              }
          });
    }
});
