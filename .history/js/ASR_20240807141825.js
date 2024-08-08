// ASR.js
async function uploadFile(file) {
    const formData = new FormData();
    formData.append('audioFile', file);

    try {
        const response = await fetch('http://127.0.0.1:5501/upload', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log('File uploaded successfully:', data);
    } catch (error) {
        console.error('Error uploading file:', error);
    }
}
