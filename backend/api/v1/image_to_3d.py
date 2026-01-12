"""
Image-to-3D API endpoints
"""

from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import Literal
from models.generation import GenerationResponse
from utils.config import settings
from utils.logging import setup_logging

logger = setup_logging()
router = APIRouter()


@router.post("/image-to-3d", response_model=GenerationResponse)
async def generate_image_to_3d(
    image: UploadFile = File(...),
    quality: Literal["low", "medium", "high"] = Form(default="medium"),
):
    """
    Generate a 3D model from an image

    Args:
        image: Uploaded image file
        quality: Reconstruction quality level

    Returns:
        GenerationResponse with task_id for tracking
    """
    try:
        # Validate file type
        if image.content_type not in settings.ALLOWED_IMAGE_FORMATS:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file format. Allowed formats: {', '.join(settings.ALLOWED_IMAGE_FORMATS)}",
            )

        # Validate file size
        contents = await image.read()
        file_size_mb = len(contents) / (1024 * 1024)

        if file_size_mb > settings.MAX_IMAGE_SIZE_MB:
            raise HTTPException(
                status_code=400,
                detail=f"File too large. Maximum size: {settings.MAX_IMAGE_SIZE_MB}MB",
            )

        logger.info(f"Received image-to-3D request: {image.filename}, size: {file_size_mb:.2f}MB, quality: {quality}")

        # TODO: Save image and submit Celery task
        # from tasks.image_to_3d import generate_image_to_3d_task
        # task = generate_image_to_3d_task.delay(image_path, quality)

        # For now, return mock response
        import uuid
        task_id = str(uuid.uuid4())

        logger.info(f"Created task {task_id} for image-to-3D generation")

        return GenerationResponse(
            task_id=task_id,
            status="queued",
            message="Task submitted for processing",
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in image-to-3D generation: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to submit generation task: {str(e)}",
        )
