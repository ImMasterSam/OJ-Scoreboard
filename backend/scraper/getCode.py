from scraper import Crawler
import logging
from random import uniform
from time import sleep
from rich.progress import Progress, SpinnerColumn, TextColumn, BarColumn, MofNCompleteColumn


def getCode():
    """
    Code Backfill Pipeline：
    從 Supabase 查詢 code=NULL 的 submissions，
    逐筆透過對應 OJ 的 fetch_code() 抓取程式碼並寫回 Supabase。
    """

    print("正在補抓程式碼...")

    # 讀取帳號密碼
    try:
        from core.config import load_config
        user_data = load_config()
    except FileNotFoundError:
        print("CRITICAL ERROR: settings.json not found!")
        return

    # 初始化 Supabase 客戶端
    try:
        from services.upload_to_supabase import load_supabase_config, init_supabase_client
        supabase_config = load_supabase_config()
        supabase_client = init_supabase_client(supabase_config)
    except Exception as e:
        print(f"無法連接 Supabase: {e}")
        logging.error(f"Failed to initialize Supabase client for code backfill: {e}")
        return

    # 建立支援 code fetch 的 fetcher 字典（OJ 名稱 -> fetcher 實例）
    fetcher_map = {
        "Zerojudge": Crawler.ZerojudgeFetcher(user_data.get('Zerojudge', {})),
        # 未來在此新增其他 OJ 的 fetcher
        # "TOJ": Crawler.TOJFetcher(user_data.get('TOJ', {})),
        # "AtCoder": Crawler.AtCoderFetcher(user_data.get('AtCoder', {})),
        # "CodeForces": Crawler.CodeForcesFetcher(user_data.get('CodeForces', {})),
        # "CSES": Crawler.CSESFetcher(user_data.get('CSES', {})),
        # "LeetCode": Crawler.LeetCodeFetcher(user_data.get('LeetCode', {})),
        # "Kattis": Crawler.KattisFetcher(user_data.get('Kattis', {})),
    }

    # 過濾出支援 code fetch 的 OJ
    supported_ojs = {name: fetcher for name, fetcher in fetcher_map.items() if fetcher.supports_code_fetch}

    if not supported_ojs:
        print("目前沒有 OJ 支援程式碼抓取。")
        return

    # 從 Supabase 查詢 code=NULL 的 submissions（只查詢支援的 OJ）
    try:
        response = supabase_client.table("Submissions") \
            .select("id, 網站") \
            .is_("Code", "null") \
            .in_("網站", list(supported_ojs.keys())) \
            .execute()
        
        pending_submissions = response.data
    except Exception as e:
        print(f"查詢 Supabase 時發生錯誤: {e}")
        logging.error(f"Failed to query code=NULL submissions from Supabase: {e}")
        return

    if not pending_submissions:
        print("所有 submissions 的程式碼都已抓取完畢，無需補抓。")
        return

    print(f"找到 {len(pending_submissions)} 筆需要補抓程式碼的 submissions。")
    
    # 按網站分組
    grouped = {}
    for sub in pending_submissions:
        oj_name = sub["網站"]
        if oj_name not in grouped:
            grouped[oj_name] = []
        grouped[oj_name].append(sub)

    success_count = 0
    fail_count = 0
    skip_count = 0

    with Progress(
        SpinnerColumn(),
        TextColumn("[progress.description]{task.description}"),
        BarColumn(),
        MofNCompleteColumn(),
        transient=False
    ) as progress:

        for oj_name, submissions in grouped.items():
            fetcher = supported_ojs[oj_name]
            task_id = progress.add_task(
                f"[cyan]正在補抓 {oj_name} 程式碼...",
                total=len(submissions)
            )

            for sub in submissions:
                submission_id = sub["id"]

                try:
                    code = fetcher.fetch_code(submission_id)

                    if code is None:
                        skip_count += 1
                        progress.advance(task_id)
                        continue

                    # 逐筆寫回 Supabase
                    supabase_client.table("Submissions") \
                        .update({"Code": code}) \
                        .eq("網站", oj_name) \
                        .eq("id", submission_id) \
                        .execute()

                    success_count += 1

                except Exception as e:
                    logging.error(f"<{oj_name}> Failed to backfill code for submission {submission_id}: {e}")
                    fail_count += 1

                progress.advance(task_id)

                # 隨機延遲 1~3 秒，避免觸發 rate limit
                sleep(uniform(1, 3))

            progress.update(task_id, description=f"[green]✔ 完成 {oj_name} 程式碼補抓[/green]")

    print(f"程式碼補抓完成！成功: {success_count} 筆, 失敗: {fail_count} 筆, 跳過: {skip_count} 筆")
    logging.info(f"Code backfill completed: success={success_count}, failed={fail_count}, skipped={skip_count}")
