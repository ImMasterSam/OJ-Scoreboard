import Crawler
import pandas as pd
import concurrent.futures
import os
from rich.progress import Progress, SpinnerColumn, TextColumn

def get_fallback_data(oj_name: str) -> pd.DataFrame:
    """
    從舊有的 JSON 檔案 (Subs_data.json) 中讀取特定 OJ 的歷史資料。
    如果檔案不存在或讀取失敗，則回傳空的 DataFrame，作為爬蟲失敗時的備用方案。
    """
    file_path = "Json/Subs_data.json"
    if not os.path.exists(file_path):
        return pd.DataFrame()
    try:
        # read_json might fail if file is completely empty
        if os.path.getsize(file_path) == 0:
            return pd.DataFrame()
            
        df = pd.read_json(file_path, orient='records', lines=True)
        if '網站' in df.columns:
            oj_df = df[df['網站'] == oj_name]
            return oj_df
        return pd.DataFrame()
    except Exception as e:
        return pd.DataFrame()

def fetch_oj(crawler_func, oj_name: str, progress: Progress, task_id):
    """
    執行單一 OJ 的爬蟲函式，並更新終端機的進度條狀態。
    若爬蟲過程發生錯誤，則攔截錯誤並呼叫 get_fallback_data() 嘗試載入舊資料，避免程式中斷。
    """
    try:
        df = crawler_func()
        progress.update(task_id, completed=1, description=f"[green]✔ 完成 {oj_name} 資料[/green]")
        return df
    except Exception as e:
        # Catch exception and fallback to old data
        progress.update(task_id, completed=1, description=f"[yellow]⚠ {oj_name} 失敗，載入舊資料 ({type(e).__name__})[/yellow]")
        return get_fallback_data(oj_name)

def getSubs():

    print("正在蒐集資料...")

    crawlers = [
        (Crawler.Zerojudge, "Zerojudge"),
        (Crawler.UVa, "UVa"),
        (Crawler.Kattis, "Kattis"),
        (Crawler.TOJ, "TOJ"),
        (Crawler.AtCoder, "AtCoder"),
        (Crawler.CodeForces, "CodeForces")
    ]

    dfs = []
    
    # Set max_workers capped at logical CPUs but max 6
    max_workers = min(6, os.cpu_count() or 1)

    with Progress(
        SpinnerColumn(),
        TextColumn("[progress.description]{task.description}"),
        transient=False
    ) as progress:
        
        futures_to_oj = {}
        with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
            for func, name in crawlers:
                task_id = progress.add_task(f"[cyan]正在獲取 {name} 資料...", total=1)
                future = executor.submit(fetch_oj, func, name, progress, task_id)
                futures_to_oj[future] = name
            
            for future in concurrent.futures.as_completed(futures_to_oj):
                df = future.result()
                if not df.empty:
                    dfs.append(df)

    if dfs:
        total_sub_df = pd.concat(dfs, ignore_index=True)
        if not total_sub_df.empty:
            total_sub_df.sort_values(['完成時間'], inplace=True)

            with open("Json/Subs_data.json", "w+") as f:
                f.write(total_sub_df.to_json(orient='records', lines=True))

            print(f"完成資料蒐集 ({total_sub_df.shape[0]} 筆) !")
        else:
            print("資料蒐集完成，但無任何資料。")
    else:
        print("資料蒐集完成，但無任何資料。")