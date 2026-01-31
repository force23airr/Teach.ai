import { GenerateRequest, TaskStatus } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function generateVideo(
  request: GenerateRequest
): Promise<{ task_id: string }> {
  const res = await fetch(`${API_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  if (!res.ok) {
    throw new Error(`Failed to start generation: ${res.statusText}`);
  }
  return res.json();
}

export async function getTaskStatus(taskId: string): Promise<TaskStatus> {
  const res = await fetch(`${API_URL}/api/status/${taskId}`);
  if (!res.ok) {
    throw new Error(`Failed to get status: ${res.statusText}`);
  }
  return res.json();
}

export function getVideoUrl(taskId: string): string {
  return `${API_URL}/api/video/${taskId}`;
}
