import asyncio
from pathlib import Path

from app.config import settings


async def render_manim(task_id: str, manim_code: str) -> Path:
    scenes_dir = Path(settings.generated_scenes_dir)
    scenes_dir.mkdir(parents=True, exist_ok=True)

    scene_file = scenes_dir / f"{task_id}_scene.py"
    scene_file.write_text(manim_code, encoding="utf-8")

    media_dir = Path(settings.media_dir) / task_id

    process = await asyncio.create_subprocess_exec(
        "manim",
        settings.manim_quality,
        "--format", "mp4",
        "--media_dir", str(media_dir),
        str(scene_file),
        "TopicScene",
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )

    stdout, stderr = await process.communicate()

    if process.returncode != 0:
        error_msg = stderr.decode("utf-8", errors="replace")
        raise RuntimeError(f"Manim rendering failed:\n{error_msg}")

    # Find the rendered video file
    video_dir = media_dir / "videos" / f"{task_id}_scene"
    if not video_dir.exists():
        raise RuntimeError(f"Manim output directory not found: {video_dir}")

    # Find the MP4 in the quality subdirectory
    mp4_files = list(video_dir.rglob("*.mp4"))
    if not mp4_files:
        raise RuntimeError("No MP4 file found in Manim output")

    return mp4_files[0]
