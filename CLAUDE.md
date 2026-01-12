# Impression3D - AI Assistant Development Guide

## Project Overview

**Impression3D** is a professional, user-friendly fullstack application for generating STL files (3D models for 3D printing) using AI. The application supports two primary generation methods:

1. **Text-to-3D**: Generate 3D models from natural language descriptions
2. **Image-to-3D**: Reconstruct 3D models from 2D images

### Project Goals

- Create a professional-grade 3D generation platform
- Maintain exceptional user experience and interface design
- Leverage state-of-the-art AI models for high-quality output
- Ensure scalability and performance optimization
- Support both hobbyist and professional use cases

## Technology Stack

### Frontend Stack

**Core Framework**
- **Next.js 15** with TypeScript for fullstack architecture
- Server-side rendering (SSR) and React Server Components
- Built-in routing and API routes
- Environment: Node.js 18+ recommended

**3D Visualization**
- **React Three Fiber**: React renderer for Three.js
- **Drei**: Helper components for cameras, controls, loaders
- **react-stl-viewer**: Pre-built STL visualization component
- Purpose: Real-time 3D model preview and manipulation

**UI Components**
- **Shadcn/ui**: Modern, accessible component library
- **Tailwind CSS**: Utility-first styling framework
- **Zod**: Type-safe form validation
- Design philosophy: Professional yet user-friendly

### Backend Stack

**API Framework**
- **FastAPI** (Python 3.10+): High-performance async API framework
- **Pydantic**: Data validation and settings management
- **OpenAPI**: Automatic API documentation generation
- Async support throughout for long-running operations

**Task Queue**
- **Celery**: Distributed task processing
- **Redis**: Message broker and caching layer
- Purpose: Handle long-running ML inference (5-30 seconds per generation)
- **Celery Flower**: Task monitoring and management dashboard

**Alternative Deployment Options**
- **Modal**: Serverless GPU inference platform
- **RunPod Serverless**: Cold starts under 200ms (48% of requests)

### AI/ML Models

**Image-to-3D (Primary: TripoSR)**
- Developer: Tripo AI + Stability AI
- Speed: < 0.5 seconds for reconstruction
- State-of-the-art quality
- GitHub: VAST-AI-Research/TripoSR
- Requirements: Python >= 3.10, PyTorch >= 2.1.0, CUDA >= 12.1

**Image-to-3D (Alternative: InstantMesh)**
- Developer: Tencent ARC
- Multi-view consistent generation
- GitHub: TencentARC/InstantMesh
- Uses Zero123++ for multi-view synthesis

**Text-to-3D (Primary: Shap-E)**
- Developer: OpenAI
- Generates implicit functions rendered as textured meshes
- GitHub: openai/shap-e
- Faster convergence than Point-E

**Text-to-3D (Alternative: Combined Pipeline)**
- Text → Image: Stable Diffusion 3D / DALL-E
- Image → 3D: TripoSR / InstantMesh
- Benefit: Leverages mature text-to-image models

### 3D Processing

**Primary Library: Trimesh**
- Pure Python 3.8+ mesh processing
- Emphasis on watertight surfaces
- Direct STL export from NumPy arrays
- Install: `pip install trimesh`

**Secondary Library: Open3D**
- Industrial-strength 3D data processing
- CUDA-optimized operations
- Fast GPU-supported ICP and neighbor search
- Use for: Real-time workflows, point cloud processing

### Infrastructure

**GPU Hosting (Recommended: RunPod)**
- Cost: 5-6× cheaper than AWS/Azure
- RTX 4090: $0.35/hour
- A100 40GB: $1.19/hour
- Serverless: $2.17/hour (active time only)
- Per-second billing

**Alternative: AWS/Azure for Enterprise**
- AWS SageMaker for ML deployment
- Azure N-series VMs with latest GPUs
- Use when: Enterprise-grade security/compliance required

