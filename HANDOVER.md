# 冰島旅遊地圖 — AI Handover Document

## 這個專案是什麼

`冰島旅遊地圖.html` 是一個**單頁互動式冰島自駕旅遊規劃地圖**，整合側邊欄行程與 Leaflet.js 地圖，讓使用者點景點就能在地圖上飛行定位、查看 popup 與 Wikipedia 照片。

### 功能清單

| 功能 | 說明 |
|------|------|
| 行程總覽 | 左側總覽面板，每天一張卡片，含住宿、里程、總費用 |
| 天數 Tab | D0–D9 共 10 個 tab，顯示當天詳細景點時間軸 |
| 地圖互動 | 點景點 → 地圖飛行；點地圖 marker → 打開 popup |
| 價格編輯 | 點 ✏️ 進入編輯模式，點價格文字直接修改，存入 localStorage |
| 匯率換算 | ISK 100 = NT$ 即時換算顯示器，可手動更新 |
| Wikipedia 照片 | 自動抓取景點封面照（非同步，有快取） |
| Google Maps 導航 | 每個景點均有導航連結 |
| 差異說明 | 與原始 Excel 行程表差異的可收合說明區塊 |

---

## Source 來源

### 主要 Google Sheets（需 Google 帳號存取）
**URL**: https://docs.google.com/spreadsheets/d/1G0_lhvx6llEozjT5HWmBTSO1OZDB0mjEJ12v35baMdQ/edit?gid=461091797#gid=461091797

Sheet 結構（Tab: gid=461091797）：

| 列 | 內容 |
|----|------|
| 行 1-2 | D0–D16 欄位標題，對應日期 9/24–10/10 |
| 行「A団住宿」| 卡致豆桓 4 人住宿安排 |
| 行「住宿費」| 住宿費用（NT$），**column-aligned（欄位對應日期）** |
| 行「B団住宿」| 豆林羅哈 4 人住宿（HTML 未收錄，另一組不同住宿） |
| 行「景點」| 每天景點列表（多列） |
| 行「車程時間/行車里程」| 每天總車程與里程 |
| 行「未確認」| 備選住宿與尚未確定項目 |

