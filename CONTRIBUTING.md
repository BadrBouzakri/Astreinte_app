# 🤝 Guide de Contribution - Astreinte App v2.0

> **Merci de votre intérêt pour contribuer à Astreinte App !** 

Ce guide vous explique comment contribuer efficacement au projet.

---

## 🎯 Comment Contribuer

### 🐛 **Signaler un Bug**
1. **Vérifiez** qu'il n'existe pas déjà dans les [issues](https://github.com/BadrBouzakri/Astreinte_app/issues)
2. **Utilisez** le template d'issue bug
3. **Incluez** :
   - Description détaillée
   - Étapes de reproduction
   - Comportement attendu vs observé
   - Environnement (OS, navigateur, version)
   - Captures d'écran si applicable

### ✨ **Proposer une Fonctionnalité**
1. **Ouvrez** une issue avec le label `feature`
2. **Décrivez** clairement :
   - Le problème résolu
   - La solution proposée
   - Les alternatives considérées
   - Impact utilisateur

### 🔧 **Contribuer au Code**
1. **Fork** le repository
2. **Créez** une branche feature : `git checkout -b feature/amazing-feature`
3. **Développez** avec les standards du projet
4. **Testez** vos modifications
5. **Commit** : `git commit -m 'feat: add amazing feature'`
6. **Push** : `git push origin feature/amazing-feature`
7. **Ouvrez** une Pull Request

---

## 🏗️ Standards de Développement

### 📝 **Convention de Commit**
Utilisez le format [Conventional Commits](https://www.conventionalcommits.org/) :

```
<type>[optional scope]: <description>

[optional body]

[optional footer]
```

**Types autorisés :**
- `feat`: Nouvelle fonctionnalité
- `fix`: Correction de bug
- `docs`: Documentation uniquement
- `style`: Changements de style (format, etc.)
- `refactor`: Refactoring sans changement fonctionnel
- `test`: Ajout ou modification de tests
- `chore`: Maintenance (build, deps, etc.)

**Exemples :**
```bash
feat(dashboard): add real-time metrics display
fix(api): resolve server crash on invalid date format
docs(readme): update installation instructions
style(ui): improve dark mode contrast
refactor(stats): optimize calculation algorithms
test(backup): add compression validation tests
chore(deps): update React to v18.2.1
```

### 🎨 **Standards de Code**

#### **JavaScript/React**
- **ES6+** syntax moderne
- **Functional components** avec hooks
- **PropTypes** ou TypeScript pour validation
- **Camel case** pour variables et fonctions
- **Pascal case** pour composants

```javascript
// ✅ Bon
const calculateDuration = (startTime, endTime) => {
  // Implementation
};

const InterventionCard = ({ intervention, onEdit }) => {
  // Component
};

// ❌ Éviter
function calculate_duration(start_time, end_time) {
  // Implementation
}
```

#### **CSS**
- **BEM methodology** ou classes utilitaires
- **Mobile-first** responsive design
- **CSS Variables** pour thèmes
- **Flexbox/Grid** pour layouts

```css
/* ✅ Bon */
.intervention-card {
  display: flex;
  padding: var(--spacing-md);
}

.intervention-card__title {
  font-size: var(--font-size-lg);
  color: var(--color-primary);
}

.intervention-card--urgent {
  border-left: 4px solid var(--color-danger);
}
```

#### **API/Backend**
- **RESTful** endpoints
- **HTTP status codes** appropriés
- **Validation** stricte des entrées
- **Error handling** robuste
- **Logging** structuré

```javascript
// ✅ Bon
app.post('/api/interventions', validateIntervention, async (req, res) => {
  try {
    const intervention = await createIntervention(req.body);
    res.status(201).json(intervention);
  } catch (error) {
    logger.error('Failed to create intervention', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

### 🧪 **Tests**
- **Tests unitaires** pour logique métier
- **Tests d'intégration** pour API
- **Tests e2e** pour workflows critiques
- **Couverture** > 80% pour nouveau code

```javascript
// Exemple test
describe('calculateDuration', () => {
  it('should calculate duration correctly', () => {
    expect(calculateDuration('09:00', '17:00')).toBe('8:00');
  });
  
  it('should handle overnight shifts', () => {
    expect(calculateDuration('22:00', '06:00')).toBe('8:00');
  });
});
```

---

## 📁 Structure du Projet

```
Astreinte_app/
├── 📁 public/             # Assets statiques
├── 📁 src/                # Code source React
│   ├── App.js             # Composant principal
│   ├── App.css            # Styles globaux
│   └── index.js           # Point d'entrée
├── 📁 scripts/            # Scripts utilitaires
│   ├── backup.js          # Système de backup
│   ├── restore.js         # Restauration
│   ├── migrate.js         # Migrations
│   └── stats.js           # Statistiques
├── 📁 data/               # Données JSON
├── 📁 backups/            # Sauvegardes
├── server.js              # API Backend
├── package.json           # Configuration npm
├── docker-compose.yml     # Configuration Docker
└── README.md              # Documentation
```

---

## 🚀 Environnement de Développement

### **Prérequis**
- Node.js 16+ et npm 8+
- Docker & Docker Compose (optionnel)
- Git

### **Installation**
```bash
# Cloner le repository
git clone https://github.com/BadrBouzakri/Astreinte_app.git
cd Astreinte_app

# Installer les dépendances
npm install

# Initialiser les données (optionnel)
npm run migrate init

# Développement avec hot-reload
npm run dev
```

### **Scripts Disponibles**
```bash
# Développement
npm run dev              # React dev server
npm run dev:full         # React + API concurrents
npm start               # Production server

# Build & Test
npm run build           # Build production
npm test               # Tests unitaires
npm run lint           # Linting

# Utilitaires
npm run stats          # Statistiques
npm run backup         # Sauvegarde
npm run restore        # Restauration
npm run migrate        # Migration

# Docker
npm run docker:build   # Build image
npm run compose:up     # Lancer stack complète
```

---

## 🔍 Process de Review

### **Checklist PR**
- [ ] Code suit les standards du projet
- [ ] Tests ajoutés/mis à jour
- [ ] Documentation mise à jour
- [ ] Pas de breaking changes non documentés
- [ ] Performance vérifiée
- [ ] Sécurité vérifiée
- [ ] Accessible (WCAG 2.1 AA)

### **Critères d'Acceptation**
- ✅ **Fonctionnalité** : Fonctionne comme attendu
- ✅ **Qualité** : Code maintenable et lisible
- ✅ **Tests** : Couverture adequat
- ✅ **Documentation** : À jour et claire
- ✅ **Performance** : Pas de régression
- ✅ **Sécurité** : Vulnérabilités vérifiées

---

## 🎯 Roadmap & Priorités

### **🔜 v2.1 (Q3 2025)**
Priorité haute pour contributions :
- [ ] 🔐 Authentification multi-utilisateur
- [ ] 📧 Notifications email
- [ ] 📱 PWA complète
- [ ] 🗄️ Support PostgreSQL

### **🌟 v2.2 (Q4 2025)**
Priorité moyenne :
- [ ] 🤖 IA prédictive
- [ ] 📊 Intégration Grafana
- [ ] 🔌 API webhooks
- [ ] 📱 App mobile native

### **🏷️ Good First Issues**
Parfait pour débuter :
- Documentation améliorée
- Tests unitaires
- Optimisations CSS
- Traductions
- Exemples d'utilisation

---

## 🛡️ Sécurité

### **Signaler une Vulnérabilité**
- **Email** : security@astreinte-app.com (si disponible)
- **Issue privée** GitHub
- **Coordinated disclosure** préférée

### **Standards Sécurité**
- Validation stricte des entrées
- Sanitisation des données
- Headers de sécurité appropriés
- Dépendances à jour
- Pas de secrets en dur

---

## 📚 Ressources

### **Documentation**
- [README principal](README.md)
- [Configuration Labels](LABELS.md)
- [API Documentation](server.js)
- [Scripts Utilitaires](scripts/)

### **Outils Recommandés**
- **IDE** : VS Code avec extensions React
- **Debug** : React DevTools, Chrome DevTools
- **Test** : Jest, React Testing Library
- **Linting** : ESLint, Prettier
- **Git** : Git Flow ou GitHub Flow

### **Communauté**
- 💬 [GitHub Discussions](https://github.com/BadrBouzakri/Astreinte_app/discussions)
- 🐛 [Issues](https://github.com/BadrBouzakri/Astreinte_app/issues)
- 📧 Support : contact@astreinte-app.com

---

## 🙏 Reconnaissance

### **Types de Contributions Valorisées**
- 💻 Code (fonctionnalités, corrections)
- 📚 Documentation (guides, API docs)
- 🐛 Tests & QA (tests, bug reports)
- 🎨 Design (UI/UX, icônes)
- 🌍 Traductions (i18n)
- 💡 Idées (issues, discussions)
- 📢 Promotion (blog posts, talks)

### **Hall of Fame**
Les contributeurs significatifs seront mentionnés dans :
- README principal
- Release notes
- Page dédiée (future)

---

## ❓ FAQ

### **Q: Comment choisir une issue à traiter ?**
R: Commencez par les issues labelées `good-first-issue`, puis `help-wanted`. Vérifiez qu'elle n'est pas déjà assignée.

### **Q: Puis-je proposer des breaking changes ?**
R: Oui, mais documentez-les clairement et proposez un plan de migration. Préférez les versions majeures.

### **Q: Comment tester mes modifications ?**
R: Utilisez `npm test` pour les tests unitaires, et testez manuellement avec `npm run dev:full`.

### **Q: Mes commits doivent-ils être signés ?**
R: Non requis mais recommandé pour la sécurité.

### **Q: Dois-je mettre à jour la documentation ?**
R: Oui, toute modification utilisateur doit être documentée.

---

## 🎉 Conclusion

**Chaque contribution compte !** Qu'elle soit grande ou petite, votre aide améliore l'expérience de tous les utilisateurs d'Astreinte App.

**Merci de faire partie de cette aventure ! 🚀**

---

*Pour toute question, n'hésitez pas à ouvrir une issue ou une discussion.*