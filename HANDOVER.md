# 冰島旅遊地圖 — AI Handover Document

## 這個專案是什麼

`index.html` 是一個**單頁互動式旅遊規劃地圖**，整合側邊欄行程與 Leaflet.js 地圖，讓使用者點景點就能在地圖上飛行定位、查看 popup 與 Wikipedia 照片。

**2026-08-26 起改為雙行程網站**：最上方新增「🇮🇸 冰島／🇳🇱 荷蘭」分頁切換（`.trip-switch` + `switchTrip(id)`），同一網址、同一介面骨架，切換時整個側欄與地圖重新渲染成另一趟行程的資料。冰島（原本功能）維持不變；荷蘭是簡化版（見下方「雙行程架構」章節）。

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
| 行「B団住宿」| 豆林羅哈 4 人住宿（HTML 已收錄，同住或另訂皆標示） |
| 行「C団住宿 (屁孩來囉！)」| 2026-08-24 發現新增的第三團，僅 D2/D3/D4/D5/D8 有 Booking.com 連結，其餘天數空白，Sheet 未列費用 |
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
| D0 | 9/24(四) | 飯店未知 | NT$28,289 | — | — | 待確認飯店名稱（2026-08-26 Sheet 再更新為 NT$28,289，先前為 25,429／25,329） |
| D1 | 9/25(五) | ~~Flyers Airport Hotel~~ → 8人住宿 Airbnb（與B/C團合住） | NT$22,000 | Carol / Agoda（**已取消，記得退掉**） | **同 A團（合住 Airbnb）** | 2026-08-25 Sheet更新：原 Flyers 訂房取消，改與 B/C團合住同一 Airbnb（連結見下）；2026-08-26 Sheet 補上新 Airbnb 實際費用 NT$22,000 |
| D2 | 9/26(六) | Kirkjufell View Cottages | NT$13,228 | 雅致 / Agoda | **同 A團** | 9/21前可免費取消 |
| D3 | 9/27(日) | Steinaskjól Apartments | NT$8,579 | 雅致 / Agoda | ~~Guesthouse AkurInn~~ → Colin 的 Airbnb 訂房（另訂） | ⚠️ 2026-08-25 Sheet更新：B團住宿由 AkurInn 改為 Colin 已訂的 Airbnb（原在備選清單） |
| D4 | 9/28 | Vogar Travel Service | NT$9,116 | 秉翔 / Booking | **同 A團** | — |
| D5 | 9/29 | Hafaldan HI Hostel | NT$9,565 | 卡羅 / Booking | Greystone summerhouse（另訂） | — |
| D6 | 9/30 | Guesthouse Stekkatun | NT$17,442 | 雅致 / Trip.com | Guesthouse Skálafell（另訂） | 雙人房×2間含早餐，不可取消（2026-07-17 已訂） |
| D7 | 10/1 | Stracta Apartments Orustustaðir | NT$14,520 | 雅致 / Guide to Iceland | **同 A團** | 已訂，9/24前可免費取消 |
| D8 | 10/2 | Hestheimar, Hella | NT$9,815 | 雅致 / Booking | **同 A團** | 9/27前可免費取消 |
| D9 | 10/3 | **Nupan Deluxe**（凱夫拉維克市區 Aðalgata 10） | NT$8,891 | 雅致 / Booking | Golden Circle Domes - Lake View（另訂） | 已訂，2026/9/27前（不含當日）可免費取消（2026-08-13 同步 Sheet） |

**A團住宿費加總**：NT$141,445（2026-08-26 Sheet 更新後：D0 28,289 + D1 22,000 + D2 13,228 + D3 8,579 + D4 9,116 + D5 9,565 + D6 17,442 + D7 14,520 + D8 9,815 + D9 8,891）。B團另訂之夜（D3/D5/D6/D9）費用 Sheet 未列。

### C團（屁孩來囉！）住宿對照表（2026-08-24 新發現，2026-08-25 擴充）

> Sheet 新增「C團住宿 (屁孩來囉！)」列。2026-08-24 首次發現時僅 D2/D3/D4/D5/D8 有資料；2026-08-25 Sheet 再更新，補上 D1/D6/D7/D9，僅 D0/D10 仍空白。C團住宿費 Sheet 全程未列。

