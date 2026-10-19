import { lazy, Suspense, useEffect, useState, useCallback, useMemo } from "react";
import Header from "./components/Header.jsx";
import AuthForm from "./components/AuthForm.jsx";
import * as api from "./api/taskApi.js";

const TaskBoardPage = lazy(() => import("./pages/TaskBoardPage.jsx"));
const ActivityPage = lazy(() => import("./pages/ActivityPage.jsx"));

const formatTime = () =>
  new Date().toLocaleTimeString("en-US", { hour12: false });

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [connected, setConnected] = useState(true);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [busyTaskId, setBusyTaskId] = useState(null);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);
  const [log, setLog] = useState([]);
  const [user, setUser] = useState(null);
  const [pathname, setPathname] = useState(() => window.location.pathname);
  const [sessionLoading, setSessionLoading] = useState(Boolean(api.getAuthToken()));

  useEffect(() => {
    const handleLocationChange = () => setPathname(window.location.pathname);
    window.addEventListener("popstate", handleLocationChange);
    return () => window.removeEventListener("popstate", handleLocationChange);
  }, []);

  useEffect(() => {
    if (pathname === "/" || pathname === "/activity") return;
    window.history.replaceState({}, "", "/");
    setPathname("/");
  }, [pathname]);

  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      setSessionLoading(false);
      setTasks([]);
      setError("Your session expired. Sign in again to continue.");
    };

    window.addEventListener("task-manager:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("task-manager:unauthorized", handleUnauthorized);
  }, []);

  useEffect(() => {
    if (!api.getAuthToken()) {
      setSessionLoading(false);
      return undefined;
    }

    let active = true;
    api.fetchCurrentUser()
      .then((response) => {
        if (active) setUser(response.data.data);
      })
      .catch(() => {
        if (active) setError("Your session expired. Sign in again to continue.");
      })
      .finally(() => {
        if (active) setSessionLoading(false);
      });

    return () => { active = false; };
  }, []);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const queryText = query.trim().toLowerCase();
      const matchesQuery =
        !queryText ||
        [task.title, task.description].join(" ").toLowerCase().includes(queryText);
      const matchesFilter = filter === "all" ? true : task.status === filter;
      return matchesQuery && matchesFilter;
    });
  }, [tasks, query, filter]);

  const completedTasks = tasks.filter((task) => task.status === "done").length;
  const completion = tasks.length ? Math.round((completedTasks / tasks.length) * 100) : 0;

  const pushLog = useCallback((method, url) => {
    setLog((prev) => [{ method, url, time: formatTime() }, ...prev].slice(0, 8));
  }, []);

  const loadTasks = useCallback(async () => {
    try {
      const res = await api.fetchTasks();
      setTasks(res.data.data);
      setConnected(true);
      pushLog("GET", "/api/tasks");
      setError("");
    } catch (err) {
      if (err.response?.status === 401) return;
      setConnected(false);
      setError(
        "Can't reach the API. Make sure the backend is running on http://localhost:5000."
      );
    } finally {
      setLoading(false);
    }
  }, [pushLog]);

  useEffect(() => {
    if (user) {
      setLoading(true);
      loadTasks();
    } else {
      setTasks([]);
      setLoading(false);
    }
  }, [user, loadTasks]);

  useEffect(() => {
    if (!toast) return undefined;
    const timeout = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const handleCreate = async ({ title, description }) => {
    setSubmitting(true);
    setError("");
    try {
      const res = await api.createTask({ title, description });
      setTasks((prev) => [...prev, res.data.data]);
      setQuery("");
      setFilter("all");
      pushLog("POST", "/api/tasks");
      setConnected(true);
      setToast({ type: "success", message: "Task created" });
      return true;
    } catch (err) {
      if (err.response?.status === 401) return false;
      setError(err.response?.data?.error || "Failed to create task");
      setToast({ type: "error", message: "Task could not be created" });
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (task, status) => {
    const previous = tasks;
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status } : t)));
    setBusyTaskId(task.id);
    setError("");
    try {
      const res = await api.updateTask(task.id, { status });
      setTasks((prev) => prev.map((t) => (t.id === task.id ? res.data.data : t)));
      pushLog("PUT", `/api/tasks/${task.id}`);
      setConnected(true);
      setToast({ type: "success", message: "Task updated" });
    } catch (err) {
      setTasks(previous);
      if (err.response?.status === 401) return;
      setError(err.response?.data?.error || "Failed to update task");
      setToast({ type: "error", message: "Task could not be updated" });
    } finally {
      setBusyTaskId(null);
    }
  };

  const handleDelete = async (id) => {
    const task = tasks.find((item) => item.id === id);
    if (!task || !window.confirm(`Delete "${task.title}"?`)) return;

    const previous = tasks;
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setBusyTaskId(id);
    setError("");
    try {
      await api.deleteTask(id);
      pushLog("DELETE", `/api/tasks/${id}`);
      setConnected(true);
      setToast({ type: "success", message: "Task deleted" });
    } catch (err) {
      setTasks(previous);
      if (err.response?.status === 401) return;
      setError(err.response?.data?.error || "Failed to delete task");
      setToast({ type: "error", message: "Task could not be deleted" });
    } finally {
      setBusyTaskId(null);
    }
  };

  const handleAuthenticate = ({ token, user: authenticatedUser }) => {
    api.setAuthToken(token);
    setError("");
    setUser(authenticatedUser);
  };

  const handleLogout = () => {
    api.clearAuthToken();
    setUser(null);
    setTasks([]);
    setError("");
  };

  const handleNavigate = (event, path) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (pathname === path) return;
    window.history.pushState({}, "", path);
    setPathname(path);
  };

  if (sessionLoading) {
    return <div className="loading app">Restoring your session…</div>;
  }

  if (!user) {
    return <AuthForm onAuthenticate={handleAuthenticate} notice={error} />;
  }

  return (
    <div className="app">
      <Header
        connected={connected}
        taskCount={tasks.length}
        user={user}
        pathname={pathname}
        onLogout={handleLogout}
        onNavigate={handleNavigate}
      />

      {error && <div className="banner banner--error">{error}</div>}
      {toast && (
        <div className={`toast toast--${toast.type}`} role="status">
          {toast.message}
        </div>
      )}

      <Suspense fallback={(
        <div className="loading route-loading" role="status" aria-live="polite">
          <span className="route-loading__spinner" aria-hidden="true" />
          Loading page…
        </div>
      )}>
        {pathname === "/activity" ? (
          <ActivityPage entries={log} />
        ) : (
            <TaskBoardPage
              tasks={tasks}
              completedTasks={completedTasks}
              completion={completion}
              filteredTasks={filteredTasks}
              query={query}
              filter={filter}
              loading={loading}
              submitting={submitting}
              busyTaskId={busyTaskId}
              onCreate={handleCreate}
              onQueryChange={setQuery}
              onFilterChange={setFilter}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
            />
        )}
      </Suspense>
    </div>
  );
}
