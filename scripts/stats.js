#!/usr/bin/env node

/**
 * 📊 Astreinte App v2.0 - Script de Statistiques
 * Génère des statistiques détaillées sur les données d'astreinte
 */

const fs = require('fs').promises;
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'data', 'data.json');

// Couleurs pour la console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

// Formatage coloré
const colorize = (text, color) => `${colors[color]}${text}${colors.reset}`;

// Lire les données
const readData = async () => {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(colorize('❌ Erreur lecture données:', 'red'), error.message);
    return { interventions: [], metadata: { version: 'unknown' } };
  }
};

// Convertir durée en minutes
const dureeEnMinutes = (debut, fin) => {
  if (!debut || !fin) return 0;
  const [hDebut, mDebut] = debut.split(':').map(Number);
  const [hFin, mFin] = fin.split(':').map(Number);
  let totalMinutes = (hFin * 60 + mFin) - (hDebut * 60 + mDebut);
  if (totalMinutes < 0) totalMinutes += 24 * 60;
  return totalMinutes;
};

// Formater minutes en heures:minutes
const minutesEnDuree = (minutes) => {
  const heures = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${heures}h${mins.toString().padStart(2, '0')}`;
};

// Calculer statistiques générales
const calculerStatistiques = (interventions) => {
  const now = new Date();
  const stats = {
    total: interventions.length,
    totalMinutes: 0,
    parType: {},
    parPriorite: {},
    parClient: {},
    parServeur: {},
    parMois: {},
    parJour: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
    semaineCourante: 0,
    moisCourant: 0
  };

  const debutSemaine = new Date(now);
  debutSemaine.setDate(now.getDate() - now.getDay() + 1);
  
  const debutMois = new Date(now.getFullYear(), now.getMonth(), 1);

  interventions.forEach(intervention => {
    const date = new Date(intervention.date);
    const minutes = dureeEnMinutes(intervention.heureDebut, intervention.heureFin);
    
    stats.totalMinutes += minutes;
    
    // Par type
    stats.parType[intervention.type] = (stats.parType[intervention.type] || 0) + 1;
    
    // Par priorité
    const priorite = intervention.priority || 'Medium';
    stats.parPriorite[priorite] = (stats.parPriorite[priorite] || 0) + 1;
    
    // Par client
    if (intervention.client) {
      stats.parClient[intervention.client] = (stats.parClient[intervention.client] || 0) + 1;
    }
    
    // Par serveur
    if (intervention.serveur) {
      stats.parServeur[intervention.serveur] = (stats.parServeur[intervention.serveur] || 0) + 1;
    }
    
    // Par mois
    const moisKey = date.toISOString().slice(0, 7); // YYYY-MM
    stats.parMois[moisKey] = (stats.parMois[moisKey] || 0) + minutes;
    
    // Par jour de la semaine
    stats.parJour[date.getDay()]++;
    
    // Semaine courante
    if (date >= debutSemaine) {
      stats.semaineCourante += minutes;
    }
    
    // Mois courant
    if (date >= debutMois) {
      stats.moisCourant += minutes;
    }
  });

  return stats;
};

// Afficher un tableau
const afficherTableau = (titre, data, couleur = 'cyan') => {
  console.log('\n' + colorize(`📊 ${titre}`, couleur));
  console.log(colorize('━'.repeat(50), 'blue'));
  
  Object.entries(data)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([key, value], index) => {
      const position = colorize(`${index + 1}.`.padStart(3), 'yellow');
      const nom = key.padEnd(25);
      const valeur = typeof value === 'number' && value > 60 
        ? colorize(minutesEnDuree(value), 'green')
        : colorize(value.toString(), 'green');
      console.log(`${position} ${nom} ${valeur}`);
    });
};

// Afficher les top performers
const afficherTopPerformers = (interventions) => {
  const parJour = {};
  
  interventions.forEach(intervention => {
    const date = intervention.date;
    const minutes = dureeEnMinutes(intervention.heureDebut, intervention.heureFin);
    parJour[date] = (parJour[date] || 0) + minutes;
  });

  console.log('\n' + colorize('🏆 TOP 10 JOURNÉES LES PLUS ACTIVES', 'magenta'));
  console.log(colorize('━'.repeat(50), 'blue'));
  
  Object.entries(parJour)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([date, minutes], index) => {
      const position = colorize(`${index + 1}.`.padStart(3), 'yellow');
      const jour = new Date(date).toLocaleDateString('fr-FR', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      const duree = colorize(minutesEnDuree(minutes), 'green');
      console.log(`${position} ${jour} - ${duree}`);
    });
};

// Afficher graphique ASCII simple
const afficherGraphique = (data, titre) => {
  console.log('\n' + colorize(`📈 ${titre}`, 'cyan'));
  console.log(colorize('━'.repeat(50), 'blue'));
  
  const maxValue = Math.max(...Object.values(data));
  const maxBarLength = 30;
  
  Object.entries(data)
    .sort((a, b) => new Date(a[0]) - new Date(b[0]))
    .forEach(([key, value]) => {
      const barLength = Math.round((value / maxValue) * maxBarLength);
      const bar = '█'.repeat(barLength) + '░'.repeat(maxBarLength - barLength);
      const pourcentage = Math.round((value / maxValue) * 100);
      console.log(`${key} ${colorize(bar, 'blue')} ${colorize(minutesEnDuree(value), 'green')} (${pourcentage}%)`);
    });
};

// Fonction principale
const main = async () => {
  console.log(colorize('🚀 ASTREINTE APP v2.0 - STATISTIQUES DÉTAILLÉES', 'bright'));
  console.log(colorize('═'.repeat(60), 'blue'));
  
  const data = await readData();
  
  if (!data.interventions || data.interventions.length === 0) {
    console.log(colorize('📭 Aucune donnée trouvée', 'yellow'));
    return;
  }

  const stats = calculerStatistiques(data.interventions);
  
  // Informations générales
  console.log('\n' + colorize('📊 INFORMATIONS GÉNÉRALES', 'bright'));
  console.log(colorize('━'.repeat(50), 'blue'));
  console.log(`Version des données: ${colorize(data.metadata?.version || 'unknown', 'green')}`);
  console.log(`Dernière mise à jour: ${colorize(data.metadata?.lastUpdated ? new Date(data.metadata.lastUpdated).toLocaleString('fr-FR') : 'inconnue', 'green')}`);
  console.log(`Total interventions: ${colorize(stats.total, 'green')}`);
  console.log(`Temps total: ${colorize(minutesEnDuree(stats.totalMinutes), 'green')}`);
  console.log(`Durée moyenne: ${colorize(minutesEnDuree(Math.round(stats.totalMinutes / stats.total)), 'green')}`);
  console.log(`Semaine courante: ${colorize(minutesEnDuree(stats.semaineCourante), 'green')}`);
  console.log(`Mois courant: ${colorize(minutesEnDuree(stats.moisCourant), 'green')}`);

  // Tableaux statistiques
  afficherTableau('RÉPARTITION PAR TYPE', stats.parType, 'cyan');
  afficherTableau('RÉPARTITION PAR PRIORITÉ', stats.parPriorite, 'yellow');
  
  if (Object.keys(stats.parClient).length > 0) {
    afficherTableau('TOP CLIENTS', stats.parClient, 'green');
  }
  
  if (Object.keys(stats.parServeur).length > 0) {
    afficherTableau('TOP SERVEURS', stats.parServeur, 'magenta');
  }

  // Répartition par jour de la semaine
  const jours = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const parJourNom = {};
  jours.forEach((jour, index) => {
    if (stats.parJour[index] > 0) {
      parJourNom[jour] = stats.parJour[index];
    }
  });
  
  if (Object.keys(parJourNom).length > 0) {
    afficherTableau('RÉPARTITION PAR JOUR DE LA SEMAINE', parJourNom, 'blue');
  }

  // Top journées
  afficherTopPerformers(data.interventions);

  // Graphique mensuel (derniers 6 mois avec données)
  const moisAvecDonnees = Object.entries(stats.parMois)
    .filter(([_, minutes]) => minutes > 0)
    .slice(-6)
    .reduce((acc, [mois, minutes]) => {
      acc[mois] = minutes;
      return acc;
    }, {});

  if (Object.keys(moisAvecDonnees).length > 0) {
    afficherGraphique(moisAvecDonnees, 'ÉVOLUTION MENSUELLE (6 DERNIERS MOIS)');
  }

  // Insights intelligents
  console.log('\n' + colorize('🧠 INSIGHTS INTELLIGENTS', 'bright'));
  console.log(colorize('━'.repeat(50), 'blue'));
  
  const typeMax = Object.entries(stats.parType).sort((a, b) => b[1] - a[1])[0];
  console.log(`🎯 Type d'intervention le plus fréquent: ${colorize(typeMax[0], 'green')} (${typeMax[1]} interventions)`);
  
  const prioriteHaute = stats.parPriorite['High'] || 0;
  const pourcentageHaute = Math.round((prioriteHaute / stats.total) * 100);
  console.log(`🚨 Interventions haute priorité: ${colorize(pourcentageHaute + '%', prioriteHaute > 30 ? 'red' : 'green')} (${prioriteHaute}/${stats.total})`);
  
  const moyenneParJour = Math.round(stats.totalMinutes / 7);
  console.log(`⏰ Moyenne hebdomadaire: ${colorize(minutesEnDuree(moyenneParJour), 'green')} par jour`);
  
  if (Object.keys(stats.parClient).length > 0) {
    const clientPrincipal = Object.entries(stats.parClient).sort((a, b) => b[1] - a[1])[0];
    console.log(`🏢 Client principal: ${colorize(clientPrincipal[0], 'green')} (${clientPrincipal[1]} interventions)`);
  }

  // Recommandations
  console.log('\n' + colorize('💡 RECOMMANDATIONS', 'bright'));
  console.log(colorize('━'.repeat(50), 'blue'));
  
  if (pourcentageHaute > 40) {
    console.log(colorize('⚠️  Taux élevé d\'interventions haute priorité - Considérez la maintenance préventive', 'yellow'));
  }
  
  if (stats.semaineCourante > stats.moisCourant / 4 * 1.5) {
    console.log(colorize('📈 Activité intense cette semaine - Surveillez la charge de travail', 'yellow'));
  }
  
  if (Object.keys(stats.parServeur).length > 10) {
    console.log(colorize('🖥️  Grand nombre de serveurs impliqués - Consolidation possible', 'blue'));
  }

  console.log('\n' + colorize('✨ Rapport généré avec succès !', 'green'));
  console.log(colorize('═'.repeat(60), 'blue'));
};

// Gestion des erreurs
process.on('unhandledRejection', (error) => {
  console.error(colorize('💥 Erreur non gérée:', 'red'), error.message);
  process.exit(1);
});

// Lancement
if (require.main === module) {
  main().catch(error => {
    console.error(colorize('💥 Erreur:', 'red'), error.message);
    process.exit(1);
  });
}

module.exports = { calculerStatistiques, readData };