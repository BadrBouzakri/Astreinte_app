#!/usr/bin/env node

/**
 * 💾 Astreinte App v2.0 - Script de Backup
 * Sauvegarde automatique des données avec rotation et compression
 */

const fs = require('fs').promises;
const path = require('path');
const { createReadStream, createWriteStream } = require('fs');
const { createGzip } = require('zlib');
const { pipeline } = require('stream/promises');

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
  maxBackups: 30, // Garder 30 sauvegardes
  compressionLevel: 6 // Niveau de compression gzip
};

// Créer le répertoire de backup
const ensureBackupDir = async () => {
  try {
    await fs.access(config.backupDir);
  } catch {
    await fs.mkdir(config.backupDir, { recursive: true });
    console.log(colorize(`📁 Répertoire de backup créé: ${config.backupDir}`, 'green'));
  }
};

// Obtenir la liste des fichiers de données
const getDataFiles = async () => {
  try {
    const files = await fs.readdir(config.dataDir);
    return files.filter(file => file.endsWith('.json'));
  } catch (error) {
    console.error(colorize('❌ Erreur lecture répertoire data:', 'red'), error.message);
    return [];
  }
};

// Générer nom de backup avec timestamp
const generateBackupName = (filename, timestamp = new Date()) => {
  const name = path.parse(filename).name;
  const dateStr = timestamp.toISOString().slice(0, 19).replace(/[T:]/g, '-');
  return `${name}_backup_${dateStr}.json.gz`;
};

// Compresser et sauvegarder un fichier
const backupFile = async (sourceFile, backupName) => {
  const sourcePath = path.join(config.dataDir, sourceFile);
  const backupPath = path.join(config.backupDir, backupName);
  
  try {
    const gzip = createGzip({ level: config.compressionLevel });
    const source = createReadStream(sourcePath);
    const destination = createWriteStream(backupPath);
    
    await pipeline(source, gzip, destination);
    
    // Obtenir les tailles pour stats
    const sourceStats = await fs.stat(sourcePath);
    const backupStats = await fs.stat(backupPath);
    const compressionRatio = Math.round((1 - backupStats.size / sourceStats.size) * 100);
    
    return {
      sourceSize: sourceStats.size,
      backupSize: backupStats.size,
      compressionRatio,
      backupPath
    };
  } catch (error) {
    console.error(colorize(`❌ Erreur backup ${sourceFile}:`, 'red'), error.message);
    throw error;
  }
};

// Nettoyer les anciens backups
const cleanOldBackups = async () => {
  try {
    const files = await fs.readdir(config.backupDir);
    const backupFiles = files
      .filter(file => file.includes('_backup_') && file.endsWith('.json.gz'))
      .map(file => ({
        name: file,
        path: path.join(config.backupDir, file),
        // Extraire timestamp du nom
        timestamp: file.match(/_backup_(\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2})/)?.[1]
      }))
      .filter(file => file.timestamp)
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp));

    if (backupFiles.length > config.maxBackups) {
      const toDelete = backupFiles.slice(config.maxBackups);
      
      for (const file of toDelete) {
        await fs.unlink(file.path);
        console.log(colorize(`🗑️  Ancien backup supprimé: ${file.name}`, 'yellow'));
      }
      
      console.log(colorize(`🧹 ${toDelete.length} ancien(s) backup(s) supprimé(s)`, 'blue'));
    }
  } catch (error) {
    console.error(colorize('❌ Erreur nettoyage:', 'red'), error.message);
  }
};

// Lister les backups existants
const listBackups = async () => {
  try {
    const files = await fs.readdir(config.backupDir);
    const backupFiles = files
      .filter(file => file.includes('_backup_') && file.endsWith('.json.gz'))
      .map(async (file) => {
        const filePath = path.join(config.backupDir, file);
        const stats = await fs.stat(filePath);
        return {
          name: file,
          size: stats.size,
          created: stats.birthtime,
          timestamp: file.match(/_backup_(\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2})/)?.[1]
        };
      });

    const resolvedFiles = await Promise.all(backupFiles);
    return resolvedFiles
      .filter(file => file.timestamp)
      .sort((a, b) => b.created - a.created);
  } catch (error) {
    console.error(colorize('❌ Erreur listage backups:', 'red'), error.message);
    return [];
  }
};

