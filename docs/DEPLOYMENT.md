# Impression3D - Guide de déploiement

Guide complet pour déployer Impression3D en production.

## Table des matières

1. [Architecture de production](#architecture-de-production)
2. [Option 1: Déploiement avec Docker](#option-1-déploiement-avec-docker)
3. [Option 2: Déploiement sur cloud](#option-2-déploiement-sur-cloud)
4. [Configuration](#configuration)
5. [Sécurité](#sécurité)
6. [Monitoring](#monitoring)
7. [Maintenance](#maintenance)

## Architecture de production

```
                    ┌─────────────┐
                    │   Vercel    │
                    │  (Frontend) │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │   AWS ALB   │
                    │ (Load Bal.) │
                    └──────┬──────┘
                           │
        ┌──────────────────┴──────────────────┐
        │                                     │
   ┌────▼────┐                          ┌────▼────┐
   │ FastAPI │                          │ FastAPI │
   │ Server 1│                          │ Server 2│
   └────┬────┘                          └────┬────┘
        │                                     │
        └──────────────────┬──────────────────┘
                           │
                    ┌──────▼──────┐
                    │    Redis    │
                    │  (Cluster)  │
                    └──────┬──────┘
                           │
        ┌──────────────────┴──────────────────┐
        │                                     │
   ┌────▼────┐                          ┌────▼────┐
   │ Celery  │                          │ Celery  │
   │ Worker 1│                          │ Worker 2│
   │  (GPU)  │                          │  (GPU)  │
   └────┬────┘                          └────┬────┘
        │                                     │
        └──────────────────┬──────────────────┘
                           │
                    ┌──────▼──────┐
                    │     S3      │
                    │  (Storage)  │
                    └─────────────┘
```

## Option 1: Déploiement avec Docker

### 1.1 Configuration des services

#### Production docker-compose

```bash
cd infrastructure
cp docker-compose.prod.yml docker-compose.yml
```

#### Variables d'environnement

Créez un fichier `.env`:

```bash
# Redis
REDIS_PASSWORD=your_secure_redis_password

# Database
DATABASE_URL=postgresql+asyncpg://user:pass@your-db-host:5432/impression3d

# AWS S3
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET=impression3d-prod

# Flower
FLOWER_USERNAME=admin
FLOWER_PASSWORD=secure_flower_password

# Secrets
JWT_SECRET_KEY=your_jwt_secret_key
```

### 1.2 Lancement en production

```bash
# Construire les images
docker-compose build

# Démarrer les services
docker-compose up -d

# Vérifier les logs
docker-compose logs -f
```

### 1.3 Scaling

```bash
# Augmenter le nombre de workers
docker-compose up -d --scale celery-worker-cpu=4

# Augmenter les serveurs API
docker-compose up -d --scale backend=3
```

## Option 2: Déploiement sur cloud

### 2.1 Frontend sur Vercel

#### Installation

```bash
cd frontend
npm install -g vercel
vercel login
```

#### Déploiement

```bash
# Déploiement de test
vercel

# Déploiement en production
vercel --prod
```

#### Variables d'environnement Vercel

```
NEXT_PUBLIC_API_URL=https://api.your-domain.com
NEXT_PUBLIC_WS_URL=wss://api.your-domain.com
NEXT_PUBLIC_CDN_URL=https://cdn.your-domain.com
```

### 2.2 Backend sur AWS

#### 2.2.1 ECS (Elastic Container Service)

**Étape 1: Créer un ECR repository**

```bash
aws ecr create-repository --repository-name impression3d-backend
```

**Étape 2: Build et push l'image Docker**

```bash
cd backend
docker build -t impression3d-backend .

# Tag et push
docker tag impression3d-backend:latest \
  <account-id>.dkr.ecr.<region>.amazonaws.com/impression3d-backend:latest

docker push <account-id>.dkr.ecr.<region>.amazonaws.com/impression3d-backend:latest
```

**Étape 3: Créer un cluster ECS**

```bash
aws ecs create-cluster --cluster-name impression3d-cluster
```

**Étape 4: Créer une task definition**

Créez `task-definition.json`:

```json
{
  "family": "impression3d-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "<account-id>.dkr.ecr.<region>.amazonaws.com/impression3d-backend:latest",
      "portMappings": [
        {
          "containerPort": 8000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {"name": "REDIS_URL", "value": "redis://..."},
        {"name": "DATABASE_URL", "value": "postgresql://..."}
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/impression3d-backend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

**Étape 5: Créer un service**

```bash
aws ecs create-service \
  --cluster impression3d-cluster \
  --service-name impression3d-backend-service \
  --task-definition impression3d-backend \
  --desired-count 2 \
  --launch-type FARGATE
```

#### 2.2.2 Workers Celery sur RunPod

**Pourquoi RunPod?**
- 5-6× moins cher qu'AWS pour GPU
- RTX 4090: $0.35/heure
- A100 40GB: $1.19/heure
- Facturation à la seconde

**Configuration RunPod:**

1. Créez un Pod avec GPU (RTX 4090 ou A100)
2. Utilisez une image Docker personnalisée:

```dockerfile
FROM runpod/pytorch:2.1.0-py3.10-cuda12.1.0-devel

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

CMD celery -A celery_app worker --loglevel=info
```

3. Configurez les variables d'environnement
4. Démarrez le Pod

### 2.3 Base de données PostgreSQL

#### Option A: Neon (Serverless)

```bash
# Inscription sur https://neon.tech
# Créez une base de données
# Copiez la connection string

DATABASE_URL=postgresql+asyncpg://user:pass@ep-xxx.neon.tech/impression3d
```

#### Option B: AWS RDS

```bash
aws rds create-db-instance \
  --db-instance-identifier impression3d-db \
  --db-instance-class db.t3.medium \
  --engine postgres \
  --master-username admin \
  --master-user-password YourPassword123 \
  --allocated-storage 20
```

### 2.4 Redis

#### Option A: Redis Cloud

```bash
# Inscription sur https://redis.com/try-free
# Créez une base de données
# Copiez l'URL de connexion

REDIS_URL=redis://default:password@redis-xxxxx.cloud.redislabs.com:12345
```

#### Option B: AWS ElastiCache

```bash
aws elasticache create-cache-cluster \
  --cache-cluster-id impression3d-redis \
  --engine redis \
  --cache-node-type cache.t3.micro \
  --num-cache-nodes 1
```

### 2.5 Stockage S3

```bash
# Créer un bucket S3
aws s3 mb s3://impression3d-models

# Configurer CORS
aws s3api put-bucket-cors \
  --bucket impression3d-models \
  --cors-configuration file://cors.json
```

**cors.json:**

```json
{
  "CORSRules": [
    {
      "AllowedOrigins": ["https://your-domain.com"],
      "AllowedMethods": ["GET", "PUT", "POST"],
      "AllowedHeaders": ["*"],
      "MaxAgeSeconds": 3000
    }
  ]
}
```

### 2.6 CDN CloudFront

```bash
aws cloudfront create-distribution \
  --origin-domain-name impression3d-models.s3.amazonaws.com \
  --default-root-object index.html
```

## Configuration

### Checklist de production

- [ ] Variables d'environnement configurées
- [ ] Secrets stockés de manière sécurisée (AWS Secrets Manager, etc.)
- [ ] Base de données sauvegardée quotidiennement
- [ ] SSL/TLS configuré
- [ ] CORS configuré correctement
- [ ] Rate limiting activé
- [ ] Logging centralisé
- [ ] Monitoring configuré
- [ ] Alertes configurées
- [ ] Documentation à jour

### Variables d'environnement essentielles

```bash
# Backend
DEBUG=False
REDIS_URL=redis://...
DATABASE_URL=postgresql://...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
S3_BUCKET=impression3d-models
MODEL_CACHE_DIR=/models
GPU_DEVICE=cuda:0

# Frontend
NEXT_PUBLIC_API_URL=https://api.your-domain.com
NEXT_PUBLIC_CDN_URL=https://cdn.your-domain.com
```

## Sécurité

### 1. HTTPS/SSL

Utilisez Let's Encrypt pour les certificats gratuits:

```bash
sudo certbot --nginx -d api.your-domain.com
```

### 2. Pare-feu

```bash
# Autoriser uniquement ports nécessaires
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

### 3. Secrets

Ne jamais committer de secrets. Utilisez:
- AWS Secrets Manager
- HashiCorp Vault
- Environment variables chiffrées

### 4. Rate Limiting

Configuration nginx:

```nginx
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

server {
    location /api/ {
        limit_req zone=api_limit burst=20 nodelay;
    }
}
```

## Monitoring

### 1. Application Monitoring

#### Sentry pour les erreurs

```python
# backend/main.py
import sentry_sdk

sentry_sdk.init(
    dsn="your-sentry-dsn",
    environment="production",
)
```

#### DataDog pour les métriques

```bash
# Installer l'agent DataDog
DD_API_KEY=your-api-key DD_SITE="datadoghq.com" \
  bash -c "$(curl -L https://s3.amazonaws.com/dd-agent/scripts/install_script.sh)"
```

### 2. Celery Monitoring avec Flower

```bash
celery -A celery_app flower \
  --port=5555 \
  --basic_auth=admin:password
```

### 3. Logs

Configuration centralisée avec CloudWatch:

```python
import watchtower

logger.addHandler(watchtower.CloudWatchLogHandler(
    log_group='/impression3d/backend'
))
```

### 4. Alertes

Configuration d'alertes AWS CloudWatch:

```bash
aws cloudwatch put-metric-alarm \
  --alarm-name high-cpu \
  --alarm-description "Alert when CPU exceeds 80%" \
  --metric-name CPUUtilization \
  --threshold 80
```

## Maintenance

### Sauvegardes

#### Base de données

```bash
# Sauvegarde automatique quotidienne
0 2 * * * pg_dump impression3d | gzip > /backups/db-$(date +\%Y\%m\%d).sql.gz
```

#### Modèles générés

```bash
# Sync S3 vers backup
aws s3 sync s3://impression3d-models s3://impression3d-backups
```

### Mises à jour

```bash
# Pull nouvelle version
git pull origin main

# Rebuild et redéploiement
docker-compose build
docker-compose up -d --no-deps backend
```

### Rollback

```bash
# Revenir à la version précédente
git checkout v1.0.0
docker-compose build
docker-compose up -d
```

## Coûts estimés

### Startup (MVP)

- Frontend (Vercel): $0-20/mois
- Backend (AWS t3.small): $15/mois
- Workers GPU (RunPod): $50-200/mois
- Database (Neon): $0-25/mois
- Redis (Redis Cloud): $0-10/mois
- S3 + CloudFront: $10-30/mois

**Total: ~$75-300/mois**

### Production (1000 générations/jour)

- Frontend (Vercel Pro): $20/mois
- Backend (ECS 2 instances): $100/mois
- Workers GPU (RunPod A100): $300-600/mois
- Database (RDS): $50-100/mois
- Redis (ElastiCache): $30/mois
- S3 + CloudFront: $100/mois
- Monitoring: $50/mois

**Total: ~$650-1000/mois**

## Support

Pour toute question sur le déploiement:
- Consultez la [documentation complète](../CLAUDE.md)
- Ouvrez une [issue](https://github.com/yourusername/Impression3D/issues)
- Contactez l'équipe de support

---

**Bon déploiement! 🚀**
