# Utiliser Node.js comme base
FROM node:18-alpine

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer toutes les dépendances (dev + prod)
RUN npm install

# Copier tout le code source
COPY . .

# Build de l'application React pour la production
RUN npm run build

# Exposer le port 3001 (port du serveur Node.js)
EXPOSE 3001

# Variables d'environnement
ENV NODE_ENV=production
ENV PORT=3001

# Créer le répertoire pour les données
RUN mkdir -p /app/data

# Démarrer le serveur Node.js
CMD ["node", "server.js"]