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
| 差異說明 | 可收合說明區塊。**2026-08-26 起改為「待辦清單」性質**：只列還沒解決／owner 需確認的事項（`待確認`）與持續有效的價格提醒（`價格估算`），**不再累積歷史 changelog**——一旦某項被 owner 確認或 Sheet 更新解決，就整條移除，不要留「已確認／已修正／已同步」這類過去式項目卡在裡面。新資訊/新發現才新增。詳見下方「🤖 給 AI」流程 |
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

## 住宿費對照表（2026-09-06 更新版）

> **重要**：住宿費 row 為 **column-aligned**（每欄的價格對應該欄的日期）。
> 舊版 HTML 曾誤用「sequential pairing」導致 D1–D5 全部錯位。已修正。

> **四團並行**：A團（卡致水桓，2026-09-06 由「卡致豆桓」改名）／B團（豆林羅哈）／C團（屁孩來囉！）／**D團（摸摸小姐，2026-09-06 新加入）**在 Sheet 是四列。部分夜晚合住、部分各自訂房。「住宿費」row 主要對應 A團（已訂/計價），其餘團費用 Sheet 多數未列。
> ⚠️ **2026-09-06 Sheet 把好幾個晚上的住宿「合併」成同一團體訂房**：D1（A+B+C+D合住一個Airbnb）、D3（A+B合住新Airbnb）、D8（A+B+C+D合住12人Airbnb）、D9（B+C+D改列同一Google Maps連結）。合併後 Sheet 對這些欄位大多**不再顯示獨立金額**（住宿費儲存格被合併進說明文字裡），HTML 對應顯示「―」並在差異說明區塊標註待確認。

| Day | 日期 | A團飯店 | A團費用 | 狀態 |
|-----|------|------|------|------|
| D0 | 9/24(四) | 飯店未知（A/B/C團共用） | NT$18,191 | 2026-09-06 Sheet 再更新（原 28,289→25,429→25,329）；D團另訂 Flyers Airport Hotel |
| D1 | 9/25(五) | 8人住宿 Airbnb（**A+B+C+D四團合住**） | ― | 2026-08-26曾列NT$22,000，2026-09-06該欄與說明文字合併，未再顯示獨立金額 |
| D2 | 9/26(六) | Kirkjufell View Cottages（A+B同住） | NT$13,228 | 9/21前可免費取消；D團「後續喬房間」尚未定案 |
| D3 | 9/27(日) | **Day Dream - Townhall Square Apartment**（**A+B合住**，亞庫來利市區） | ― | 2026-09-06 Sheet更新：取代原 Steinaskjól／Colin訂的Airbnb；住宿費未列；D團「後續喬房間」尚未定案 |
| D4 | 9/28 | Vogar Travel Service（A+B同住） | NT$9,116 | D團「後續喬房間」尚未定案 |
| D5 | 9/29 | Hafaldan HI Hostel（**A+D同住**） | NT$9,565 | B團另訂 Greystone summerhouse、C團另訂 Media Luna Guesthouse |
| D6 | 9/30 | Guesthouse Stekkatun | NT$17,442 | 雙人房×2間含早餐，不可取消；D團住宿 Sheet 兩處矛盾（待確認） |
| D7 | 10/1 | Stracta Apartments Orustustaðir（A+B+C+D同地點，D團雙人房另訂） | NT$14,520 | 9/24前可免費取消 |
| D8 | 10/2 | **12人住宿 Airbnb**（**A+B+C+D四團合住**，含早餐） | NT$26,626 | 2026-09-06 Sheet更新：取代原 Hestheimar 各自訂房 |
| D9 | 10/3 | Nupan Deluxe（僅A團） | NT$8,891 | **B/C/D團改列「Tower Apartments」（Reykjavík）**，另有「Keflavik Micro Suites」連結用途待確認 |

**A團住宿費加總**：NT$117,579（D0 18,191 + D1 0(未列) + D2 13,228 + D3 0(未列) + D4 9,116 + D5 9,565 + D6 17,442 + D7 14,520 + D8 26,626 + D9 8,891）。**⚠️ 不含 D1/D3 兩晚金額（Sheet 未列），實際總花費會更高**。

### C團（屁孩來囉！）住宿對照表（2026-08-24 新發現，2026-08-25/26 擴充）

