import json
import pandas as pd
from datetime import datetime

OJ_LIST = ['Zerojudge', 'UVa', 'Kattis', 'TOJ', 'AtCoder', 'CodeForces']

lastest_time = {}

timeNow = datetime.now()
lastest_time['SQL'] = "2024/11/17 15:41:17"

submissions = {}
for OJ in OJ_LIST:
    submissions[OJ] = "2024/11/17 15:41:17"

lastest_time['Submissions'] = submissions

print(lastest_time)
json.dump(lastest_time, open('update_time.json', 'w+'), indent = 4)
print("Complete")