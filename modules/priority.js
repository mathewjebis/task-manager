// Fallback priority for tasks that don't have an explicit priority set
// (e.g. tasks pulled in from the demo API on first load). User-created
// tasks now set their own priority via the priority select in the UI.
export function assignPriority(id) {
  if (id % 3 === 0) return "High";
  if (id % 3 === 1) return "Medium";
  return "Low";
}

export function getPriorityColor(priority) {
  if (priority === "High") return { bg: "#ffe0e0", color: "#e74c3c" };
  if (priority === "Medium") return { bg: "#fff4e0", color: "#f39c12" };
  return { bg: "#e0f7e9", color: "#27ae60" };
}
