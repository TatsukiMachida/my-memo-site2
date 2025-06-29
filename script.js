import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDjPy3df4YHOpq7LiK4JPOiUueeSQLWdOs",
  authDomain: "my-memo-site2.firebaseapp.com",
  projectId: "my-memo-site2",
  storageBucket: "my-memo-site2.firebasestorage.app",
  messagingSenderId: "315786136304",
  appId: "1:315786136304:web:32b98c73e97c10f0ad1035"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const memosCol = collection(db, "memos");

const memoForm = document.getElementById("memoForm");
const memoInput = document.getElementById("memoInput");
const memoList = document.getElementById("memoList");

// 日本時間でフォーマット
function formatTimestamp(ts) {
  if (!ts) return "";
  const date = ts.toDate();
  return date.toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

// メモと返信を描画
async function loadMemos() {
  memoList.innerHTML = "";
  const q = query(memosCol, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  for (const memoDoc of snapshot.docs) {
    const memoData = memoDoc.data();
    const memoId = memoDoc.id;

    const li = document.createElement("li");
    const memoText = document.createElement("div");
    memoText.textContent = memoData.text;
    memoText.className = "memo-text";
    li.appendChild(memoText);

    const date = document.createElement("div");
    date.textContent = formatTimestamp(memoData.createdAt);
    date.className = "memo-date";
    li.appendChild(date);

    // 編集ボタン
    const editBtn = document.createElement("button");
    editBtn.textContent = "編集";
    editBtn.onclick = async () => {
      const newText = prompt("メモを編集:", memoData.text);
      if (newText) {
        await updateDoc(doc(db, "memos", memoId), { text: newText });
        loadMemos();
      }
    };
    li.appendChild(editBtn);

    // 返信入力欄
    const replyInput = document.createElement("textarea");
    replyInput.placeholder = "返信を入力...";
    replyInput.className = "reply-input";
    li.appendChild(replyInput);

    const replyBtn = document.createElement("button");
    replyBtn.textContent = "返信追加";
    replyBtn.onclick = async () => {
      const text = replyInput.value.trim();
      if (text) {
        await addDoc(collection(db, "memos", memoId, "replies"), {
          text,
          createdAt: serverTimestamp()
        });
        replyInput.value = "";
        loadMemos();
      }
    };
    li.appendChild(replyBtn);

    // 返信表示
    const repliesCol = collection(db, "memos", memoId, "replies");
    const repliesSnapshot = await getDocs(query(repliesCol, orderBy("createdAt", "asc")));
    const replyList = document.createElement("ul");
    replyList.className = "reply-list";

    repliesSnapshot.forEach((replyDoc) => {
      const replyData = replyDoc.data();
      const replyId = replyDoc.id;

      const replyItem = document.createElement("li");
      replyItem.textContent = `${replyData.text}（${formatTimestamp(replyData.createdAt)}）`;

      // 編集ボタン
      const editReplyBtn = document.createElement("button");
      editReplyBtn.textContent = "編集";
      editReplyBtn.onclick = async () => {
        const newText = prompt("返信を編集:", replyData.text);
        if (newText) {
          await updateDoc(doc(db, "memos", memoId, "replies", replyId), { text: newText });
          loadMemos();
        }
      };
      replyItem.appendChild(editReplyBtn);

      // 削除ボタン
      const deleteReplyBtn = document.createElement("button");
      deleteReplyBtn.textContent = "削除";
      deleteReplyBtn.onclick = async () => {
        await deleteDoc(doc(db, "memos", memoId, "replies", replyId));
        loadMemos();
      };
      replyItem.appendChild(deleteReplyBtn);

      replyList.appendChild(replyItem);
    });

    li.appendChild(replyList);
    memoList.appendChild(li);
  }
}

// メモ新規追加
memoForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = memoInput.value.trim();
  if (text) {
    await addDoc(memosCol, {
      text,
      createdAt: serverTimestamp()
    });
    memoInput.value = "";
    loadMemos();
  }
});

loadMemos();
