#!/usr/bin/env node

/**
 * 🔄 Astreinte App v2.0 - Script de Migration
 * Migre automatiquement les données vers les nouvelles structures
 */

const fs = require('fs').promises;
const path = require('path');

// Couleurs console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

const colorize = (text, color) => `${colors[color]}${text}${colors.reset}`;

// Configuration
const config = {
  dataDir: path.join(__dirname, '..', 'data'),
  dataFile: path.join(__dirname, '..', 'data', 'data.json'),
  backupDir: path.join(__dirname, '..', 'backups'),
  migrations: []
};

// Versions supportées
const VERSIONS = {
  '1.0': '1.0.0',
  '2.0': '2.0.0'
};

// Créer une sauvegarde avant migration
const createMigrationBackup = async () => {
  try {
    await fs.access(config.dataFile);
    
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-');
    const backupName = `data_pre_migration_${timestamp}.json`;
    const backupPath = path.join(config.backupDir, backupName);
    
    // Créer le répertoire backup si nécessaire
    try {
      await fs.access(config.backupDir);
    } catch {
      await fs.mkdir(config.backupDir, { recursive: true });
    }
    
    await fs.copyFile(config.dataFile, backupPath);
    console.log(colorize(`💾 Backup de migration créé: ${backupName}`, 'green'));
    
    return backupPath;
  } catch (error) {
    console.log(colorize('📝 Aucun fichier existant - pas de backup nécessaire', 'yellow'));
    return null;
  }
};

// Détecter la version actuelle des données
const detectCurrentVersion = async () => {
  try {
    const data = JSON.parse(await fs.readFile(config.dataFile, 'utf8'));
    
    // v2.0 a des métadonnées avec version
    if (data.metadata && data.metadata.version) {
      return data.metadata.version;
    }
    
    // v1.0 n'a pas de métadonnées
    if (Array.isArray(data.interventions) && typeof data.nextId === 'number') {
      return '1.0.0';
    }
    
    return 'unknown';
  } catch (error) {
    return 'none'; // Aucun fichier
  }
};

// Migration v1.0 → v2.0
const migrateV1ToV2 = async (data) => {
  console.log(colorize('🔄 Migration v1.0 → v2.0...', 'blue'));
  
  const migratedData = {
    interventions: data.interventions || [],
    nextId: data.nextId || 1,
    metadata: {
      version: '2.0.0',
      migrated: new Date().toISOString(),
      migratedFrom: '1.0.0',
      totalInterventions: (data.interventions || []).length,
      features: [
        'Enhanced fields (ticket, client, server)',
        'Priority system',
        'Metadata tracking',
        'Extended archives'
      ]
    }
  };
  
  // Migrer chaque intervention
  migratedData.interventions = migratedData.interventions.map(intervention => ({
    ...intervention,
    // Nouveaux champs v2.0 avec valeurs par défaut
    priority: intervention.priority || 'Medium',
    ticket: intervention.ticket || '',
    client: intervention.client || '',
    serveur: intervention.serveur || '',
    // Horodatage de migration
    migrated: new Date().toISOString()
  }));
  
  console.log(colorize(`✅ ${migratedData.interventions.length} interventions migrées`, 'green'));
  console.log(colorize('   • Ajout du système de priorités (défaut: Medium)', 'blue'));
  console.log(colorize('   • Ajout des champs ticket, client, serveur', 'blue'));
  console.log(colorize('   • Ajout des métadonnées de version', 'blue'));
  
  return migratedData;
};

// Migration v2.0 → v2.1 (future)
const migrateV2ToV2_1 = async (data) => {
  console.log(colorize('🔄 Migration v2.0 → v2.1...', 'blue'));
  
  // Exemple de migration future
  const migratedData = {
    ...data,
    metadata: {
      ...data.metadata,
      version: '2.1.0',
      migrated: new Date().toISOString(),
      migratedFrom: data.metadata?.version || '2.0.0',
      features: [
        ...(data.metadata?.features || []),
        'User authentication',
        'PostgreSQL support',
        'Email notifications'
      ]
    }
  };
  
  console.log(colorize('✅ Migration v2.1 préparée (exemple)', 'green'));
  
  return migratedData;
};

