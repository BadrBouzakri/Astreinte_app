# Étape 1: Build de l'application React
FROM node:18-alpine as build

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm install --production=false

# Copier le code source
COPY . .

# Build de l'application pour la production
RUN npm run build

# Étape 2: Serveur de production avec Nginx
FROM nginx:alpine

# Copier les fichiers buildés vers Nginx
COPY --from=build /app/build /usr/share/nginx/html

# Copier la configuration Nginx personnalisée
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exposer le port 80
EXPOSE 80

# Démarrer Nginx
CMD ["nginx", "-g", "daemon off;"]