| Day | 日期 | C團飯店 | 備註 |
|-----|------|--------|------|
| D1 | 9/25(五) | 8人住宿 Airbnb（與A/B團合住） | 2026-08-25新增，與A/B團同一 Airbnb |
| D2 | 9/26(六) | Kirkjufell Hotel（即 Hotel Framnes） | Grundarfjörður，近教會山。2026-08-24 Sheet 為 Share 短連結（已反查出實際飯店 Hotel Framnes）；2026-08-25 Sheet 改列明文「Kirkjufell Hotel」（同一物業的別名） |
| D3 | 9/27(日) | Hotel Norðurland | 亞庫來利市區，距A團步行2分鐘、距B團步行3分鐘（2026-08-25 Sheet 新增距離資訊） |
| D4 | 9/28 | Vogahraun Guesthouse（同AB團地點） | Sheet 原文「同AB團地點 Vogar Travel Service」，與 A/B團同一物業 |
| D5 | 9/29 | Media Luna Guesthouse | Seyðisfjörður 市區，距A團3分鐘車程、距B團(Egilsstaðir)30分鐘車程（2026-08-25 Sheet 新增距離資訊） |
| D6 | 9/30 | Guesthouse Skálafell（加床） | 2026-08-25新增，與B團同地點，加床同住 |
| D7 | 10/1 | Stracta Apartments Orustustaðir（加床） | 2026-08-25新增，與A/B團同地點，加床同住 |
| D8 | 10/2 | Hestheimar（另訂房） | 與 A/B團同一地點，2人1房另訂 |
| D9 | 10/3 | ⏳ 確認中 | 2026-08-25新增，Sheet 原文「看B團能不能加床（確認中）」，尚無確定住宿 |

---

## 目前已知 Bug / 待辦

| 項目 | 說明 |
|------|------|
| ~~D6 住宿費~~ | ✅ 已訂：Guesthouse Stekkatun NT$17,442（雅致/Trip.com，雙人房×2含早餐，不可取消） |
| ~~D7 住宿費~~ | ✅ 已訂：Stracta Apartments Orustustaðir NT$14,520（雅致/Guide to Iceland） |
| D0 飯店名稱 | Google Sheet 無列出 9/24 飯店名稱，費用已更新為 NT$25,429，飯店名稱確認後填入 |
| ~~D9 住宿確認~~ | ✅ 已訂：Nupan Deluxe NT$8,891（雅致/Booking，凱夫拉維克市區 Aðalgata 10，距 KEF 約 5 分鐘，2026/9/27前不含當日可免費取消）。取代原「Flyers Airport Hotel（待確認）NT$8,493」 |
| **取車時間 Sheet 自相矛盾** | Sheet 9/26 欄註記「取車約 08:00 在機場取車（桓哥訂的 Booking）」，但 9/25 欄景點列 Lotus Car Rental。HTML 目前維持 D1(9/25) 落地後取車，已在 D2 提醒與差異說明加註警示。**owner 需確認實際取車時間與租車公司** |
| ~~B 団住宿~~ | ✅ 已收錄：A/B 團住宿已在 HTML 每日住宿區分「A團／B團・同住或另訂」清楚標示 |
| B 團費用 | 豆林羅哈另訂之夜（D3/D5/D6/D9）Sheet 未列費用，確認後可補 |
| **D2(9/26) 溫泉地點** | **Sheet 本身兩分頁矛盾**：主排程分頁寫「藍湖溫泉 Blue Lagoon」，Daily detail／景點簡表分頁寫「Sky Lagoon」。HTML 目前採用 Sky Lagoon（座標/介紹/費用皆為 Sky Lagoon），已在景點標籤與差異說明區塊加註警示（2026-07-17）。**owner 需自行確認實際要去哪一個，AI 不擅自決定** |
| ~~D7 Svartifoss~~ 已移除（**註：Sheet 主排程分頁其實有列**） | 2026-08-13 覆查：Sheet **主排程分頁** D7 欄確實列有「斯瓦蒂佛斯／黑瀑布 Svartifoss（同個停車點）」，但 **Daily detail 分頁沒有**。因 Svartifoss 在 Skaftafell、與 14:00 Hof 集合方向相反且會遲到，維持 owner 2026-07-28 決定不排入，改在提醒與差異說明加註。原記錄「不在 Sheet」有誤，已更正。<br>2026-07-28：依 owner 指示「Day 7 依 Google Sheet 顯示」 → 已從 D7 景點移除（行程緊湊、與 Hof 集合點相反方向）。改於「今日重點提醒」註記為可略選項。D7 景點回到 Sheet 的 3 站：傑古沙龍→鑽石沙灘→冰川健行 |
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

