# OJ Scoreboard

<div align="center">

**自動爬取多平台 Online Judge 解題記錄，並以視覺化 Dashboard 呈現統計數據。**

[![Deploy](https://github.com/ImMasterSam/OJ-Scoreboard/actions/workflows/deploy.yml/badge.svg)](https://github.com/ImMasterSam/OJ-Scoreboard/actions/workflows/deploy.yml)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.13+-3776AB?logo=python&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Database-3FCF8E?logo=supabase&logoColor=white)

</div>

---

## 功能概覽

- 🕷️ **多平台自動爬蟲** — 支援 6 大 Online Judge 平台，定時自動抓取解題紀錄
- 📊 **視覺化 Dashboard** — 網站分佈、解題結果統計、歷年提交趨勢、近期提交紀錄
- ☁️ **雲端同步** — 透過 Supabase 儲存資料，前端即時從雲端讀取
- 🚀 **自動部署** — Push 到 `main` 分支自動透過 GitHub Actions 部署至 GitHub Pages

## 支援的 Online Judge 平台

| 平台 | 資料來源 | 認證方式 |
|------|---------|---------|
| **Zerojudge** | Selenium + API | 帳號密碼登入 |
| **UVa** | uHunt API | User ID |
| **Kattis** | autokattis 套件 | 帳號密碼 |
| **TOJ** (TFCIS) | Selenium 爬蟲 | User ID |
| **AtCoder** | Kenkoooo API | Username |
| **CodeForces** | Codeforces API | API Key + Secret |


## 快速開始

### 前置需求

- **Node.js** ≥ 20
- **Python** ≥ 3.13
- **uv** (Python 套件管理器)
- **Chrome** + **ChromeDriver** (Zerojudge / TOJ 爬蟲需要)
- 一個 **Supabase** 專案

### 1. 設定 Backend

```bash
# 進入 backend 目錄
cd backend

# 安裝 Python 依賴
uv sync

# 複製設定檔範本並填入各平台帳號
cp core/settings.json.example core/settings.json
```

編輯 `core/settings.json`，填入你的各平台帳號密碼：

```jsonc
{
  "Zerojudge": {
    "Username": "your_username",
    "Password": "your_password"
  },
  "UVa": {
    "UserId": "your_user_id"
  },
  "Kattis": {
    "UserId": "your_user_id",
    "Password": "your_password"
  },
  "TOJ": {
    "UserId": "your_user_id"
  },
  "AtCoder": {
    "Username": "your_username"
  },
  "CodeForces": {
    "Key": "your_api_key",
    "Secret": "your_api_secret",
    "Handle": "your_handle"
  },
  "Supabase": {
    "Url": "https://your-project.supabase.co",
    "Key": "your_service_role_key"
  }
}
```

```bash
# 執行爬蟲 (會自動每 10 分鐘定時爬取)
uv run python main.py

# 上傳資料到 Supabase
uv run python -m services.upload_to_supabase
```

### 2. 設定 Frontend

```bash
# 進入 frontend 目錄
cd frontend

# 安裝依賴
npm install

# 建立環境變數檔
cp .env.example .env  # 或手動建立
```

在 `frontend/.env` 中填入 Supabase 連線資訊：

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

```bash
# 啟動開發伺服器
npm run dev
```

### 3. Supabase 資料表設定

在 Supabase 中建立 `Submissions` 資料表，包含以下欄位：

| 欄位名稱 | 型別 | 說明 |
|----------|------|------|
| `網站` | `text` | OJ 平台名稱 |
| `題目名稱` | `text` | 題目標題 |
| `完成時間` | `text` | 提交時間 |
| `結果` | `text` | 判題結果 (AC, WA, TLE...) |
| `網址` | `text` | 題目連結 |

> **複合唯一鍵 (Unique Constraint)：** `(網站, 題目名稱, 完成時間)` — 用於 upsert 去重。
