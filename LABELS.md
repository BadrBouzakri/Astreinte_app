# 🏷️ GitHub Labels Configuration

Ce fichier contient la configuration des labels recommandés pour organiser les issues et PR.

## 📋 Labels par Catégorie

### 🐛 Bug & Issues
- `bug` - 🐛 Bug confirmé
- `critical` - 🚨 Bug critique
- `regression` - ↩️ Régression
- `security` - 🔒 Problème de sécurité

### ✨ Fonctionnalités
- `enhancement` - ✨ Nouvelle fonctionnalité
- `feature` - 🎯 Feature request
- `ui/ux` - 🎨 Amélioration interface
- `performance` - ⚡ Optimisation performance

### 📚 Documentation
- `documentation` - 📚 Documentation
- `readme` - 📖 Amélioration README
- `api-docs` - 🔧 Documentation API
- `examples` - 💡 Exemples

### 🛠️ Maintenance
- `maintenance` - 🛠️ Maintenance technique
- `refactor` - 🔄 Refactoring
- `dependencies` - 📦 Dépendances
- `ci/cd` - 🚀 Intégration continue

### 🎯 Priorités
- `priority-high` - 🔥 Priorité haute
- `priority-medium` - 🟡 Priorité moyenne
- `priority-low` - 🟢 Priorité basse

### 📊 Versions
- `v2.0` - 🎉 Version 2.0
- `v2.1` - 🔜 Version 2.1
- `roadmap` - 🗺️ Roadmap

### 👥 Workflow
- `good-first-issue` - 👋 Bon premier issue
- `help-wanted` - 🤝 Aide demandée
- `question` - ❓ Question
- `discussion` - 💬 Discussion
- `duplicate` - 📎 Doublon
- `wontfix` - ❌ Ne sera pas corrigé
- `invalid` - ⚠️ Invalide

### 🚀 Release
- `breaking-change` - 💥 Breaking change
- `backward-compatible` - ✅ Rétrocompatible
- `migration` - 🔄 Migration nécessaire

## 🎨 Codes Couleur Recommandés

```json
{
  "bug": "#d73a49",
  "critical": "#b60205", 
  "security": "#ee0701",
  "enhancement": "#a2eeef",
  "feature": "#0075ca",
  "ui/ux": "#f9d0c4",
  "performance": "#fef2c0",
  "documentation": "#0052cc",
  "maintenance": "#666666",
  "priority-high": "#b60205",
  "priority-medium": "#fbca04",
  "priority-low": "#0e8a16",
  "v2.0": "#7057ff",
  "good-first-issue": "#7057ff",
  "help-wanted": "#008672"
}
```

## 🛠️ Configuration via API GitHub

Pour créer ces labels automatiquement, utilisez l'API GitHub :

```bash
# Exemple de création de label
curl -X POST \
  -H "Authorization: token YOUR_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/BadrBouzakri/Astreinte_app/labels \
  -d '{
    "name": "v2.0",
    "description": "🎉 Version 2.0 related",
    "color": "7057ff"
  }'
```

## 📋 Utilisation Recommandée

### Pour les Issues
- Toujours assigner au moins un label de type (`bug`, `enhancement`, etc.)
- Ajouter une priorité si approprié
- Utiliser les labels de version pour organiser la roadmap

### Pour les Pull Requests
- Indiquer si c'est un `breaking-change`
- Mentionner la version cible (`v2.0`, `v2.1`)
- Ajouter `documentation` si mise à jour docs nécessaire

### Exemples d'Utilisation
```
🐛 Bug critique mode sombre
Labels: bug, critical, ui/ux, priority-high, v2.0

✨ Nouvelle fonctionnalité notifications email  
Labels: enhancement, feature, v2.1, priority-medium

📚 Amélioration documentation API
Labels: documentation, api-docs, good-first-issue
```

## 🚀 Workflow Recommandé

1. **Triage** : Assigner labels initiaux
2. **Priorisation** : Ajouter labels de priorité
3. **Planning** : Organiser par version
4. **Développement** : Suivre avec labels workflow
5. **Review** : Valider avant merge
6. **Release** : Grouper par version pour release notes