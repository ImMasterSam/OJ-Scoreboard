import mysql.connector
import mysql.connector.cursor
import pandas as pd
from threading import Thread

from datetime import datetime
import json
from os import getcwd
from win11toast import notify
import logging

import Crawler

OJ_LIST = ['Zerojudge', 'UVa', 'Kattis', 'TOJ', 'AtCoder', 'CodeForces']
ICON = {
    'src': f'{getcwd().replace('\\', '/')}/Assets/Icon.ico',
    'placement': 'appLogoOverride'
}

SubsData_path = 'Json/Subs_data.json'
UpdateTime_path = 'Json/update_time.json'

# 檢查是否需要更新資料
def check_lastest_update() -> None:

    logging.info('Checking all possible Updates ......')

    lastest_time = dict()
    notifyErrors: list[str] = []
    threads: list[Thread] = [None] * len(OJ_LIST)
    
    with open(SubsData_path, "r") as f:
        content = "".join(f.readlines())
        subs_data = json.loads(content)

    with open(UpdateTime_path, "r") as f:
        content = "".join(f.readlines())
        lastest_time = json.loads(content)
    
    # 檢查最後 OJ 讀取時間
    for i in range(len(OJ_LIST)):

        website = OJ_LIST[i]

        if getDeltaHour(lastest_time['Submissions'][website]) >= 12:
            
            threads[i] = Thread(target=getSubs, args=(website, subs_data, notifyErrors, lastest_time))
            threads[i].start()

    for thread in threads:
        if thread is not None:
            thread.join()

    json.dump(subs_data, open(SubsData_path, 'w+'), indent = 4)
    
    # 檢查最後 SQL 資料庫更新時間
    if getDeltaHour(lastest_time['SQL']) >= 12:

        try:
            updateSQL()
            lastest_time["SQL"] = datetime.now().strftime("%Y/%m/%d %H:%M:%S")
        except:
            notifyErrors.append('無法上傳資料至 SQL 資料庫')

    with open(UpdateTime_path, "w") as f:
        json.dump(lastest_time, f, indent = 4)

    
    if notifyErrors != []:
        notify(title = "Online Judge 爬蟲", body = f"錯誤資訊 :\n{'\n'.join(notifyErrors)}", icon = ICON)

    logging.info(f'COMPLETE all possible updates :)')



# 更新 Excel 檔案
def updateExcel(file_path: str, sheet_name: str, index: bool) -> None: 

    logging.info(f'Uploading submissions to excel file (\'{file_path}\')')

    # 讀取 json 檔
    df = pd.read_json(SubsData_path, lines = True)
    df.sort_values(['完成時間'], inplace = True)
    print(df)
    df.to_excel(file_path, sheet_name=sheet_name, index=index)

    logging.info(f'Excel file uploading COMPLETE :) (\'{file_path}\')')



# 將資料上傳至 SQL 資料庫
def updateSQL() -> bool:

    # 讀取使用者資料
    userData = json.load(open('settings.json', 'r'))

    logging.info(f'Uploading submissions to SQL Server ......')
    
    # 讀取 json 檔
    df = getDataFrame()
    df.sort_values(['完成時間'], inplace = True)

    try:
        # 連線至資料庫
        connection = mysql.connector.connect(host = userData['MySQL']['Host'],
                                             port = userData['MySQL']['Port'],
                                             user = userData['MySQL']['User'],
                                             password = userData['MySQL']['Password'])

        logging.info(f'Connected to SQL server')

        cursor = connection.cursor()

        cursor.execute(f"USE `{userData['MySQL']['Database']}`;")
        try:
            cursor.execute(f"DELETE FROM `{userData['MySQL']['Table']}`;")
        except:
            pass
        logging.info(f'SQL table cleared')

        mysql_insert_query =    f"""
                                 INSERT INTO `{userData['MySQL']['Table']}` 
                                 (`title`, `time`, `language`, `result`, `website`, `url`) 
                                 VALUES (%s, %s, %s, %s, %s, %s)
                                 """

        submissions = df.to_dict('records')
        total_submissions = len(submissions)

        for idx in range(total_submissions):

            data = submissions[idx]
            print(f"{idx} / {total_submissions} completed ! \r", end = "")

            data_value = (data["題目名稱"], data["完成時間"], data["程式語言"], data["結果"], data["網站"], data["網址"])

            cursor.execute(mysql_insert_query, data_value)

        cursor.close()
        connection.commit()
        connection.close()

        logging.info(f'Uploading submissions to SQL server COMPLETE :) ( {total_submissions} subs )')
        return True

    except:
        logging.error(f'Uploading submissions FAILED! :(')
        return False
    


def getSubs(website: str, subs_data: dict, notifyErrors: list[str], lastest_time: dict) -> None:

    logging.info(f'<{website}> : Start fetching submissions ......')

    try:
        submissions: pd.DataFrame = eval(f'Crawler.{website}()')
        subs_data[website] = submissions.to_dict(orient = 'records')
        lastest_time['Submissions'][website] = datetime.now().strftime("%Y/%m/%d %H:%M:%S")
        logging.info(f'<{website}> : Submissions fetching COMPLETE  :) ( {len(submissions)} subs )')
    except:
        errorsMessage = f'<{website}> : Unable to fetch submissions :('
        logging.error(errorsMessage)
        notifyErrors.append(errorsMessage)

def getDataFrame() -> pd.DataFrame:

    raw_data: dict = {}

    with open(SubsData_path, "r") as f:
        content = "".join(f.readlines())
        raw_data = json.loads(content)

    sub_list: list[dict] = []

    for OJ in raw_data.values():
        sub_list.extend(OJ)

    df = pd.DataFrame(sub_list)
    return df


def getDeltaHour(time: str) -> int:

    time_now = datetime.now()
    
    last_update_time = datetime.strptime(time, "%Y/%m/%d %H:%M:%S")
    delta_time = time_now - last_update_time
    delta_hour = delta_time.seconds // 3600 + delta_time.days * 24

    return delta_hour

