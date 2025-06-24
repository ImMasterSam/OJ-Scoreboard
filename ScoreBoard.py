from Update import *

import schedule
from time import sleep
from sys import exit
import os
import logging
import logging.handlers
from threading import Thread

import pystray
from PIL import Image

STARTUP_DELAY = 0           # (Seconds)
CHECK_INTERVAL = 10         # (Minutes)
TRAY_UPDATE_INTERVAL = 1    # (Minutes)
LOG_INTERVAL = 1            # (Hours)
LOGGER_BACKUP = 10000

UPDATE_TIME: dict = {}

Running = True

def click(icon, query):

    global Running

    if str(query) == 'Exit':
        icon.stop()
        Running = False
    icon.update_menu()



def readJson():

    global UPDATE_TIME

    with open(UpdateTime_path, "r") as f:
        content = "".join(f.readlines())
        UPDATE_TIME = json.loads(content)



def updateTray(icon):

    readJson()
    icon.update_menu()



if __name__ == "__main__":

    logging.basicConfig(level = logging.INFO,
                        format = '[%(levelname)s] %(asctime)s: %(message)s',
                        datefmt = '%Y/%m/%d %H:%M:%S',
                        filename = 'ScoreBoard.log')
    logging.handlers.TimedRotatingFileHandler(filename = "ScoreBoard.log", 
                                              when = 'H',
                                              interval = LOG_INTERVAL,
                                              backupCount = LOGGER_BACKUP)

    # 確定 setttings.json 已經存在
    if not os.path.exists('settings.json'):
        logging.critical('settings.json not found !!!')
        notify(title = "Online Judge 爬蟲", body = f"'CRITICAL ERROR: settings.json not found !!!'")
        exit(1)

    # 延長啟動時間
    sleep(STARTUP_DELAY)
    readJson()

    # 系統匣顯示
    ICON = Image.open('Assets/icon.ico')
    SQL_time = pystray.MenuItem(lambda text : f'SQL: {UPDATE_TIME['SQL']}', action = click)
    OJs = list(map(lambda i : pystray.MenuItem(lambda text : f'{OJ_LIST[i]}: {UPDATE_TIME['Submissions'][OJ_LIST[i]]}', action = click),  range(len(OJ_LIST))))
    OJ_time = pystray.MenuItem(text = 'Online Judges', action = pystray.Menu(lambda: OJs))
    exit = pystray.MenuItem(text = 'Exit', action = click, default = False)
    MENU_items = [SQL_time, OJ_time, exit]
    icon = pystray.Icon(name = 'Online Judge Crawler',
                        title = 'OJ Crawler',
                        icon = ICON,
                        menu = pystray.Menu(lambda: MENU_items))
    trayIcon = Thread(target = icon.run)
    trayIcon.start()

    check_lastest_update()

    # 每 {CHECK_INTERVAL} 分鐘檢查一次
    schedule.every(CHECK_INTERVAL).minutes.do(check_lastest_update)
    schedule.every(TRAY_UPDATE_INTERVAL).minutes.do(updateTray, icon)

    while Running:
        sleep(1)
        schedule.run_pending()
