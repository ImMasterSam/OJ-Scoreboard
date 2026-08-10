import json
import os
from typing import List
from Crawler import Submission
from supabase import Client
from dataclasses import asdict

class SubmissionStore:
    def __init__(self, json_path: str = "Json/Subs_data.json"):
        self.json_path = json_path
        
        # 確保資料夾存在
        os.makedirs(os.path.dirname(self.json_path), exist_ok=True)

    def save(self, submissions: List[Submission]) -> None:
        """
        將 submissions 依照時間排序，並儲存為 JSON Lines 格式
        """
        if not submissions:
            print("資料蒐集完成，但無任何資料。")
            return
            
        # 依照完成時間排序
        sorted_subs = sorted(submissions, key=lambda x: x.完成時間)
        
        with open(self.json_path, "w+", encoding="utf-8") as f:
            for sub in sorted_subs:
                # 序列化為 json string 並寫入單行
                f.write(json.dumps(asdict(sub), ensure_ascii=False) + "\n")
                
        print(f"完成資料蒐集 ({len(sorted_subs)} 筆) !")

    def load(self) -> List[Submission]:
        """
        從 JSON Lines 檔案讀取 submissions
        """
        submissions = []
        if not os.path.exists(self.json_path):
            return submissions
            
        with open(self.json_path, "r", encoding="utf-8") as f:
            for line in f:
                if line.strip():
                    data = json.loads(line)
                    # 依據 Crawler 的 Submission 欄位建立物件
                    sub = Submission(
                        題目名稱=data.get("題目名稱", ""),
                        完成時間=data.get("完成時間", ""),
                        程式語言=data.get("程式語言", ""),
                        結果=data.get("結果", ""),
                        網站=data.get("網站", ""),
                        網址=data.get("網址", "")
                    )
                    submissions.append(sub)
        return submissions

    def sync_to_cloud(self, client: Client, submissions: List[Submission]) -> None:
        """
        處理去重邏輯，並將資料 upsert 到 Supabase
        """
        if not submissions:
            print("沒有要上傳的提交紀錄 (submissions)。")
            return

        # 去重複 (以 網站, 題目名稱, 完成時間 為複合鍵)
        unique_data = {}
        for sub in submissions:
            key = (sub.網站, sub.題目名稱, sub.完成時間)
            unique_data[key] = asdict(sub)
            
        data = list(unique_data.values())
        
        if len(data) != len(submissions):
            print(f"提示：在 {len(submissions)} 筆資料中，移除了 {len(submissions) - len(data)} 筆重複的資料。")

        try:
            # 執行 upsert
            response = client.table("Submissions").upsert(
                data, 
                on_conflict="網站, 題目名稱, 完成時間"
            ).execute()
            
            print(f"成功更新或插入 (upsert) 了 {len(data)} 筆資料。")
        except Exception as e:
            print(f"上傳至 Supabase 時發生錯誤: {e}")
