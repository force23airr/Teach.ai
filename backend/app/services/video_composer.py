import asyncio
from pathlib import Path

from app.config import settings


async def compose_video(
    task_id: str, animation_path: Path, narration_path: Path
) -> Path:
    output_dir = Path(settings.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    output_path = output_dir / f"{task_id}_final.mp4"

    process = await asyncio.create_subprocess_exec(
        "ffmpeg",
        "-i", str(animation_path),
        "-i", str(narration_path),
        "-c:v", "copy",
        "-c:a", "aac",
        "-shortest",
        "-y",
        str(output_path),
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )

    stdout, stderr = await process.communicate()

    if process.returncode != 0:
        error_msg = stderr.decode("utf-8", errors="replace")
        raise RuntimeError(f"ffmpeg composition failed:\n{error_msg}")

    return output_path
