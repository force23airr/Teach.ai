from typing import Literal, Optional

from pydantic import BaseModel


class GenerateRequest(BaseModel):
    topic: str
    subject: Literal["math", "science"]
    grade_level: Literal["high_school", "college"]


class RenderRequest(BaseModel):
    task_id: str
    script: str
    manim_code: str


class TaskStatus(BaseModel):
    task_id: str
    status: Literal[
        "queued",
        "generating_script",
        "generating_manim",
        "review",
        "rendering_animation",
        "generating_narration",
        "composing_video",
        "completed",
        "failed",
    ]
    progress: int = 0
    video_url: Optional[str] = None
    error: Optional[str] = None
    script: Optional[str] = None
    manim_code: Optional[str] = None
