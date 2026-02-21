<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# ✈️ Solo Travel App

一個專為獨自旅行者設計的 React 應用程式，集成了行程規劃、支出管理、雲端同步與 AI 助手。

## ✨ 特色功能

- **📍 行程規劃**：建立與管理每日活動，支援地圖預覽與天氣預報。
- **💰 支出管理**：追蹤多幣值消費，視覺化支出圖表。
- **🎫 票券保管 (Wallet)**：整合儲存機票、飯店確認單與 QR Code。
- **🤖 AI 助手**：一鍵生成推薦行程（需 Gemini API）。
- **📊 雲端 persistent**：整合 Google Sheets 作為後端資料庫。
- **📱 行動優先**：優化的浮動視窗設計，適合行動裝置操作。

---

## 🚀 快速開始

### 1. 安裝環境
確保你的電腦已安裝 [Node.js](https://nodejs.org/) (建議 v18 以上)。

### 2. 下載與安裝
```bash
# 下載專案
git clone <repository-url>
cd solo-travel

# 安裝依賴
npm install
```

### 3. 配置環境變數 (`.env.local`)
在專案根目錄建立 `.env.local` 檔案：
```env
VITE_GEMINI_API_KEY=你的_Gemini_API_金鑰
VITE_GAS_URL=你的_Google_Apps_Script_網路應用程式網址
```

### 4. 啟動開發伺服器
```bash
npm run dev
```
打開 [http://localhost:3000](http://localhost:3000) 即可開始使用。

---

## 📊 Google Sheets 雲端同步設定

本專案使用 Google Sheets 作為後端存儲，請依照以下步驟設定：

### 第一步：準備試算表
在你的 Google 試算表中建立 **3 個頁籤 (Tabs)**，並在第一列填入以下 **精確的欄位名稱**：

| 頁籤名稱 | 欄位標題 (精確複製第一列) |
| :--- | :--- |
| **`plane`** | `id`, `date`, `time`, `title`, `description`, `type`, `location_lat`, `location_lng`, `address`, `isCompleted`, `notes`, `priceEstimate`, `currency`, `images` |
| **`spend`** | `id`, `amount`, `currency`, `category`, `description`, `date`, `exchangeRateToBase`, `notes` |
| **`wallet`** | `id`, `type`, `title`, `date`, `qrCodeUrl`, `details`, `files`, `notes` |
| **`poi`** | `id`, `title`, `description`, `location_lat`, `location_lng`, `category`, `address` |

### 第二步：配置 Google Apps Script (GAS)
1. 在試算表中點選 **延伸功能 > Apps Script**。
2. 貼入以下程式碼：

```javascript
function doGet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const data = {};
  ['plane', 'spend', 'wallet', 'poi'].forEach(name => {
    const sheet = ss.getSheetByName(name);
    if (!sheet) return;
    const values = sheet.getDataRange().getValues();
    const headers = values[0];
    const rows = values.slice(1);
    data[name] = rows.map(row => {
      const obj = {};
      headers.forEach((h, i) => {
        let val = row[i];
        try { if (typeof val === 'string' && (val.startsWith('[' ) || val.startsWith('{'))) val = JSON.parse(val); } catch(e) {}
        obj[h] = val;
      });
      return obj;
    });
  });
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const params = JSON.parse(e.postData.contents);
    const { action, type, data } = params;
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(type);
    const values = sheet.getDataRange().getValues();
    const headers = values[0];
    const idIndex = headers.indexOf('id');
    const rowData = headers.map(h => {
      let val = data[h];
      if (typeof val === 'object' && val !== null) return JSON.stringify(val);
      return val === undefined ? "" : val;
    });
    if (action === 'set') {
      let rowIndex = -1;
      for (let i = 1; i < values.length; i++) {
        if (values[i][idIndex] == data.id) { rowIndex = i + 1; break; }
      }
      if (rowIndex > 0) sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
      else sheet.appendRow(rowData);
    } else if (action === 'delete') {
      for (let i = 1; i < values.length; i++) {
        if (values[i][idIndex] == data.id) { sheet.deleteRow(i + 1); break; }
      }
    }
    return ContentService.createTextOutput(JSON.stringify({ status: 'success' })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}
```

3. 點選 **部署 > 新增部署**。
4. 類型選擇 **內容：Web 應用程式**。
5. 存取權限設為 **「所有人」(Anyone)**。
6. 部署後產生的 **網頁應用程式 URL** 需填入 `.env.local` 的 `VITE_GAS_URL`。

---

## 🧪 測試範例資料

若想測試同步功能，可手動將以下範例填入對應頁籤的第二列：

### Itinerary (`plane`) 範例
- **id**: `test-p1`
- **date**: `2023-10-24`
- **time**: `09:00`
- **title**: `清萊白廟參訪`
- **type**: `Sightseeing`
- **isCompleted**: `false`
- **priceEstimate**: `100`

### Expenses (`spend`) 範例
- **id**: `test-s1`
- **amount**: `350`
- **currency**: `THB`
- **category**: `Food`
- **description**: `泰式河粉午餐`
- **date**: `2023-10-24`
- **exchangeRateToBase**: `1`

### Wallet (`wallet`) 範例
- **id**: `test-w1`
- **type**: `Flight`
- **title**: `長榮航空 BR211`
- **date**: `Oct 25, 08:30`
- **details**: `座位 22A, 閘口 C1`

---

## ⚙️ 全域設定 (`src/config.ts`)

你可以直接修改 `src/config.ts` 來更改預設的旅遊目的地與幣值：
- `DESTINATION`: 更改天氣預報城市（如 'ChiangMai'）。
- `BASE_CURRENCY`: 更改預設貨幣（如 'THB'）。
- `CURRENCY_SYMBOL`: 更改顯示符號（如 '฿'）。
