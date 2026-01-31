"use client";

import { STATUS_LABELS, TaskStatus } from "@/lib/types";

interface Props {
  status: TaskStatus;
}

export default function ProgressTracker({ status }: Props) {
  const label = STATUS_LABELS[status.status] || status.status;

  return (
    <div className="w-full max-w-lg space-y-4">
      {/* Progress bar */}
      <div className="h-3 w-full overflow-hidden rounded-full bg-gray-800">
        <div
          className="h-full rounded-full bg-blue-500 transition-all duration-700 ease-out"
          style={{ width: `${status.progress}%` }}
        />
      </div>

      {/* Status label */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-300">{label}</span>
        <span className="font-mono text-gray-500">{status.progress}%</span>
      </div>

      {/* Animated dots */}
      {status.status !== "completed" && status.status !== "failed" && (
        <div className="flex justify-center gap-1 pt-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-2 w-2 animate-bounce rounded-full bg-blue-500"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
