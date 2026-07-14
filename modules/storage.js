import { StorageError } from "./errors.js";

export function saveToLocal(allTasks) {
  try {
    localStorage.setItem("myTasks", JSON.stringify(allTasks));
  } catch {
    throw new StorageError(
      "Could not save tasks — your browser's storage may be full or unavailable.",
    );
  }
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