## 雙行程架構（冰島／荷蘭，2026-08-26 新增）

### 資料來源與範圍
- **冰島**：D0–D9（9/24–10/3），資料同前，完整功能（住宿A/B/C團、價格編輯、行前準備、差異說明）。
- **荷蘭**：D10–D15（10/4–10/9，冰島行程結束後的阿姆斯特丹延伸假期）。來源是 Google Sheet 一張**與冰島同格式的結構化表格**（列標籤：班機/住宿/住宿費/景點/Road Map/交通/景點），**不是**分頁裡另外三處重複出現的長段文字草稿（那三處是複製貼上的舊草稿殘影，內容一字不差，已確認忽略）。
- ⚠️ **荷蘭資料不完整**：Sheet 該表格部分儲存格內容過長，read_file_content 工具固定在同一位置截斷，重新查詢多次結果一致（非隨機截斷，是硬性長度上限）。已如實收錄讀到的部分，缺漏處已在對應日期的 `tips` 註明並標記 ⚠️，包括：
  - ~~D12(10/6) NDSM 段落句子被截斷~~ → 2026-08-26 重新查詢已補齊：免費渡輪F4號線約14分鐘，晚餐在水岸貨櫃餐廳
  - ~~D13/D14 景點分配一度誤判兩次~~ → **owner 直接確認最終版本**：D13(10/7) = 風車村 Zaanse Schans ＋ 福倫丹 Volendam 同天；D14(10/8) = 羊角村 Giethoorn 單獨一天
  - **D11(10/5)** 補上阿姆斯特丹運河遊船完整場次資訊：18:30、1小時、可免費改期，**Fareharbor 完整訂票連結**已由 owner 確認並收錄（先前一度誤放在 D10，且連結被讀取工具截斷）
  - 若要再核對，建議直接開 Sheet 該表格用滑鼠展開儲存格查看，或請 owner 截圖
- 荷蘭景點座標**非 Sheet 提供**（該表格 Road Map/交通列全空）：改用知名地標的公開座標（Anne Frank House、Rijksmuseum、Zaanse Schans 等），來源為一般地理常識／公開資料，不是行程決策內容，風險低。

### 簡化範圍（依 owner 2026-08-26 指示）
荷蘭分頁刻意**不**包含：住宿A/B/C團分組、價格編輯（✏️/🔄按鈕隱藏）、🧳行前準備 tab（按鈕隱藏）、差異說明區塊。**保留**：總覽卡片、地圖互動（點景點飛地圖／點marker開popup）、每日景點時間軸、Wikipedia縮圖、Google Maps導航連結、🖨列印。

