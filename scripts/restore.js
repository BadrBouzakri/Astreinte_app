#!/usr/bin/env node

/**
 * 🔄 Astreinte App v2.0 - Script de Restauration
 * Restaure les données depuis un backup avec vérification d'intégrité
 */

const fs = require('fs').promises;
const path = require('path');
const { createReadStream, createWriteStream } = require('fs');
const { createGunzip } = require('zlib');
const { pipeline } = require('stream/promises');
const readline = require('readline');

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
  backupDir: path.join(__dirname, '..', 'backups'),
  tempDir: path.join(__dirname, '..', 'temp')
};

// Interface readline pour questions interactives
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise(resolve => rl.question(query, resolve));

// Créer répertoire temporaire
const ensureTempDir = async () => {
  try {
    await fs.access(config.tempDir);
  } catch {
    await fs.mkdir(config.tempDir, { recursive: true });
  }
};

// Lister les backups disponibles
const listAvailableBackups = async () => {
  try {
    const files = await fs.readdir(config.backupDir);
    const backupFiles = files
      .filter(file => file.includes('_backup_') && file.endsWith('.json.gz'))
      .map(async (file) => {
        const filePath = path.join(config.backupDir, file);
        const stats = await fs.stat(filePath);
        
        // Extraire informations du nom
        const nameMatch = file.match(/^(.+)_backup_(\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2})\.json\.gz$/);
        
        return {
          filename: file,
          path: filePath,
          originalName: nameMatch ? nameMatch[1] + '.json' : 'unknown.json',
          timestamp: nameMatch ? nameMatch[2] : 'unknown',
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime
        };
      });

    const resolvedFiles = await Promise.all(backupFiles);
    return resolvedFiles
      .filter(file => file.timestamp !== 'unknown')
      .sort((a, b) => b.created - a.created);
  } catch (error) {
    console.error(colorize('❌ Erreur listage backups:', 'red'), error.message);
    return [];
  }
};

// Décompresser un backup
const decompressBackup = async (backupPath, outputPath) => {
  try {
    const gunzip = createGunzip();
    const source = createReadStream(backupPath);
    const destination = createWriteStream(outputPath);
    
    await pipeline(source, gunzip, destination);
    
    return true;
  } catch (error) {
    console.error(colorize('❌ Erreur décompression:', 'red'), error.message);
    return false;
  }
};

// Valider l'intégrité des données restaurées
const validateRestoredData = async (filePath) => {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(content);
    
    const validation = {
      isValidJSON: true,
      hasInterventions: Array.isArray(data.interventions),
      hasMetadata: !!data.metadata,
      interventionCount: data.interventions?.length || 0,
      version: data.metadata?.version || 'unknown',
      hasNextId: typeof data.nextId === 'number',
      errors: []
    };
    
    // Vérifications avancées
    if (!validation.hasInterventions) {
      validation.errors.push('Structure interventions manquante');
    }
    
    if (validation.hasInterventions && data.interventions.length > 0) {
      // Vérifier structure des interventions
      const sampleIntervention = data.interventions[0];
      const requiredFields = ['id', 'date', 'heureDebut', 'heureFin', 'description'];
      
      for (const field of requiredFields) {
        if (!(field in sampleIntervention)) {
          validation.errors.push(`Champ requis manquant: ${field}`);
        }
      }
      
      // Vérifier format des dates
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(sampleIntervention.date)) {
        validation.errors.push('Format de date invalide');
      }
      
      // Vérifier format des heures
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(sampleIntervention.heureDebut) || !timeRegex.test(sampleIntervention.heureFin)) {
        validation.errors.push('Format d\'heure invalide');
      }
    }
    
    validation.isValid = validation.errors.length === 0;
    
    return validation;
    
  } catch (error) {
    return {
      isValidJSON: false,
      isValid: false,
      error: error.message,
      errors: [error.message]
    };
  }
};

