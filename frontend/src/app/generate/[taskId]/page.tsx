"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getTaskStatus, getVideoUrl, renderVideo } from "@/lib/api";
import type { TaskStatus } from "@/lib/types";
import ProgressTracker from "@/components/ProgressTracker";
import ReviewEditor from "@/components/ReviewEditor";
import VideoPlayer from "@/components/VideoPlayer";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function GeneratePage() {
  const params = useParams();
  const taskId = params.taskId as string;
  const [status, setStatus] = useState<TaskStatus | null>(null);
  const [rendering, setRendering] = useState(false);

  useEffect(() => {
    if (!taskId) return;

    let active = true;

    async function poll() {
      while (active) {
        try {
          const data = await getTaskStatus(taskId);
          if (!active) break;
          setStatus(data);
          // Stop polling when we hit review, completed, or failed
          if (
            data.status === "review" ||
            data.status === "completed" ||
            data.status === "failed"
          )
            break;
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

  // Resume polling after render is triggered
  useEffect(() => {
    if (!rendering || !status) return;
    // Only poll during render phase (not review)
    if (status.status === "review") return;

    let active = true;

    async function poll() {
      while (active) {
        try {
          const data = await getTaskStatus(taskId);
          if (!active) break;
          setStatus(data);
          if (data.status === "completed" || data.status === "failed") {
            setRendering(false);
            break;
          }
        } catch {
          // Retry
        }
        await new Promise((r) => setTimeout(r, 2000));
      }
    }

    poll();
    return () => {
      active = false;
    };
  }, [rendering, status?.status, taskId]);

  async function handleRender(script: string, manimCode: string) {
    setRendering(true);
    try {
      await renderVideo({
        task_id: taskId,
        script,
        manim_code: manimCode,
      });
      // Update local status to trigger render polling
      setStatus((prev) =>
        prev ? { ...prev, status: "rendering_animation", progress: 65 } : prev
      );
    } catch {
      setRendering(false);
    }
  }

  const isGenerating =
    status &&
    status.status !== "review" &&
    status.status !== "completed" &&
    status.status !== "failed";

  return (
    <div className="flex min-h-screen flex-col items-center bg-black text-white">
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <h1 className="mb-2 text-3xl font-bold">
          Teach<span className="text-blue-500">.ai</span>
        </h1>

        {/* Loading / connecting */}
        {!status && <p className="mt-4 text-gray-400">Connecting...</p>}

        {/* Generating draft (Phase 1) */}
        {isGenerating && !rendering && (
          <div className="mt-8 flex flex-col items-center gap-6">
            <p className="text-gray-400">Generating your draft...</p>
            <ProgressTracker status={status} />
          </div>
        )}

        {/* Review step */}
        {status && status.status === "review" && !rendering && (
          <div className="mt-8 flex flex-col items-center gap-4">
            <p className="text-lg font-medium text-blue-400">
              Review your video before rendering
            </p>
            <p className="max-w-lg text-center text-sm text-gray-500">
              Read through the narration script and animation code below. Edit
              anything you want to change, then hit render.
            </p>
            <ReviewEditor
              script={status.script || ""}
              manimCode={status.manim_code || ""}
              onRender={handleRender}
              loading={rendering}
            />
          </div>
        )}

        {/* Rendering (Phase 2) */}
        {rendering && status && status.status !== "completed" && status.status !== "failed" && (
          <div className="mt-8 flex flex-col items-center gap-6">
            <p className="text-gray-400">Rendering your video...</p>
            <ProgressTracker status={status} />
          </div>
        )}

        {/* Completed */}
        {status && status.status === "completed" && (
          <div className="mt-8 flex flex-col items-center gap-6">
            <p className="text-lg font-medium text-green-400">
              Your video is ready!
            </p>
            <VideoPlayer videoUrl={getVideoUrl(taskId)} />
          </div>
        )}

        {/* Failed */}
        {status && status.status === "failed" && (
          <div className="mt-8 flex flex-col items-center gap-4">
            <p className="text-lg font-medium text-red-400">
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