### 程式架構（`index.html` 內）
- `ICELAND_DAYS[]` / `NL_DAYS[]`：兩份行程資料，取代原本單一的 `DAYS`。
- `let DAYS`：目前作用中的行程，`switchTrip()` 時重新賦值（`ICELAND_DAYS` 或 `NL_DAYS`）。
- `TRIPS{iceland,netherlands}`：每個行程的設定物件——標題文字、日期/天數chip、地圖初始中心與zoom（`home:[lat,lon,zoom]`）、`showAcc`（是否顯示住宿區塊）、`showPrep`（是否顯示行前準備按鈕）、`editable`（是否顯示價格編輯按鈕）。
- `switchTrip(id)`：切換行程的總開關——重設 `DAYS`、更新側欄標題/chip文字、依 `cfg` 顯示/隱藏行前準備與編輯按鈕、重新呼叫 `buildOverview()` + `renderTabsAndPanels()` + `renderMapLayers()` + `rebuildSearchIndex()`，最後 `showAll()` 回到總覽並飛到該行程的地圖中心。
- `buildOverview()`：改為可重複呼叫（開頭 `panel.innerHTML=''`），依 `cfg.showAcc` 決定要不要顯示差異說明區塊與住宿總計；日曆卡片邏輯抽成共用函式 `buildOverviewCards(panel)`。
- `buildDayPanel()`：住宿區塊整段包在 `if(TRIPS[ACTIVE_TRIP].showAcc&&day.acc){...}` 內，其餘（景點時間軸、餐廳、班機、tips）維持共用不動。
- `renderTabsAndPanels()` / `renderMapLayers()`：原本寫死在頁面載入時執行一次的組裝流程，抽成可重複呼叫的函式，切換行程時會先清掉舊行程的 DOM/Leaflet layers 再重建。`.dtabs` 的 grid 欄數也改成依 `DAYS.length` 動態設定（不再寫死 `repeat(10,1fr)`）。
- `showAll()` 的地圖飛行目標改讀 `TRIPS[ACTIVE_TRIP].home`（不再寫死冰島座標）。
- 已驗證：`node --check`（語法）＋ headless Edge DOM smoke test（實際點擊分頁切換按鈕，確認 tab/panel 數量正確切換、無 JS runtime error、地圖 marker 正常生成、Wikipedia 縮圖正常載入）。

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
2026-08-26（**新增荷蘭雙行程功能**，owner 要求「跟冰島一模一樣的方式設計...另一個tab是for荷蘭」；過程中發現 Sheet 又有新更動，一併同步）：
- 🆕 **新增「🇮🇸冰島／🇳🇱荷蘭」雙行程分頁**：詳見上方「雙行程架構」章節。荷蘭 D10–D15（10/4–10/9），簡化版功能（無住宿分組/價格編輯/行前準備/差異說明，保留地圖互動＋景點時間軸＋Wikipedia縮圖＋列印）
- ⚠️ **同步作業期間 Sheet 又被 owner 即時編輯**，比對到 2 項新變動一併修正：
  - D0(9/24) 住宿費 NT$25,429 → **NT$28,289**
  - D1(9/25) 新 Airbnb 住宿費由「未列」補齊為 **NT$22,000**（原 Flyers 金額 NT$10,558 已作廢）
  - 住宿總計連動 NT$127,143 → **NT$141,445**
- ✅ D12(10/6) NDSM 段落先前因讀取工具截斷而不完整，重新查詢已補齊：免費渡輪F4號線約14分鐘、晚餐在水岸貨櫃餐廳
- ✅ D10(10/4) 阿姆斯特丹運河遊船補上場次時間 18:30（1小時，可免費改期）；Sheet 附的訂票連結本身被截斷不完整，未收錄
- 已用 headless Edge 做 DOM smoke test（語法檢查＋實際點擊切換分頁＋確認無 JS runtime error＋地圖 marker/Wikipedia 縮圖正常）並截圖存證
- 追加修正兩輪（owner 直接確認最終版本）：運河遊船改列到 **D11(10/5)**（原誤放 D10），補上完整 Fareharbor 訂票連結；**D13(10/7) = 風車村＋福倫丹同天，D14(10/8) = 羊角村單獨一天**（中間一度誤拆成福倫丹與羊角村同天，已改回）
- 尚未 push，依專案流程待 owner 確認後上線

2026-08-25（**第三次以 Google Sheet 為 source 全面比對同步**，owner 說「google sheet又更新了」，要求再同步）：
- ⚠️ **D1(9/25) 住宿變動**：A團原訂 Flyers Airport Hotel（Carol/Agoda）Sheet 已標記「已取消（記得退掉）」，改為與 B/C團合住同一 8人 Airbnb；住宿費 NT$10,558 仍是原 Flyers 金額，新 Airbnb 費用 Sheet 未列 → 已同步至 HTML，並在差異說明與 tips 加註待確認
- ✅ **D3(9/27) B團住宿變動**：由 Guesthouse AkurInn 改為 Colin 已訂的 Airbnb（原本只是 D3 備選清單中的一個候選連結，現已成為 B團正式住宿）→ 已同步，並將該連結從備選清單移除
- ✅ **C團擴充**：新增 D6(Guesthouse Skálafell加床)、D7(Stracta Apartments Orustustaðir加床)、D9(⏳確認中，能否與B團加床)；D1(與A/B團合住同一Airbnb)；D2 由連結改列明文「Kirkjufell Hotel」（即先前反查到的 Hotel Framnes）；D3/D5 新增距其他團的步行/車程距離備註 → C團現已涵蓋 D1–D9（僅 D0/D10 空白），全部同步進 HTML
- ✅ B團住宿區塊 render 新增可點擊連結支援（`day.acc.b.url`，比照 C團）
- 差異說明區塊新增 3 項並修正 1 項過時項目（原「Flyers已確認」→ 標註後續已取消），改為依 `diffs.length` 動態計算項目數，避免手動計數再度失準
- 比對結果：A/B團住宿費、景點清單、班機、冰川健行預約、Road Map 等其餘欄位與 2026-08-24 同步版本一致，無其他落差
- 已 push 上線（owner 確認後）

