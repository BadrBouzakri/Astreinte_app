# 🔒 Security Policy - Astreinte App

## 🛡️ Versions Supportées

Les versions suivantes d'Astreinte App bénéficient de mises à jour de sécurité :

| Version | Support Sécurité |
| ------- | ---------------- |
| 2.0.x   | ✅ Support actif |
| 1.0.x   | ⚠️ Support critique uniquement |
| < 1.0   | ❌ Non supporté |

**Recommandation** : Migrez toujours vers la dernière version v2.x pour bénéficier des dernières améliorations de sécurité.

---

## 🚨 Signaler une Vulnérabilité

### Coordinated Disclosure

Nous prenons la sécurité très au sérieux. Si vous découvrez une vulnérabilité de sécurité, merci de la signaler de manière responsable.

### 📧 Contact Sécurité

Pour signaler une vulnérabilité :

1. **Email privé** : Ouvrez une issue GitHub en marquant "Private vulnerability reporting"
2. **GitHub Security Advisory** : Utilisez le système GitHub Security Advisory
3. **Issue publique** : Uniquement pour les problèmes de sécurité mineurs

### ⏱️ Délais de Réponse

- **Accusé de réception** : 48 heures
- **Évaluation initiale** : 5 jours ouvrés
- **Correctif développé** : 15 jours ouvrés (selon gravité)
- **Release avec correctif** : 7 jours après développement

### 🎯 Scope

**Dans le scope :**
- Vulnérabilités dans le code de l'application
- Problèmes d'authentification/autorisation (v2.1+)
- Injection de code (XSS, injection SQL future)
- Exposition de données sensibles
- Déni de service (DoS)
- Vulnérabilités dans les dépendances

**Hors scope :**
- Phishing ou ingénierie sociale
- Vulnérabilités nécessitant un accès physique
- Bugs sans impact sécurité
- Problèmes dans les outils de développement

---

## 🔐 Pratiques de Sécurité

### Architecture Sécurisée

**Backend (Node.js/Express) :**
- ✅ Validation stricte des entrées utilisateur
- ✅ Sanitisation des données JSON
- ✅ Headers de sécurité (CORS configuré)
- ✅ Gestion d'erreurs sans exposition d'informations
- ✅ Rate limiting (prévu v2.1)

**Frontend (React) :**
- ✅ Validation côté client
- ✅ Échappement automatique des données affichées
- ✅ Content Security Policy ready
- ✅ Pas de localStorage pour données sensibles

**Infrastructure :**
- ✅ Docker avec utilisateur non-root
- ✅ Volumes séparés pour données
- ✅ Configuration environnement sécurisée
- ✅ Logs structurés sans données sensibles

### Données et Stockage

**Actuellement (v2.0) :**
- 📄 Stockage JSON local (pas de données personnelles sensibles)
- 🔒 Validation des types et formats
- 💾 Backups avec intégrité vérifiée
- 🛡️ Pas de mots de passe ou tokens stockés

**Future (v2.1+) :**
- 🔐 Authentification sécurisée
- 🗄️ Migration vers PostgreSQL avec chiffrement
- 🔑 Gestion des sessions sécurisées
- 📊 Audit logs des accès

### Dépendances

**Gestion automatisée :**
- 🔍 Scan automatique des vulnérabilités (Dependabot)
- ⬆️ Mises à jour régulières des dépendances
- 🛡️ Audit de sécurité mensuel
- 📦 Packages vérifiés et maintenus

**Dépendances principales :**
- `react` : Framework frontend
- `express` : Serveur web
- `cors` : Gestion CORS sécurisée

---

## 🔧 Configuration Sécurisée

### Variables d'Environnement

```bash
# Configuration recommandée
NODE_ENV=production
PORT=3001
# Future: ajouter authentification
# JWT_SECRET=<strong-secret>
# DB_CONNECTION_STRING=<encrypted>
```

### Docker Sécurisé

```dockerfile
# Utilisateur non-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs

# Variables d'environnement sécurisées
ENV NODE_ENV=production
ENV PORT=3001

# Exposition de port minimal
EXPOSE 3001
```

### Reverse Proxy

**Configuration Nginx recommandée :**
```nginx
# Headers de sécurité
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

# Rate limiting
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req zone=api burst=20 nodelay;
```

---

## 🛡️ Modèle de Menaces

