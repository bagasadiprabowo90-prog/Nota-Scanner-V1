# Google Sheets Setup (Gratis!)

Ikuti langkah ini untuk menghubungkan aplikasi ke Google Sheets:

## 1. Buat Google Sheet

1. Buka [Google Sheets](https://sheets.google.com)
2. Buat spreadsheet baru
3. Rename sheet pertama menjadi `Transactions`
4. Buat header di baris 1:

| A | B | C | D | E | F | G |
|---|---|---|---|---|---|---|
| id | type | category | description | amount | date | source |

## 2. Buat Apps Script

1. Di spreadsheet, klik **Extensions → Apps Script**
2. Hapus semua kode, paste kode berikut:

```javascript
const SHEET_NAME = "Transactions";

function doGet(e) {
  const action = e.parameter.action;
  if (action === "getAll") {
    return getAll();
  }
  return ContentService.createTextOutput(JSON.stringify({ error: "Unknown action" }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  if (data.action === "add") {
    return addTransaction(data);
  }
  if (data.action === "delete") {
    return deleteTransaction(data.id);
  }
  return ContentService.createTextOutput(JSON.stringify({ error: "Unknown action" }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getAll() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const transactions = data.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => obj[h] = row[i]);
    return obj;
  });
  return ContentService.createTextOutput(JSON.stringify({ transactions }))
    .setMimeType(ContentService.MimeType.JSON);
}

function addTransaction(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const id = Date.now().toString();
  sheet.appendRow([id, data.type, data.category, data.description, data.amount, data.date, data.source || "manual"]);
  const tx = { id, type: data.type, category: data.category, description: data.description, amount: data.amount, date: data.date, source: data.source };
  return ContentService.createTextOutput(JSON.stringify({ transaction: tx }))
    .setMimeType(ContentService.MimeType.JSON);
}

function deleteTransaction(id) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) {
      sheet.deleteRow(i + 1);
      return ContentService.createTextOutput(JSON.stringify({ success: true }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  return ContentService.createTextOutput(JSON.stringify({ success: false }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

## 3. Deploy sebagai Web App

1. Klik **Deploy → New deployment**
2. Pilih type: **Web app**
3. Execute as: **Me**
4. Who has access: **Anyone**
5. Klik **Deploy**
6. Copy URL yang diberikan

## 4. Set Environment Variable

1. Buat file `.env.local` di root project:

```
NEXT_PUBLIC_GSHEET_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

2. Restart aplikasi

## Catatan

- Data disimpan di Google Sheets Anda sendiri → **100% GRATIS**
- Tidak ada biaya tersembunyi
- Tanpa Google Sheets URL, aplikasi tetap berfungsi menggunakan Local Storage browser
