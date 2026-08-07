import json
from time import sleep

from selenium import webdriver
from selenium.webdriver.common.by import By

browser = webdriver.Chrome()

browser.get("https://toj.tfcis.org/oj/proset/?off=0")

offset = 0

d = dict()

while True:

    browser.get(f"https://toj.tfcis.org/oj/proset/?pageoff={offset}&topcoder=ignore")
    sleep(1)

    titles = browser.find_elements(By.TAG_NAME, 'tr')

    if len(titles) <= 2:
        break

    for i in range(len(titles)-2):

        temp = titles[i+2]
        print(temp.text)

        id = temp.find_elements(By.TAG_NAME, 'td')[0].text
        title = temp.find_elements(By.TAG_NAME, 'td')[2].text

        #print(id, title)

        d[id] = title

    offset += 40

browser.close()
json.dump(d, open("Json/Proset.json", "w+"))