// Formater taille en bytes
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

// Vérifier l'intégrité des données
const checkDataIntegrity = async (filename) => {
  const filePath = path.join(config.dataDir, filename);
  
  try {
    const content = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(content);
    
    // Vérifications basiques
    const checks = {
      isValidJSON: true,
      hasInterventions: Array.isArray(data.interventions),
      hasMetadata: !!data.metadata,
      interventionCount: data.interventions?.length || 0,
      version: data.metadata?.version || 'unknown'
    };
    
    return checks;
  } catch (error) {
    return {
      isValidJSON: false,
      error: error.message
    };
  }
};

// Commande: backup
const performBackup = async () => {
  console.log(colorize('💾 DÉMARRAGE DU BACKUP', 'bright'));
  console.log(colorize('═'.repeat(50), 'blue'));
  
  await ensureBackupDir();
  
  const dataFiles = await getDataFiles();
  
  if (dataFiles.length === 0) {
    console.log(colorize('📭 Aucun fichier de données trouvé', 'yellow'));
    return;
  }
  
  const timestamp = new Date();
  const results = [];
  
  for (const file of dataFiles) {
    console.log(colorize(`\n📄 Traitement: ${file}`, 'cyan'));
    
    // Vérifier intégrité
    const integrity = await checkDataIntegrity(file);
    
    if (!integrity.isValidJSON) {
      console.error(colorize(`❌ Fichier corrompu: ${integrity.error}`, 'red'));
      continue;
    }
    
    console.log(colorize(`✅ Intégrité OK - ${integrity.interventionCount} interventions (v${integrity.version})`, 'green'));
    
    // Backup
    const backupName = generateBackupName(file, timestamp);
    
    try {
      const result = await backupFile(file, backupName);
      
      console.log(colorize(`💾 Backup créé: ${backupName}`, 'green'));
      console.log(colorize(`📊 Taille originale: ${formatSize(result.sourceSize)}`, 'blue'));
      console.log(colorize(`📦 Taille compressée: ${formatSize(result.backupSize)} (-${result.compressionRatio}%)`, 'blue'));
      
      results.push({
        file,
        backupName,
        ...result,
        integrity
      });
      
    } catch (error) {
      console.error(colorize(`❌ Échec backup ${file}`, 'red'));
    }
  }
  
  // Nettoyage
  await cleanOldBackups();
  
  // Résumé
  console.log(colorize('\n📊 RÉSUMÉ DU BACKUP', 'bright'));
  console.log(colorize('━'.repeat(50), 'blue'));
  
  const totalOriginal = results.reduce((sum, r) => sum + r.sourceSize, 0);
  const totalCompressed = results.reduce((sum, r) => sum + r.backupSize, 0);
  const avgCompression = Math.round((1 - totalCompressed / totalOriginal) * 100);
  
  console.log(`✅ Fichiers sauvegardés: ${colorize(results.length, 'green')}`);
  console.log(`📊 Taille totale: ${colorize(formatSize(totalOriginal), 'blue')}`);
  console.log(`📦 Après compression: ${colorize(formatSize(totalCompressed), 'blue')} (-${avgCompression}%)`);
  console.log(`📅 Timestamp: ${colorize(timestamp.toLocaleString('fr-FR'), 'cyan')}`);
  
  console.log(colorize('\n✨ Backup terminé avec succès !', 'green'));
};

