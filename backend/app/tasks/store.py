import asyncio
from typing import Optional

from app.models.schemas import TaskStatus


class TaskStore:
    def __init__(self):
        self._tasks: dict[str, TaskStatus] = {}
        self._lock = asyncio.Lock()

    async def create_task(self, task_id: str) -> TaskStatus:
        async with self._lock:
            task = TaskStatus(task_id=task_id, status="queued", progress=0)
            self._tasks[task_id] = task
            return task

    async def update_task(
        self,
        task_id: str,
        status: Optional[str] = None,
        progress: Optional[int] = None,
        video_url: Optional[str] = None,
        error: Optional[str] = None,
    ) -> TaskStatus:
        async with self._lock:
            task = self._tasks[task_id]
            if status is not None:
                task.status = status
            if progress is not None:
                task.progress = progress
            if video_url is not None:
                task.video_url = video_url
            if error is not None:
                task.error = error
            return task

    async def get_task(self, task_id: str) -> Optional[TaskStatus]:
        async with self._lock:
            return self._tasks.get(task_id)


task_store = TaskStore()
