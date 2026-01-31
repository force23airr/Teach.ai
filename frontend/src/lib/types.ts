export interface GenerateRequest {
  topic: string;
  subject: "math" | "science";
  grade_level: "high_school" | "college";
}

export interface TaskStatus {
  task_id: string;
  status:
    | "queued"
    | "generating_script"
    | "generating_manim"
    | "rendering_animation"
    | "generating_narration"
    | "composing_video"
    | "completed"
    | "failed";
  progress: number;
  video_url: string | null;
  error: string | null;
}

export const STATUS_LABELS: Record<TaskStatus["status"], string> = {
  queued: "Starting up...",
  generating_script: "Writing narration script...",
  generating_manim: "Creating animations...",
  rendering_animation: "Rendering video...",
  generating_narration: "Generating voiceover...",
  composing_video: "Composing final video...",
  completed: "Done!",
  failed: "Something went wrong",
};