// Créer une sauvegarde de sécurité avant restauration
const createSafetyBackup = async (targetFile) => {
  const targetPath = path.join(config.dataDir, targetFile);
  
  try {
    await fs.access(targetPath);
    
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-');
    const safetyBackupName = `${path.parse(targetFile).name}_safety_${timestamp}.json`;
    const safetyBackupPath = path.join(config.backupDir, safetyBackupName);
    
    await fs.copyFile(targetPath, safetyBackupPath);
    
    console.log(colorize(`🛡️  Sauvegarde de sécurité créée: ${safetyBackupName}`, 'cyan'));
    
    return safetyBackupPath;
  } catch (error) {
    console.log(colorize('📝 Aucun fichier existant - pas de sauvegarde de sécurité nécessaire', 'yellow'));
    return null;
  }
};

// Afficher les détails d'un backup
const showBackupDetails = async (backup) => {
  console.log(colorize('\n📋 DÉTAILS DU BACKUP', 'bright'));
  console.log(colorize('━'.repeat(50), 'blue'));
  
  console.log(`📁 Fichier: ${colorize(backup.filename, 'cyan')}`);
  console.log(`📄 Fichier original: ${colorize(backup.originalName, 'green')}`);
  console.log(`📅 Créé le: ${colorize(backup.created.toLocaleString('fr-FR'), 'blue')}`);
  console.log(`📊 Taille: ${colorize(formatSize(backup.size), 'yellow')}`);
  console.log(`🕒 Timestamp: ${colorize(backup.timestamp.replace(/-/g, ':').replace('T', ' '), 'magenta')}`);
  
  // Test de décompression rapide pour vérifier l'intégrité
  const tempTestFile = path.join(config.tempDir, 'test_' + Date.now() + '.json');
  
  try {
    console.log(colorize('\n🔍 Vérification de l\'intégrité...', 'cyan'));
    
    const success = await decompressBackup(backup.path, tempTestFile);
    
    if (success) {
      const validation = await validateRestoredData(tempTestFile);
      
      if (validation.isValid) {
        console.log(colorize('✅ Backup valide', 'green'));
        console.log(colorize(`📊 ${validation.interventionCount} interventions (v${validation.version})`, 'blue'));
      } else {
        console.log(colorize('⚠️  Backup partiellement valide', 'yellow'));
        validation.errors.forEach(error => {
          console.log(colorize(`   • ${error}`, 'yellow'));
        });
      }
    } else {
      console.log(colorize('❌ Backup corrompu', 'red'));
    }
    
    // Nettoyer le fichier de test
    await fs.unlink(tempTestFile);
    
  } catch (error) {
    console.error(colorize('❌ Erreur vérification:', 'red'), error.message);
  }
};

