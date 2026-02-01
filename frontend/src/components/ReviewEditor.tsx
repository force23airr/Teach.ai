"use client";

import { useState } from "react";
import { Play, RotateCcw } from "lucide-react";

interface Props {
  script: string;
  manimCode: string;
  onRender: (script: string, manimCode: string) => void;
  loading: boolean;
}

export default function ReviewEditor({
  script,
  manimCode,
  onRender,
  loading,
}: Props) {
  const [editedScript, setEditedScript] = useState(script);
  const [editedCode, setEditedCode] = useState(manimCode);
  const [activeTab, setActiveTab] = useState<"script" | "code">("script");

  return (
    <div className="w-full max-w-4xl space-y-4">
      <div className="rounded-xl border border-gray-700 bg-gray-900 overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          <button
            onClick={() => setActiveTab("script")}
            className={`flex-1 px-4 py-3 text-sm font-medium transition ${
              activeTab === "script"
                ? "bg-gray-800 text-white border-b-2 border-blue-500"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            Narration Script
          </button>
          <button
            onClick={() => setActiveTab("code")}
            className={`flex-1 px-4 py-3 text-sm font-medium transition ${
              activeTab === "code"
                ? "bg-gray-800 text-white border-b-2 border-blue-500"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            Animation Code (Manim)
          </button>
        </div>

        {/* Editor */}
        {activeTab === "script" ? (
          <div className="p-4">
            <p className="mb-2 text-xs text-gray-500">
              This is what the AI voiceover will say. Edit anything you want to
              change.
            </p>
            <textarea
              value={editedScript}
              onChange={(e) => setEditedScript(e.target.value)}
              rows={14}
              className="w-full rounded-lg border border-gray-700 bg-black p-4 text-sm leading-relaxed text-gray-200 outline-none ring-blue-500 transition focus:ring-2 resize-y"
            />
          </div>
        ) : (
          <div className="p-4">
            <p className="mb-2 text-xs text-gray-500">
              Python code that generates the animation. Edit if you know Manim,
              or leave as-is.
            </p>
            <textarea
              value={editedCode}
              onChange={(e) => setEditedCode(e.target.value)}
              rows={14}
              spellCheck={false}
              className="w-full rounded-lg border border-gray-700 bg-black p-4 font-mono text-sm text-green-400 outline-none ring-blue-500 transition focus:ring-2 resize-y"
            />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => {
            setEditedScript(script);
            setEditedCode(manimCode);
          }}
          className="flex items-center gap-2 rounded-lg border border-gray-700 px-4 py-3 text-sm font-medium text-gray-400 transition hover:border-gray-500 hover:text-white"
        >
          <RotateCcw className="h-4 w-4" />
          Reset to Original
        </button>

        <button
          onClick={() => onRender(editedScript, editedCode)}
          disabled={loading || !editedScript.trim() || !editedCode.trim()}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Play className="h-4 w-4" />
          {loading ? "Rendering..." : "Looks Good — Render Video"}
        </button>
      </div>
    </div>
  );
}
