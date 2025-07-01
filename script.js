// Firebase 初期化
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore, collection, doc, addDoc, getDocs, updateDoc, deleteDoc,
  serverTimestamp, query, orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDjPy3df4YHOpq7LiK4JPOiUueeSQLWdOs",
  authDomain: "my-memo-site2.firebaseapp.com",
  projectId: "my-memo-site2",
  storageBucket: "my-memo-site2.appspot.com",
  messagingSenderId: "315786136304",
  appId: "1:315786136304:web:32b98c73e97c10f0ad1035"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// DOM取得
const categoryList = document.getElementById("categoryList");
const addCategoryBtn = document.getElementById("addCategoryBtn");
const newCategoryInput = document.getElementById("newCategoryInput");
const memoForm = document.getElementById("memoForm");
const memoInput = document.getElementById("memoInput");
const memoList = document.getElementById("memoList");

let currentCategoryId = null;

// 日付フォーマット
function formatTimestamp(ts) {
  if (!ts) return "";
  const date = ts.toDate();
  return date.toLocaleString("ja-JP", {
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit"
  });
}

// カテゴリ読み込み
async function loadCategories() {
  categoryList.innerHTML = "";

  // Gemini AI カテゴリ追加
  const geminiLi = document.createElement("li");
  geminiLi.textContent = "生成AI";
  geminiLi.style.backgroundColor = "purple";
  geminiLi.style.color = "white";
  geminiLi.style.cursor = "pointer";
  geminiLi.onclick = () => {
    currentCategoryId = null;
    memoList.innerHTML = "";
    showGeminiInput();
  };
  categoryList.appendChild(geminiLi);

  const snapshot = await getDocs(collection(db, "categories"));
  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    const li = document.createElement("li");
    const nameSpan = document.createElement("span");
    nameSpan.textContent = data.name;
    nameSpan.style.cursor = "pointer";
    nameSpan.onclick = () => {
      currentCategoryId = docSnap.id;
      loadMemos();
    };

    const editBtn = document.createElement("button");
    editBtn.textContent = "✏️";
    editBtn.onclick = async () => {
      const newName = prompt("カテゴリ名を編集:", data.name);
      if (newName) {
        await updateDoc(doc(db, "categories", docSnap.id), { name: newName });
        loadCategories();
      }
    };

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "🗑️";
    deleteBtn.onclick = async () => {
      if (confirm("このカテゴリと中のメモを全て削除します。よろしいですか？")) {
        await deleteAllMemos(docSnap.id);
        await deleteDoc(doc(db, "categories", docSnap.id));
        if (currentCategoryId === docSnap.id) currentCategoryId = null;
        loadCategories();
        loadMemos();
      }
    };

    li.appendChild(nameSpan);
    li.appendChild(editBtn);
    li.appendChild(deleteBtn);
    categoryList.appendChild(li);
  });
}

function showGeminiInput() {
  const container = document.createElement("div");
  container.style.margin = "20px";

  const input = document.createElement("textarea");
  input.placeholder = "生成AIに質問を入力...";
  input.style.width = "100%";
  input.style.height = "80px";
  input.style.marginBottom = "10px";
  container.appendChild(input);

  const button = document.createElement("button");
  button.textContent = "送信";
  button.onclick = () => {
    const prompt = input.value.trim();
    if (prompt) {
      addGeminiMessage(prompt, "user");
      fetchGeminiResponse(prompt);
    }
  };
  container.appendChild(button);

  memoList.appendChild(container);
}

function addGeminiMessage(text, role) {
  const div = document.createElement("div");
  div.className = role === "user" ? "user-bubble" : "gemini-bubble";
  div.textContent = text;
  memoList.appendChild(div);
}

async function fetchGeminiResponse(prompt) {
  addGeminiMessage("生成中...", "gemini");

  try {
    const apiKey = "YOUR_GEMINI_API_KEY";
    const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" + apiKey, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "エラーが発生しました。";
    memoList.lastChild.textContent = text;
  } catch (e) {
    memoList.lastChild.textContent = "エラー: " + e.message;
  }
}

loadCategories();
