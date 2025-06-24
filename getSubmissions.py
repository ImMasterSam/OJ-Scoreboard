import Crawler
import pandas as pd

def getSubs():

    print("正在蒐集資料...")

    ZJ_AC = Crawler.Zerojudge()
    print("完成 ZeroJudge 資料")

    UVa_AC = Crawler.UVa()
    print("完成 UVa 資料")

    Kat_AC = Crawler.Kat()
    print("完成 Kattis 資料")

    TOJ_AC = Crawler.TOJ()
    print("完成 TOJ 資料")

    AtCoder_AC = Crawler.AtCoder()
    print("完成 AtCoder 資料")

    CodeForces_AC = Crawler.CodeForces()
    print("完成 CodeForces 資料")

    total_sub_df = pd.concat([ZJ_AC, UVa_AC, Kat_AC, TOJ_AC, AtCoder_AC, CodeForces_AC], ignore_index = True)
    total_sub_df.sort_values(['完成時間'], inplace = True)

    with open("Json/Subs_data.json", "w+") as f:
        f.write(total_sub_df.to_json(orient='records', lines=True))

    print(f"完成資料蒐集 ({total_sub_df.shape[0]} 筆) !")