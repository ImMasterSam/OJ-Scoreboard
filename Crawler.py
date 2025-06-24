import datetime
from time import time as gettime, sleep
import json
from random import randint
import os
if os.name == 'nt': from win11toast import notify
import logging

import requests
from bs4 import BeautifulSoup
import hashlib

from selenium import webdriver
from selenium.common.exceptions import WebDriverException
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
import pickle

from autokattis import Kattis as KAT

import pandas as pd

def Zerojudge() -> pd.DataFrame: 

    # 爬蟲瀏覽器參數設定
    chrome_options = Options()
    # chrome_options.add_argument('--disable-gpu')  # 禁用 GPU 加速
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument("--headless")
    # chrome_options.add_argument('--user-data-dir=C:/Users/USER/AppData/Local/Google/Chrome/User Data') # 使用 Chrome 的使用者資料

    # 啟動 Webdriver
    try:
        browser = webdriver.Chrome(options=chrome_options)
    except:
        if os.name == 'nt':
            notify(title = "Online Judge 爬蟲", body = f"'CRITICAL ERROR: Unable to find Chrome Driver !!!'")
        else:
            print("'CRITICAL ERROR: Unable to find Chrome Driver !!!'")
        logging.critical('Unable to find Chrome Driver !!!')
        raise WebDriverException

    # 進入登入頁面
    browser.get("https://zerojudge.tw/Login")

    # 讀取帳號密碼
    userData = json.load(open("settings.json", "r"))

    # 自動使用預設資料進入登入頁面
    username = browser.find_element(By.XPATH,'/html/body/div[4]/div[2]/div[2]/form/div[1]/div/input')
    password = browser.find_element(By.XPATH,'/html/body/div[4]/div[2]/div[2]/form/div[2]/div/input')
    username.send_keys(userData['Zerojudge']['Username'])
    password.send_keys(userData['Zerojudge']['Password'])
    loginButton = browser.find_element(By.XPATH,'/html/body/div[4]/div[2]/div[2]/form/button[1]')
    loginButton.click()

    # 可以用 Chrome 的資料直接用 Google 登入 (現在暫時不需要)
    # Google = browser.find_element(By.XPATH,'/html[1]/body[1]/div[4]/div[2]/div[2]/a[1]')
    # Google.click()

    sleep(0.5)  # 等待頁面載入

    # 檢查是否登入成功
    if browser.current_url == "https://zerojudge.tw/Login":
        error_message = browser.find_element(By.XPATH, '/html/body/div[6]/div/div/div[2]/div/div').text
        if os.name == 'nt':
            notify(title = "Online Judge 爬蟲", body = f"ERROR: Unable to login Zerojudge !!! ({error_message})")
        else:
            print(f"ERROR: Unable to login Zerojudge !!! ({error_message})")
        logging.error(f"Unable to login Zerojudge !!! ({error_message})")
        raise ValueError(f"Unable to login Zerojudge !!! ({error_message})")

    # 進入使用者解題統計頁面
    browser.get("https://zerojudge.tw/UserStatistic")

    a = browser.find_element(By.XPATH, "/html/body/div[3]/div/div[1]/div/div[2]/div[3]/a")
    user = browser.find_element(By.XPATH, '/html/body/div[3]/div/div[1]/div/div[2]/h4/span[1]/a').get_attribute("title")
    url = a.get_attribute("href")

    # 保存 cookie
    cookies = browser.get_cookies()
    pickle.dump(cookies, open("cookies.pkl", "wb"))
    browser.close()  # 關閉瀏覽器

    raw_data = list()
    lang_d = {"CPP":"C++", "PYTHON": "Python", "JAVA": "Java"}

    s = requests.Session()
    for cookie in cookies:
        s.cookies.set(cookie['name'], cookie['value'])

    while True:

        lst = s.get(url)
        soup = BeautifulSoup(lst.text, 'lxml')

        for i in soup.find_all('tr'):
            if i.has_attr("solutionid"):
                tds = i.find_all('td')
                title = tds[2].text.lstrip().replace('\r', '').replace('\n', '').split(' -- #')[0]
                date = tds[5].getText().lstrip().replace('\r', '').replace('\n', '').replace('\t', '')
                result = tds[3].find_all('a')[1].text
                t_lang = tds[4].select_one('#btn_SolutionCode').text
                lang = lang_d[t_lang]

                if(result == "NA"):
                    result = "WA"
                
                submission_data = {"題目名稱" : title,
                                   "完成時間" : date,
                                   "程式語言" : lang,
                                   "結果" : result,
                                   "網站" : "Zerojudge",
                                   "網址" : f"https://zerojudge.tw/ShowProblem?problemid={title[:4]}"}

                raw_data.append(submission_data)

        url = 'https://zerojudge.tw/Submissions' + soup.select_one('#pagging').find('a', title='lastpage=')['href']

        if len(soup.select("tr")) == 2:
            break

    submission_df = pd.DataFrame(raw_data)

    return submission_df


