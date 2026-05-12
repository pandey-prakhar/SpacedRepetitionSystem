import { useState } from "react";
import { api } from "../api";

const EMPTY = {
  title: "",
  url: "",
  pattern: "",
  difficultyTag: "MEDIUM",
  description: "",
  sampleTestCase: "",
  notes: "",
  solutionCode: "",
};

const inputClass =
  "w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 dark:placeholder-gray-500";

const labelClass =
  "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

function AddTab({ onCreated }) {
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const setField = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        title: form.title.trim(),
        url: form.url.trim() || null,
        pattern: form.pattern.trim() || null,
        difficultyTag: form.difficultyTag,
        description: form.description.trim() || null,
        sampleTestCase: form.sampleTestCase.trim() || null,
        notes: form.notes.trim() || null,
        solutionCode: form.solutionCode.trim() || null,
      };
      await api.create(payload);
      setForm(EMPTY);
      onCreated();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 space-y-4 max-w-2xl"
    >
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Add a problem</h2>

      <div>
        <label className={labelClass}>Title *</label>
        <input
          type="text"
          required
          value={form.title}
          onChange={setField("title")}
          className={inputClass}
          placeholder="Two Sum"
        />
      </div>

      <div>
        <label className={labelClass}>URL</label>
        <input
          type="url"
          value={form.url}
          onChange={setField("url")}
          className={inputClass}
          placeholder="https://leetcode.com/problems/two-sum"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Difficulty</label>
          <select
            value={form.difficultyTag}
            onChange={setField("difficultyTag")}
            className={inputClass}
          >
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Pattern</label>
          <input
            type="text"
            value={form.pattern}
            onChange={setField("pattern")}
            className={inputClass}
            placeholder="hashmap / two-pointer / dp"
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>
          Description <span className="text-gray-400 dark:text-gray-500 font-normal">(short, shown on review card)</span>
        </label>
        <textarea
          value={form.description}
          onChange={setField("description")}
          rows={4}
          className={inputClass}
          placeholder="Given an array of integers, return indices of the two numbers that add up to a target…"
        />
      </div>

      <div>
        <label className={labelClass}>
          Sample test case <span className="text-gray-400 dark:text-gray-500 font-normal">(shown on review card)</span>
        </label>
        <textarea
          value={form.sampleTestCase}
          onChange={setField("sampleTestCase")}
          rows={3}
          className={inputClass + " font-mono text-sm"}
          placeholder={"Input: nums = [2,7,11,15], target = 9\nOutput: [0,1]"}
        />
      </div>

      <div>
        <label className={labelClass}>
          Notes <span className="text-gray-400 dark:text-gray-500 font-normal">(hidden behind reveal)</span>
        </label>
        <textarea
          value={form.notes}
          onChange={setField("notes")}
          rows={4}
          className={inputClass}
          placeholder="Key insight, edge cases…"
        />
      </div>

      <div>
        <label className={labelClass}>
          Solution code <span className="text-gray-400 dark:text-gray-500 font-normal">(hidden behind reveal)</span>
        </label>
        <textarea
          value={form.solutionCode}
          onChange={setField("solutionCode")}
          rows={6}
          className={inputClass + " font-mono text-sm"}
          placeholder="def two_sum(nums, target):  ..."
        />
      </div>

      {error && <p className="text-sm text-red-600 dark:text-red-400">Error: {error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 dark:disabled:bg-blue-800 text-white font-medium px-4 py-2 rounded"
      >
        {submitting ? "Saving…" : "Add problem"}
      </button>
    </form>
  );
}

export default AddTab;
