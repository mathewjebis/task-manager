# Task Manager

A vanilla JavaScript task manager built with modular ES6 code — no frameworks, no build step. Focused on demonstrating core JavaScript fundamentals cleanly: modules, the Observer pattern, `Proxy`/`Reflect` for validation, generators, and browser APIs like `IntersectionObserver`.

## Live Demo

[View Live Website](https://mathewjebis.github.io/task-manager/)

## Features

- **Task CRUD** — add, inline-edit, complete, and delete tasks
- **User-set priority** — choose High/Medium/Low when adding a task; demo tasks pulled from the API get a fallback priority for display purposes
- **Priority filtering** — filter the list to All / High / Medium / Low
- **Live stats** — total, completed, and pending task counts, updated in real time
- **Search** — debounced live search across task titles
- **Sort** — alphabetical A–Z / Z–A, throttled to prevent rapid re-sorts
- **Dark mode** — toggle persists across sessions via `localStorage`
- **Data persistence** — all tasks saved to `localStorage`; falls back to a public demo API on first load
- **Clear all** — wipes all tasks and storage, with a confirmation step
- **Storage size indicator** — shows current `localStorage` usage in KB
- **Edit history** — tracks and displays how many times a task has been edited
- **Entrance animations** — task rows animate in on scroll via `IntersectionObserver`
- **In-app notifications** — a banner for errors, info, and success messages (no native `alert()`/`prompt()` popups)

## Technologies Used

- Vanilla JavaScript (ES6 modules, no framework)
- `Proxy` / `Reflect` for runtime data validation
- Observer pattern for decoupled state-change notifications
- Generators (`function*`) for task iteration
- `IntersectionObserver` API for scroll animations
- CSS custom properties for theming (light/dark mode)
- `localStorage` for persistence
- [JSONPlaceholder](https://jsonplaceholder.typicode.com/) as a demo data source on first load

## Project Structure

```
├── index.html
├── index.css
├── main.js              # Wires up DOM events and reacts to state changes
└── modules/
    ├── api.js           # Fetches demo tasks + users from JSONPlaceholder
    ├── errors.js        # Custom error classes + in-app banner notifications
    ├── priority.js       # Priority color mapping and fallback logic
    ├── storage.js        # localStorage read/write/clear/size helpers
    ├── tasks.js          # Core task state, validation, and business logic
    └── ui.js              # Renders tasks and stats to the DOM
```

## How to Run

Because this project uses ES6 modules (`type="module"`), it needs to be served over HTTP rather than opened directly as a file — browsers block module imports from the `file://` protocol.

```bash
git clone https://github.com/mathewjebis/task-manager.git
cd task-manager
```

Then serve it with any static server, for example the VS Code "Live Server" extension, or:

```bash
npx serve .
```

## Notes on scope

This is a client-only demo — there's no backend, and data lives entirely in the browser's `localStorage`. A [separate fullstack project](https://github.com/mathewjebis) with real authentication and a database is in progress to demonstrate backend skills.

## Author

**S. Mathew Jebis**

- GitHub: [mathewjebis](https://github.com/mathewjebis)
