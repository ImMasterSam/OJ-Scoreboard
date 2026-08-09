import json
from typing import List
from datetime import datetime
from supabase import create_client, Client
from Crawler import Submission
import dateutil.parser

def load_supabase_config() -> dict:
    """從 settings.json 讀取 Supabase 設定"""
    try:
        with open("settings.json", "r") as f:
            config = json.load(f)
            return config.get("Supabase", {})
    except FileNotFoundError:
        print("錯誤：找不到 settings.json 檔案。")
        return {}
    except json.JSONDecodeError:
        print("錯誤：settings.json 格式無效。")
        return {}

def init_supabase_client(config: dict) -> Client:
    """初始化 Supabase 客戶端"""
    url: str = config.get("Url")
    key: str = config.get("Key")
    
    if not url or not key or url == "YOUR_SUPABASE_URL":
        raise ValueError("必須在 settings.json 中提供 Supabase 的 Url 和 Key")
        
    return create_client(url, key)

def standardize_timestamp(date_str: str) -> str:
    """
    將各種時間字串格式統一標準化為 YYYY-MM-DD HH:MM:SS。
    使用 dateutil.parser 來自動猜測與解析時間格式。
    """
    if not date_str:
        return ""
    
    try:
        # dateutil.parser 可以處理 ISO 格式、包含或不含秒數的字串等
        dt = dateutil.parser.parse(date_str)
        return dt.strftime('%Y-%m-%d %H:%M:%S')
    except (ValueError, TypeError) as e:
        print(f"警告：無法解析時間字串 '{date_str}': {e}")
        return date_str # 若解析失敗則回傳原始字串

def upload_submissions(client: Client, submissions: List[Submission]) -> None:
    """
    將 Submission 物件的列表上傳到 Supabase 資料庫。
    使用 upsert 根據複合唯一鍵 ("網站", "題目名稱", "完成時間") 
    來更新現有記錄或插入新記錄。
    """
    if not submissions:
        print("沒有要上傳的提交紀錄 (submissions)。")
        return

    # 將 Submission dataclass 轉換為符合 Supabase 資料表綱要的字典 (dictionary)
    # 同時過濾掉陣列中重複的鍵值 (網站, 題目名稱, 完成時間) 避免 Postgres ON CONFLICT 報錯
    unique_data = {}
    for sub in submissions:
        std_time = standardize_timestamp(sub.完成時間)
        key = (sub.網站, sub.題目名稱, std_time)
        unique_data[key] = {
            "題目名稱": sub.題目名稱,
            "完成時間": std_time,
            "程式語言": sub.程式語言,
            "結果": sub.結果,
            "網站": sub.網站,
            "網址": sub.網址
        }
    
    data = list(unique_data.values())
    
    if len(data) != len(submissions):
        print(f"提示：在 {len(submissions)} 筆資料中，移除了 {len(submissions) - len(data)} 筆重複的資料。")

    try:
        # 執行 upsert
        # 注意：'on_conflict' 需要資料庫中的這些欄位具有 Unique Constraint (唯一限制)
        response = client.table("Submissions").upsert(
            data, 
            on_conflict="網站, 題目名稱, 完成時間"
        ).execute()
        
        print(f"成功更新或插入 (upsert) 了 {len(data)} 筆資料。")
        # print("回應 (Response):", response)
    except Exception as e:
        print(f"上傳至 Supabase 時發生錯誤: {e}")

if __name__ == "__main__":
    # --- 整合測試與上傳區塊 ---
    
    # 1. 讀取設定
    supabase_config = load_supabase_config()
    
    try:
        # 2. 初始化客戶端
        supabase_client = init_supabase_client(supabase_config)
        
        # 3. 讀取 Json/Subs_data.json 的資料 (JSON Lines 格式)
        submissions_data = []
        file_path = "Json/Subs_data.json"
        
        print(f"正在從 {file_path} 讀取資料...")
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                for line in f:
                    if line.strip():
                        # 解析每一行的 JSON 物件並轉換為 Submission dataclass
                        row_dict = json.loads(line)
                        submissions_data.append(Submission(**row_dict))
            print(f"成功讀取 {len(submissions_data)} 筆提交紀錄。")
        except FileNotFoundError:
            print(f"錯誤：找不到檔案 {file_path}")
            exit(1)
        
        # 4. 上傳資料
        print("開始將資料上傳至 Supabase...")
        upload_submissions(supabase_client, submissions_data)
        
    except ValueError as e:
        print(f"設定錯誤: {e}")
        print("請確認已經在 settings.json 中填入正確的 Supabase 憑證。")