def UVa() -> pd.DataFrame:

    # 讀取使用者資料
    userData = json.load(open("settings.json", "r"))

    # 從 API 讀取資料
    subs_url = f"https://uhunt.onlinejudge.org/api/subs-user/{userData['UVa']['UserId']}"
    subs_res = requests.get(subs_url)
    pb_url = "https://uhunt.onlinejudge.org/api/p"
    pb_res = requests.get(pb_url)

    if(subs_res.status_code != 200 or pb_res.status_code != 200):
        logging.error('<UVa> : Unable to connect to the UVa\'s API :(')

    #將 json 轉為陣列
    sub_js = json.loads(subs_res.text)
    pb_js = json.loads(pb_res.text)

    #建立題目標題字典
    title_d = dict()
    for i in pb_js:
        title_d[i[0]] = {"id":str(i[1]), "title":i[2]}

    # 資料處理
    subs_list = sub_js['subs']
    raw_data = list()
    lang_d = {1:"ANSI", 2:"Java", 3:"C++", 4:"Pascal", 5:"C++"}
    result_d = {30:"CE", 40:"RE", 50:"TLE", 60:"MLE", 70:"WA", 80:"WA", 90:"AC"}

    for i in subs_list:

        title = title_d[i[1]]['id'] + " - " + title_d[i[1]]['title']
        lang = lang_d[i[5]]
        un_time = i[4]
        dt = datetime.datetime.fromtimestamp(un_time)
        time = str(dt)

        submission_data = {"題目名稱" : title,
                           "完成時間" : time,
                           "程式語言" : lang,
                           "結果" : result_d[i[2]],
                           "網站" : "UVa",
                           "網址" : f"https://onlinejudge.org/index.php?option=com_onlinejudge&Itemid=8&page=show_problem&problem={i[1]}"}
        
        raw_data.append(submission_data)

    submission_df = pd.DataFrame(raw_data)

    return submission_df


def Kattis() -> pd.DataFrame:

    # 讀取帳號密碼
    userData = json.load(open("settings.json", "r"))

    #從 autokattis 引入資料
    kt = KAT(userData['Kattis']['UserId'], userData['Kattis']['Password'])

    raw_data = list()

    for i in kt.stats():

        title = i['name']
        time = str(i['timestamp'])
        lang = i['language']

        if(i['test_case_passed'] == i['test_case_full']):
            result = "AC"
        else:
            result = "WA"

        submission_data = {"題目名稱" : title,
                           "完成時間" : time,
                           "程式語言" : lang,
                           "結果" : result,
                           "網站" : "Kattis",
                           "網址" : f"https://open.kattis.com/problems/{i['id']}"}
        
        raw_data.append(submission_data)

    submission_df = pd.DataFrame(raw_data)

    return submission_df


def TOJ() -> pd.DataFrame:

    # 讀取使用者資料
    userData = json.load(open("settings.json", "r"))

    # 爬蟲瀏覽器參數設定
    chrome_options = Options()
    # chrome_options.add_argument('--disable-gpu')  # 禁用 GPU 加速
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument("--headless")

    # 啟動 Webdriver
    try:
        browser = webdriver.Chrome(options=chrome_options)
    except:
        if os.name == 'nt':
            notify(title = "Online Judge 爬蟲", body = f"'CRITICAL ERROR: Unable to find Chrome Driver !!!'")
        else:
            print("'CRITICAL ERROR: Unable to find Chrome Driver !!!'")
        logging.critical('Unable to find Chrome Driver !!!')
        raise WebDriverException

    result_d = {"Accepted":"AC", "Wrong Answer":"WA", "Compile Error":"CE", "Runtime Error":"RE", "Time Limit Exceed":"TLE", "Memory Limit Exceed":"MLE"}
    raw_data = list()

    pageoff = 0
    pagestep = 20

    # 讀取題目名稱
    with open("Json/Proset.json") as f:
        proset_d = json.load(f)

    test_res = requests.get(f"https://toj.tfcis.org/oj/chal/?acctid={userData['TOJ']['UserId']}")
    if(test_res.status_code != 200):
        logging.error('<TOJ> : Unable to connect to the TOJ :(')
        raise ConnectionError("Unable to connect to the TOJ :(")

    while True:
        
        url = f"https://toj.tfcis.org/oj/chal/?pageoff={pageoff}&acctid={userData['TOJ']['UserId']}"
        browser.get(url)
        sleep(1)  # 等待頁面載入

        trs = browser.find_elements(By.TAG_NAME, 'tr')

        if len(trs) <= 2:
            break

        for j in range(len(trs)-2):
            tds = trs[j+2].find_elements(By.TAG_NAME, 'td')

            id = tds[1].text
            title = proset_d[id]
            time = tds[-1].text
            lang = "C++"
            result = result_d[tds[3].text]

            submission_data = {"題目名稱" : title,
                               "完成時間" : time,
                               "程式語言" : lang,
                               "結果" : result,
                               "網站" : "TOJ",
                               "網址" : f"https://toj.tfcis.org/oj/pro/{id}/"}

            raw_data.append(submission_data)

        pageoff += pagestep

    submission_df = pd.DataFrame(raw_data)

    return submission_df


