const memoForm = document.getElementById("memoForm");
const memoInput = document.getElementById("memoInput");
const memoList = document.getElementById("memoList");

function loadMemos() {
  const memos = JSON.parse(localStorage.getItem("memos") || "[]");
  memoList.innerHTML = "";

  memos.forEach((memo, index) => {
    const li = document.createElement("li");
    li.textContent = memo;

    // 削除ボタン追加
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "削除";
    deleteBtn.style.marginLeft = "10px";
    deleteBtn.onclick = () => {
      deleteMemo(index);
    };

    li.appendChild(deleteBtn);
    memoList.appendChild(li);
  });
}

function deleteMemo(index) {
  const memos = JSON.parse(localStorage.getItem("memos") || "[]");
  memos.splice(index, 1);
  localStorage.setItem("memos", JSON.stringify(memos));
  loadMemos();
}

memoForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = memoInput.value.trim();
  if (text) {
    const memos = JSON.parse(localStorage.getItem("memos") || "[]");
    memos.push(text);
    localStorage.setItem("memos", JSON.stringify(memos));
    memoInput.value = "";
    loadMemos();
  }
});

loadMemos();