**Deployment**
- Frontend: Vercel (seamless Next.js deployment)
- Backend: Docker + RunPod / AWS Lambda + GPU endpoints
- Database: PostgreSQL (Neon for serverless, RDS for AWS)
- Storage: S3/Azure Blob for STL files + CloudFront CDN
- Monitoring: Celery Flower, Sentry, DataDog

## Project Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                            │
│  Next.js 15 + TypeScript + React Three Fiber + Drei        │
│  - 3D visualization with STL viewer                         │
│  - Image/text upload interface                              │
│  - Real-time generation progress                            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ REST API / WebSocket
                     │
┌────────────────────▼────────────────────────────────────────┐
│                    BACKEND (FastAPI)                         │
│  - API endpoints for text/image-to-3D                       │
│  - Request validation (Pydantic)                            │
│  - Task submission to Celery                                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Task Queue
                     │
┌────────────────────▼────────────────────────────────────────┐
│              CELERY WORKERS + REDIS                          │
│  - Distributed task processing                              │
│  - Model loading (once per worker)                          │
│  - Progress updates via WebSocket                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ GPU Inference
                     │
┌────────────────────▼────────────────────────────────────────┐
│                   AI/ML MODELS                               │
│  Text-to-3D: Shap-E or (SD3D → TripoSR)                    │
│  Image-to-3D: TripoSR or InstantMesh                        │
│  - Load models on worker startup                            │
│  - Generate 3D representations                              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Mesh Processing
                     │
┌────────────────────▼────────────────────────────────────────┐
│            3D PROCESSING (Trimesh/Open3D)                    │
│  - Mesh cleanup and optimization                            │
│  - STL file generation                                       │
│  - Quality validation                                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ File Storage
                     │
┌────────────────────▼────────────────────────────────────────┐
│                S3/Azure Blob + CDN                           │
│  - STL file storage                                          │
│  - Signed URLs for download                                  │
│  - CDN distribution                                          │
└──────────────────────────────────────────────────────────────┘
```

## Directory Structure

```
/Impression3D
├── /frontend                    # Next.js application
│   ├── /app                     # Next.js 15 app directory
│   │   ├── /api                 # API routes
│   │   ├── /generate            # Generation pages
│   │   ├── /gallery             # User gallery
│   │   └── layout.tsx           # Root layout
│   ├── /components              # React components
│   │   ├── /ui                  # Shadcn/ui components
│   │   ├── /viewer              # 3D viewer components
│   │   ├── /forms               # Input forms
│   │   └── /layout              # Layout components
│   ├── /lib                     # Utilities and helpers
│   │   ├── /api                 # API client functions
│   │   ├── /validation          # Zod schemas
│   │   └── /utils               # Utility functions
│   ├── /public                  # Static assets
│   ├── /styles                  # Global styles
│   ├── package.json
│   ├── tsconfig.json
│   └── tailwind.config.ts
│
├── /backend                     # FastAPI application
│   ├── /api                     # API routes
│   │   ├── /v1                  # API version 1
│   │   │   ├── text_to_3d.py   # Text-to-3D endpoints
│   │   │   ├── image_to_3d.py  # Image-to-3D endpoints
│   │   │   └── status.py       # Status and health checks
│   │   └── __init__.py
│   ├── /models                  # Pydantic models
│   │   ├── generation.py       # Generation request/response models
│   │   ├── user.py             # User models
│   │   └── __init__.py
│   ├── /services                # Business logic
│   │   ├── generation.py       # Generation orchestration
│   │   ├── storage.py          # File storage service
│   │   └── validation.py       # Input validation
│   ├── /tasks                   # Celery tasks
│   │   ├── text_to_3d.py       # Text-to-3D Celery tasks
│   │   ├── image_to_3d.py      # Image-to-3D Celery tasks
│   │   └── processing.py       # Post-processing tasks
│   ├── /utils                   # Utilities
│   │   ├── logging.py          # Logging configuration
│   │   └── config.py           # Configuration management
│   ├── main.py                 # FastAPI application entry
│   ├── celery_app.py           # Celery configuration
│   ├── requirements.txt
│   └── Dockerfile
│
├── /ml-models                   # ML model implementations
│   ├── /triposr                # TripoSR model
│   │   ├── model.py            # Model wrapper
│   │   ├── inference.py        # Inference logic
│   │   └── requirements.txt
│   ├── /shap-e                 # Shap-E model
│   │   ├── model.py
│   │   ├── inference.py
│   │   └── requirements.txt
│   ├── /preprocessing          # Preprocessing utilities
│   │   ├── image.py            # Image preprocessing
│   │   └── text.py             # Text preprocessing
│   └── /postprocessing         # Postprocessing utilities
│       ├── mesh.py             # Mesh cleanup
│       └── stl_export.py       # STL generation
│
├── /infrastructure             # Infrastructure as code
│   ├── docker-compose.yml      # Local development
│   ├── docker-compose.prod.yml # Production configuration
│   └── /k8s                    # Kubernetes configs (if needed)
│
├── /scripts                    # Utility scripts
│   ├── setup.sh               # Development setup
│   ├── download_models.sh     # Download ML models
│   └── test_inference.py      # Test ML inference
│
├── /docs                       # Documentation
│   ├── API.md                 # API documentation
│   ├── DEPLOYMENT.md          # Deployment guide
│   └── MODELS.md              # ML models documentation
│
├── .gitignore
├── README.md                   # Project README
├── CLAUDE.md                   # This file
└── LICENSE
```

## Development Workflow

### Initial Setup

1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd Impression3D
   ```

2. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Backend Setup**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   uvicorn main:app --reload
   ```

4. **Download ML Models**
   ```bash
   # Run model download script
   ./scripts/download_models.sh
   ```

5. **Start Redis and Celery**
   ```bash
   # Terminal 1: Redis
   redis-server

   # Terminal 2: Celery worker
   cd backend
   celery -A celery_app worker --loglevel=info

   # Terminal 3: Celery Flower (optional)
   celery -A celery_app flower
   ```

6. **Docker Compose (Alternative)**
   ```bash
   docker-compose up
   ```

### Development Best Practices

#### Code Style and Standards

**Python (Backend)**
- Follow PEP 8 style guide
- Use type hints for all function signatures
- Max line length: 88 characters (Black formatter)
- Use async/await for I/O operations
- Document all public APIs with docstrings

**TypeScript (Frontend)**
- Use strict TypeScript configuration
- Prefer functional components with hooks
- Use named exports over default exports
- Max line length: 100 characters
- Document complex components with JSDoc

**Formatting Tools**
- Python: Black, isort, flake8
- TypeScript: Prettier, ESLint
- Run formatters before committing

#### Git Workflow

**Branch Naming Convention**
- Feature branches: `feature/description`
- Bug fixes: `fix/description`
- Documentation: `docs/description`
- Refactoring: `refactor/description`

**Commit Messages**
- Use conventional commits format
- Format: `type(scope): description`
- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
- Examples:
  - `feat(api): add text-to-3D endpoint`
  - `fix(viewer): resolve STL loading issue`
  - `docs(readme): update installation instructions`

**Pull Request Process**
1. Create feature branch from `main`
2. Implement changes with tests
3. Run linters and formatters
4. Ensure all tests pass
5. Create PR with description of changes
6. Address review comments
7. Squash and merge when approved

### Testing Strategy

**Unit Tests**
- Backend: pytest with pytest-asyncio
- Frontend: Jest with React Testing Library
- Aim for >80% code coverage

**Integration Tests**
- Test API endpoints with sample data
- Verify STL file generation pipeline
- Test Celery task execution

**3D Validation Tests**
- Verify mesh is manifold (watertight)
- Check for degenerate triangles
- Validate STL file structure
- Test with Trimesh validation utilities

**Performance Tests**
- Measure inference time per model
- Monitor memory usage during generation
- Track API response times
- Use pytest-benchmark or locust for load testing

**Example Test Structure**
```python
# backend/tests/test_generation.py
import pytest
from fastapi.testclient import TestClient

