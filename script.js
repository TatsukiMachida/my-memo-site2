// Firebase SDKをCDN経由で読み込む（type="module"を使う想定）
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// あなたのFirebaseプロジェクト設定
const firebaseConfig = {
  apiKey: "AIzaSyDjPy3df4YHOpq7LiK4JPOiUueeSQLWdOs",
  authDomain: "my-memo-site2.firebaseapp.com",
  projectId: "my-memo-site2",
  storageBucket: "my-memo-site2.firebasestorage.app",
  messagingSenderId: "315786136304",
  appId: "1:315786136304:web:32b98c73e97c10f0ad1035"
};

// 初期化
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const memosCol = collection(db, "memos");

const memoForm = document.getElementById("memoForm");
const memoInput = document.getElementById("memoInput");
const memoList = document.getElementById("memoList");

// メモ一覧を取得して表示
async function loadMemos() {
  memoList.innerHTML = "";
  const snapshot = await getDocs(memosCol);
  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const li = document.createElement("li");
    li.textContent = data.text;

    // 改行保持
    li.style.whiteSpace = "pre-wrap";

    // 削除ボタン
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "削除";
    deleteBtn.style.marginLeft = "10px";
    deleteBtn.onclick = async () => {
      await deleteDoc(doc(db, "memos", docSnap.id));
      loadMemos();
    };

    li.appendChild(deleteBtn);
    memoList.appendChild(li);
  });
}

// メモの送信処理
memoForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = memoInput.value.trim();
  if (text) {
    await addDoc(memosCol, { text });
    memoInput.value = "";
    loadMemos();
  }
});

// 初期表示
loadMemos();
