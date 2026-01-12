"""
Celery application configuration
"""

from celery import Celery
from utils.config import settings

# Create Celery app
celery_app = Celery(
    "impression3d",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=[
        "tasks.text_to_3d",
        "tasks.image_to_3d",
        "tasks.processing",
    ],
)

# Celery configuration
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=600,  # 10 minutes
    task_soft_time_limit=540,  # 9 minutes
    worker_prefetch_multiplier=1,
    worker_max_tasks_per_child=50,
)

# Optional: Task routing
celery_app.conf.task_routes = {
    "tasks.text_to_3d.*": {"queue": "text_to_3d"},
    "tasks.image_to_3d.*": {"queue": "image_to_3d"},
    "tasks.processing.*": {"queue": "processing"},
}

if __name__ == "__main__":
    celery_app.start()
