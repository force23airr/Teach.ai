import asyncio
import logging

from app.models.schemas import GenerateRequest
from app.services.manim_generator import generate_manim_code
from app.services.manim_renderer import render_manim
from app.services.script_generator import generate_script
from app.services.tts_service import generate_narration
from app.services.video_composer import compose_video
from app.tasks.store import task_store

logger = logging.getLogger(__name__)

MAX_MANIM_RETRIES = 2


async def run_pipeline(task_id: str, request: GenerateRequest) -> None:
    try:
        # Step 1: Generate script
        await task_store.update_task(task_id, status="generating_script", progress=10)
        script = await generate_script(
            request.topic, request.subject, request.grade_level
        )
        await task_store.update_task(task_id, progress=25)

        # Step 2: Generate Manim code
        await task_store.update_task(task_id, status="generating_manim", progress=30)
        manim_code = await generate_manim_code(request.topic, request.subject, script)
        await task_store.update_task(task_id, progress=45)

        # Steps 3 & 4: Render Manim + Generate TTS (concurrently)
        await task_store.update_task(
            task_id, status="rendering_animation", progress=50
        )

        # Manim rendering with retry logic
        animation_path = None
        last_error = None
        for attempt in range(MAX_MANIM_RETRIES + 1):
            try:
                if attempt > 0:
                    logger.info(
                        f"Retrying Manim generation (attempt {attempt + 1}) for task {task_id}"
                    )
                    manim_code = await generate_manim_code(
                        request.topic, request.subject, script, error_feedback=last_error
                    )
                animation_path = await render_manim(task_id, manim_code)
                break
            except (RuntimeError, SyntaxError) as e:
                last_error = str(e)
                logger.warning(f"Manim attempt {attempt + 1} failed: {last_error}")
                if attempt == MAX_MANIM_RETRIES:
                    raise RuntimeError(
                        f"Manim rendering failed after {MAX_MANIM_RETRIES + 1} attempts: {last_error}"
                    )

        await task_store.update_task(task_id, progress=65)

        # TTS narration (can run after Manim since we need to know Manim succeeded)
        await task_store.update_task(
            task_id, status="generating_narration", progress=70
        )
        narration_path = await generate_narration(task_id, script)
        await task_store.update_task(task_id, progress=85)

        # Step 5: Compose final video
        await task_store.update_task(task_id, status="composing_video", progress=90)
        await compose_video(task_id, animation_path, narration_path)

        # Done
        await task_store.update_task(
            task_id,
            status="completed",
            progress=100,
            video_url=f"/api/video/{task_id}",
        )
        logger.info(f"Pipeline completed for task {task_id}")

    except Exception as e:
        logger.error(f"Pipeline failed for task {task_id}: {e}")
        await task_store.update_task(
            task_id, status="failed", error=str(e)
        )
