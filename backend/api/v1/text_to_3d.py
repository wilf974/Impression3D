"""
Text-to-3D API endpoints
"""

from fastapi import APIRouter, HTTPException
from models.generation import TextTo3DRequest, GenerationResponse
from utils.logging import setup_logging

logger = setup_logging()
router = APIRouter()


@router.post("/text-to-3d", response_model=GenerationResponse)
async def generate_text_to_3d(request: TextTo3DRequest):
    """
    Generate a 3D model from text description

    Args:
        request: Text-to-3D generation request with prompt and quality

    Returns:
        GenerationResponse with task_id for tracking
    """
    try:
        logger.info(f"Received text-to-3D request: {request.prompt[:50]}...")

        # TODO: Import and call Celery task
        # from tasks.text_to_3d import generate_text_to_3d_task
        # task = generate_text_to_3d_task.delay(request.prompt, request.quality)

        # For now, return mock response
        import uuid
        task_id = str(uuid.uuid4())

        logger.info(f"Created task {task_id} for text-to-3D generation")

        return GenerationResponse(
            task_id=task_id,
            status="queued",
            message="Task submitted for processing",
        )

    except Exception as e:
        logger.error(f"Error in text-to-3D generation: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to submit generation task: {str(e)}",
        )
