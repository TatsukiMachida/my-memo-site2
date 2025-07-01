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

    // 編集ボタン
    const editBtn = document.createElement("button");
    editBtn.textContent = "✏️";
    editBtn.onclick = async () => {
      const newName = prompt("カテゴリ名を編集:", data.name);
      if (newName) {
        await updateDoc(doc(db, "categories", docSnap.id), { name: newName });
        loadCategories();
      }
    };

    // 削除ボタン
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

// メモとその返信を全削除（カテゴリ削除時）
async function deleteAllMemos(categoryId) {
  const memosRef = collection(db, "categories", categoryId, "memos");
  const memosSnap = await getDocs(memosRef);
  for (const memo of memosSnap.docs) {
    const memoId = memo.id;
    const repliesRef = collection(db, "categories", categoryId, "memos", memoId, "replies");
    const repliesSnap = await getDocs(repliesRef);
    for (const reply of repliesSnap.docs) {
      await deleteDoc(doc(repliesRef, reply.id));
    }
    await deleteDoc(doc(memosRef, memoId));
  }
}

// メモ読み込み
async function loadMemos() {
  memoList.innerHTML = "";
  if (!currentCategoryId) return;
  const memoRef = collection(db, "categories", currentCategoryId, "memos");
  const snapshot = await getDocs(query(memoRef, orderBy("createdAt", "desc")));
  for (const docSnap of snapshot.docs) {
    const memo = docSnap.data();
    const memoId = docSnap.id;
    const li = document.createElement("li");
    const textDiv = document.createElement("div");
    textDiv.textContent = memo.text;
    li.appendChild(textDiv);
    const dateDiv = document.createElement("div");
    dateDiv.className = "memo-date";
    dateDiv.textContent = formatTimestamp(memo.createdAt);
    li.appendChild(dateDiv);

    // 編集
    const editBtn = document.createElement("button");
    editBtn.textContent = "編集";
    editBtn.onclick = async () => {
      const newText = prompt("編集：", memo.text);
      if (newText) {
        await updateDoc(doc(db, "categories", currentCategoryId, "memos", memoId), { text: newText });
        loadMemos();
      }
    };
    li.appendChild(editBtn);

    // 返信入力欄
    const replyInput = document.createElement("textarea");
    replyInput.className = "reply-input";
    replyInput.placeholder = "返信を入力...";
    li.appendChild(replyInput);

    const replyBtn = document.createElement("button");
    replyBtn.textContent = "返信追加";
    replyBtn.onclick = async () => {
      const text = replyInput.value.trim();
      if (text) {
        await addDoc(collection(db, "categories", currentCategoryId, "memos", memoId, "replies"), {
          text,
          createdAt: serverTimestamp()
        });
        loadMemos();
      }
    };
    li.appendChild(replyBtn);

    // 返信一覧
    const repliesRef = collection(db, "categories", currentCategoryId, "memos", memoId, "replies");
    const repliesSnap = await getDocs(query(repliesRef, orderBy("createdAt")));
    const replyList = document.createElement("ul");
    replyList.className = "reply-list";

    repliesSnap.forEach(replyDoc => {
      const reply = replyDoc.data();
      const replyId = replyDoc.id;
      const replyItem = document.createElement("li");
      replyItem.textContent = `${reply.text}（${formatTimestamp(reply.createdAt)}）`;

      // 編集
      const editReplyBtn = document.createElement("button");
      editReplyBtn.textContent = "編集";
      editReplyBtn.onclick = async () => {
        const newText = prompt("返信を編集:", reply.text);
        if (newText) {
          await updateDoc(doc(db, "categories", currentCategoryId, "memos", memoId, "replies", replyId), { text: newText });
          loadMemos();
        }
      };
      replyItem.appendChild(editReplyBtn);

      // 削除
      const deleteReplyBtn = document.createElement("button");
      deleteReplyBtn.textContent = "削除";
      deleteReplyBtn.onclick = async () => {
        await deleteDoc(doc(db, "categories", currentCategoryId, "memos", memoId, "replies", replyId));
        loadMemos();
      };
      replyItem.appendChild(deleteReplyBtn);

      replyList.appendChild(replyItem);
    });

    li.appendChild(replyList);
    memoList.appendChild(li);
  }
}

// メモ追加
memoForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!currentCategoryId) return;
  const text = memoInput.value.trim();
  if (text) {
    await addDoc(collection(db, "categories", currentCategoryId, "memos"), {
      text,
      createdAt: serverTimestamp()
    });
    memoInput.value = "";
    loadMemos();
  }
});

// カテゴリ追加
addCategoryBtn.addEventListener("click", async () => {
  const name = newCategoryInput.value.trim();
  if (!name) return;
  const ref = await addDoc(collection(db, "categories"), { name });
  newCategoryInput.value = "";
  loadCategories();
});

loadCategories();
