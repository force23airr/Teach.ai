"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { generateVideo } from "@/lib/api";
import type { GenerateRequest } from "@/lib/types";

const SUGGESTIONS = [
  "Derivatives",
  "Area under the curve",
  "Fourier transforms",
  "Newton's laws of motion",
  "Electromagnetic waves",
  "Linear algebra & matrices",
  "Probability distributions",
  "Thermodynamics",
];

export default function TopicForm() {
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [subject, setSubject] = useState<GenerateRequest["subject"]>("math");
  const [gradeLevel, setGradeLevel] =
    useState<GenerateRequest["grade_level"]>("high_school");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setError("");

    try {
      const { task_id } = await generateVideo({
        topic: topic.trim(),
        subject,
        grade_level: gradeLevel,
      });
      router.push(`/generate/${task_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl space-y-6">
      {/* Topic Input */}
      <div>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Enter a topic — e.g., derivatives, Newton's third law..."
          className="w-full rounded-xl border border-gray-700 bg-gray-900 px-5 py-4 text-lg text-white placeholder-gray-500 outline-none ring-blue-500 transition focus:ring-2"
          disabled={loading}
        />
        {/* Suggestions */}
        <div className="mt-3 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setTopic(s)}
              className="rounded-full border border-gray-700 px-3 py-1 text-sm text-gray-400 transition hover:border-blue-500 hover:text-blue-400"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Subject Toggle */}
      <div className="flex gap-3">
        <label className="text-sm font-medium text-gray-400">Subject</label>
        <div className="flex rounded-lg border border-gray-700 overflow-hidden">
          {(["math", "science"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSubject(s)}
              className={`px-4 py-2 text-sm font-medium capitalize transition ${
                subject === s
                  ? "bg-blue-600 text-white"
                  : "bg-gray-900 text-gray-400 hover:text-white"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <label className="ml-4 text-sm font-medium text-gray-400">Level</label>
        <div className="flex rounded-lg border border-gray-700 overflow-hidden">
          {(
            [
              ["high_school", "High School"],
              ["college", "College"],
            ] as const
          ).map(([val, label]) => (
            <button
              key={val}
              type="button"
              onClick={() => setGradeLevel(val)}
              className={`px-4 py-2 text-sm font-medium transition ${
                gradeLevel === val
                  ? "bg-blue-600 text-white"
                  : "bg-gray-900 text-gray-400 hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || !topic.trim()}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-4 text-lg font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Sparkles className="h-5 w-5" />
        {loading ? "Starting..." : "Generate Video"}
      </button>

      {error && <p className="text-center text-red-400">{error}</p>}
    </form>
  );
}
