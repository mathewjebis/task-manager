export class ApiService {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async getData() {
    let response = await fetch(this.baseUrl);
    if (!response.ok) throw new Error("API fetch failed!");
    return await response.json();
  }
}

export class TaskApiService extends ApiService {
  constructor() {
    super("https://jsonplaceholder.typicode.com/todos");
  }

  async getMultipleData() {
    let [todos, users] = await Promise.all([
      fetch("https://jsonplaceholder.typicode.com/todos").then((r) => r.json()),
      fetch("https://jsonplaceholder.typicode.com/users").then((r) => r.json()),
    ]);
    return { todos, users };
  }
}