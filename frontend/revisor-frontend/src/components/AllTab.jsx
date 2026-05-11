import { useEffect, useState } from "react";
import { api } from "../api";

function AllTab({ refreshKey, onChange }) {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    api
      .listAll()
      .then((data) => {
        setProblems(data);
        setError(null);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  const handleDelete = async (id, title) => {
    if (!confirm(`Delete "${title}"?`)) return;
    try {
      await api.remove(id);
      onChange();
    } catch (e) {
      alert(`Delete failed: ${e.message}`);
    }
  };

  if (loading) return <p className="text-gray-500">Loading…</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;
  if (problems.length === 0)
    return (
      <div className="bg-white rounded-lg p-8 text-center border">
        <p className="text-gray-700 font-medium">No problems yet</p>
        <p className="text-sm text-gray-500 mt-1">Use the Add Problem tab to create one.</p>
      </div>
    );

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-gray-900">
        {problems.length} problem{problems.length === 1 ? "" : "s"}
      </h2>
      {problems.map((p) => (
        <div key={p.id} className="bg-white rounded-lg p-4 border flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900 truncate">{p.title}</h3>
              {p.difficultyTag && (
                <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                  {p.difficultyTag}
                </span>
              )}
            </div>
            {p.url && (
              <a
                href={p.url}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                {p.url}
              </a>
            )}
            <div className="text-xs text-gray-500 mt-1">
              next review {p.nextReviewDate} · reps {p.repetitions} · interval {p.intervalDays}d · ef{" "}
              {p.easeFactor.toFixed(2)}
            </div>
          </div>
          <button
            onClick={() => handleDelete(p.id, p.title)}
            className="ml-4 text-sm text-red-600 hover:text-red-700 font-medium"
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}

export default AllTab;
