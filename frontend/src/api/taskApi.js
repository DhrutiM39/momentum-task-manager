import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";
const TOKEN_KEY = "taskManagerToken";

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" }
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || "";
    const isAuthSubmission = url === "/auth/login" || url === "/auth/register";
    if (error.response?.status === 401 && !isAuthSubmission) {
      localStorage.removeItem(TOKEN_KEY);
      window.dispatchEvent(new Event("task-manager:unauthorized"));
    }
    return Promise.reject(error);
  }
);

const normalizeTask = (task) => ({ ...task, id: task.id || task._id });

export const getAuthToken = () => localStorage.getItem(TOKEN_KEY);
export const setAuthToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearAuthToken = () => localStorage.removeItem(TOKEN_KEY);

export const registerUser = (credentials) => client.post("/auth/register", credentials);
export const loginUser = (credentials) => client.post("/auth/login", credentials);
export const fetchCurrentUser = () => client.get("/auth/me");

export const fetchTasks = async () => {
  const response = await client.get("/tasks");
  return { ...response, data: { ...response.data, data: response.data.data.map(normalizeTask) } };
};

export const createTask = async (task) => {
  const response = await client.post("/tasks", task);
  return { ...response, data: { ...response.data, data: normalizeTask(response.data.data) } };
};

export const updateTask = async (id, task) => {
  const response = await client.put(`/tasks/${id}`, task);
  return { ...response, data: { ...response.data, data: normalizeTask(response.data.data) } };
};

export const deleteTask = (id) => client.delete(`/tasks/${id}`);