def AtCoder() -> pd.DataFrame:

    # 讀取使用者資料
    userData = json.load(open("settings.json", "r"))

    # 從 API 讀取資料
    subs_url = f"https://kenkoooo.com/atcoder/atcoder-api/v3/user/submissions?user={userData['AtCoder']['Username']}&from_second=0"
    subs_res = requests.get(subs_url)
    pb_url = "https://kenkoooo.com/atcoder/resources/problems.json"
    pb_res = requests.get(pb_url)

    if(subs_res.status_code != 200 or pb_res.status_code != 200):
        logging.error('<AtCoder> : Unable to connect to the AtCoder\'s API :(')

    #將 json 轉為陣列
    sub_js = json.loads(subs_res.text)
    pb_js = json.loads(pb_res.text)

    raw_data = list()

    # 讀取各 submission 資料
    for sub in sub_js:

        problem_data = list(filter(lambda pb : pb['id'] == sub['problem_id'], pb_js))[0]

        contest_name = sub['contest_id'].upper()
        title = contest_name + " - " + problem_data['title']
        time = datetime.datetime.fromtimestamp(sub['epoch_second']).strftime('%Y-%m-%d %H:%M:%S')
        language = sub['language'].split()[0]
        result = sub['result']
        website = "AtCoder"
        URL = f"https://atcoder.jp/contests/{sub['contest_id']}/tasks/{sub['problem_id']}"

        submission_data = {"題目名稱" : title,
                           "完成時間" : time,
                           "程式語言" : language,
                           "結果" : result,
                           "網站" : "AtCoder",
                           "網址" : URL}

        raw_data.append(submission_data)
    
    submission_df = pd.DataFrame(raw_data)

    return submission_df


def CodeForces() -> pd.DataFrame:

    # 讀取使用者資料
    userData = json.load(open("settings.json", "r"))
    
    # CoderForces 專屬 Key & Secret
    KEY = userData['CodeForces']['Key']
    SECRET = userData['CodeForces']['Secret']
    HANDLE = userData['CodeForces']['Handle']

    # 產生湊雜函式
    rand = randint(100000, 999999)
    current_time = int(gettime())
    HASH = hashlib.sha512(f"{rand}/user.status?apiKey={KEY}&handle={HANDLE}&time={current_time}#{SECRET}".encode()).hexdigest()

    # 從 API 讀取資料
    subs_url = f'https://codeforces.com/api/user.status?apiKey={KEY}&handle={HANDLE}&time={current_time}&apiSig={rand}{HASH}'
    subs_res = requests.get(subs_url)

    if(subs_res.status_code != 200):
        logging.error('<CodeForces> : Unable to connect to the CodeForces\'s API :(')

    #將 json 轉為陣列
    sub_js = json.loads(subs_res.text)

    # 字典集
    complier_dict = {"C++17 (GCC 7-32)" : "C++",
                    "GNU C11" : "C++",
                    "C++23 (GCC 14-64, winlibs)" : "C++",
                    "Python 3" : "Python",
                    "PyPy 3" : "Python"}
    result_dict = {"OK" : "AC",
                "COMPILATION_ERROR" : "CE",
                "RUNTIME_ERROR" : "RE",
                "WRONG_ANSWER" : "WA",
                "PRESENTATION_ERROR" : "WA",
                "TIME_LIMIT_EXCEEDED" : "TLE",
                "MEMORY_LIMIT_EXCEEDED" : "MLE",
                "CHALLENGED" : "WA",
                "PARTIAL" : "WA"}

    raw_data = list()

    # 讀取各 submission 資料
    for sub in sub_js['result']:
        
        title = sub['problem']['name']
        time = datetime.datetime.fromtimestamp(sub['creationTimeSeconds']).strftime('%Y-%m-%d %H:%M:%S')
        language = complier_dict[sub['programmingLanguage']]
        try:
            result = result_dict[sub['verdict']]
        except:
            continue
        website = "CodeForces"
        group = "contest" if sub['contestId'] < 10000 else "gym"
        URL = f"https://codeforces.com/{group}/{sub['contestId']}/problem/{sub['problem']['index']}"

        submission_data = {"題目名稱" : title,
                           "完成時間" : time,
                           "程式語言" : language,
                           "結果" : result,
                           "網站" : website,
                           "網址" : URL}
        
        raw_data.append(submission_data)

    submission_df = pd.DataFrame(raw_data)

    return submission_df

# res = CodeForces()
# print(res)