# 離職同事留言牆

給 40-50 位同事寫留言用的網頁，留言會即時存進 Firebase，大家打開網頁就能看到全部留言，不需要重新整理。網頁一打開會先看到大頭照與問候語，接著是全體合照，然後才是大家的留言牆與留言表單。

## 檔案說明

- `index.html`：頁面結構
- `style.css`：樣式
- `script.js`：留言送出 / 即時顯示的邏輯，**唯一需要你修改程式碼的檔案**
- `README.md`：這份說明

## 設定步驟

### 1. 改同事的名字

打開 `script.js`，最上面：

```js
const COLLEAGUE_NAME = "小美";
```

改成同事的名字，標題、副標、各區塊小標都會自動套用。

### 2. 放入同事的大頭照

把你要用的照片檔案改名成 `photo.jpg`，放到跟 `index.html` 同一個資料夾裡就完成了。照片會以直式相框的樣子，用一點旋轉角度呈現在畫面左上角（有點像拍立得照片貼上去的感覺），建議挑選直式、大約半身的照片，網頁會自動裁切成合適的比例。

- 如果照片不是 `.jpg`（例如 `.png`），打開 `index.html` 搜尋 `photo.jpg`，改成你實際的檔名即可。
- 如果暫時沒有照片也沒關係，網頁會自動顯示一個可愛的預設圖示，之後有照片再放進資料夾覆蓋就好。

### 3. 放入全體合照（橫幅照片）

大頭照下方有一個長方形的橫幅區塊，適合放全體合照或活動照。把照片改名成 `team.jpg`，放進跟 `index.html` 同一個資料夾即可。

- 沒有照片時，這裡會自動顯示「放上合照吧」的可愛提示，不會顯示壞掉的圖示。
- 建議挑選較寬的橫式照片，網頁會自動裁切成合適的比例。

### 4. 放入第二張個人照片（右下角）

留言表單下方、頁尾上方，有一個靠右對齊、帶點旋轉角度的小相框，適合再放一張同事的照片（例如另一個表情、另一個場合的照片），跟開頭左上角的照片頭尾呼應。

- 把照片改名成 `photo2.jpg`，放進同一個資料夾即可。
- 沒有照片時會自動顯示可愛的預設圖示，不影響版面。
- 想改照片下面那句話（預設是「下一站，精彩無限 🚀」），打開 `index.html` 搜尋 `closing-photo__caption`，改成你想寫的文字即可。

### 5. 建立 Firebase 專案並取得設定金鑰

1. 到 [firebase.google.com](https://firebase.google.com)，用 Google 帳號登入，建立新專案。
2. 左側選單點「Build → Firestore Database」，按「建立資料庫」，選「以測試模式啟動」，地區選 `asia-east1`（或離你近的）。
3. 回到專案總覽頁，按「新增應用程式」選網頁（`</>` 圖示），輸入任意暱稱後註冊。
4. Firebase 會顯示一段 `firebaseConfig`，把裡面的值分別貼到 `script.js` 對應的欄位：

```js
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "...",
};
```

> 這組 `apiKey` 只是識別碼，公開在網頁裡是正常的，真正的存取權限是由下面的「安全規則」控制。

### 6. 本機測試

在 VS Code 安裝「Live Server」擴充套件，右鍵 `index.html` → **Open with Live Server**。試著送出一則留言，確認 Firebase 主控台的 Firestore 資料裡有出現，畫面也會即時顯示。

### 7. 加上安全規則（建議一定要做）

預設的「測試模式」是完全開放的，任何人都能改別人的留言。到 Firestore 的「規則」分頁，貼上：

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /messages/{messageId} {
      allow read: if true;
      allow create: if request.resource.data.name is string
                    && request.resource.data.name.size() < 20
                    && request.resource.data.message is string
                    && request.resource.data.message.size() < 300;
      allow update, delete: if false;
    }
  }
}
```

按「發布」。這樣所有人都能讀取、新增留言，但沒有人能修改或刪除別人的留言，也限制了留言長度。

### 8. 部署上線

最簡單的方式是 GitHub Pages：

1. 把這個資料夾（含 `photo.jpg`、`team.jpg`、`photo2.jpg` 等照片）推到 GitHub 上一個新的 repository。
2. 到 repo 的 **Settings → Pages**，Source 選 `main` 分支、根目錄 `/`，儲存。
3. 等 1-2 分鐘，會拿到一個網址，例如 `https://你的帳號.github.io/repo名稱/`。

把網址分享給同事的 40-50 位同事，大家打開就能直接留言。

## 之後想調整的小地方

- 留言顯示順序：`script.js` 裡的 `orderBy("createdAt", "desc")`，改成 `"asc"` 就會變成最舊的留言在最上面。
- 留言字數上限：`index.html` 裡 textarea 的 `maxlength`，記得同時改安全規則裡的 `size() < 300`。
- 裝飾用的表情符號（🎈✨🎉🚀💛）都寫在 `index.html` 的 `hero__deco` 區塊和 `style.css` 的 `STICKERS`／`.deco`，想換成別的圖案直接改文字即可。
