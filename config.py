import json

def load_config(path: str = "settings.json") -> dict:
    """
    從指定路徑讀取並解析 JSON 設定檔。
    如果檔案不存在或格式錯誤，將會拋出相對應的例外 (FileNotFoundError, json.JSONDecodeError)。
    """
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)
