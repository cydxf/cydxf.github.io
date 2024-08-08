import os
import sys
from datetime import datetime
import json
import base64
import hmac
import hashlib
import websocket
from concurrent.futures import ThreadPoolExecutor, as_completed
from pydub import AudioSegment
from tqdm import tqdm

class Ws_Param(object):
    def __init__(self, APPID, APIKey, APISecret):
        self.APPID = APPID
        self.APIKey = APIKey
        self.APISecret = APISecret

        # 公共参数(common)
        self.CommonArgs = {"app_id": self.APPID}
        # 业务参数(business)
        self.BusinessArgs = {"domain": "iat", "language": "zh_cn", "accent": "mandarin", "vinfo": 1, "vad_eos": 10000}

    def create_url(self):
        url = 'wss://ws-api.xfyun.cn/v2/iat'
        now = datetime.now()
        date = format_date_time(mktime(now.timetuple()))

        signature_origin = "host: ws-api.xfyun.cn\n"
        signature_origin += "date: " + date + "\n"
        signature_origin += "GET /v2/iat HTTP/1.1"
        signature_sha = hmac.new(self.APISecret.encode('utf-8'), signature_origin.encode('utf-8'),
                                 digestmod=hashlib.sha256).digest()
        signature_sha = base64.b64encode(signature_sha).decode(encoding='utf-8')

        authorization_origin = "api_key=\"%s\", algorithm=\"%s\", headers=\"%s\", signature=\"%s\"" % (
            self.APIKey, "hmac-sha256", "host date request-line", signature_sha)
        authorization = base64.b64encode(authorization_origin.encode('utf-8')).decode(encoding='utf-8')
        v = {
            "authorization": authorization,
            "date": date,
            "host": "ws-api.xfyun.cn"
        }
        url = url + '?' + urlencode(v)
        return url

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
    wsParam = Ws_Param(APPID='91f7bf93', APIKey='03d0245a398713654de95df630faaf30', APISecret='MGI0NGRiNDgxNDAzMjk5ZjZiZTc4NTVk')

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
                                on_error=lambda ws, err: print(f"WebSocket 错误: {err}"),
                                on_close=lambda ws, a, b: print(f"WebSocket 关闭: {a}, {b}"))
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

    # 确保输出目录存在
    output_dir = os.path.dirname(output_txt_file)
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    # 写入结果
    with open(output_txt_file, "w", encoding="utf-8") as f:
        for chunk_result in results:
            combined_result = ''.join(chunk_result)
            f.write(combined_result.strip() + '\n')