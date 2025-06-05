# 🕐 Astreinte App - Application de Gestion des Heures d'Astreinte

Une application React moderne avec backend Node.js pour suivre et gérer vos heures d'astreinte, avec persistance des données en JSON et API REST complète.

## 🚀 Fonctionnalités

- ✅ **Suivi en temps réel** des interventions d'astreinte
- ✅ **Calcul automatique** des durées et totaux par semaine/mois
- ✅ **Interface moderne** et responsive
- ✅ **API REST complète** (GET, POST, PUT, DELETE)
- ✅ **Persistance des données** (fichier JSON sur serveur)
- ✅ **Export CSV** des données
- ✅ **Types d'interventions** prédéfinis
- ✅ **Édition en ligne** des interventions
- ✅ **Statistiques intelligentes** (semaine actuelle, mois actuel)
- ✅ **Données partagées** entre utilisateurs
- ✅ **Gestion d'erreurs** avec retry automatique

## 🛠️ Technologies Utilisées

- **Frontend**: React 18, CSS3
- **Backend**: Node.js, Express
- **API**: REST API avec JSON
- **Stockage**: Fichier JSON persistant
- **Build**: Create React App
- **Containerisation**: Docker
- **Orchestration**: Docker Compose

## 📦 Installation et Déploiement

### Prérequis

- Docker et Docker Compose installés
- Git installé

### 1. Cloner le Repository

```bash
git clone https://github.com/BadrBouzakri/Astreinte_app.git
cd Astreinte_app
```

### 2. Déploiement avec Docker Compose (Recommandé)

```bash
# Lancer l'application complète
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Arrêter l'application
docker-compose down
```

L'application sera accessible sur: **http://localhost:3000**

### 3. Déploiement avec Docker seul

```bash
# Build de l'image
docker build -t astreinte-app .

# Lancer le conteneur avec volumes
docker run -d -p 3000:3001 \
  -v $(pwd)/data:/app/data \
  --name astreinte-app astreinte-app

# Voir les logs
docker logs -f astreinte-app

# Arrêter le conteneur
docker stop astreinte-app && docker rm astreinte-app
```

### 4. Développement Local (sans Docker)

```bash
# Installer les dépendances
npm install

# Build de l'application React
npm run build

# Lancer le serveur complet (API + Frontend)
npm start

# Ou pour le développement React uniquement
npm run dev
```

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Stockage      │
│   React App     │◄──►│   Node.js API   │◄──►│   data.json     │
│   Port 3000     │    │   Port 3001     │    │   Volume        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### API Endpoints

- `GET /api/interventions` - Récupérer toutes les interventions
- `POST /api/interventions` - Créer une nouvelle intervention
- `PUT /api/interventions/:id` - Modifier une intervention
- `DELETE /api/interventions/:id` - Supprimer une intervention

## 🏗️ Structure du Projet

```
Astreinte_app/
├── public/
│   ├── index.html          # Template HTML principal
│   └── manifest.json       # Manifest PWA
├── src/
│   ├── App.js              # Frontend React avec API calls
│   ├── App.css             # Styles de l'application
│   ├── index.js            # Point d'entrée React
│   └── index.css           # Styles globaux
├── server.js               # Backend Node.js/Express + API REST
├── data/                   # Répertoire de données (créé automatiquement)
│   └── data.json           # Fichier de données persistantes
├── Dockerfile              # Configuration Docker
├── docker-compose.yml      # Configuration Docker Compose
├── package.json            # Dépendances npm (backend + frontend)
├── .dockerignore           # Fichiers ignorés par Docker
├── .gitignore              # Fichiers ignorés par Git
└── README.md               # Cette documentation
```

## 📱 Utilisation de l'Application

### Ajouter une Intervention

1. Remplissez le formulaire avec :
   - **Date** de l'intervention
   - **Heure de début** et **heure de fin**
   - **Type** d'intervention (Urgence, Maintenance, Support, etc.)
   - **Description** détaillée
   - **Observations** optionnelles

2. Cliquez sur **"Ajouter Intervention"**
3. Les données sont **automatiquement sauvegardées** sur le serveur

### Modifier une Intervention

1. Cliquez sur l'icône **✏️** dans la ligne concernée
2. Modifiez les informations dans le formulaire
3. Cliquez sur **"Sauvegarder"**

### Actualiser les Données

1. Cliquez sur **"🔄 Actualiser"** pour recharger depuis le serveur
2. Utile si plusieurs personnes utilisent l'application