def test_text_to_3d_endpoint():
    """Test text-to-3D API endpoint"""
    response = client.post("/api/v1/text-to-3d", json={
        "prompt": "a red cube",
        "quality": "medium"
    })
    assert response.status_code == 200
    assert "task_id" in response.json()
```

### Performance Optimization Guidelines

**Model Loading**
- Load AI models once per worker at startup
- Use model caching to avoid repeated downloads
- Implement lazy loading for optional models

**Mesh Processing**
- Simplify meshes for web display (reduce polygon count)
- Generate multiple LOD (Level of Detail) versions
- Use progressive loading: low-res preview → high-res final

**3D Viewer Optimization**
- Limit number of lights (prefer baked lightmaps)
- Use instancing for repeated geometries
- Implement frustum culling and occlusion
- Leverage Drei's automatic invalidation

**GPU Management**
- Use CUDA streams for concurrent processing
- Batch multiple inference requests when possible
- Monitor GPU memory usage
- Implement request queuing with priority levels

**Caching Strategy**
- Cache frequently requested models in Redis
- Use CDN for STL file delivery
- Implement browser caching for static assets
- Cache preprocessed data (embeddings, thumbnails)

## AI Assistant Guidelines

### When Working on This Project

**1. Understand the Architecture**
- Always review the architecture diagram before making changes
- Understand data flow: Frontend → API → Celery → ML Model → Processing → Storage
- Respect separation of concerns between layers

**2. Follow the Tech Stack**
- Use Next.js 15 patterns (App Router, Server Components)
- Leverage FastAPI's async capabilities
- Use Pydantic for data validation
- Follow React Three Fiber best practices

**3. Model Integration**
- When adding new models, create wrapper classes in `/ml-models`
- Implement consistent inference interface
- Document model requirements and limitations
- Add model-specific configuration

**4. API Development**
- Use Pydantic models for request/response validation
- Implement proper error handling with meaningful messages
- Document endpoints with OpenAPI descriptions
- Return consistent JSON structure
- Version APIs appropriately (v1, v2, etc.)

**5. Frontend Components**
- Create reusable, well-documented components
- Use TypeScript interfaces for props
- Implement loading states and error handling
- Optimize 3D viewer performance
- Follow accessibility best practices

**6. Testing Requirements**
- Write tests for new features
- Include happy path and edge cases
- Test error handling
- Verify STL file integrity
- Add performance benchmarks for critical paths

**7. Security Considerations**
- Validate all user inputs (file size, format, text length)
- Implement rate limiting
- Use signed URLs for file downloads
- Sanitize file uploads
- Never commit API keys or secrets

**8. Documentation**
- Update CLAUDE.md when architecture changes
- Document new API endpoints in API.md
- Add inline comments for complex logic
- Update README.md for setup changes

### Common Tasks and Patterns

**Adding a New Generation Model**
1. Create model wrapper in `/ml-models/<model-name>/`
2. Implement inference function with consistent interface
3. Add Celery task in `/backend/tasks/`
4. Create API endpoint in `/backend/api/v1/`
5. Add frontend integration
6. Write tests and documentation

**Implementing a New Feature**
1. Review existing architecture
2. Create feature branch
3. Implement backend logic first (API + tasks)
4. Add frontend interface
5. Write comprehensive tests
6. Update documentation
7. Create pull request

**Debugging Generation Issues**
1. Check Celery worker logs
2. Verify model loading status
3. Test inference with sample data
4. Validate input preprocessing
5. Check STL file integrity with Trimesh
6. Review GPU memory usage

**Optimizing Performance**
1. Profile with cProfile (backend) or React DevTools (frontend)
2. Identify bottlenecks
3. Implement caching where appropriate
4. Optimize database queries
5. Reduce unnecessary re-renders
6. Measure improvement with benchmarks

### Error Handling Patterns

**Backend (FastAPI)**
```python
from fastapi import HTTPException
from pydantic import ValidationError

