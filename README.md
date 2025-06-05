# 🕐 Astreinte App - Application de Gestion des Heures d'Astreinte

Une application React moderne pour suivre et gérer vos heures d'astreinte, containerisée avec Docker pour un déploiement facile.

## 🚀 Fonctionnalités

- ✅ **Suivi en temps réel** des interventions d'astreinte
- ✅ **Calcul automatique** des durées et totaux
- ✅ **Interface moderne** et responsive
- ✅ **Export CSV** des données
- ✅ **Types d'interventions** prédéfinis
- ✅ **Édition en ligne** des interventions
- ✅ **Statistiques** en temps réel

## 🛠️ Technologies Utilisées

- **Frontend**: React 18, CSS3
- **Build**: Create React App
- **Containerisation**: Docker, Nginx
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
# Lancer l'application
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

# Lancer le conteneur
docker run -d -p 3000:80 --name astreinte-app astreinte-app

# Voir les logs
docker logs -f astreinte-app

# Arrêter le conteneur
docker stop astreinte-app && docker rm astreinte-app
```

### 4. Développement Local (sans Docker)

```bash
# Installer les dépendances
npm install

# Lancer en mode développement
npm start

# Build pour la production
npm run build

# Servir le build de production
npm run serve
```

## 🏗️ Structure du Projet

```
Astreinte_app/
├── public/
│   ├── index.html          # Template HTML principal
│   └── manifest.json       # Manifest PWA
├── src/
│   ├── App.js              # Composant principal React
│   ├── App.css             # Styles de l'application
│   ├── index.js            # Point d'entrée React
│   └── index.css           # Styles globaux
├── Dockerfile              # Configuration Docker
├── docker-compose.yml      # Configuration Docker Compose
├── nginx.conf              # Configuration Nginx
├── package.json            # Dépendances npm
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

### Modifier une Intervention

1. Cliquez sur l'icône **✏️** dans la ligne concernée
2. Modifiez les informations dans le formulaire
3. Cliquez sur **"Sauvegarder"**

### Exporter les Données

1. Cliquez sur **"Exporter CSV"** en haut à droite
2. Le fichier se télécharge automatiquement
3. Ouvrez-le dans Excel, Google Sheets ou tout autre tableur

### Statistiques Automatiques

L'application calcule automatiquement :
- **Durée de chaque intervention** (heure fin - heure début)
- **Total journalier** (somme des interventions du même jour)
- **Total hebdomadaire** (affiché dans le tableau de bord)
- **Nombre d'interventions** et **jours actifs**

## 🔧 Configuration Avancée

### Variables d'Environnement

Vous pouvez personnaliser l'application avec ces variables dans `docker-compose.yml` :

```yaml
environment:
  - NODE_ENV=production
  - REACT_APP_TITLE=Mon Application Astreinte
```

### Port Personnalisé

Pour changer le port d'accès, modifiez dans `docker-compose.yml` :

```yaml
ports:
  - "8080:80"  # Accès sur http://localhost:8080
```

### Volumes de Données

Pour persister les logs Nginx :

```yaml
volumes:
  - ./logs:/var/log/nginx
```

## 🔒 Sécurité

L'application inclut :
- Headers de sécurité Nginx
- Protection XSS
- Compression Gzip
- Cache optimisé pour les assets statiques

## 🚀 Déploiement en Production

### Sur un Serveur

1. **Installer Docker et Docker Compose** sur votre serveur
2. **Cloner le repository** sur le serveur
3. **Configurer un reverse proxy** (Nginx, Traefik, etc.)
4. **Utiliser HTTPS** avec Let's Encrypt

### Avec Traefik (inclus dans docker-compose.yml)

```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.astreinte.rule=Host(`astreinte.mondomaine.com`)"
  - "traefik.http.routers.astreinte.tls.certresolver=letsencrypt"
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
3. **Ouvrez** une issue sur GitHub
4. **Contactez** l'équipe de développement

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

## 📊 Capture d'Écran

![Application Astreinte](https://via.placeholder.com/800x600/667eea/ffffff?text=🕐+Astreinte+App)

## 🎯 Roadmap

- [ ] Authentification utilisateur
- [ ] Base de données persistante
- [ ] API REST
- [ ] Notifications push
- [ ] Mode sombre
- [ ] Application mobile

---

**Développé avec ❤️ par BadrBouzakri** - Application de gestion des heures d'astreinte

⭐ **N'oubliez pas de mettre une étoile si ce projet vous est utile !**