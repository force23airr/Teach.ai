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


async def run_draft_pipeline(task_id: str, request: GenerateRequest) -> None:
    """Phase 1: Generate script + Manim code, then pause for teacher review."""
    try:
        # Step 1: Generate script
        await task_store.update_task(task_id, status="generating_script", progress=15)
        script = await generate_script(
            request.topic, request.subject, request.grade_level
        )
        await task_store.update_task(task_id, progress=40, script=script)

        # Step 2: Generate Manim code
        await task_store.update_task(task_id, status="generating_manim", progress=50)
        manim_code = await generate_manim_code(request.topic, request.subject, script)
        await task_store.update_task(
            task_id, status="review", progress=60, manim_code=manim_code
        )

        logger.info(f"Draft ready for review — task {task_id}")

    except Exception as e:
        logger.error(f"Draft pipeline failed for task {task_id}: {e}")
        await task_store.update_task(task_id, status="failed", error=str(e))


async def run_render_pipeline(
    task_id: str, script: str, manim_code: str
) -> None:
    """Phase 2: Take (possibly edited) script + code, render the final video."""
    try:
        # Step 3: Render Manim animation (with retry)
        await task_store.update_task(
            task_id, status="rendering_animation", progress=65
        )

        animation_path = None
        last_error = None
        for attempt in range(MAX_MANIM_RETRIES + 1):
            try:
                if attempt > 0:
                    logger.info(
                        f"Retrying Manim rendering (attempt {attempt + 1}) for task {task_id}"
                    )
                    manim_code = await generate_manim_code(
                        "retry", "math", script, error_feedback=last_error
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

        await task_store.update_task(task_id, progress=80)

        # Step 4: TTS narration
        await task_store.update_task(
            task_id, status="generating_narration", progress=82
        )
        narration_path = await generate_narration(task_id, script)
        await task_store.update_task(task_id, progress=90)

        # Step 5: Compose final video
        await task_store.update_task(task_id, status="composing_video", progress=92)
        await compose_video(task_id, animation_path, narration_path)

        # Done
        await task_store.update_task(
            task_id,
            status="completed",
            progress=100,
            video_url=f"/api/video/{task_id}",
        )
        logger.info(f"Render pipeline completed for task {task_id}")

    except Exception as e:
        logger.error(f"Render pipeline failed for task {task_id}: {e}")
        await task_store.update_task(task_id, status="failed", error=str(e))
