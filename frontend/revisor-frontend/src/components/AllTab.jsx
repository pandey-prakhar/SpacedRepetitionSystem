import { useEffect, useState } from "react";
import { api } from "../api";

function AllTab({ refreshKey, onChange }) {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(new Set());
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);

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

  const toggleExpand = (id) => {
    if (editingId === id) return;
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const startEdit = (p) => {
    setEditingId(p.id);
    setDraft({
      title: p.title ?? "",
      url: p.url ?? "",
      pattern: p.pattern ?? "",
      difficultyTag: p.difficultyTag ?? "MEDIUM",
      description: p.description ?? "",
      sampleTestCase: p.sampleTestCase ?? "",
      notes: p.notes ?? "",
      solutionCode: p.solutionCode ?? "",
    });
    setExpanded((prev) => new Set(prev).add(p.id));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft(null);
  };

  const setDraftField = (key) => (e) =>
    setDraft((d) => ({ ...d, [key]: e.target.value }));

  const saveEdit = async (id) => {
    if (!draft.title.trim()) {
      alert("Title cannot be empty.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: draft.title.trim(),
        url: draft.url,
        pattern: draft.pattern,
        difficultyTag: draft.difficultyTag,
        description: draft.description,
        sampleTestCase: draft.sampleTestCase,
        notes: draft.notes,
        solutionCode: draft.solutionCode,
      };
      await api.update(id, payload);
      cancelEdit();
      onChange();
    } catch (e) {
      alert(`Save failed: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!confirm(`Delete "${title}"?`)) return;
    try {
      await api.remove(id);
      setExpanded((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      if (editingId === id) cancelEdit();
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
      {problems.map((p) => {
        const isEditing = editingId === p.id;
        const isOpen = expanded.has(p.id) || isEditing;
        const hasDetails =
          p.description || p.sampleTestCase || p.notes || p.solutionCode;
        return (
          <div key={p.id} className="bg-white rounded-lg border overflow-hidden">
            <div className="p-4 flex items-start justify-between gap-4">
              <button
                onClick={() => toggleExpand(p.id)}
                className="flex-1 min-w-0 text-left group"
                disabled={isEditing}
              >
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 group-hover:text-gray-600 text-sm w-3">
                    {isOpen ? "▾" : "▸"}
                  </span>
                  <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-700">
                    {p.title}
                  </h3>
                  {p.difficultyTag && (
                    <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                      {p.difficultyTag}
                    </span>
                  )}
                  {p.pattern && (
                    <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                      {p.pattern}
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-1 ml-5">
                  next review {p.nextReviewDate} · reps {p.repetitions} · interval{" "}
                  {p.intervalDays}d · ef {p.easeFactor.toFixed(2)}
                </div>
              </button>
              <div className="flex items-center gap-3 shrink-0">
                {!isEditing && isOpen && (
                  <button
                    onClick={() => startEdit(p)}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Edit
                  </button>
                )}
                <button
                  onClick={() => handleDelete(p.id, p.title)}
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  Delete
                </button>
              </div>
            </div>

            {isOpen && !isEditing && (
              <div className="px-4 pb-4 ml-5 space-y-3 border-t pt-4 bg-gray-50">
                {p.url && (
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-blue-600 hover:underline break-all"
                  >
                    {p.url} ↗
                  </a>
                )}

                {!hasDetails && !p.url && (
                  <p className="text-sm text-gray-400 italic">
                    No description, notes, or solution saved for this problem.
                  </p>
                )}

                {p.description && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                      Description
                    </p>
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">{p.description}</p>
                  </div>
                )}

                {p.sampleTestCase && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                      Sample test case
                    </p>
                    <pre className="text-xs bg-white border text-gray-800 p-3 rounded overflow-x-auto whitespace-pre font-mono">
                      {p.sampleTestCase}
                    </pre>
                  </div>
                )}

                {p.notes && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Notes</p>
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">{p.notes}</p>
                  </div>
                )}

                {p.solutionCode && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Solution</p>
                    <pre className="text-xs bg-gray-900 text-gray-100 p-3 rounded overflow-x-auto whitespace-pre">
                      {p.solutionCode}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {isEditing && (
              <div className="px-4 pb-4 ml-5 space-y-3 border-t pt-4 bg-yellow-50">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={draft.title}
                    onChange={setDraftField("title")}
                    className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                    URL
                  </label>
                  <input
                    type="url"
                    value={draft.url}
                    onChange={setDraftField("url")}
                    className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                      Difficulty
                    </label>
                    <select
                      value={draft.difficultyTag}
                      onChange={setDraftField("difficultyTag")}
                      className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="EASY">Easy</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HARD">Hard</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                      Pattern
                    </label>
                    <input
                      type="text"
                      value={draft.pattern}
                      onChange={setDraftField("pattern")}
                      className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                    Description
                  </label>
                  <textarea
                    value={draft.description}
                    onChange={setDraftField("description")}
                    rows={4}
                    className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                    Sample test case
                  </label>
                  <textarea
                    value={draft.sampleTestCase}
                    onChange={setDraftField("sampleTestCase")}
                    rows={3}
                    className="w-full border rounded px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                    Notes
                  </label>
                  <textarea
                    value={draft.notes}
                    onChange={setDraftField("notes")}
                    rows={4}
                    className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                    Solution code
                  </label>
                  <textarea
                    value={draft.solutionCode}
                    onChange={setDraftField("solutionCode")}
                    rows={6}
                    className="w-full border rounded px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => saveEdit(p.id)}
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-medium px-4 py-2 rounded"
                  >
                    {saving ? "Saving…" : "Save"}
                  </button>
                  <button
                    onClick={cancelEdit}
                    disabled={saving}
                    className="bg-white border hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default AllTab;