### 輔助參考檔（本機）
`C:\Users\CC\Downloads\冰島歐洲旅遊_extracted\` 內的 HTML 檔，為舊版 Excel 匯出：
- `☑️Schedule.html` — 整體排程總表
- `✨Daily detail.html` — 每日詳細行程說明文字
- `hiking.html` — 健行相關資訊
- `➡️逆時針.html` — 環島路線方向
- `冰島旅遊地圖.html` — 本專案 HTML 本體

---

## 住宿費對照表（最終確認版）

> **重要**：住宿費 row 為 **column-aligned**（每欄的價格對應該欄的日期）。
> 舊版 HTML 曾誤用「sequential pairing」導致 D1–D5 全部錯位。已修正。

| Day | 日期 | 飯店 | 費用 | 訂房方 | 狀態 |
|-----|------|------|------|--------|------|
| D0 | 9/24(四) | 飯店未知 | NT$17,339 | — | 待確認飯店名稱 |
| D1 | 9/25(五) | Flyers Airport Hotel | NT$10,558 | Carol / Agoda | 9/26前可免費取消 |
| D2 | 9/26(六) | Kirkjufell View Cottages | NT$13,228 | 雅致 / Agoda | 9/21前可免費取消 |
| D3 | 9/27(日) | Steinaskjól Apartments | NT$8,579 | 雅致 / Agoda | 9/4前可免費取消 |
| D4 | 9/28 | Vogar Travel Service | NT$9,116 | 秉翔 / Booking | — |
| D5 | 9/29 | Hafaldan HI Hostel | NT$9,565 | 卡羅 / Booking | — |
| D6 | 9/30 | Höfn i Hornafirði | 待定 | — | 尚未訂房 |
| D7 | 10/1 | 教堂城 Kirkjubæjarklaustur | 待定 | — | 尚未訂房 |
| D8 | 10/2 | Hestheimar, Hella | NT$9,815 | 雅致 / Booking | 9/27前可免費取消 |
| D9 | 10/3 | Flyers Airport Hotel（待確認） | NT$8,493 | Agoda | 深夜班機前短暫休憩，尚未定 |

**住宿費加總**（已知費用）：NT$86,693（D6/D7 待定中）

---

## 目前已知 Bug / 待辦

| 項目 | 說明 |
|------|------|
| D6 住宿費 | Höfn 尚未訂房，費用空白，確認後用 ✏️ 編輯模式填入 |
| D7 住宿費 | 教堂城尚未訂房，同上 |
| D0 飯店名稱 | Google Sheet 無列出 9/24 飯店名稱，費用 NT$17,339，確認後填入 |
| D9 住宿確認 | Flyers Airport Hotel 待定（深夜班機前 hotel，Agoda 尚未訂） |
| B 団住宿 | 豆林羅哈 4 人有另一套住宿安排，HTML 尚未收錄 |

---

## 班機資訊（D0 出發日 9/24）

| 人 | 航班 |
|----|------|
| 致黃（卡一起） | TPE→AMS 23:59→(+1)08:15 → AMS→KEF 17:05→18:20（9/25落地） |
| Carol | TPE→HKG 19:30→21:30 → HKG→AMS 23:15→(+1)06:55（9/25落地） |
| 桓哥 | 班機 15:15→23:20（KEF落地，9/25） |
| 林豆 | LHR→KEF 21:25→23:35（9/25落地） |
| 回程（卡致黃） | KEF→AMS 07:40→13:00 → 12:20→(+1)10:00 |
| 回程（桓） | 01:10→08:50 |
| 回程（AMS→TPE） | 11:00→06:15(+1) |

---

## 設計系統（CSS Variables）

```css
--bg0: #030a14   /* 最深底色 */
--bg1: #060f1c   /* 側邊欄底色 */
--bg2: #0a1828   /* 卡片/面板 */
--bg3: #0f2035   /* 懸停/提高層級 */
--bd1 / bd2 / bd3  /* 邊框三層 */
--t1 #ddeeff / --t2 #7aa4c0 / --t3 #3a6080  /* 文字三層 */
--gold: #f2c53d  /* 子夜金（標題/active） */
--sky:  #48b8e8  /* 冰川藍（數值/連結） */
```

每天有獨立 `--dc`（day color）變數，由 JS 在 `.dtab` 上設定 `style.setProperty('--dc', day.color)`。

---

## 技術架構

```
冰島旅遊地圖.html  （單一自包含檔，無 build 工具）
├── <style>         設計系統 + 所有元件 CSS
├── <body>
│   ├── #sidebar    左側面板（490px fixed）
│   │   ├── .sb-head     標題 + 統計 chip
│   │   ├── .fx-bar      匯率計算器
│   │   ├── .edit-bar    價格編輯按鈕
│   │   ├── .tab-bar     D0–D9 tab
│   │   └── #panels      行程面板（overview + 10 個 day panel）
│   └── #map        Leaflet 地圖（flex: 1, 佔滿剩餘寬度）
└── <script>
    ├── DAYS[]      所有資料（景點/住宿/餐廳/提醒/班機）
    ├── buildOverview()   建立總覽面板
    ├── buildDayPanel()   建立各天面板
    ├── getPhoto()        Wikipedia API 抓照片（有快取）
    ├── mkIcon()          Leaflet 自訂 marker
    ├── popupHtml()       地圖 popup 內容
    ├── activateDay()     切換天數（tab + map + panel）
    └── flyToSpot()       地圖飛行 + 自動開 popup
```

---

## 重要注意事項

1. **價格編輯**：點 ✏️ 按鈕才能修改價格，直接點文字沒反應。編輯後儲存在 `localStorage`，重設按鈕可清除。

2. **住宿費是 column-aligned**：Google Sheet 的「住宿費」列，每個價格對應「同一欄」的日期，**不是**按順序排列。D6/D7 欄位為空（尚未訂房）。

3. **D8 里程**：約208 km / 3小時（若住 Hella），Sheet 原始資料如此標示。

4. **D6 里程差異**：Sheet 寫「220km」，但實際 Seyðisfjörður→Höfn 約 330km，HTML 已標注此差異（原始 Sheet 誤記）。

5. **B 団住宿**：豆林羅哈另有一套不同住宿（Greystone summerhouse、Guesthouse Skálafell、Stracta Apartments、Golden Circle Domes 等），HTML 目前只顯示 A 団（卡致豆桓）。

6. **圖片**：從 English Wikipedia API (`/api/rest_v1/page/summary/{wiki}`) 異步載入縮圖，有 in-memory cache，失效時顯示空白圓形。

7. **地圖 Tiles**：CartoDB Voyager。

---

## 最後一次 AI 作業日期
2026-07-14
