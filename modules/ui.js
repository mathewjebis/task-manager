import { getPriorityColor } from "./priority.js";
import { getEditingId, getPriority } from "./tasks.js";

// Prevents stored XSS: task titles (and assignee names) come from user
// input or a third-party API and were previously inserted into innerHTML
// unescaped. A title like `<img src=x onerror=alert(1)>` would have
// executed as real HTML before this fix.
function escapeHtml(str) {
  let div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

export function displayTasks(tasksToRender) {
  let listContainer = document.getElementById("task-list");
  listContainer.innerHTML = "";

  if (tasksToRender.length === 0) {
    listContainer.innerHTML = "<li>No tasks found</li>";
    return;
  }

  let editingId = getEditingId();

  tasksToRender.forEach((task) => {
    let priority = getPriority(task);
    let { bg, color } = getPriorityColor(priority);
    let li = document.createElement("li");

    if (task.id === editingId) {
      li.innerHTML = `
        <input type="text" class="edit-input" value="${escapeHtml(task.title)}" data-id="${task.id}" />
        <button class="save-btn" data-id="${task.id}" data-action="save-edit">Save</button>
        <button class="cancel-btn" data-id="${task.id}" data-action="cancel-edit">Cancel</button>
      `;
      let input = li.querySelector(".edit-input");
      // Save on Enter for convenience, matching the add-task input's behavior.
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          li.querySelector(".save-btn").click();
        }
      });
      listContainer.appendChild(li);
      // Auto-focus so editing feels immediate, same intent the old prompt() had.
      requestAnimationFrame(() => input.focus());
      return;
    }

    let editedBadge =
      task.editCount > 0
        ? `<span class="meta">edited ${task.editCount}x</span>`
        : "";
    let assigneeBadge = task.assignedTo
      ? `<span class="meta">assigned to ${escapeHtml(task.assignedTo)}</span>`
      : "";

    li.innerHTML = `
      <span class="badge" style="background:${bg};color:${color};">${priority}</span>
      <div class="title-wrap">
        <span class="title" style="${task.completed ? "text-decoration:line-through;opacity:0.6;" : ""}">${escapeHtml(task.title)}</span>
        ${assigneeBadge}
        ${editedBadge}
      </div>
      <button class="complete-btn" data-id="${task.id}" data-action="complete">${task.completed ? "Undo" : "Done"}</button>
      <button class="edit-btn" data-id="${task.id}" data-action="edit">Edit</button>
      <button data-id="${task.id}" data-action="delete">Delete</button>
    `;
    listContainer.appendChild(li);
  });
}

export function liveDetails(allTasks) {
  let p = document.getElementById("stats");
  let stats = allTasks.reduce(
    (acc, task) => {
      if (task.completed) acc.completed++;
      else acc.pending++;
      return acc;
    },
    { completed: 0, pending: 0 },
  );
  let total = allTasks.length;
  p.textContent = `Total: ${total} | Completed: ${stats.completed} | Pending: ${stats.pending}`;
}

export function updateStorageInfo(sizeInKB) {
  let el = document.getElementById("storage-info");
  if (el) el.textContent = `Storage used: ${sizeInKB} KB`;
}
