import json
from typing import List
from datetime import datetime
from supabase import create_client, Client
from Crawler import Submission

def load_supabase_config() -> dict:
    """從 settings.json 讀取 Supabase 設定"""
    try:
        from config import load_config
        config = load_config()
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

if __name__ == "__main__":
    # --- 整合測試與上傳區塊 ---
    
    # 1. 讀取設定
    supabase_config = load_supabase_config()
    
    try:
        # 2. 初始化客戶端
        supabase_client = init_supabase_client(supabase_config)
        
        # 3. 使用 SubmissionStore 載入並上傳資料
        from submission_store import SubmissionStore
        store = SubmissionStore()
        
        print("正在載入資料...")
        submissions_data = store.load()
        print(f"成功讀取 {len(submissions_data)} 筆提交紀錄。")
        
        print("開始將資料上傳至 Supabase...")
        store.sync_to_cloud(supabase_client, submissions_data)
        
    except ValueError as e:
        print(f"設定錯誤: {e}")
        print("請確認已經在 settings.json 中填入正確的 Supabase 憑證。")