// Initialiser des données exemple
const initializeExampleData = async () => {
  console.log(colorize('🎯 Initialisation avec données d\'exemple v2.0...', 'blue'));
  
  const exampleData = {
    interventions: [
      {
        id: 1,
        date: '2025-06-05',
        heureDebut: '14:30',
        heureFin: '16:45',
        type: 'Urgence',
        priority: 'High',
        ticket: 'INC-2025-001',
        client: 'TechCorp Ltd',
        serveur: 'PROD-WEB-01',
        description: 'Crash application e-commerce - Perte de connexion DB',
        observations: 'Résolu rapidement, origine: pic de charge',
        created: new Date().toISOString()
      },
      {
        id: 2,
        date: '2025-06-05',
        heureDebut: '20:15',
        heureFin: '21:30',
        type: 'Maintenance',
        priority: 'Medium',
        ticket: 'CHG-2025-042',
        client: 'DataSoft Inc',
        serveur: 'PROD-DB-02',
        description: 'Maintenance préventive base de données',
        observations: 'Optimisation des index effectuée',
        created: new Date().toISOString()
      },
      {
        id: 3,
        date: '2025-06-04',
        heureDebut: '09:00',
        heureFin: '10:30',
        type: 'Support',
        priority: 'Low',
        ticket: 'REQ-2025-156',
        client: 'SmallBiz Co',
        serveur: 'TEST-APP-03',
        description: 'Configuration environnement de test',
        observations: 'Configuration terminée avec succès',
        created: new Date().toISOString()
      },
      {
        id: 4,
        date: '2025-06-03',
        heureDebut: '22:00',
        heureFin: '23:15',
        type: 'Surveillance',
        priority: 'Medium',
        ticket: 'MON-2025-088',
        client: 'Enterprise Corp',
        serveur: 'PROD-API-01',
        description: 'Surveillance nocturne - Anomalie détectée',
        observations: 'Fausse alerte, monitoring ajusté',
        created: new Date().toISOString()
      }
    ],
    nextId: 5,
    metadata: {
      version: '2.0.0',
      created: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      totalInterventions: 4,
      initialized: true,
      features: [
        'Enhanced fields (ticket, client, server)',
        'Priority system (High, Medium, Low)',
        'Extended archives',
        'Dark mode support',
        'Advanced statistics'
      ]
    }
  };
  
  console.log(colorize(`✅ ${exampleData.interventions.length} interventions d'exemple créées`, 'green'));
  console.log(colorize('   • Exemples de tickets: INC, CHG, REQ, MON', 'blue'));
  console.log(colorize('   • Exemples de clients: TechCorp, DataSoft, SmallBiz, Enterprise', 'blue'));
  console.log(colorize('   • Exemples de serveurs: PROD-WEB-01, PROD-DB-02, TEST-APP-03', 'blue'));
  console.log(colorize('   • Priorités variées: High, Medium, Low', 'blue'));
  
  return exampleData;
};

// Valider la structure des données après migration
const validateMigratedData = (data, targetVersion) => {
  const validation = {
    isValid: true,
    errors: [],
    warnings: []
  };
  
  // Vérifications communes
  if (!Array.isArray(data.interventions)) {
    validation.errors.push('Structure interventions manquante');
    validation.isValid = false;
  }
  
  if (typeof data.nextId !== 'number') {
    validation.errors.push('nextId manquant ou invalide');
    validation.isValid = false;
  }
  
  // Vérifications spécifiques v2.0+
  if (targetVersion === '2.0.0') {
    if (!data.metadata) {
      validation.errors.push('Métadonnées manquantes pour v2.0');
      validation.isValid = false;
    } else {
      if (data.metadata.version !== '2.0.0') {
        validation.warnings.push('Version dans métadonnées différente');
      }
    }
    
    // Vérifier structure des interventions v2.0
    if (data.interventions.length > 0) {
      const sampleIntervention = data.interventions[0];
      
      if (!('priority' in sampleIntervention)) {
        validation.warnings.push('Champ priority manquant dans certaines interventions');
      }
      
      if (!('ticket' in sampleIntervention)) {
        validation.warnings.push('Champ ticket manquant dans certaines interventions');
      }
    }
  }
  
  return validation;
};

