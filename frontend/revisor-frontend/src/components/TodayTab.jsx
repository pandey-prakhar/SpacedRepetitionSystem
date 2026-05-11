import { useEffect, useState } from "react";
import { api } from "../api";

const RATINGS = [
  { key: "AGAIN", label: "Again", color: "bg-red-500 hover:bg-red-600" },
  { key: "HARD", label: "Hard", color: "bg-orange-500 hover:bg-orange-600" },
  { key: "GOOD", label: "Good", color: "bg-green-500 hover:bg-green-600" },
  { key: "EASY", label: "Easy", color: "bg-blue-500 hover:bg-blue-600" },
];

function TodayTab({ refreshKey, onChange }) {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [revealed, setRevealed] = useState(new Set());

  useEffect(() => {
    setLoading(true);
    api
      .listDue()
      .then((data) => {
        setProblems(data);
        setError(null);
        setRevealed(new Set());
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  const toggleReveal = (id) => {
    setRevealed((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleReview = async (id, rating) => {
    try {
      await api.review(id, rating);
      onChange();
    } catch (e) {
      alert(`Review failed: ${e.message}`);
    }
  };

  if (loading) return <p className="text-gray-500">Loading…</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;
  if (problems.length === 0)
    return (
      <div className="bg-white rounded-lg p-8 text-center border">
        <p className="text-gray-700 font-medium">Nothing due today</p>
        <p className="text-sm text-gray-500 mt-1">Add problems or come back tomorrow.</p>
      </div>
    );

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">
        {problems.length} problem{problems.length === 1 ? "" : "s"} due
      </h2>
      {problems.map((p) => {
        const isRevealed = revealed.has(p.id);
        const hasContent = p.notes || p.solutionCode;
        return (
          <div key={p.id} className="bg-white rounded-lg p-4 border space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{p.title}</h3>
                {p.url && (
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Open problem ↗
                  </a>
                )}
              </div>
              {p.difficultyTag && (
                <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">
                  {p.difficultyTag}
                </span>
              )}
            </div>

            <div className="text-xs text-gray-500">
              reps {p.repetitions} · interval {p.intervalDays}d · ef {p.easeFactor.toFixed(2)}
            </div>

            {p.description && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Description</p>
                <p className="text-sm text-gray-800 whitespace-pre-wrap">{p.description}</p>
              </div>
            )}

            {p.sampleTestCase && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Sample test case</p>
                <pre className="text-xs bg-gray-100 text-gray-800 p-3 rounded overflow-x-auto whitespace-pre font-mono">
                  {p.sampleTestCase}
                </pre>
              </div>
            )}

            {hasContent ? (
              <div>
                <button
                  onClick={() => toggleReveal(p.id)}
                  className="text-sm text-blue-600 hover:underline font-medium"
                >
                  {isRevealed ? "Hide notes & solution" : "Show notes & solution"}
                </button>

                {isRevealed && (
                  <div className="mt-3 space-y-3">
                    {p.notes && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Notes</p>
                        <p className="text-sm text-gray-800 whitespace-pre-wrap">{p.notes}</p>
                      </div>
                    )}
                    {p.solutionCode && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                          Solution
                        </p>
                        <pre className="text-xs bg-gray-900 text-gray-100 p-3 rounded overflow-x-auto whitespace-pre">
                          {p.solutionCode}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">No notes or solution saved.</p>
            )}

            <div className="flex gap-2 pt-2">
              {RATINGS.map((r) => (
                <button
                  key={r.key}
                  onClick={() => handleReview(p.id, r.key)}
                  className={`flex-1 text-white text-sm font-medium px-3 py-2 rounded ${r.color}`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default TodayTab;