@app.post("/api/v1/generate")
async def generate_3d(request: GenerationRequest):
    try:
        # Validate input
        if not request.prompt or len(request.prompt) > 500:
            raise HTTPException(
                status_code=400,
                detail="Prompt must be 1-500 characters"
            )

        # Submit task
        task = generate_task.delay(request.dict())
        return {"task_id": task.id, "status": "queued"}

    except ValidationError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.error(f"Generation failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")
```

**Frontend (React)**
```typescript
async function handleGenerate() {
  setIsLoading(true);
  setError(null);

  try {
    const response = await fetch('/api/v1/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, quality })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Generation failed');
    }

    const data = await response.json();
    setTaskId(data.task_id);
    pollStatus(data.task_id);

  } catch (err) {
    setError(err instanceof Error ? err.message : 'Unknown error');
  } finally {
    setIsLoading(false);
  }
}
```

### Key Conventions

**Naming Conventions**
- Python: `snake_case` for functions, variables; `PascalCase` for classes
- TypeScript: `camelCase` for functions, variables; `PascalCase` for components
- Files: `kebab-case` for URLs/routes; `PascalCase` for React components
- Constants: `UPPER_SNAKE_CASE` in both languages

**File Organization**
- Group by feature, not by type
- Keep related code together
- Separate concerns (UI, logic, data)
- Use index files for clean imports

**API Response Format**
```json
{
  "success": true,
  "data": {
    "task_id": "abc-123",
    "status": "processing"
  },
  "error": null
}
```

**Task Status Flow**
- `queued` → Task submitted to Celery
- `processing` → Worker started inference
- `post-processing` → Converting to STL
- `completed` → STL file ready
- `failed` → Error occurred (with error message)

## Deployment Considerations

### Environment Variables

**Frontend (.env.local)**
```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
NEXT_PUBLIC_CDN_URL=https://cdn.example.com
```

**Backend (.env)**
```
REDIS_URL=redis://localhost:6379
DATABASE_URL=postgresql://user:pass@localhost/dbname
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
S3_BUCKET=impression3d-models
MODEL_CACHE_DIR=/models
GPU_DEVICE=cuda:0
```

### Production Checklist

- [ ] Set up SSL/TLS certificates
- [ ] Configure CDN for static assets
- [ ] Enable CORS with proper origins
- [ ] Set up monitoring and alerting
- [ ] Configure auto-scaling for Celery workers
- [ ] Implement backup strategy for database
- [ ] Set up log aggregation (e.g., DataDog, CloudWatch)
- [ ] Configure rate limiting
- [ ] Enable HTTPS-only cookies
- [ ] Set up CI/CD pipeline
- [ ] Configure environment variables properly
- [ ] Test disaster recovery procedures

### Scaling Strategy

**Horizontal Scaling**
- Add more Celery workers as demand grows
- Use Kubernetes for automatic scaling
- Implement load balancing for API servers

**Vertical Scaling**
- Upgrade GPU instances for faster inference
- Increase worker memory for larger models

**Cost Optimization**
- Use spot instances for non-critical workers
- Implement request batching
- Cache frequently requested models
- Use CDN for file delivery
- Monitor and optimize GPU utilization

## Support and Resources

### Key Documentation
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [React Three Fiber](https://r3f.docs.pmnd.rs/)
- [Trimesh Documentation](https://trimesh.org/)
- [Celery Documentation](https://docs.celeryq.dev/)

### ML Model Resources
- [TripoSR GitHub](https://github.com/VAST-AI-Research/TripoSR)
- [InstantMesh GitHub](https://github.com/TencentARC/InstantMesh)
- [Shap-E GitHub](https://github.com/openai/shap-e)

### Community
- Create GitHub issues for bugs or feature requests
- Follow conventional commits for consistency
- Review open PRs and provide feedback

## Project Status

**Current State**: Initial repository setup
**Next Steps**:
1. Set up project structure
2. Initialize frontend and backend boilerplates
3. Set up Docker development environment
4. Implement basic text-to-3D pipeline
5. Add image-to-3D functionality
6. Build user interface
7. Deploy MVP

---

**Last Updated**: 2026-01-12
**Version**: 1.0.0
**Maintained By**: Development Team
