import { useEffect, useState } from "react";
import TodayTab from "./components/TodayTab";
import AllTab from "./components/AllTab";
import AddTab from "./components/AddTab";

const TABS = [
  { key: "today", label: "Today" },
  { key: "all", label: "All Problems" },
  { key: "add", label: "Add Problem" },
];

function App() {
  const [tab, setTab] = useState("today");
  const [refreshKey, setRefreshKey] = useState(0);
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light"
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));
  const triggerRefresh = () => setRefreshKey((k) => k + 1);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Revisor</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Spaced repetition for coding problems
            </p>
          </div>
          <button
            onClick={toggleTheme}
            className="text-sm px-3 py-1.5 rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Toggle dark mode"
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? "☀ Light" : "☾ Dark"}
          </button>
        </div>
      </header>

      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 flex gap-2">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                tab === t.key
                  ? "border-blue-600 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {tab === "today" && <TodayTab refreshKey={refreshKey} onChange={triggerRefresh} />}
        {tab === "all" && <AllTab refreshKey={refreshKey} onChange={triggerRefresh} />}
        {tab === "add" && (
          <AddTab
            onCreated={() => {
              triggerRefresh();
              setTab("all");
            }}
          />
        )}
      </main>
    </div>
  );
}

export default App;
