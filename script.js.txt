const memoForm = document.getElementById("memoForm");
const memoInput = document.getElementById("memoInput");
const memoList = document.getElementById("memoList");

function loadMemos() {
  const memos = JSON.parse(localStorage.getItem("memos") || "[]");
  memoList.innerHTML = "";
  memos.forEach((memo, index) => {
    const li = document.createElement("li");
    li.textContent = memo;
    memoList.appendChild(li);
  });
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
