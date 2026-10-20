const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const dateInput = document.getElementById("todo-date");
const list = document.getElementById("todo-list");
const filter = document.getElementById("filter");

let todos = [];

try {
  todos = JSON.parse(localStorage.getItem("todos")) || [];
} catch (e) {
  todos = [];
}

if (todos.length === 0 && !localStorage.getItem("todos-init")) {
  todos = [
    { id: 1, text: "Go for walking", done: false, date: "" },
    { id: 2, text: "Do homework", done: false, date: "" },
    { id: 3, text: "Plan the party", done: false, date: "" },
  ];
  localStorage.setItem("todos-init", "1");
}

function save() {
  localStorage.setItem("todos", JSON.stringify(todos));
}

const pad = (n) => String(n).padStart(2, "0");

function nowStr() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatDate(str) {
  const [datePart, timePart] = str.split("T");
  const [y, m, d] = datePart.split("-");
  let result = `${d}/${m}/${y}`;

  if (timePart) {
    let [h, min] = timePart.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    result += ` - ${pad(h)}:${pad(min)} ${period}`;
  }
  return result;
}

function isOverdue(str) {
  if (str.includes("T")) return str < nowStr();
  return str < nowStr().slice(0, 10); 
}

dateInput.min = nowStr();

function render() {
  const mode = filter.value;
  const visible = todos.filter((t) => {
    if (mode === "completed") return t.done;
    if (mode === "uncompleted") return !t.done;
    return true;
  });

  list.innerHTML = "";

  if (visible.length === 0) {
    list.innerHTML = '<li class="empty">No tasks here</li>';
    return;
  }

  visible.forEach((todo) => {
    const li = document.createElement("li");
    li.className = "todo-item" + (todo.done ? " completed" : "");

    const text = document.createElement("span");
    text.className = "todo-text";
    text.textContent = todo.text;

    const due = document.createElement("span");
    due.className = "todo-date";
    if (todo.date) {
      due.textContent = formatDate(todo.date);
      if (isOverdue(todo.date) && !todo.done) li.classList.add("overdue");
    }

    const check = document.createElement("button");
    check.className = "icon-btn check-btn";
    check.setAttribute("aria-label", "Toggle complete");
    check.innerHTML = `
      <span class="circle">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 12l5 5 9-10" />
        </svg>
      </span>`;
    check.addEventListener("click", () => {
      todo.done = !todo.done;
      save();
      render();
    });

    const del = document.createElement("button");
    del.className = "icon-btn";
    del.setAttribute("aria-label", "Delete task");
    del.innerHTML = `
      <svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor">
        <path d="M9 3h6l1 1h4v2H4V4h4l1-1zm-3 5h12l-1 12a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L6 8z" />
      </svg>`;
    del.addEventListener("click", () => {
      todos = todos.filter((t) => t.id !== todo.id);
      save();
      render();
    });

    li.append(text, due, check, del);
    list.appendChild(li);
  });
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const value = input.value.trim();
  if (!value) return;

  todos.push({ id: Date.now(), text: value, done: false, date: dateInput.value });
  input.value = "";
  dateInput.value = "";
  dateInput.min = nowStr();
  save();
  render();
});

filter.addEventListener("change", render);

setInterval(render, 60000);

render();