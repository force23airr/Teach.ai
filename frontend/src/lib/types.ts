export interface GenerateRequest {
  topic: string;
  subject: "math" | "science";
  grade_level: "high_school" | "college";
}

export interface RenderRequest {
  task_id: string;
  script: string;
  manim_code: string;
}

export interface TaskStatus {
  task_id: string;
  status:
    | "queued"
    | "generating_script"
    | "generating_manim"
    | "review"
    | "rendering_animation"
    | "generating_narration"
    | "composing_video"
    | "completed"
    | "failed";
  progress: number;
  video_url: string | null;
  error: string | null;
  script: string | null;
  manim_code: string | null;
}

export const STATUS_LABELS: Record<TaskStatus["status"], string> = {
  queued: "Starting up...",
  generating_script: "Writing narration script...",
  generating_manim: "Creating animation code...",
  review: "Ready for your review!",
  rendering_animation: "Rendering video...",
  generating_narration: "Generating voiceover...",
  composing_video: "Composing final video...",
  completed: "Done!",
  failed: "Something went wrong",
};