2026-08-24（**再次以 Google Sheet 為 source 全面比對同步**，owner 要求「不match的馬上補進html」）：
- ✅ Sheet 主排程分頁新增第三團「**C團住宿 (屁孩來囉！)**」列（HANDOVER 先前未記錄，Sheet modifiedTime 2026-08-24，晚於 2026-08-13 上次同步），於 D2/D3/D4/D5/D8 有 Booking.com 連結、其餘天數空白、Sheet 未列費用
- ✅ 已補進 HTML：D2 Hotel Framnes（Sheet 為 Share 短連結，已反查出實際飯店）、D3 Hotel Norðurland、D4 Vogahraun Guesthouse、D5 Media Luna Guesthouse、D8 Hestheimar（另訂房）— 每日住宿區塊新增「C團」標籤與連結，總覽卡片與差異說明區塊（13→14項）同步更新
- 比對結果：A團/B團住宿費、景點清單、班機、冰川健行預約等其餘欄位與 2026-08-13 同步版本一致，無其他落差
- ✅ 已 push 上線（owner 確認後，2026-08-24）

2026-08-13（**以 Google Sheet 為 source 做全面比對同步**）：
- ✅ D9(10/3) 住宿 `Flyers Airport Hotel（待確認）NT$8,493` → **`Nupan Deluxe` NT$8,891**（雅致/Booking，凱夫拉維克市區 Aðalgata 10，2026/9/27前不含當日可免費取消）；`ACC_GEO[9]` 座標由機場 63.985,-22.605 → 市區 **64.0043,-22.5644**
- ✅ D0(9/24) 住宿費 NT$25,329 → **NT$25,429**（Sheet 原值 25,428.5）
- ✅ 住宿總計連動 NT$126,645 → **NT$127,143**
- ✅ 塞爾福斯 Selfoss 8人整套房源（約NT$31,667）依 Sheet 欄位由 D9 移到 **D8(10/2)** 備選住宿，並還原 Sheet 原始連結（check_in 2026-10-02）
- ⚠️ 新增 2 項待確認：**取車時間**（Sheet 9/26 欄寫 08:00 機場取車/桓哥訂 Booking vs 9/25 欄 Lotus Car Rental）、**D7 Svartifoss**（Sheet 主排程分頁有列、Daily detail 分頁無）
- 差異說明區塊 10 項 → **13 項**；`sw.js` VERSION bump `iceland-v1` → `iceland-v2`
- 比對結果：D1–D9 景點清單、車程/里程、A團與B團住宿、班機、冰川健行預約（10/1 NT$41,755/8人）皆與 Sheet 一致，無其他落差

2026-07-28（三大功能包：① 新增 🧳 行前準備 tab＝預約狀態總表＋可勾選打包清單（localStorage）＋冰島即時資訊連結；② POI 上地圖＝住宿 🛏 床標記＋餐廳/住宿 Google Maps 搜尋連結；③ PWA 離線（新增 sw.js/manifest.webmanifest/icon.svg）＋景點搜尋框＋列印樣式＋冰川集合點座標校正到 Hof 63.992,-16.705 並標註 owner 需確認當日時間軸。另補 10/4 回程航班、冰川健行已預訂資訊。以 `node --check` 與 DOM stub 冒煙測試通過）

2026-07-17（同步 Sheet：D0 住宿費 20,969→25,329、D6 住宿已訂 Guesthouse Stekkatun NT$17,442（原 Höfn i Hornafirði 待定），住宿總計連動更新為 NT$126,645，差異說明區塊新增 2 項；另外把 D2 溫泉 Sheet 兩分頁矛盾（藍湖 vs Sky Lagoon）的警示同步標到景點標籤與差異說明區塊，共新增第 3 項，差異說明變為 10 項——此項未自行判斷，等 owner 確認）