### Exporter les Données

1. Cliquez sur **"📊 Exporter CSV"** en haut à droite
2. Le fichier se télécharge automatiquement
3. Ouvrez-le dans Excel, Google Sheets ou tout autre tableur

### Statistiques Automatiques

L'application calcule automatiquement :
- **📊 Total Semaine Actuelle** (Lundi à Dimanche en cours)
- **📈 Total Mois Actuel** (mois calendaire en cours)
- **📋 Total Interventions** (nombre total)
- **Durée de chaque intervention** (heure fin - heure début)
- **Total journalier** (somme des interventions du même jour)

## 💾 Persistance des Données

- **Stockage**: Fichier `data/data.json` sur le serveur
- **Partage**: Données accessibles à tous les utilisateurs
- **Backup**: Le fichier JSON peut être sauvegardé facilement
- **Migration**: Possibilité de migrer vers une vraie base de données plus tard

## 🔧 Configuration Avancée

### Variables d'Environnement

```bash
# Port du serveur (défaut: 3001)
PORT=3001

# Environnement (production/development)
NODE_ENV=production
```

### Port Personnalisé

Pour changer le port d'accès, modifiez dans `docker-compose.yml` :

```yaml
ports:
  - "8080:3001"  # Accès sur http://localhost:8080
```

### Volumes de Données

```yaml
volumes:
  - ./data:/app/data        # Données persistantes
  - ./logs:/app/logs        # Logs applicatifs
```

## 🔒 Sécurité

L'application inclut :
- Validation des données côté serveur
- Gestion d'erreurs robuste
- API REST sécurisée
- Gestion des CORS pour le développement

## 🚀 Déploiement en Production

### Sur un Serveur

1. **Installer Docker et Docker Compose** sur votre serveur
2. **Cloner le repository** sur le serveur
3. **Configurer un reverse proxy** (Apache, Nginx, Traefik, etc.)
4. **Utiliser HTTPS** avec Let's Encrypt

### Configuration Apache2 (Reverse Proxy)

```apache
<VirtualHost *:80>
    ServerName astreinte.mondomaine.com
    ProxyPass / http://localhost:3000/
    ProxyPassReverse / http://localhost:3000/
    ProxyPreserveHost On
</VirtualHost>
```

### Avec Traefik (inclus dans docker-compose.yml)

```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.astreinte.rule=Host(`astreinte.mondomaine.com`)"
  - "traefik.http.routers.astreinte.tls.certresolver=letsencrypt"
```

## 🛡️ Backup et Restauration

### Backup

```bash
# Sauvegarder les données
cp ./data/data.json ./backup/data-$(date +%Y%m%d-%H%M%S).json

# Ou automatique avec cron
0 2 * * * cp /path/to/astreinte/data/data.json /backup/astreinte-$(date +\%Y\%m\%d).json
```

### Restauration

```bash
# Arrêter l'application
docker-compose down

# Restaurer le fichier
cp ./backup/data-20250605.json ./data/data.json

# Relancer
docker-compose up -d
```

## 🤝 Contribution

1. **Fork** le repository
2. **Créer** une branche feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** vos changements (`git commit -m 'Add some AmazingFeature'`)
4. **Push** vers la branche (`git push origin feature/AmazingFeature`)
5. **Ouvrir** une Pull Request

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🆘 Support

Pour toute question ou problème :

1. **Consultez** cette documentation
2. **Vérifiez** les logs Docker : `docker-compose logs`
3. **Vérifiez** l'API : `curl http://localhost:3000/api/interventions`
4. **Ouvrez** une issue sur GitHub

## 🔄 Mise à Jour

Pour mettre à jour l'application :

```bash
# Arrêter l'application
docker-compose down

# Récupérer les dernières modifications
git pull origin main

# Rebuild et relancer
docker-compose up -d --build
```

## 🎯 Roadmap

- [x] ✅ **API REST complète**
- [x] ✅ **Persistance des données**
- [x] ✅ **Calculs intelligents par période**
- [ ] 🔄 **Authentification utilisateur**
- [ ] 🔄 **Migration vers PostgreSQL**
- [ ] 🔄 **Notifications push**
- [ ] 🔄 **Mode sombre**
- [ ] 🔄 **Application mobile PWA**
- [ ] 🔄 **API de rapports avancés**

---

**Développé avec ❤️ par BadrBouzakri** - Application full-stack de gestion des heures d'astreinte

⭐ **N'oubliez pas de mettre une étoile si ce projet vous est utile !**