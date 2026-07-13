export class AppError extends Error {
  constructor(message, code) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.timestamp = new Date().toLocaleString();
  }
}

export class NetworkError extends AppError {
  constructor(message) {
    super(message, "NETWORK_ERROR");
    this.name = "NetworkError";
  }
}

export class ValidationError extends AppError {
  constructor(message) {
    super(message, "VALIDATION_ERROR");
    this.name = "ValidationError";
  }
}

export class StorageError extends AppError {
  constructor(message) {
    super(message, "STORAGE_ERROR");
    this.name = "StorageError";
  }
}

// Generic banner for error / info / success messages.
// Replaces the old alert()-based flow for checkTasks/getNextTask.
export function showBanner(message, type = "error", duration = 3000) {
  let banner = document.getElementById("banner");
  banner.textContent = message;
  banner.className = "banner show " + type;
  clearTimeout(showBanner._timer);
  showBanner._timer = setTimeout(() => {
    banner.classList.remove("show");
  }, duration);
}

// Kept for backwards compatibility with existing call sites.
export function showError(message, duration = 3000) {
  showBanner(message, "error", duration);
}

export function handleError(error) {
  console.error("[" + error.name + "] " + error.message);
  showError(error.message);
}