| Day | 日期 | C團飯店 | 備註 |
|-----|------|--------|------|
| D1 | 9/25(五) | 與A/B/D團合住8人Airbnb | 2026-09-06：D團也加入 |
| D2 | 9/26(六) | Kirkjufell Hotel（即 Hotel Framnes） | Grundarfjörður，近教會山 |
| D3 | 9/27(日) | Hotel Norðurland | 亞庫來利市區，距A/B團步行3分鐘（2026-09-06 Sheet 簡化措辭） |
| D4 | 9/28 | Vogahraun Guesthouse（同AB團地點） | 與 A/B團同一物業 |
| D5 | 9/29 | Media Luna Guesthouse | Seyðisfjörður 市區 |
| D6 | 9/30 | Guesthouse Skálafell（加床） | 與B團同地點，加床同住 |
| D7 | 10/1 | Stracta Apartments Orustustaðir（加床） | 與A/B/D團同地點，加床同住 |
| D8 | 10/2 | 與A/B/D團合住12人Airbnb | 2026-09-06：取代原本各自訂房的 Hestheimar |
| D9 | 10/3 | **Tower Apartments（Reykjavík）** | 2026-09-06 Sheet更新：已確定與B/D團同住，不再是「確認中」 |

### D團（摸摸小姐）住宿對照表（2026-09-06 新加入）

> D團是 2026-09-06 Sheet 新增的第四位旅伴，暱稱「摸摸小姐」。**班機與大家不同**：9/23 提前一天出發（台灣→西雅圖→冰島 TPE-SEA-KEF），9/25 09:25 落地KEF；回程 10/3 晚上 KEF→SEA→台灣（比其他人晚一天回到台灣，10/5清晨抵台）。

| Day | 日期 | D團住宿 | 備註 |
|-----|------|--------|------|
| D0 | 9/24(四) | **Flyers Airport Hotel**（獨立訂房） | 與A/B/C團「飯店未知」不同，D團已自行確認 |
| D1 | 9/25(五) | 與A/B/C團合住8人Airbnb | 可一起住 |
| D2 | 9/26(六) | ⏳ 房間安排中 | Sheet「可一起住/後續喬房間」，尚未定案跟哪一團 |
| D3 | 9/27(日) | ⏳ 房間安排中 | 同上 |
| D4 | 9/28 | ⏳ 房間安排中 | 同上 |
| D5 | 9/29 | 與A團同住 Hafaldan HI Hostel | 已確定 |
| D6 | 9/30 | ⚠️ 確認中 | Sheet 兩處矛盾：一處寫已加床同住B/C團 Guesthouse Skálafell，另一處寫「需要另外找住宿」 |
| D7 | 10/1 | Stracta Apartments Orustustaðir（雙人房） | 與A/B/C團同地點，雙人房另訂 |
| D8 | 10/2 | 與A/B/C團合住12人Airbnb | 已確定 |
| D9 | 10/3 | Tower Apartments（Reykjavík，與B/C團同處） | 已確定 |

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

**差異說明區塊維護規則（2026-08-26 owner 指示）**：
- 這區塊是「待辦清單」，不是 changelog。每次同步 Sheet 後：
  - 已經被 owner 確認、或 Sheet 已補齊資料而解決的項目 → **整條刪除**，不要標成「已確認/已修正/已過時」留著
  - 真正還沒解決、owner 需要回答的（例如 Sheet 本身矛盾、資料缺漏）→ 保留為 `待確認`
  - 持續有效的提醒（例如票價每年會變、建議上官網再核對）→ 保留為 `價格估算`
  - 新發現的問題才新增一條
- `dtog.innerHTML` 的項目數是用 `diffs.length` 動態算的，不用手動數。

**同一住宿多團合住時的顯示規則**：若 A/B/C 團經 owner 確認是**同一筆訂房、真的睡在一起**（例如同一個 Airbnb 連結），就別再各團分開列一大段重複「與XX團同住」的文字——直接把 `acc.name`/`acc.sub` 寫成一則，`sub` 裡用逗號註明是哪幾團（例如「A團＋B團＋C團（卡致豆桓、豆林羅哈、屁孩來囉！）全部同住此處」），不要用 `day.acc.b`/`day.acc.bSame`/`day.acc.c` 三段式渲染。但如果是**同地點、不同筆訂房**（例如 C 團在 Booking.com 另外訂了同一棟建築的房間），仍維持分開列出並附各自連結，因為那是真的要各自處理的訂房資訊。

**重點規則**：
- ✅ 每次「改東西」都要把上面 1–4 步做完（改檔、驗證、同步文件、commit）。
- ⛔ **不要每次都自動 push**。push 是「發布上線」的動作，**每次 push 前都必須先問使用者、得到同意才 push**。
- 使用者可能一次改好幾項後才決定一起 push，別自作主張提早發布。

---

