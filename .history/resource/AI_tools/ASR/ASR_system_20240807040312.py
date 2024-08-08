import os
from XfSparkLite_API_module import convert_audio, split_audio, process_chunk  # 调用之前开发的模块函数

def process_audio_file(file_path):
    output_folder = "processed_chunks"
    convert_audio(file_path, file_path)
    split_audio(file_path, output_folder)

    chunk_files = [os.path.join(output_folder, f) for f in os.listdir(output_folder)]
    results = []

    for i, chunk_file in enumerate(chunk_files):
        result = process_chunk(chunk_file, i)
        results.append(result)

    transcription = ''.join(results)
    return transcription
