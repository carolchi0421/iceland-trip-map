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
| 🧳 行前準備 tab | 新增分頁：預約狀態總表（BOOKINGS）＋可勾選打包清單（PACKING，存 localStorage `pack_<cat>_<i>`）＋冰島即時資訊連結（vedur 天氣/極光、umferdin 路況、safetravel）。函式 `buildPrep()` |
| 住宿地圖標記 | 每日住宿以 🛏 床 icon 上圖（`ACC_GEO` 城鎮級座標＋`mkBedIcon`／`showBeds`，僅當天顯示）；panel 與 popup 皆有「Google Maps 找飯店」連結 |
| 餐廳導航 | 每個餐廳卡片加 Google Maps 依名稱搜尋連結（不落精確 pin） |
| 停車場標示 | 自然景點的編號 pin 本身即停車場座標（來自 Sheet 的「XXX Parking」）→ 導航鈕標「🅿️ 停車場導航」；城鎮/機場（`TOWN_SPOTS`：tpe/kef/akureyri/hofn-dinner/djupivogur/seydisfjordur）維持「🗺 導航」。少數停車場與地標不同者用 `sp.parkAt:[lat,lon]`＋`parkLabel` 另放藍色 **P** 標記（`mkParkIcon`/`showParks`，active-day 顯示），目前：西角山→Viking Café 售票點。要加更多只需在該景點補 `parkAt` 座標 |
| 景點搜尋 | 側欄搜尋框，輸入 zh/en 即時過濾 → `activateDay`＋`flyToSpot`（↑↓/Enter/Esc） |
| 列印/PDF | 🖨 列印按鈕 + `@media print`：攤平全日程、隱藏地圖/chrome，供紙本備援 |
| PWA 離線 | `manifest.webmanifest`＋`sw.js`（app shell 網路優先、地圖圖磚/Wikipedia 照片 cache-first）＋`icon.svg`。冰島訊號差也能看行程 |

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

> **兩團分開**：A團（卡致豆桓）與 B團（豆林羅哈）在 Sheet 是兩列。部分夜晚同住、部分各自訂房。
> 「住宿費」row 為 **A團**（已訂/計價）；B團費用 Sheet 未列。

| Day | 日期 | A團（卡致豆桓）飯店 | A團費用 | 訂房方 | B團（豆林羅哈）飯店 | 狀態 |
|-----|------|------|------|--------|------|------|
| D0 | 9/24(四) | 飯店未知 | NT$25,329 | — | — | 待確認飯店名稱（Sheet 9/24 欄，2026-07-17 更新） |
| D1 | 9/25(五) | Flyers Airport Hotel | NT$10,558 | Carol / Agoda | **同 A團** | 9/26前可免費取消 |
| D2 | 9/26(六) | Kirkjufell View Cottages | NT$13,228 | 雅致 / Agoda | **同 A團** | 9/21前可免費取消 |
| D3 | 9/27(日) | Steinaskjól Apartments | NT$8,579 | 雅致 / Agoda | Guesthouse AkurInn（另訂） | 9/4前可免費取消 |
| D4 | 9/28 | Vogar Travel Service | NT$9,116 | 秉翔 / Booking | **同 A團** | — |
| D5 | 9/29 | Hafaldan HI Hostel | NT$9,565 | 卡羅 / Booking | Greystone summerhouse（另訂） | — |
| D6 | 9/30 | Guesthouse Stekkatun | NT$17,442 | 雅致 / Trip.com | Guesthouse Skálafell（另訂） | 雙人房×2間含早餐，不可取消（2026-07-17 已訂） |
| D7 | 10/1 | Stracta Apartments Orustustaðir | NT$14,520 | 雅致 / Guide to Iceland | **同 A團** | 已訂，9/24前可免費取消 |
| D8 | 10/2 | Hestheimar, Hella | NT$9,815 | 雅致 / Booking | **同 A團** | 9/27前可免費取消 |
| D9 | 10/3 | Flyers Airport Hotel（待確認） | NT$8,493 | Agoda | Golden Circle Domes - Lake View（另訂） | 深夜班機前短暫休憩，A團尚未定 |

**A團住宿費加總**：NT$126,645（全部 D0–D9 已有金額）。B團另訂之夜（D3/D5/D6/D9）費用 Sheet 未列。

---

## 目前已知 Bug / 待辦

