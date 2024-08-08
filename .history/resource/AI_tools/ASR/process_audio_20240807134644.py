import sys
import os
import websocket
import json
import base64
import hmac
import hashlib
import datetime
from pydub import AudioSegment
from concurrent.futures import ThreadPoolExecutor, as_completed
from tqdm import tqdm

def convert_audio(input_file, output_file):
    audio = AudioSegment.from_file(input_file)
    audio = audio.set_frame_rate(16000).set_channels(1).set_sample_width(2)
    audio.export(output_file, format="wav")

def split_audio(input_file, output_folder, chunk_length_ms=60000):
    audio = AudioSegment.from_file(input_file)
    duration_ms = len(audio)
    chunks = duration_ms // chunk_length_ms + (1 if duration_ms % chunk_length_ms != 0 else 0)

    if not os.path.exists(output_folder):
        os.makedirs(output_folder)

    for i in range(chunks):
        start_time = i * chunk_length_ms
        end_time = min(start_time + chunk_length_ms, duration_ms)
        chunk = audio[start_time:end_time]
        chunk.export(os.path.join(output_folder, f"chunk_{i}.wav"), format="wav")

def process_chunk(chunk_path, index, results):
    wsParam = Ws_Param(APPID='your_app_id', APIKey='your_api_key', APISecret='your_api_secret')

    def on_open(ws):
        def run():
            frameSize = 8000
            interval = 0.0001
            status = STATUS_FIRST_FRAME

            with open(chunk_path, "rb") as fp:
                while True:
                    buf = fp.read(frameSize)
                    if not buf:
                        status = STATUS_LAST_FRAME

                    if status == STATUS_FIRST_FRAME:
                        d = {"common": wsParam.CommonArgs,
                             "business": wsParam.BusinessArgs,
                             "data": {"status": 0, "format": "audio/L16;rate=16000",
                                      "audio": str(base64.b64encode(buf), 'utf-8'),
                                      "encoding": "raw"}}
                        ws.send(json.dumps(d))
                        status = STATUS_CONTINUE_FRAME
                    elif status == STATUS_CONTINUE_FRAME:
                        d = {"data": {"status": 1, "format": "audio/L16;rate=16000",
                                      "audio": str(base64.b64encode(buf), 'utf-8'),
                                      "encoding": "raw"}}
                        ws.send(json.dumps(d))
                    elif status == STATUS_LAST_FRAME:
                        d = {"data": {"status": 2, "format": "audio/L16;rate=16000",
                                      "audio": str(base64.b64encode(buf), 'utf-8'),
                                      "encoding": "raw"}}
                        ws.send(json.dumps(d))
                        break

                    time.sleep(interval)

            ws.close()

        ws.on_open = on_open
        ws.run_forever()

    wsUrl = wsParam.create_url()
    ws = websocket.WebSocketApp(wsUrl,
                                on_message=lambda ws, msg: on_message(ws, msg, index, results),
                                on_error=on_error,
                                on_close=lambda ws, a, b: on_close(ws, a, b, chunk_path))
    ws.run_forever()

if __name__ == "__main__":
    input_audio_file = sys.argv[1]
    output_txt_file = sys.argv[2]

    convert_audio(input_audio_file, 'converted.wav')
    split_audio('converted.wav', 'chunks')

    chunk_files = [os.path.join('chunks', f"chunk_{i}.wav") for i in range(len(os.listdir('chunks')))]
    results = []

    with tqdm(total=len(chunk_files), desc="Processing") as pbar:
        with ThreadPoolExecutor(max_workers=50) as executor:
            future_to_chunk = {executor.submit(process_chunk, chunk_file, index, results): (chunk_file, index) for index, chunk_file in enumerate(chunk_files)}

            for future in as_completed(future_to_chunk):
                future.result()

    with open(output_txt_file, "w", encoding="utf-8") as f:
        for chunk_result in results:
            combined_result = ''.join(chunk_result)
            f.write(combined_result.strip() + '\n')
