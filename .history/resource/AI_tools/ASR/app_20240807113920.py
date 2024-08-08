from flask import Flask, request, jsonify, render_template
import os
from ASR_system import process_audio_file

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('../../../ASR.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"})
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"})
    if file:
        file_path = os.path.join("uploads", file.filename)
        file.save(file_path)
        transcription = process_audio_file(file_path)
        os.remove(file_path)  # 清理上传的文件
        return jsonify({"transcription": transcription})
    return jsonify({"error": "File upload failed"})

if __name__ == '__main__':
    pass
