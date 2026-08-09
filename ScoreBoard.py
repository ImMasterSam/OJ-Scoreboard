import schedule
from time import sleep
from sys import exit
import os
import sys
import logging
import logging.handlers

from getSubmissions import getSubs

STARTUP_DELAY = 0           # (Seconds)
CHECK_INTERVAL = 10         # (Minutes)
LOG_INTERVAL = 1            # (Hours)
LOGGER_BACKUP = 10000
log2console = False

Running = True

if __name__ == "__main__":

    logging.basicConfig(level = logging.INFO,
                        format = '[%(levelname)s] %(asctime)s: %(message)s',
                        datefmt = '%Y/%m/%d %H:%M:%S',
                        filename = 'ScoreBoard.log')
    if log2console:
        logging.getLogger().addHandler(logging.StreamHandler(sys.stdout))
    logging.handlers.TimedRotatingFileHandler(filename = "ScoreBoard.log", 
                                              when = 'H',
                                              interval = LOG_INTERVAL,
                                              backupCount = LOGGER_BACKUP)

    # 確定 setttings.json 已經存在
    if not os.path.exists('settings.json'):
        logging.critical('settings.json not found !!!')
        exit(1)

    # 延長啟動時間
    sleep(STARTUP_DELAY)

    # 初次執行爬蟲
    getSubs()

    # 每 {CHECK_INTERVAL} 分鐘檢查一次
    schedule.every(CHECK_INTERVAL).minutes.do(getSubs)

    while Running:
        sleep(1)
        schedule.run_pending()
