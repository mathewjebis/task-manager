import { saveToLocal, clearLocal } from "./storage.js";
import { assignPriority } from "./priority.js";
import { ValidationError } from "./errors.js";

let allTasks = [];
let editingId = null;

const taskObserver = {
  subscribers: [],
  subscribe(fn) {
    this.subscribers.push(fn);
  },
  unsubscribe(fn) {
    this.subscribers = this.subscribers.filter((sub) => sub !== fn);
  },
  notify(event, data) {
    this.subscribers.forEach((fn) => fn(event, data));
  },
};

const filterStrategies = {
  all: (tasks) => tasks.filter((task) => !task.completed),
  high: (tasks) =>
    tasks.filter((task) => !task.completed && getPriority(task) === "High"),
  medium: (tasks) =>
    tasks.filter((task) => !task.completed && getPriority(task) === "Medium"),
  low: (tasks) =>
    tasks.filter((task) => !task.completed && getPriority(task) === "Low"),
};

let currentStrategy = "all";

// A task created by the user always carries its own priority.
// Tasks pulled in from the demo API on first load don't, so they
// fall back to the id-derived priority for demo purposes only.
export function getPriority(task) {
  return task.priority || assignPriority(task.id);
}

export function setFilterStrategy(strategy) {
  currentStrategy = strategy;
  applyFiltersAndRender();
}

export function getAllTasks() {
  return allTasks;
}

export function setAllTasks(tasks) {
  allTasks = tasks;
}

export function getEditingId() {
  return editingId;
}

export function* taskGenerator(tasks) {
  for (let task of tasks) {
    yield task;
  }
}

// Returns a message instead of alert()-ing directly, so the UI layer
// decides how to display it (banner, in this app).
export function getNextTaskMessage() {
  let pending = allTasks.filter((task) => !task.completed);
  let gen = taskGenerator(pending);
  let next = gen.next();
  if (!next.done) {
    return "Next Task: " + next.value.title;
  }
  return "No pending tasks!";
}

export function checkTasksMessage() {
  let hasHighPriority = allTasks.some(
    (task) => getPriority(task) === "High" && !task.completed,
  );
  let allCompleted =
    allTasks.length > 0 && allTasks.every((task) => task.completed);
  if (allCompleted) return "All tasks completed!";
  if (hasHighPriority) return "You have high priority pending tasks!";
  return "No high priority tasks pending!";
}

export function applyFiltersAndRender() {
  let searchValue =
    document.getElementById("search-box")?.value.trim().toLowerCase() || "";
  let strategyFiltered = filterStrategies[currentStrategy](allTasks);
  let filtered = strategyFiltered.filter((task) =>
    task.title.toLowerCase().includes(searchValue),
  );
  taskObserver.notify("render", filtered);
}

export function deleteTask(id) {
  allTasks = allTasks.filter((task) => task.id != id);
  taskObserver.notify("delete", { id });
}

export function startEdit(id) {
  editingId = id;
  taskObserver.notify("edit-start", { id });
}

export function cancelEdit() {
  editingId = null;
  taskObserver.notify("edit-cancel", {});
}

export function saveEdit(id, newTitle) {
  let task = allTasks.find((task) => task.id === id);
  if (!task) return;

  newTitle = newTitle.trim();
  if (newTitle === "") {
    taskObserver.notify("validation-error", {
      message: "Task title cannot be empty!",
    });
    return;
  }

  task.title = newTitle;
  // Stored directly on the (serializable) task object instead of a
  // WeakMap, so it survives a page reload — tasks are recreated as new
  // objects from localStorage on every load, which a WeakMap can't track.
  task.lastEdited = new Date().toLocaleString();
  task.editCount = (task.editCount || 0) + 1;

  editingId = null;
  taskObserver.notify("edit", { id, title: newTitle });
}

export function completeTask(id) {
  let task = allTasks.find((task) => task.id === id);
  if (!task) return;

  task.completed = !task.completed;
  taskObserver.notify("complete", { id, completed: task.completed });
}

export function addTask() {
  let input = document.getElementById("add-box");
  let prioritySelect = document.getElementById("priority-select");
  if (!input) return;

  let title = input.value.trim();
  if (title === "") {
    taskObserver.notify("validation-error", {
      message: "Task title cannot be empty!",
    });
    return;
  }
  try {
    let newTask = createTaskProxy({
      id: Date.now(),
      title: title,
      completed: false,
      priority: prioritySelect?.value || "Medium",
    });

    allTasks.unshift(newTask);
    input.value = "";
    taskObserver.notify("add", newTask);
  } catch (error) {
    taskObserver.notify("proxy-error", error);
  }
}

export function sortTasks(direction) {
  // Spread operator shallow copy preserves the validation Proxies
  // cleanly during array sorting operations.
  let newArr = [...allTasks];

  newArr.sort((a, b) => {
    if (direction === "asc") return a.title.localeCompare(b.title);
    else return b.title.localeCompare(a.title);
  });

  allTasks = newArr;
  taskObserver.notify("sort", { direction });
}

export function clearAllTasks() {
  allTasks = [];
  clearLocal();
  taskObserver.notify("clear", {});
}

export function createTaskProxy(task) {
  return new Proxy(task, {
    set(target, prop, value) {
      if (prop === "title" && typeof value !== "string") {
        throw new TypeError("Title must be a string!");
      }
      if (prop === "title" && value.trim() === "") {
        throw new Error("Title cannot be empty!");
      }
      if (prop === "completed" && typeof value !== "boolean") {
        throw new TypeError("Completed must be true or false!");
      }
      if (prop === "priority" && !["High", "Medium", "Low"].includes(value)) {
        throw new TypeError("Priority must be High, Medium, or Low!");
      }
      return Reflect.set(target, prop, value);
    },
    get(target, prop) {
      return Reflect.get(target, prop);
    },
  });
}

export { taskObserver };