// Formater taille
const formatSize = (bytes) => {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`;
};

// Commande: restore
const performRestore = async (backupFilename = null) => {
  console.log(colorize('🔄 RESTAURATION DE BACKUP', 'bright'));
  console.log(colorize('═'.repeat(50), 'blue'));
  
  await ensureTempDir();
  
  const backups = await listAvailableBackups();
  
  if (backups.length === 0) {
    console.log(colorize('📭 Aucun backup trouvé', 'yellow'));
    rl.close();
    return;
  }
  
  let selectedBackup;
  
  if (backupFilename) {
    // Backup spécifique fourni en paramètre
    selectedBackup = backups.find(b => b.filename === backupFilename);
    
    if (!selectedBackup) {
      console.error(colorize(`❌ Backup non trouvé: ${backupFilename}`, 'red'));
      rl.close();
      return;
    }
  } else {
    // Mode interactif - lister et sélectionner
    console.log(colorize('\n📋 BACKUPS DISPONIBLES:', 'cyan'));
    console.log(colorize('─'.repeat(50), 'blue'));
    
    backups.forEach((backup, index) => {
      const date = backup.created.toLocaleString('fr-FR');
      const size = formatSize(backup.size);
      console.log(`${colorize((index + 1).toString().padStart(2), 'yellow')}. ${backup.originalName} - ${date} (${size})`);
    });
    
    const choice = await question(colorize('\n🔢 Sélectionnez un backup (numéro) ou "q" pour quitter: ', 'cyan'));
    
    if (choice.toLowerCase() === 'q') {
      console.log(colorize('👋 Restauration annulée', 'yellow'));
      rl.close();
      return;
    }
    
    const index = parseInt(choice) - 1;
    
    if (isNaN(index) || index < 0 || index >= backups.length) {
      console.error(colorize('❌ Sélection invalide', 'red'));
      rl.close();
      return;
    }
    
    selectedBackup = backups[index];
  }
  
  // Afficher détails du backup sélectionné
  await showBackupDetails(selectedBackup);
  
  // Confirmation
  if (!backupFilename) { // Mode interactif seulement
    const confirm = await question(colorize('\n⚠️  Êtes-vous sûr de vouloir restaurer ce backup ? (oui/non): ', 'yellow'));
    
    if (confirm.toLowerCase() !== 'oui' && confirm.toLowerCase() !== 'o' && confirm.toLowerCase() !== 'yes' && confirm.toLowerCase() !== 'y') {
      console.log(colorize('👋 Restauration annulée', 'yellow'));
      rl.close();
      return;
    }
  }
  
  console.log(colorize('\n🔄 DÉMARRAGE DE LA RESTAURATION...', 'cyan'));
  
  try {
    // 1. Créer sauvegarde de sécurité
    const safetyBackup = await createSafetyBackup(selectedBackup.originalName);
    
    // 2. Décompresser le backup
    const tempFile = path.join(config.tempDir, 'restore_' + Date.now() + '.json');
    console.log(colorize('📦 Décompression du backup...', 'blue'));
    
    const decompressSuccess = await decompressBackup(selectedBackup.path, tempFile);
    
    if (!decompressSuccess) {
      throw new Error('Échec de la décompression');
    }
    
    // 3. Valider les données
    console.log(colorize('🔍 Validation des données...', 'blue'));
    const validation = await validateRestoredData(tempFile);
    
    if (!validation.isValid) {
      console.error(colorize('❌ Données invalides:', 'red'));
      validation.errors.forEach(error => {
        console.error(colorize(`   • ${error}`, 'red'));
      });
      
      if (!backupFilename) {
        const forceRestore = await question(colorize('⚠️  Forcer la restauration malgré les erreurs ? (oui/non): ', 'yellow'));
        if (forceRestore.toLowerCase() !== 'oui') {
          throw new Error('Restauration annulée par l\'utilisateur');
        }
      }
    }
    
    // 4. Restaurer le fichier
    const targetPath = path.join(config.dataDir, selectedBackup.originalName);
    
    console.log(colorize('💾 Copie des données restaurées...', 'blue'));
    await fs.copyFile(tempFile, targetPath);
    
    // 5. Nettoyer
    await fs.unlink(tempFile);
    
    // 6. Résultats
    console.log(colorize('\n✅ RESTAURATION TERMINÉE AVEC SUCCÈS !', 'green'));
    console.log(colorize('━'.repeat(50), 'blue'));
    
    console.log(`📁 Fichier restauré: ${colorize(selectedBackup.originalName, 'green')}`);
    console.log(`📊 Interventions: ${colorize(validation.interventionCount.toString(), 'blue')}`);
    console.log(`📅 Version: ${colorize(validation.version, 'cyan')}`);
    
    if (safetyBackup) {
      console.log(`🛡️  Sauvegarde de sécurité: ${colorize(path.basename(safetyBackup), 'yellow')}`);
    }
    
    console.log(colorize('\n💡 N\'oubliez pas de redémarrer l\'application pour charger les nouvelles données !', 'cyan'));
    
  } catch (error) {
    console.error(colorize('\n💥 ERREUR LORS DE LA RESTAURATION:', 'red'));
    console.error(colorize(error.message, 'red'));
    
    console.log(colorize('\n🛡️  Vos données originales sont protégées.', 'green'));
    
    if (safetyBackup) {
      console.log(colorize(`💾 Sauvegarde de sécurité disponible: ${path.basename(safetyBackup)}`, 'yellow'));
    }
  }
  
  rl.close();
};

// Commande: list
const listBackupsCmd = async () => {
  console.log(colorize('📋 BACKUPS DISPONIBLES POUR RESTAURATION', 'bright'));
  console.log(colorize('═'.repeat(70), 'blue'));
  
  const backups = await listAvailableBackups();
  
  if (backups.length === 0) {
    console.log(colorize('📭 Aucun backup trouvé', 'yellow'));
    return;
  }
  
  console.log(colorize('📅 Date              📂 Fichier Original       📊 Taille   🕒 Âge', 'cyan'));
  console.log(colorize('─'.repeat(70), 'blue'));
  
  backups.forEach((backup) => {
    const date = backup.created.toLocaleString('fr-FR').substring(0, 16);
    const name = backup.originalName.length > 20 ? backup.originalName.substring(0, 17) + '...' : backup.originalName;
    const size = formatSize(backup.size);
    
    const ageMs = Date.now() - backup.created.getTime();
    const ageDays = Math.floor(ageMs / (1000 * 60 * 60 * 24));
    const ageHours = Math.floor((ageMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    let ageStr;
    if (ageDays > 0) {
      ageStr = `${ageDays}j ${ageHours}h`;
    } else {
      ageStr = `${ageHours}h`;
    }
    
    const isRecent = ageDays === 0; 
    const color = isRecent ? 'green' : ageDays < 7 ? 'cyan' : 'white';
    
    console.log(`${colorize(date, color)} ${name.padEnd(22)} ${size.padEnd(8)} ${colorize(ageStr, 'yellow')}`);
  });
  
  console.log(colorize(`\n📊 Total: ${backups.length} backup(s) disponible(s)`, 'cyan'));
};

// Aide
const showHelp = () => {
  console.log(colorize('🔄 ASTREINTE APP v2.0 - SCRIPT DE RESTAURATION', 'bright'));
  console.log(colorize('═'.repeat(50), 'blue'));
  console.log('\nCommandes disponibles:');
  console.log(colorize('  restore [fichier]', 'green') + ' - Restaurer un backup (interactif si pas de fichier)');
  console.log(colorize('  list', 'cyan') + '             - Lister les backups disponibles');
  console.log(colorize('  help', 'magenta') + '             - Afficher cette aide');
  
  console.log('\nExemples:');
  console.log('  npm run restore');
  console.log('  node scripts/restore.js');
  console.log('  node scripts/restore.js data_backup_2025-06-06-21-00-00.json.gz');
  console.log('  node scripts/restore.js list');
  
  console.log(colorize('\n⚠️  ATTENTION:', 'yellow'));
  console.log('• Une sauvegarde de sécurité est créée automatiquement');
  console.log('• Redémarrez l\'application après la restauration');
  console.log('• Vérifiez toujours l\'intégrité des données restaurées');
};

// Main
const main = async () => {
  const command = process.argv[2] || 'restore';
  const arg = process.argv[3];
  
  try {
    switch (command.toLowerCase()) {
      case 'restore':
        await performRestore(arg);
        break;
        
      case 'list':
      case 'ls':
        await listBackupsCmd();
        break;
        
      case 'help':
      case '-h':
      case '--help':
        showHelp();
        break;
        
      default:
        // Si c'est un nom de fichier, traiter comme restore
        if (command.includes('backup') && command.endsWith('.json.gz')) {
          await performRestore(command);
        } else {
          console.error(colorize(`❌ Commande inconnue: ${command}`, 'red'));
          console.log(colorize('💡 Utilisez "help" pour voir les commandes disponibles', 'yellow'));
          process.exit(1);
        }
    }
  } catch (error) {
    console.error(colorize('💥 Erreur:', 'red'), error.message);
    rl.close();
    process.exit(1);
  }
};

// Gestion des erreurs
process.on('unhandledRejection', (error) => {
  console.error(colorize('💥 Erreur non gérée:', 'red'), error.message);
  rl.close();
  process.exit(1);
});

process.on('SIGINT', () => {
  console.log(colorize('\n👋 Restauration interrompue', 'yellow'));
  rl.close();
  process.exit(0);
});

// Lancement
if (require.main === module) {
  main();
}

module.exports = {
  performRestore,
  listAvailableBackups,
  validateRestoredData
};