### Acteurs de Menace

1. **Utilisateur malveillant interne**
   - Risque : Modification/suppression de données
   - Mitigation : Audit logs (v2.1), backups automatiques

2. **Attaquant externe**
   - Risque : Injection, XSS, déni de service
   - Mitigation : Validation stricte, rate limiting

3. **Supply chain attack**
   - Risque : Dépendances compromises
   - Mitigation : Audit automatique, pinning des versions

### Assets Protégés

1. **Données d'intervention**
   - Heures d'astreinte, tickets, clients
   - Criticité : Moyenne (pas de données personnelles sensibles)

2. **Intégrité du service**
   - Disponibilité de l'application
   - Criticité : Haute pour équipes production

3. **Configuration système**
   - Secrets, tokens futurs
   - Criticité : Haute

---

## 🔍 Tests de Sécurité

### Tests Automatisés

```bash
# Audit des dépendances
npm audit

# Tests de sécurité
npm run test:security

# Scan statique (futur)
npm run lint:security
```

### Tests Manuels Recommandés

**Input Validation :**
- Injection dans champs texte
- Validation des formats (date, heure)
- Taille maximale des données

**Frontend Security :**
- XSS dans descriptions/observations
- CSRF sur actions critiques
- Manipulation d'état côté client

**API Security :**
- Rate limiting
- Validation des endpoints
- Gestion des erreurs

---

## 📊 Incident Response

### Processus d'Incident

1. **Détection** : Monitoring, reports utilisateur
2. **Évaluation** : Criticité, impact, scope
3. **Containment** : Isolation, rollback si nécessaire
4. **Eradication** : Développement et test du correctif
5. **Recovery** : Déploiement sécurisé
6. **Lessons Learned** : Post-mortem et améliorations

### Classification des Incidents

**Critique (P0) :**
- Compromission complète de l'application
- Exposition de toutes les données
- Déni de service total

**Élevé (P1) :**
- Accès non autorisé à des données
- Injection de code exécutable
- Escalade de privilèges

**Moyen (P2) :**
- Exposition limitée de données
- Déni de service partiel
- Bypass de validation

**Bas (P3) :**
- Information disclosure mineur
- Problèmes de configuration

---

## 🔄 Mises à Jour de Sécurité

### Communication

Les mises à jour de sécurité sont communiquées via :
- **GitHub Security Advisories**
- **Release notes** avec marquage [SECURITY]
- **Issues GitHub** pour impacts utilisateur

### Versioning Sécurité

```
v2.0.1 - Patch de sécurité
v2.0.2 - Correctif critique
v2.1.0 - Nouvelles fonctionnalités sécurité
```

### Backward Compatibility

Les correctifs de sécurité préservent la compatibilité sauf si impossible pour la sécurité.

---

## 🤝 Responsible Disclosure

### Reconnaissance

Les chercheurs en sécurité qui signalent des vulnérabilités de manière responsable seront :
- Crédités dans les release notes (avec accord)
- Mentionnés dans le Hall of Fame sécurité
- Remerciés publiquement après résolution

### Bug Bounty (Futur)

Pour v2.1+ avec authentification, nous considérons :
- Programme de bug bounty structuré
- Récompenses pour vulnérabilités critiques
- Partenariat avec plateformes HackerOne/Bugcrowd

---

## 📚 Ressources Sécurité

### Standards Suivis

- **OWASP Top 10** - Web Application Security
- **NIST Cybersecurity Framework**
- **ISO 27001** - Principes de gestion de sécurité

### Outils Recommandés

**Développement :**
- ESLint Security Plugin
- npm audit
- Snyk pour dépendances

**Déploiement :**
- Docker security scanning
- SSL/TLS configuré (Let's Encrypt)
- Monitoring des logs

### Formation

**Développeurs :**
- OWASP Secure Coding Practices
- SANS Top 25 Software Errors
- Secure Development Lifecycle

---

## 📞 Contact

Pour toute question relative à la sécurité :

- **GitHub Issues** : [Security label](https://github.com/BadrBouzakri/Astreinte_app/issues?q=label%3Asecurity)
- **Email** : Via GitHub contact form
- **Documentation** : Ce fichier SECURITY.md

---

**🛡️ La sécurité est l'affaire de tous. Merci de contribuer à la sécurité d'Astreinte App !**