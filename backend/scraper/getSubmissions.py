from scraper import Crawler
import concurrent.futures
import os
import logging
from rich.progress import Progress, SpinnerColumn, TextColumn
import json
from dataclasses import asdict

def get_fallback_data(oj_name: str) -> list[Crawler.Submission]:
    """
    從舊有的 JSON 檔案 (Subs_data.json) 中讀取特定 OJ 的歷史資料。
    如果檔案不存在或讀取失敗，則回傳空的 list，作為爬蟲失敗時的備用方案。
    """
    try:
        from services.submission_store import SubmissionStore
        store = SubmissionStore()
        all_subs = store.load()
        return [sub for sub in all_subs if sub.網站 == oj_name]
    except Exception as e:
        logging.error(f"Failed to load fallback data for {oj_name}: {e}")
        return []

def fetch_oj(fetcher: Crawler.OnlineJudgeFetcher, oj_name: str, progress: Progress, task_id) -> list[Crawler.Submission]:
    """
    執行單一 OJ 的爬蟲函式，並更新終端機的進度條狀態。
    若爬蟲過程發生錯誤，則攔截錯誤並呼叫 get_fallback_data() 嘗試載入舊資料，避免程式中斷。
    """
    logging.info(f"<{oj_name}> : Start fetching submissions ......")
    try:
        data = fetcher.fetch()
        logging.info(f"<{oj_name}> : Submissions fetching COMPLETE  :) ( {len(data)} subs )")
        progress.update(task_id, completed=1, description=f"[green]✔ 完成 {oj_name} 資料[/green]")
        return data
    except Exception as e:
        # Catch exception and fallback to old data
        logging.error(f"<{oj_name}> : Unable to fetch submissions :( - {type(e).__name__}: {str(e)}")
        progress.update(task_id, completed=1, description=f"[yellow]⚠ {oj_name} 失敗，載入舊資料 ({type(e).__name__})[/yellow]")
        return get_fallback_data(oj_name)

def getSubs():

    print("正在蒐集資料...")
    
    # 讀取帳號密碼
    try:
        from core.config import load_config
        user_data = load_config()
    except FileNotFoundError:
        print("CRITICAL ERROR: settings.json not found!")
        return

    crawlers = [
        (Crawler.ZerojudgeFetcher(user_data.get('Zerojudge', {})), "Zerojudge"),
        (Crawler.UVaFetcher(user_data.get('UVa', {})), "UVa"),
        (Crawler.KattisFetcher(user_data.get('Kattis', {})), "Kattis"),
        (Crawler.TOJFetcher(user_data.get('TOJ', {})), "TOJ"),
        (Crawler.AtCoderFetcher(user_data.get('AtCoder', {})), "AtCoder"),
        (Crawler.CodeForcesFetcher(user_data.get('CodeForces', {})), "CodeForces")
    ]

    all_submissions = []
    
    # Set max_workers capped at logical CPUs but max 6
    max_workers = min(6, os.cpu_count() or 1)

    with Progress(
        SpinnerColumn(),
        TextColumn("[progress.description]{task.description}"),
        transient=False
    ) as progress:
        
        futures_to_oj = {}
        with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
            for fetcher, name in crawlers:
                task_id = progress.add_task(f"[cyan]正在獲取 {name} 資料...", total=1)
                future = executor.submit(fetch_oj, fetcher, name, progress, task_id)
                futures_to_oj[future] = name
            
            for future in concurrent.futures.as_completed(futures_to_oj):
                data = future.result()
                if data:
                    all_submissions.extend(data)

    if all_submissions:
        from services.submission_store import SubmissionStore
        store = SubmissionStore()
        store.save(all_submissions)
    else:
        print("資料蒐集完成，但無任何資料。")