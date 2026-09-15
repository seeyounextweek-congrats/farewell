// ===================================================================
// 1) 幫離職同事改名字：改這裡就好，標題會自動套用
// ===================================================================
const COLLEAGUE_NAME = "Matt"; // 例如 "小美"，會顯示成「給小美的留言牆」

// ===================================================================
// 2) 貼上 Firebase 主控台給你的設定物件（在「新增網頁應用程式」那步拿到）
// ===================================================================
const firebaseConfig = {
  apiKey: "AIzaSyC9QBD_d6bEx1aAKUjhBTuFKgNbOcImWgE",
  authDomain: "farewell-d9080.firebaseapp.com",
  projectId: "farewell-d9080",
  storageBucket: "farewell-d9080.firebasestorage.app",
  messagingSenderId: "152984265143",
  appId: "1:152984265143:web:b9deb21b8bbdaf3bdcc832",
  measurementId: "G-DJ66ZHB898",
};

// ===================================================================
// 以下不用改，是留言板的運作邏輯
// ===================================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// 把同事的名字套進標題、副標與各區塊小標
document.getElementById("page-title").textContent = `給${COLLEAGUE_NAME}的留言牆`;
document.getElementById("hero-title").textContent = `給${COLLEAGUE_NAME}的留言牆`;
document.getElementById("hero-subtitle").textContent =
  `這段時間辛苦你了。這裡集滿了大家想對${COLLEAGUE_NAME}說的話——謝謝、祝福，還有不捨，在下一段旅程開始前，好好收下。`;
document.getElementById("wall-heading").textContent = `大家想對${COLLEAGUE_NAME}說的話 💌`;
document.getElementById("form-heading").textContent = `留下你想對${COLLEAGUE_NAME}說的話 ✍️`;

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const messagesRef = collection(db, "messages");

const form = document.getElementById("message-form");
const nameInput = document.getElementById("name");
const messageInput = document.getElementById("message");
const errorEl = document.getElementById("form-error");
const submitBtn = document.getElementById("submit-btn");
const wallEl = document.getElementById("messages");
const wallStatusEl = document.getElementById("wall-status");

// 每則留言右上角的小貼圖，依序循環使用
const STICKERS = ["🎈", "⭐", "💛", "🌟", "🙌", "🎉"];

function showError(text) {
  errorEl.textContent = text;
  errorEl.hidden = false;
}

function clearError() {
  errorEl.hidden = true;
  errorEl.textContent = "";
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearError();

  const name = nameInput.value.trim();
  const message = messageInput.value.trim();

  if (!name || !message) {
    showError("請填寫姓名與留言內容");
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "祝福送出中…";

  try {
    await addDoc(messagesRef, {
      name,
      message,
      createdAt: serverTimestamp(),
    });
    form.reset();
    nameInput.focus();
  } catch (err) {
    console.error(err);
    showError("送出失敗，請確認網路連線或稍後再試一次");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "送出祝福 🎁";
  }
});

function formatTime(timestamp) {
  if (!timestamp) return "剛剛";
  return timestamp.toDate().toLocaleString("zh-TW", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function renderMessages(snapshot) {
  wallEl.innerHTML = "";

  if (snapshot.empty) {
    wallStatusEl.textContent = "目前還沒有留言，成為第一個留言的人吧！";
    return;
  }

  wallStatusEl.textContent = `目前共有 ${snapshot.size} 則留言`;

  let index = 0;
  snapshot.forEach((doc) => {
    const data = doc.data();

    const card = document.createElement("article");
    card.className = "note-card";

    const stickerEl = document.createElement("span");
    stickerEl.className = "note-card__sticker";
    stickerEl.setAttribute("aria-hidden", "true");
    stickerEl.textContent = STICKERS[index % STICKERS.length];

    const nameEl = document.createElement("p");
    nameEl.className = "note-card__name";
    nameEl.textContent = data.name;

    const messageEl = document.createElement("p");
    messageEl.className = "note-card__message";
    messageEl.textContent = data.message;

    const timeEl = document.createElement("p");
    timeEl.className = "note-card__time";
    timeEl.textContent = formatTime(data.createdAt);

    card.append(stickerEl, nameEl, messageEl, timeEl);
    wallEl.appendChild(card);
    index += 1;
  });
}

const messagesQuery = query(messagesRef, orderBy("createdAt", "desc"));

onSnapshot(
  messagesQuery,
  (snapshot) => renderMessages(snapshot),
  (err) => {
    console.error(err);
    wallStatusEl.textContent = "留言載入失敗，請確認 firebaseConfig 是否已填寫正確";
  }
);
