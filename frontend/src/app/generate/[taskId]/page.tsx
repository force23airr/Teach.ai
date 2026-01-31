"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getTaskStatus, getVideoUrl } from "@/lib/api";
import type { TaskStatus } from "@/lib/types";
import ProgressTracker from "@/components/ProgressTracker";
import VideoPlayer from "@/components/VideoPlayer";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function GeneratePage() {
  const params = useParams();
  const taskId = params.taskId as string;
  const [status, setStatus] = useState<TaskStatus | null>(null);

  useEffect(() => {
    if (!taskId) return;

    let active = true;

    async function poll() {
      while (active) {
        try {
          const data = await getTaskStatus(taskId);
          if (!active) break;
          setStatus(data);
          if (data.status === "completed" || data.status === "failed") break;
        } catch {
          // Retry on network errors
        }
        await new Promise((r) => setTimeout(r, 2000));
      }
    }

    poll();
    return () => {
      active = false;
    };
  }, [taskId]);

  return (
    <div className="flex min-h-screen flex-col items-center bg-black text-white">
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-20">
        <h1 className="mb-2 text-3xl font-bold">
          Teach<span className="text-blue-500">.ai</span>
        </h1>

        {!status && (
          <p className="text-gray-400">Connecting...</p>
        )}

        {status && status.status !== "completed" && status.status !== "failed" && (
          <div className="mt-8 flex flex-col items-center gap-6">
            <p className="text-gray-400">Generating your video...</p>
            <ProgressTracker status={status} />
          </div>
        )}

        {status && status.status === "completed" && (
          <div className="mt-8 flex flex-col items-center gap-6">
            <p className="text-lg text-green-400 font-medium">
              Your video is ready!
            </p>
            <VideoPlayer videoUrl={getVideoUrl(taskId)} />
          </div>
        )}

        {status && status.status === "failed" && (
          <div className="mt-8 flex flex-col items-center gap-4">
            <p className="text-lg text-red-400 font-medium">
              Generation failed
            </p>
            <p className="max-w-md text-center text-sm text-gray-500">
              {status.error}
            </p>
            <Link
              href="/"
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
            >
              <ArrowLeft className="h-4 w-4" />
              Try Again
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