// Afficher le statut de migration
const showMigrationStatus = async () => {
  console.log(colorize('📊 STATUT DE MIGRATION', 'bright'));
  console.log(colorize('═'.repeat(50), 'blue'));
  
  const currentVersion = await detectCurrentVersion();
  const targetVersion = '2.0.0';
  
  console.log(`Version actuelle: ${colorize(currentVersion, currentVersion === 'none' ? 'yellow' : 'cyan')}`);
  console.log(`Version cible: ${colorize(targetVersion, 'green')}`);
  
  if (currentVersion === 'none') {
    console.log(colorize('📝 Aucun fichier de données - initialisation nécessaire', 'yellow'));
  } else if (currentVersion === targetVersion) {
    console.log(colorize('✅ Données déjà à jour', 'green'));
  } else if (currentVersion === '1.0.0') {
    console.log(colorize('🔄 Migration v1.0 → v2.0 disponible', 'blue'));
  } else {
    console.log(colorize('⚠️  Version non reconnue', 'yellow'));
  }
  
  // Informations sur le fichier
  try {
    const stats = await fs.stat(config.dataFile);
    const data = JSON.parse(await fs.readFile(config.dataFile, 'utf8'));
    
    console.log(`📅 Dernière modification: ${colorize(stats.mtime.toLocaleString('fr-FR'), 'cyan')}`);
    console.log(`📊 Taille: ${colorize(Math.round(stats.size / 1024) + ' KB', 'blue')}`);
    console.log(`📋 Interventions: ${colorize((data.interventions || []).length, 'green')}`);
    
  } catch (error) {
    console.log(colorize('📭 Fichier de données non trouvé', 'yellow'));
  }
};

// Commande: migrate
const performMigration = async (force = false) => {
  console.log(colorize('🔄 MIGRATION DES DONNÉES', 'bright'));
  console.log(colorize('═'.repeat(50), 'blue'));
  
  const currentVersion = await detectCurrentVersion();
  const targetVersion = '2.0.0';
  
  console.log(`🔍 Version détectée: ${colorize(currentVersion, 'cyan')}`);
  console.log(`🎯 Version cible: ${colorize(targetVersion, 'green')}`);
  
  // Cas spéciaux
  if (currentVersion === 'none') {
    console.log(colorize('\n📝 Aucun fichier de données trouvé', 'yellow'));
    console.log(colorize('🎯 Initialisation avec données d\'exemple...', 'blue'));
    
    // Créer le répertoire data si nécessaire
    try {
      await fs.access(config.dataDir);
    } catch {
      await fs.mkdir(config.dataDir, { recursive: true });
      console.log(colorize(`📁 Répertoire data créé: ${config.dataDir}`, 'green'));
    }
    
    const exampleData = await initializeExampleData();
    await fs.writeFile(config.dataFile, JSON.stringify(exampleData, null, 2));
    
    console.log(colorize('✅ Initialisation terminée avec succès !', 'green'));
    return;
  }
  
  if (currentVersion === targetVersion && !force) {
    console.log(colorize('✅ Les données sont déjà à jour !', 'green'));
    return;
  }
  
  if (currentVersion === 'unknown') {
    console.log(colorize('⚠️  Version non reconnue - migration forcée vers v2.0', 'yellow'));
  }
  
  // Créer backup de migration
  const backupPath = await createMigrationBackup();
  
  try {
    // Lire les données actuelles
    const currentData = JSON.parse(await fs.readFile(config.dataFile, 'utf8'));
    let migratedData;
    
    // Appliquer les migrations nécessaires
    if (currentVersion === '1.0.0' || currentVersion === 'unknown') {
      migratedData = await migrateV1ToV2(currentData);
    } else {
      console.log(colorize('ℹ️  Aucune migration nécessaire', 'blue'));
      return;
    }
    
    // Valider les données migrées
    const validation = validateMigratedData(migratedData, targetVersion);
    
    if (!validation.isValid) {
      console.error(colorize('❌ Erreurs de validation:', 'red'));
      validation.errors.forEach(error => {
        console.error(colorize(`   • ${error}`, 'red'));
      });
      throw new Error('Données migrées invalides');
    }
    
    if (validation.warnings.length > 0) {
      console.log(colorize('⚠️  Avertissements:', 'yellow'));
      validation.warnings.forEach(warning => {
        console.log(colorize(`   • ${warning}`, 'yellow'));
      });
    }
    
    // Sauvegarder les données migrées
    await fs.writeFile(config.dataFile, JSON.stringify(migratedData, null, 2));
    
    // Résultats
    console.log(colorize('\n✅ MIGRATION TERMINÉE AVEC SUCCÈS !', 'green'));
    console.log(colorize('━'.repeat(50), 'blue'));
    
    console.log(`🎯 Version finale: ${colorize(migratedData.metadata.version, 'green')}`);
    console.log(`📊 Interventions migrées: ${colorize(migratedData.interventions.length, 'blue')}`);
    console.log(`📅 Date de migration: ${colorize(new Date().toLocaleString('fr-FR'), 'cyan')}`);
    
    if (backupPath) {
      console.log(`💾 Backup pré-migration: ${colorize(path.basename(backupPath), 'yellow')}`);
    }
    
    console.log(colorize('\n🚀 Fonctionnalités disponibles après migration:', 'cyan'));
    (migratedData.metadata.features || []).forEach(feature => {
      console.log(colorize(`   ✨ ${feature}`, 'green'));
    });
    
    console.log(colorize('\n💡 Redémarrez l\'application pour utiliser les nouvelles fonctionnalités !', 'cyan'));
    
  } catch (error) {
    console.error(colorize('\n💥 ERREUR LORS DE LA MIGRATION:', 'red'));
    console.error(colorize(error.message, 'red'));
    
    if (backupPath) {
      console.log(colorize(`\n🛡️  Backup de sécurité disponible: ${path.basename(backupPath)}`, 'yellow'));
      console.log(colorize('💡 Utilisez le script restore pour revenir en arrière si nécessaire', 'blue'));
    }
    
    throw error;
  }
};