| 項目 | 說明 |
|------|------|
| ~~D6 住宿費~~ | ✅ 已訂：Guesthouse Stekkatun NT$17,442（雅致/Trip.com，雙人房×2含早餐，不可取消） |
| ~~D7 住宿費~~ | ✅ 已訂：Stracta Apartments Orustustaðir NT$14,520（雅致/Guide to Iceland） |
| D0 飯店名稱 | Google Sheet 無列出 9/24 飯店名稱，費用已更新為 NT$25,329，飯店名稱確認後填入 |
| D9 住宿確認 | Flyers Airport Hotel 待定（深夜班機前 hotel，Agoda 尚未訂） |
| ~~B 団住宿~~ | ✅ 已收錄：A/B 團住宿已在 HTML 每日住宿區分「A團／B團・同住或另訂」清楚標示 |
| B 團費用 | 豆林羅哈另訂之夜（D3/D5/D6/D9）Sheet 未列費用，確認後可補 |
| **D2(9/26) 溫泉地點** | **Sheet 本身兩分頁矛盾**：主排程分頁寫「藍湖溫泉 Blue Lagoon」，Daily detail／景點簡表分頁寫「Sky Lagoon」。HTML 目前採用 Sky Lagoon（座標/介紹/費用皆為 Sky Lagoon），已在景點標籤與差異說明區塊加註警示（2026-07-17）。**owner 需自行確認實際要去哪一個，AI 不擅自決定** |
| ~~D7 Svartifoss~~ 已移除 | 2026-07-28：依 owner 指示「Day 7 依 Google Sheet 顯示」，Svartifoss 不在 Sheet D7 行程 → 已從 D7 景點移除（行程緊湊、與 Hof 集合點相反方向）。改於「今日重點提醒」註記為可略選項。D7 景點回到 Sheet 的 3 站：傑古沙龍→鑽石沙灘→冰川健行 |
| D8 Gljúfrabúi 無行程細節 | 未列在 Daily detail 分頁，popup 無「行程細節」段落，HTML 已有 tips 註記 |
| ~~冰川健行預約~~ | ✅ 已訂（Sheet「體驗行程」分頁 預約=TRUE）：Troll Expeditions／GetYourGuide，10/1，NT$41,755/8人。已入 HTML 景點＋行前預約表 |
| **D7 冰川集合點在 Hof（非 Skaftafell）＋14:00 抵達** | Troll.is 集合點為 **Hof**（Hofgarður 以西1km、Falljökull 以東9km、距 Jökulsárlón 約30min），路邊有免費私人停車場，結束回同地點。在 Skaftafell 遊客中心**東方約 25km**，座標已由 64.018,-16.975 改為 **63.992,-16.705**。時間：**tour 14:30 出發，須 14:00（提早30分）抵達**否則喪失名額。D7 已依 Sheet 顯示（無 Svartifoss），行程緊湊提醒放在「今日重點提醒」：鑽石沙灘後直接往 Hof（約26km/30分），Hof 無餐廳需先吃或自備。（Owner 已於 2026-07-28 提供 GYG 集合原文確認） |
| 未預約項目（行前表追蹤） | Sky Lagoon、藍湖、米糊/Earth Lagoon、梵谷博物館、e-SIM 皆 **待訂**（見 🧳 行前準備 tab 預約狀態總表） |

---

## 班機資訊（D0 出發日 9/24）

| 人 | 航班 |
|----|------|
| 致黃 | 台灣→阿姆斯特丹 TPE→AMS 23:59→(+1)08:15 |
| Carol | 台灣→香港 TPE→HKG 19:30→21:30；香港→阿姆斯特丹 HKG→AMS 23:15→(+1)06:55 |
| 致黃+Carol | 阿姆斯特丹→冰島 AMS→KEF 17:05→18:20（AMS 會合後同班，9/25落地） |
| 桓哥 | 司徒加特→冰島 STR→KEF 15:15→23:20（9/25落地） |
| 林豆 | 倫敦→冰島 LHR→KEF 21:25→23:35（9/25落地） |
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

> 專案目錄現在有 4 個檔：`index.html`（主體）＋ PWA 三件套 `manifest.webmanifest`、`sw.js`、`icon.svg`。

```
index.html  （單一自包含檔，無 build 工具）
├── <head>          manifest / theme-color / icon 連結
├── <style>         設計系統 + 所有元件 CSS（含 @media print 列印樣式）
├── <body>
│   ├── #sidebar    左側面板
│   │   ├── .sb-head     標題 + 統計 chip + 🔍 景點搜尋框
│   │   ├── .edit-bar    🖨列印 / ✏️價格編輯 / 🔄重設
│   │   ├── .tab-bar     Overview / 🧳行前 + D0–D9 tab
│   │   └── #panels      overview + prep + 10 個 day panel
│   └── #map        Leaflet 地圖（flex: 1）
└── <script>
    ├── DAYS[]      所有資料（景點/住宿/餐廳/提醒/班機）
    ├── BOOKINGS[] PACKING[] INFO_LINKS[] ACC_GEO{}   行前/住宿資料
    ├── buildOverview() / buildDayPanel() / buildPrep()  面板
    ├── mkIcon() / mkBedIcon() / popupHtml() / accPopupHtml()  地圖圖標與 popup
    ├── activateDay() / showAll() / showPrep()  分頁切換
    ├── showSegLabels() / showBeds()   當天里程 pill／住宿床標記
    ├── 景點搜尋 IIFE + printBtn + serviceWorker.register('sw.js')
    └── flyToSpot()       地圖飛行 + 自動開 popup

manifest.webmanifest  PWA 設定（start_url/scope=./，standalone）
sw.js                 service worker：app shell 網路優先、圖磚/照片 cache-first；改版時 bump VERSION
icon.svg              app icon（極光主題）
```

---

## 重要注意事項

