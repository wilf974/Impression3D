# Impression3D

**Génération de modèles 3D par IA pour l'impression 3D**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![Node](https://img.shields.io/badge/node-18+-green.svg)](https://nodejs.org/)

Impression3D est une application fullstack professionnelle qui permet de générer des fichiers STL pour l'impression 3D à partir de descriptions textuelles ou d'images, en utilisant les modèles d'IA les plus récents.

## ✨ Fonctionnalités

- **Texte vers 3D**: Générez des modèles 3D à partir de descriptions en langage naturel
- **Image vers 3D**: Reconstruisez des modèles 3D à partir de photos 2D
- **Visualisation 3D**: Aperçu interactif en temps réel des modèles générés
- **Export STL**: Fichiers prêts à imprimer optimisés pour l'impression 3D
- **Interface moderne**: UI professionnelle et intuitive
- **Traitement asynchrone**: Génération en arrière-plan avec suivi de progression

## 🏗️ Architecture

```
Frontend (Next.js 15)
      ↓
   FastAPI
      ↓
  Celery + Redis
      ↓
 Modèles ML (TripoSR, Shap-E)
      ↓
Traitement 3D (Trimesh)
      ↓
  Fichiers STL
```

## 🚀 Démarrage rapide

### Prérequis

- **Node.js** 18+ et npm
- **Python** 3.10+
- **Redis** (ou Docker)
- **Docker** (optionnel mais recommandé)
- **GPU CUDA** (optionnel, pour de meilleures performances)

### Installation avec Docker (Recommandé)

```bash
# 1. Cloner le dépôt
git clone <repository-url>
cd Impression3D

# 2. Lancer les services
cd infrastructure
docker-compose up
```

L'application sera accessible à:
- **Frontend**: http://localhost:3000
- **API Backend**: http://localhost:8000/docs
- **Flower (Celery)**: http://localhost:5555

### Installation manuelle

```bash
# 1. Exécuter le script de configuration
chmod +x scripts/setup.sh
./scripts/setup.sh

# 2. Démarrer Redis (dans un terminal)
redis-server

# 3. Démarrer le backend (dans un terminal)
cd backend
source venv/bin/activate
uvicorn main:app --reload

# 4. Démarrer Celery worker (dans un terminal)
cd backend
source venv/bin/activate
celery -A celery_app worker --loglevel=info

# 5. Démarrer le frontend (dans un terminal)
cd frontend
npm run dev
```

## 📚 Documentation

- **[CLAUDE.md](CLAUDE.md)**: Guide complet pour les développeurs et assistants IA
- **[API Documentation](docs/API.md)**: Documentation de l'API REST
- **[Deployment Guide](docs/DEPLOYMENT.md)**: Guide de déploiement en production

## 🛠️ Stack technologique

### Frontend
- **Next.js 15** - Framework React avec SSR
- **TypeScript** - Typage statique
- **React Three Fiber** - Visualisation 3D
- **Tailwind CSS** - Styling
- **Shadcn/ui** - Composants UI

### Backend
- **FastAPI** - Framework API Python
- **Celery** - File d'attente de tâches
- **Redis** - Message broker
- **Pydantic** - Validation de données
- **PostgreSQL** - Base de données

### ML/IA
- **TripoSR** - Reconstruction image-to-3D
- **Shap-E** - Génération text-to-3D
- **PyTorch** - Framework ML
- **Trimesh** - Traitement de maillages 3D

## 🎯 Utilisation

### Générer un modèle 3D depuis un texte

1. Accédez à http://localhost:3000
2. Cliquez sur "Texte vers 3D"
3. Entrez une description (ex: "un vase moderne avec des motifs géométriques")
4. Sélectionnez la qualité
5. Cliquez sur "Générer"
6. Téléchargez votre fichier STL une fois généré

### Générer un modèle 3D depuis une image

1. Accédez à http://localhost:3000
2. Cliquez sur "Image vers 3D"
3. Téléchargez une image (PNG, JPG, WebP)
4. Sélectionnez la qualité
5. Cliquez sur "Générer"
6. Téléchargez votre fichier STL une fois généré

## 📁 Structure du projet

```
Impression3D/
├── frontend/          # Application Next.js
├── backend/           # API FastAPI
├── ml-models/         # Modèles ML et wrappers
├── infrastructure/    # Docker et configurations
├── scripts/           # Scripts utilitaires
├── docs/              # Documentation
└── CLAUDE.md         # Guide de développement
```

## 🧪 Tests

```bash
# Tester l'inférence ML
python scripts/test_inference.py

# Tests backend
cd backend
pytest

# Tests frontend
cd frontend
npm test
```

## 🚢 Déploiement

### Production avec Docker

```bash
cd infrastructure
docker-compose -f docker-compose.prod.yml up -d
```

### Hébergement recommandé

- **Frontend**: Vercel
- **Backend**: AWS/Azure ou RunPod (pour GPU)
- **Base de données**: PostgreSQL (Neon, RDS)
- **Stockage**: S3 / Azure Blob Storage
- **CDN**: CloudFront

Voir [DEPLOYMENT.md](docs/DEPLOYMENT.md) pour plus de détails.

## 🤝 Contribution

Les contributions sont les bienvenues ! Veuillez consulter [CLAUDE.md](CLAUDE.md) pour les conventions de développement.

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'feat: Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📝 Conventions de commit

Nous utilisons les [Conventional Commits](https://www.conventionalcommits.org/):

- `feat`: Nouvelle fonctionnalité
- `fix`: Correction de bug
- `docs`: Documentation
- `style`: Formatage
- `refactor`: Refactorisation
- `test`: Tests
- `chore`: Maintenance

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🙏 Remerciements

- [TripoSR](https://github.com/VAST-AI-Research/TripoSR) par Tripo AI et Stability AI
- [Shap-E](https://github.com/openai/shap-e) par OpenAI
- [Trimesh](https://github.com/mikedh/trimesh) pour le traitement de maillages
- [FastAPI](https://fastapi.tiangolo.com/) pour le framework backend
- [Next.js](https://nextjs.org/) pour le framework frontend

## 📞 Support

Pour toute question ou problème:
- Ouvrez une [issue](https://github.com/yourusername/Impression3D/issues)
- Consultez la [documentation](docs/)
- Lisez le [guide de développement](CLAUDE.md)

---

**Fait avec ❤️ pour la communauté de l'impression 3D**
