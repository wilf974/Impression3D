# Impression3D API Documentation

Documentation de l'API REST pour Impression3D.

## Base URL

- **Development**: `http://localhost:8000`
- **Production**: `https://api.impression3d.com`

## Authentication

Actuellement, l'API est ouverte sans authentification. L'authentification sera ajoutée dans une version future.

## Endpoints

### Health Check

#### `GET /health`

Vérifie l'état de santé de l'API.

**Response:**
```json
{
  "status": "healthy",
  "service": "impression3d-api"
}
```

---

### Text-to-3D Generation

#### `POST /api/v1/text-to-3d`

Génère un modèle 3D à partir d'une description textuelle.

**Request Body:**
```json
{
  "prompt": "un vase moderne avec des motifs géométriques",
  "quality": "medium"
}
```

**Parameters:**
- `prompt` (string, required): Description du modèle 3D (1-500 caractères)
- `quality` (string, optional): Qualité de génération - `"low"`, `"medium"`, `"high"` (défaut: `"medium"`)

**Response (202 Accepted):**
```json
{
  "task_id": "abc123-def456-ghi789",
  "status": "queued",
  "message": "Task submitted for processing"
}
```

**Error Responses:**

- `400 Bad Request`: Prompt invalide ou trop long
- `422 Unprocessable Entity`: Validation échouée
- `500 Internal Server Error`: Erreur serveur

---

### Image-to-3D Generation

#### `POST /api/v1/image-to-3d`

Génère un modèle 3D à partir d'une image.

**Request:**
- Content-Type: `multipart/form-data`

**Form Data:**
- `image` (file, required): Fichier image (PNG, JPG, WebP, max 10MB)
- `quality` (string, optional): Qualité de reconstruction - `"low"`, `"medium"`, `"high"` (défaut: `"medium"`)

**Response (202 Accepted):**
```json
{
  "task_id": "abc123-def456-ghi789",
  "status": "queued",
  "message": "Task submitted for processing"
}
```

**Error Responses:**

- `400 Bad Request`: Format de fichier invalide ou fichier trop volumineux
- `422 Unprocessable Entity`: Validation échouée
- `500 Internal Server Error`: Erreur serveur

---

### Task Status

#### `GET /api/v1/status/{task_id}`

Récupère le statut d'une tâche de génération.

**Path Parameters:**
- `task_id` (string, required): Identifiant de la tâche

**Response (200 OK):**
```json
{
  "task_id": "abc123-def456-ghi789",
  "status": "processing",
  "progress": 50,
  "created_at": "2026-01-12T10:00:00Z",
  "updated_at": "2026-01-12T10:01:30Z"
}
```

**Status Values:**
- `queued`: Tâche en attente de traitement
- `processing`: Génération en cours
- `post-processing`: Conversion en STL
- `completed`: Tâche terminée avec succès
- `failed`: Tâche échouée

**Response when completed:**
```json
{
  "task_id": "abc123-def456-ghi789",
  "status": "completed",
  "progress": 100,
  "result_url": "https://cdn.impression3d.com/models/abc123-def456-ghi789.stl",
  "created_at": "2026-01-12T10:00:00Z",
  "updated_at": "2026-01-12T10:02:45Z"
}
```

**Response when failed:**
```json
{
  "task_id": "abc123-def456-ghi789",
  "status": "failed",
  "progress": 0,
  "error": "Model generation failed: insufficient GPU memory",
  "created_at": "2026-01-12T10:00:00Z",
  "updated_at": "2026-01-12T10:00:30Z"
}
```

**Error Responses:**

- `404 Not Found`: Tâche non trouvée
- `500 Internal Server Error`: Erreur serveur

---

### Download Model

#### `GET /api/v1/download/{task_id}`

Télécharge le fichier STL généré.

**Path Parameters:**
- `task_id` (string, required): Identifiant de la tâche

**Response (200 OK):**
- Content-Type: `application/octet-stream` ou `model/stl`
- Fichier STL en binaire

**Error Responses:**

- `404 Not Found`: Tâche ou fichier non trouvé
- `400 Bad Request`: Tâche non terminée
- `500 Internal Server Error`: Erreur serveur

---

## Rate Limiting

Rate limiting sera ajouté dans une version future:
- 100 requêtes par heure pour les utilisateurs non authentifiés
- 1000 requêtes par heure pour les utilisateurs authentifiés

## Error Format

Toutes les erreurs suivent ce format:

```json
{
  "detail": "Description de l'erreur",
  "status_code": 400
}
```

## Examples

### Example: Text-to-3D avec curl

```bash
curl -X POST "http://localhost:8000/api/v1/text-to-3d" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "un cube rouge avec des coins arrondis",
    "quality": "medium"
  }'
```

### Example: Image-to-3D avec curl

```bash
curl -X POST "http://localhost:8000/api/v1/image-to-3d" \
  -F "image=@/path/to/image.jpg" \
  -F "quality=medium"
```

### Example: Check Status avec curl

```bash
curl -X GET "http://localhost:8000/api/v1/status/abc123-def456-ghi789"
```

### Example: Download Model avec curl

```bash
curl -X GET "http://localhost:8000/api/v1/download/abc123-def456-ghi789" \
  -o model.stl
```

## Python SDK Example

```python
import requests

# Generate from text
response = requests.post(
    "http://localhost:8000/api/v1/text-to-3d",
    json={
        "prompt": "un vase moderne",
        "quality": "medium"
    }
)
task_id = response.json()["task_id"]

# Check status
status_response = requests.get(
    f"http://localhost:8000/api/v1/status/{task_id}"
)
print(status_response.json())

# Download when completed
if status_response.json()["status"] == "completed":
    model = requests.get(
        f"http://localhost:8000/api/v1/download/{task_id}"
    )
    with open("model.stl", "wb") as f:
        f.write(model.content)
```

## JavaScript/TypeScript SDK Example

```typescript
// Generate from image
const formData = new FormData();
formData.append('image', imageFile);
formData.append('quality', 'medium');

const response = await fetch('http://localhost:8000/api/v1/image-to-3d', {
  method: 'POST',
  body: formData
});

const { task_id } = await response.json();

// Poll for status
const checkStatus = async () => {
  const statusResponse = await fetch(
    `http://localhost:8000/api/v1/status/${task_id}`
  );
  const status = await statusResponse.json();

  if (status.status === 'completed') {
    // Download model
    window.location.href =
      `http://localhost:8000/api/v1/download/${task_id}`;
  } else if (status.status === 'failed') {
    console.error(status.error);
  } else {
    setTimeout(checkStatus, 2000); // Poll every 2 seconds
  }
};

checkStatus();
```

## OpenAPI / Swagger

Documentation interactive disponible à:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`
- **OpenAPI JSON**: `http://localhost:8000/openapi.json`

## Support

Pour toute question sur l'API:
- Consultez le [README](../README.md)
- Ouvrez une [issue](https://github.com/yourusername/Impression3D/issues)
- Lisez le [guide de développement](../CLAUDE.md)
