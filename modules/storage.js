export function saveToLocal(allTasks) {
  localStorage.setItem("myTasks", JSON.stringify(allTasks));
}

export function loadFromLocal() {
  return localStorage.getItem("myTasks");
}

export function clearLocal() {
  localStorage.removeItem("myTasks");
}

export function getLocalSize() {
  let data = localStorage.getItem("myTasks") || "";
  let sizeInKB = (new Blob([data]).size / 1024).toFixed(2);
  return sizeInKB;
}
