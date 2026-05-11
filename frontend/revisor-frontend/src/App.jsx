import { useState } from "react";
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

  const triggerRefresh = () => setRefreshKey((k) => k + 1);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Revisor</h1>
          <p className="text-sm text-gray-500">Spaced repetition for coding problems</p>
        </div>
      </header>

      <nav className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 flex gap-2">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                tab === t.key
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
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