1. **價格編輯**：點 ✏️ 按鈕才能修改價格，直接點文字沒反應。編輯後儲存在 `localStorage`，重設按鈕可清除。

2. **住宿費是 column-aligned**：Google Sheet 的「住宿費」列，每個價格對應「同一欄」的日期，**不是**按順序排列。D6/D7 欄位為空（尚未訂房）。

3. **D8 里程**：約208 km / 3小時（若住 Hella），Sheet 原始資料如此標示。

4. **D6 里程差異**：Sheet 寫「220km」，但實際 Seyðisfjörður→Höfn 約 330km，HTML 已標注此差異（原始 Sheet 誤記）。

5. **A/B 兩團住宿**：A團（卡致豆桓）與 B團（豆林羅哈）在 Sheet 是兩列。**HTML 每日住宿區塊已同時顯示兩團**：資料放在 `day.acc`（A團，含價格）與 `day.acc.b`（B團另訂）／`day.acc.bSame:true`（B團同住）。同住的夜晚（D1/D2/D4/D7/D8）顯示「B團與 A團同住此處」；各自訂房的夜晚（D3 Guesthouse AkurInn、D5 Greystone summerhouse、D6 Guesthouse Skálafell、D9 Golden Circle Domes）分開列出。B團費用 Sheet 未列。

6. **圖片**：從 English Wikipedia API (`/api/rest_v1/page/summary/{wiki}`) 異步載入縮圖，有 in-memory cache，失效時顯示空白圓形。

7. **地圖 Tiles**：CartoDB Voyager。

---

## 線上部署（GitHub Pages）

| 項目 | 內容 |
|------|------|
| 固定網址 | **https://carolchi0421.github.io/iceland-trip-map/** |
| Repo | https://github.com/carolchi0421/iceland-trip-map （Public） |
| GitHub 帳號 | carolchi0421 |
| 線上版來源檔 | `C:\Users\CC\Downloads\iceland-trip-map\index.html`（= 本專案 HTML，唯一來源） |
| gh CLI | `C:\Program Files\GitHub CLI\gh.exe`（v2.96，已登入 keyring） |

> ⚠️ 部署前的舊複本 `C:\Users\CC\Downloads\冰島旅遊地圖.html` **已刪除**。線上版只有一個來源檔：`iceland-trip-map\index.html`。

---

### 🤖 給 AI：使用者說「幫我改 XXX」時的完整流程

當使用者要求修改地圖內容（例如填住宿費、改景點、調樣式），要**一次做完以下所有步驟**，不要只改一半：

1. **編輯** `C:\Users\CC\Downloads\iceland-trip-map\index.html`（線上版唯一來源）。
2. **本機驗證**改動正確（檢查 HTML 結構、必要時開檔確認）。
3. **同步 HANDOVER**：若改動涉及住宿費表、待辦、班機等本文件記錄的資訊，一併更新此 `HANDOVER.md`，並複製一份到 `iceland-trip-map\HANDOVER.md`。
4. **暫存 + commit**（此時可以 commit，但先不要 push）：
   ```
   git -C C:\Users\CC\Downloads\iceland-trip-map add -A
   git -C C:\Users\CC\Downloads\iceland-trip-map commit -m "說明"
   ```
5. **⛔ push 前一定要先問使用者**：commit 完成後，明確詢問「要現在 push 上線嗎？」等使用者同意才執行：
   ```
   git -C C:\Users\CC\Downloads\iceland-trip-map push
   ```
6. push 後告知：約 30 秒–1 分鐘線上版 https://carolchi0421.github.io/iceland-trip-map/ 會自動更新（網址不變）。

**重點規則**：
- ✅ 每次「改東西」都要把上面 1–4 步做完（改檔、驗證、同步文件、commit）。
- ⛔ **不要每次都自動 push**。push 是「發布上線」的動作，**每次 push 前都必須先問使用者、得到同意才 push**。
- 使用者可能一次改好幾項後才決定一起 push，別自作主張提早發布。

---

## 最後一次 AI 作業日期
2026-07-28（三大功能包：① 新增 🧳 行前準備 tab＝預約狀態總表＋可勾選打包清單（localStorage）＋冰島即時資訊連結；② POI 上地圖＝住宿 🛏 床標記＋餐廳/住宿 Google Maps 搜尋連結；③ PWA 離線（新增 sw.js/manifest.webmanifest/icon.svg）＋景點搜尋框＋列印樣式＋冰川集合點座標校正到 Hof 63.992,-16.705 並標註 owner 需確認當日時間軸。另補 10/4 回程航班、冰川健行已預訂資訊。以 `node --check` 與 DOM stub 冒煙測試通過）

2026-07-17（同步 Sheet：D0 住宿費 20,969→25,329、D6 住宿已訂 Guesthouse Stekkatun NT$17,442（原 Höfn i Hornafirði 待定），住宿總計連動更新為 NT$126,645，差異說明區塊新增 2 項；另外把 D2 溫泉 Sheet 兩分頁矛盾（藍湖 vs Sky Lagoon）的警示同步標到景點標籤與差異說明區塊，共新增第 3 項，差異說明變為 10 項——此項未自行判斷，等 owner 確認）
