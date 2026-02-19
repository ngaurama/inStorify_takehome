import { useState, useEffect, useCallback } from "react";
import { ThemeProvider, useTheme } from "../ThemeContext";
import { todoApi } from "../services/api";
import TodoInput from "./TodoInput";
import TodoList from "./TodoList";
import FilterBar from "./FilterBar";
import StatsBar from "./StatsBar";
import Toast from "./Toast";

function SunIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export function AppInner() {
  const { theme, toggle } = useTheme();
  const [todos, setTodos] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    completed: null,
    priority: null,
    search: "",
  });
  const [toast, setToast] = useState(null);

  // just a final toast notification to show activity
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchTodos = useCallback(async () => {
    try {
      const params = {};
      if (filters.completed != null) 
        params.completed = filters.completed;
      if (filters.priority) 
        params.priority = filters.priority;
      if (filters.search) 
        params.search = filters.search;

      const data = await todoApi.getAll(params);
      setTodos(data);
    } catch {
        showToast("Failed to load todo items", "error");
    }
  }, [filters]);

  const fetchStats = useCallback(async () => {
    try {
      const data = await todoApi.getStats();
      setStats(data);
    } catch {
        showToast("Failed to get stats", "error");
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchTodos(), fetchStats()]);
      setLoading(false);
    };
    init();
  }, [fetchTodos, fetchStats]);

  const handleCreate = async (todoData) => {
    try {
      const newTodo = await todoApi.create(todoData);
      setTodos((prev) => [newTodo, ...prev]);
      fetchStats();
      showToast("Todo added");
    } catch {
      showToast("Failed to create todo item", "error");
    }
  };

  const handleToggle = async (id, completed) => {
    try {
      const updated = await todoApi.update(id, { completed });
      setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
      fetchStats();
    } catch {
      showToast("Failed to update completion", "error");
    }
  };

  const handleUpdate = async (id, data) => {
    try {
      const updated = await todoApi.update(id, data);
      setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
      fetchStats();
      showToast("Todo updated");
    } catch {
      showToast("Failed to update todo item", "error");
    }
  };

  const handleDelete = async (id) => {
    try {
      await todoApi.delete(id);
      setTodos((prev) => prev.filter((t) => t.id !== id));
      fetchStats();
      showToast("Todo removed");
    } catch {
      showToast("Failed to delete todo", "error");
    }
  };

  return (
    <div className="h-screen flex flex-col bg-(--bg) transition-colors duration-200 overflow-hidden">
      <header className="p-6 border-b-[1.5px] border-(--border) transition-colors duration-300 shrink-0">
        <div className="max-w-xl mx-auto flex justify-between items-center">
          <div>
            {/* header title with count of items */}
            <h1
              className="
                    font-[DM Sans, sans-serif]
                    font-normal text-2xl
                    text-(--text-primary)
                    tracking-[-0.01em]
                    leading-none"
            >
              Todo List
            </h1>
            {stats && <StatsBar stats={stats} />}
          </div>
          {/* dakr mode toggle button */}
          <button
            onClick={toggle}
            className="
                bg-(--bg-subtle)
                border border-(--border)
                rounded-full
                py-2 px-3.5
                text-(--text-secondary)
                cursor-pointer
                flex items-center gap-1.5
                text-sm
                font-normal
                transition-all duration-300
            "
            aria-label="Toggle theme"
          >
            {theme === "light" ? <MoonIcon /> : <SunIcon />}
            <span>{theme === "light" ? "Dark" : "Light"}</span>
          </button>
        </div>
      </header>

      {/* Main block of everything apart from header */}
      <main className="max-w-xl w-full mx-auto pt-8 pb-0 flex flex-col flex-1 overflow-hidden">
        <div className="flex flex-col gap-7 shrink-0 px-6 mb-7">
          <TodoInput onCreate={handleCreate} />
          <FilterBar filters={filters} onChange={setFilters} />
        </div>

        {/* todo items themselves */}
        <div className="flex-1 overflow-y-auto px-6 pb-10 custom-scrollbar">
          {loading ? (
            <div className="text-center py-16 text-(--text-muted) text-sm">
              loading…
            </div>
          ) : (
            <div className="p-2">
               <TodoList
                todos={todos}
                onToggle={handleToggle}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            </div>
          )}
        </div>
      </main>

      {/* <div className="fixed bottom-4 left-4 z-50 hidden md:block">
        <a
          href="https://ngaurama.com"
          target="_blank"
          rel="noopener noreferrer"
          className="
            text-xs
            text-(--text-muted)
            hover:text-(--accent)
            transition-colors
            duration-200
            px-3
            py-1.5
            inline-flex
            items-center
            gap-1.5
            font-light
            italic
            -z-10
          "
        >
          Made by Nitai Gauramani
        </a>
      </div> */}

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}
