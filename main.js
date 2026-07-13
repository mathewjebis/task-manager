import { TaskApiService } from "./modules/api.js";
import { loadFromLocal, saveToLocal, getLocalSize } from "./modules/storage.js";
import { displayTasks, liveDetails, updateStorageInfo } from "./modules/ui.js";
import { NetworkError, handleError, showBanner } from "./modules/errors.js";
import { createTaskProxy } from "./modules/tasks.js";
import {
  setAllTasks,
  getAllTasks,
  addTask,
  deleteTask,
  startEdit,
  cancelEdit,
  saveEdit,
  completeTask,
  sortTasks,
  checkTasksMessage,
  getNextTaskMessage,
  applyFiltersAndRender,
  clearAllTasks,
  setFilterStrategy,
  taskObserver,
} from "./modules/tasks.js";

const toggleBtn = document.getElementById("theme-toggle");
const currentTheme = localStorage.getItem("theme") || "light";

function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

function throttle(fn, limit) {
  let lastCall = 0;
  return function (...args) {
    let now = Date.now();
    if (now - lastCall >= limit) {
      lastCall = now;
      fn(...args);
    }
  };
}

const debouncedSearch = debounce(() => applyFiltersAndRender(), 400);
const throttledSort = throttle((direction) => sortTasks(direction), 1000);

// --- Button wiring (replaces inline onclick="" attributes) ---
document.getElementById("add-btn").addEventListener("click", addTask);
document.getElementById("add-box").addEventListener("keydown", (e) => {
  if (e.key === "Enter") addTask();
});
document
  .getElementById("sort-asc")
  .addEventListener("click", () => throttledSort("asc"));
document
  .getElementById("sort-desc")
  .addEventListener("click", () => throttledSort("desc"));
document.getElementById("check-btn").addEventListener("click", () => {
  showBanner(checkTasksMessage(), "info");
});
document.getElementById("next-btn").addEventListener("click", () => {
  showBanner(getNextTaskMessage(), "info");
});
document.getElementById("clear-btn").addEventListener("click", () => {
  if (getAllTasks().length === 0) return;
  let confirmed = confirm("Delete all tasks? This cannot be undone.");
  if (confirmed) clearAllTasks();
});
document
  .getElementById("search-box")
  .addEventListener("input", debouncedSearch);

document.getElementById("filter-buttons").addEventListener("click", (e) => {
  let button = e.target.closest("button[data-filter]");
  if (!button) return;
  document
    .querySelectorAll("#filter-buttons button")
    .forEach((b) => b.classList.remove("active"));
  button.classList.add("active");
  setFilterStrategy(button.dataset.filter);
});

// Event delegation for per-task buttons (add/edit/delete/complete/save/cancel)
document.getElementById("task-list").addEventListener("click", (e) => {
  let button = e.target.closest("button");
  if (!button) return;
  let id = Number(button.dataset.id);
  let action = button.dataset.action;

  if (action === "delete") deleteTask(id);
  if (action === "edit") startEdit(id);
  if (action === "complete") completeTask(id);
  if (action === "cancel-edit") cancelEdit();
  if (action === "save-edit") {
    let input = document.querySelector(`.edit-input[data-id="${id}"]`);
    if (input) saveEdit(id, input.value);
  }
});

// --- Central reaction to task state changes ---
// Data-mutating events get persisted; every event (including editing
// state changes) triggers a re-render so the UI stays in sync.
const dataMutatingEvents = new Set([
  "add",
  "delete",
  "edit",
  "complete",
  "sort",
  "clear",
]);

taskObserver.subscribe((event, data) => {
  if (event === "render") {
    displayTasks(data);
    liveDetails(getAllTasks());
    observeTasks();
    return;
  }
  if (event === "validation-error") {
    showBanner(data.message, "error");
    return;
  }
  if (event === "proxy-error") {
    handleError(data);
    return;
  }

  if (dataMutatingEvents.has(event)) {
    saveToLocal(getAllTasks());
    updateStorageInfo(getLocalSize());
  }
  applyFiltersAndRender();
});

function observeTasks() {
  let items = document.querySelectorAll("#task-list li");
  let observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0)";
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 },
  );
  items.forEach((item) => {
    item.style.opacity = "0";
    item.style.transform = "translateY(20px)";
    item.style.transition = "opacity 0.3s ease, transform 0.3s ease";
    observer.observe(item);
  });
}

const api = new TaskApiService();

async function init() {
  let savedData = loadFromLocal();
  try {
    if (savedData) {
      let rawTasks = JSON.parse(savedData);
      let proxiedTasks = rawTasks.map((task) => createTaskProxy(task));
      setAllTasks(proxiedTasks);
    } else {
      // users is now actually used: each demo task gets assigned a
      // name pulled from the users endpoint, fetched in parallel above.
      let { todos, users } = await api.getMultipleData();
      let proxiedTodos = todos.map((task, index) =>
        createTaskProxy({
          ...task,
          assignedTo: users[index % users.length]?.name,
        }),
      );
      setAllTasks(proxiedTodos);
      saveToLocal(proxiedTodos);
    }

    applyFiltersAndRender();
  } catch (error) {
    handleError(new NetworkError("Failed to connect to system!"));
    document.getElementById("task-list").innerHTML =
      "<li>Failed to connect to system.</li>";
  }
  liveDetails(getAllTasks());
  updateStorageInfo(getLocalSize());
}

if (currentTheme === "dark") {
  document.documentElement.setAttribute("data-theme", "dark");
  toggleBtn.textContent = "☀️";
}

toggleBtn.addEventListener("click", () => {
  let theme = document.documentElement.getAttribute("data-theme");
  if (theme === "dark") {
    document.documentElement.setAttribute("data-theme", "light");
    localStorage.setItem("theme", "light");
    toggleBtn.textContent = "🌙";
  } else {
    document.documentElement.setAttribute("data-theme", "dark");
    localStorage.setItem("theme", "dark");
    toggleBtn.textContent = "☀️";
  }
});

init();