// Commande: list
const listBackupsCmd = async () => {
  console.log(colorize('📋 LISTE DES BACKUPS', 'bright'));
  console.log(colorize('═'.repeat(70), 'blue'));
  
  const backups = await listBackups();
  
  if (backups.length === 0) {
    console.log(colorize('📭 Aucun backup trouvé', 'yellow'));
    return;
  }
  
  console.log(colorize('📅 Date              📂 Nom                                    📊 Taille', 'cyan'));
  console.log(colorize('─'.repeat(70), 'blue'));
  
  backups.forEach((backup, index) => {
    const date = backup.created.toLocaleString('fr-FR');
    const name = backup.name.length > 35 ? backup.name.substring(0, 32) + '...' : backup.name;
    const size = formatSize(backup.size);
    
    const isRecent = (Date.now() - backup.created) < 24 * 60 * 60 * 1000; // Moins de 24h
    const color = isRecent ? 'green' : 'white';
    
    console.log(`${colorize(date, color)} ${name.padEnd(37)} ${colorize(size, 'blue')}`);
  });
  
  console.log(colorize(`\n📊 Total: ${backups.length} backup(s)`, 'cyan'));
  
  // Stats
  const totalSize = backups.reduce((sum, b) => sum + b.size, 0);
  const oldestBackup = backups[backups.length - 1];
  const newestBackup = backups[0];
  
  if (oldestBackup && newestBackup) {
    console.log(colorize(`📦 Taille totale: ${formatSize(totalSize)}`, 'blue'));
    console.log(colorize(`📅 Plus ancien: ${oldestBackup.created.toLocaleDateString('fr-FR')}`, 'yellow'));
    console.log(colorize(`📅 Plus récent: ${newestBackup.created.toLocaleDateString('fr-FR')}`, 'green'));
  }
};

// Commande: clean
const cleanBackupsCmd = async () => {
  console.log(colorize('🧹 NETTOYAGE DES BACKUPS', 'bright'));
  console.log(colorize('═'.repeat(50), 'blue'));
  
  await cleanOldBackups();
  
  console.log(colorize('✨ Nettoyage terminé !', 'green'));
};

// Commande: info
const showInfo = async () => {
  console.log(colorize('ℹ️  INFORMATIONS BACKUP', 'bright'));
  console.log(colorize('═'.repeat(50), 'blue'));
  
  console.log(`📁 Répertoire data: ${colorize(config.dataDir, 'cyan')}`);
  console.log(`💾 Répertoire backups: ${colorize(config.backupDir, 'cyan')}`);
  console.log(`🔄 Rétention: ${colorize(config.maxBackups + ' backups', 'yellow')}`);
  console.log(`📦 Compression: ${colorize('gzip niveau ' + config.compressionLevel, 'blue')}`);
  
  const backups = await listBackups();
  console.log(`📊 Backups actuels: ${colorize(backups.length, 'green')}`);
  
  if (backups.length > 0) {
    const totalSize = backups.reduce((sum, b) => sum + b.size, 0);
    console.log(`💽 Espace utilisé: ${colorize(formatSize(totalSize), 'blue')}`);
  }
};

// Aide
const showHelp = () => {
  console.log(colorize('💾 ASTREINTE APP v2.0 - SCRIPT DE BACKUP', 'bright'));
  console.log(colorize('═'.repeat(50), 'blue'));
  console.log('\nCommandes disponibles:');
  console.log(colorize('  backup', 'green') + '  - Créer un nouveau backup');
  console.log(colorize('  list', 'cyan') + '    - Lister les backups existants');
  console.log(colorize('  clean', 'yellow') + '   - Nettoyer les anciens backups');
  console.log(colorize('  info', 'blue') + '    - Afficher les informations de configuration');
  console.log(colorize('  help', 'magenta') + '    - Afficher cette aide');
  
  console.log('\nExemples:');
  console.log('  npm run backup');
  console.log('  node scripts/backup.js list');
  console.log('  node scripts/backup.js clean');
};

// Main
const main = async () => {
  const command = process.argv[2] || 'backup';
  
  try {
    switch (command.toLowerCase()) {
      case 'backup':
      case 'create':
        await performBackup();
        break;
        
      case 'list':
      case 'ls':
        await listBackupsCmd();
        break;
        
      case 'clean':
      case 'cleanup':
        await cleanBackupsCmd();
        break;
        
      case 'info':
      case 'config':
        await showInfo();
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
  performBackup,
  listBackups: listBackupsCmd,
  cleanOldBackups,
  config
};