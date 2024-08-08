import os
from XfSparkLite_API_module import convert_audio, split_audio, process_chunk
from tqdm import tqdm
from concurrent.futures import ThreadPoolExecutor, as_completed

def process_audio_file(file_path):
    output_folder = "processed_chunks"
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)
    
    # 转换音频
    convert_audio(file_path, file_path)
    # 分割音频
    split_audio(file_path, output_folder)

    chunk_files = [os.path.join(output_folder, f) for f in os.listdir(output_folder)]
    results = [[] for _ in range(len(chunk_files))]  # 使用二维列表来存储每个 chunk 的所有结果

    # 创建进度条
    with tqdm(total=len(chunk_files), desc="Processing") as pbar:
        with ThreadPoolExecutor(max_workers=50) as executor:
            future_to_chunk = {executor.submit(process_chunk, chunk_file, i, results, pbar): (chunk_file, i) for i, chunk_file in enumerate(chunk_files)}

            for future in as_completed(future_to_chunk):
                future.result()

    # 将所有块的结果合并
    transcription = ""
    for chunk_result in results:
        combined_result = ''.join(chunk_result)
        transcription += combined_result.strip() + '\n'

    # 清理处理过的音频块
    for chunk_file in chunk_files:
        os.remove(chunk_file)

    return transcription