## 最後一次 AI 作業日期
2026-09-06（第六輪：**新旅伴「D團（摸摸小姐）」加入＋多筆住宿合併**，owner 說「google sheet又更新了，再把html同步更新」）：
- 🆕 **Sheet 新增第四團「D團（摸摸小姐）」**：9/23 提前出發（台灣→西雅圖→冰島 TPE-SEA-KEF，9/25 09:25落地KEF）、10/3晚班機KEF→SEA→台灣離境（比其他人晚回台）。已在 D0–D9 各日住宿區塊補上 D團資訊，全新的 `day.acc.d` 渲染邏輯（比照 C團模式）
- ⚠️ **A團隊名變更**：「卡致豆桓」→「卡致水桓」，Sheet 兩處一致，已同步改名
- ⚠️ **D0(9/24) 住宿費**：NT$28,289 → **NT$18,191**
- ⚠️ **D3(9/27) A+B團合住新 Airbnb**：由 Steinaskjól Apartments／Colin訂的Airbnb改為「Day Dream - Townhall Square Apartment」（亞庫來利市區，WebSearch 反查確認），住宿費 Sheet 未列
- ⚠️ **D8(10/2) A+B+C+D團合住12人 Airbnb**（NT$26,626，含早餐），取代原本 Hestheimar 各自訂房；ACC_GEO[8] 座標同步更新為 Sheet 提供的精確座標
- ⚠️ **D9(10/3) B/C/D團改列 Google Maps 連結「Tower Apartments」**（Reykjavík，已 resolve 短連結查出地點名），取代原「Golden Circle Domes」與「確認中」狀態；另有第二個連結「Keflavik Micro Suites」用途不明，已在 tips 與差異說明標註待確認
- ⚠️ **D1(9/25) 住宿費**：2026-08-26曾列NT$22,000，這次 Sheet 該欄與描述文字合併後不再顯示獨立金額，改列「―」並在差異說明標註
- ⚠️ **住宿總計連動**：NT$141,445 → **NT$117,579**（不含 D1/D3 未列金額的兩晚，已在差異說明特別註記避免誤解成真的變便宜）
- 差異說明區塊本輪淨增：新增「D團加入」新增項＋多筆「待確認」項目，全部依循先前建立的「待辦清單」原則（只留待確認/新增，不留歷史 changelog）
- HANDOVER.md 住宿費對照表全面改版：A團表格更新、C團表格同步四團合住狀態、**新增 D團專屬對照表**
- ⚠️ 本次因環境變化（新 session、新 scratchpad 路徑）headless Edge 無法產生任何輸出（`--version` 都無回應），**無法做 DOM smoke test**，僅完成 `node --check` 語法驗證與手動比對 diff。建議 push 後請 owner 實際點開網站確認 D0/D3/D8/D9 幾張卡片顯示正常
- 尚未 push，依專案流程待 owner 確認後上線

2026-08-26（第五輪：**地圖底圖 CartoDB Voyager 需要 API key 的問題**）：
- ⚠️ CartoDB 把 `basemaps.cartocdn.com` 這組匿名免費 raster 圖磚鎖起來了，沒有 key 會回傳畫有「API KEY REQUIRED」浮水印的圖磚（不是前端能移除的文字，是伺服器端畫進圖片本身）。官方文件也說這組 raster 圖磚正在走向淘汰
- 一度改成免key的 OpenStreetMap 標準圖磚，但 owner 覺得樣式跟原本 Voyager 差太多，**要求改回 CartoDB Voyager 網址**，即使目前會顯示浮水印
- **現狀**：`index.html`/`sw.js` 的圖磚設定已改回 `basemaps.cartocdn.com`（帶浮水印）。若之後 owner 想要真正修好，**必須去 https://carto.com/basemaps/apikey 申請免費 API key**（不用信用卡），把 key 加進 tile URL（`?api_key=YOUR_KEY`）即可完全恢復原本 Voyager 樣式且無浮水印——這是唯一能拿回「一模一樣」畫面的方法，其他免key圖層樣式都會不同
- sw.js VERSION bump v2→v3(OSM)→v4(改回cartocdn)

2026-08-26（第四輪：**差異說明區塊瘦身＋合住住宿顯示簡化**，owner 看到線上版後要求把「已確認/已過時」項目全部去掉、只留待確認+新資訊，並把 D1(9/25) A/B/C三團合住的重複區塊改成一則）：
- ✅ 差異說明區塊從 18 項砍到 **9 項**：全部移除「已修正/已確認/已同步/已過時」類的歷史 changelog 項目，只留 6 個「待確認」＋2 個「價格估算」＋1 個荷蘭資料缺漏提醒
- ✅ D1(9/25) 住宿改成單一區塊：`8人住宿（Airbnb）`，`sub` 直接寫「A團＋B團＋C團（卡致豆桓、豆林羅哈、屁孩來囉！）全部同住此處」，拿掉原本 `bSame`/`c` 三段式重複渲染
- ✅ HANDOVER.md 新增兩條長期規則：差異說明區塊維護原則（待辦清單而非changelog）、多團合住的顯示規則（同一筆訂房才合併顯示，同地點不同訂房仍分開列）
- 已用 headless Edge 驗證：差異說明顯示「9項」、D1 內容含三團名稱且不再有單獨的「A團‧卡致豆桓」標籤、無 JS runtime error

2026-08-26（第三輪：新增荷蘭雙行程功能，owner 要求「跟冰島一模一樣的方式設計...另一個tab是for荷蘭」；過程中發現 Sheet 又有新更動，一併同步）：
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