// Aide
const showHelp = () => {
  console.log(colorize('🔄 ASTREINTE APP v2.0 - SCRIPT DE MIGRATION', 'bright'));
  console.log(colorize('═'.repeat(50), 'blue'));
  console.log('\nCommandes disponibles:');
  console.log(colorize('  migrate', 'green') + '        - Migrer vers la dernière version');
  console.log(colorize('  status', 'cyan') + '         - Afficher le statut de migration');
  console.log(colorize('  force', 'yellow') + '          - Forcer la migration même si déjà à jour');
  console.log(colorize('  init', 'magenta') + '           - Initialiser avec données d\'exemple');
  console.log(colorize('  help', 'blue') + '           - Afficher cette aide');
  
  console.log('\nExemples:');
  console.log('  npm run migrate');
  console.log('  node scripts/migrate.js status');
  console.log('  node scripts/migrate.js force');
  
  console.log(colorize('\n📋 Migrations supportées:', 'cyan'));
  console.log('  • v1.0 → v2.0 : Ajout des champs ticket, client, serveur, priorité');
  console.log('  • Initialisation : Création avec données d\'exemple v2.0');
  
  console.log(colorize('\n🛡️  Sécurité:', 'yellow'));
  console.log('  • Backup automatique avant migration');
  console.log('  • Validation des données après migration');
  console.log('  • Possibilité de restauration en cas de problème');
};

// Main
const main = async () => {
  const command = process.argv[2] || 'migrate';
  
  try {
    switch (command.toLowerCase()) {
      case 'migrate':
      case 'update':
        await performMigration(false);
        break;
        
      case 'force':
        await performMigration(true);
        break;
        
      case 'status':
      case 'check':
        await showMigrationStatus();
        break;
        
      case 'init':
      case 'initialize':
        await performMigration(false); // Utilisera initializeExampleData si aucun fichier
        break;
        
      case 'help':
      case '-h':
      case '--help':
        showHelp();
        break;
        
      default:
        console.error(colorize(`❌ Commande inconnue: ${command}`, 'red'));
        console.log(colorize('💡 Utilisez "help" pour voir les commandes disponibles', 'yellow'));
        process.exit(1);
    }
  } catch (error) {
    console.error(colorize('💥 Erreur:', 'red'), error.message);
    process.exit(1);
  }
};

// Gestion des erreurs
process.on('unhandledRejection', (error) => {
  console.error(colorize('💥 Erreur non gérée:', 'red'), error.message);
  process.exit(1);
});

// Lancement
if (require.main === module) {
  main();
}

module.exports = {
  performMigration,
  detectCurrentVersion,
  migrateV1ToV2,
  validateMigratedData,
  VERSIONS
};