import asyncio
import uuid
from pathlib import Path

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

from app.config import settings
from app.models.schemas import GenerateRequest, TaskStatus
from app.services.pipeline import run_pipeline
from app.tasks.store import task_store

router = APIRouter(prefix="/api")


@router.post("/generate", status_code=202)
async def generate_video(request: GenerateRequest) -> dict:
    task_id = str(uuid.uuid4())
    await task_store.create_task(task_id)
    asyncio.create_task(run_pipeline(task_id, request))
    return {"task_id": task_id}


@router.get("/status/{task_id}")
async def get_status(task_id: str) -> TaskStatus:
    task = await task_store.get_task(task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.get("/video/{task_id}")
async def get_video(task_id: str):
    task = await task_store.get_task(task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    if task.status != "completed":
        raise HTTPException(status_code=400, detail="Video not ready")

    video_path = Path(settings.output_dir) / f"{task_id}_final.mp4"
    if not video_path.exists():
        raise HTTPException(status_code=404, detail="Video file not found")

    return FileResponse(
        path=str(video_path),
        media_type="video/mp4",
        filename=f"teach_ai_{task_id}.mp4",
    )
