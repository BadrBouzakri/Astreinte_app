const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_FILE = path.join(__dirname, 'data', 'data.json');
const DATA_DIR = path.join(__dirname, 'data');

// Middleware
app.use(cors());
app.use(express.json());

// Servir les fichiers statiques React
app.use(express.static(path.join(__dirname, 'build')));

// Créer le répertoire data s'il n'existe pas
const ensureDataDirectory = async () => {
  try {
    await fs.access(DATA_DIR);
  } catch (error) {
    await fs.mkdir(DATA_DIR, { recursive: true });
    console.log('📁 Répertoire data créé');
  }
};

// Initialiser le fichier de données s'il n'existe pas
const initDataFile = async () => {
  try {
    await fs.access(DATA_FILE);
    console.log('📄 Fichier de données existant trouvé');
  } catch (error) {
    // Le fichier n'existe pas, le créer avec des données d'exemple améliorées
    const initialData = {
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
          description: 'Problème serveur principal - Crash application',
          observations: 'Résolu rapidement, origine: pic de charge'
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
          observations: 'Optimisation des index effectuée'
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
          observations: 'Configuration terminée avec succès'
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
          observations: 'Fausse alerte, monitoring ajusté'
        }
      ],
      nextId: 5,
      metadata: {
        version: '2.0',
        created: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        totalInterventions: 4,
        features: [
          'Enhanced fields (ticket, client, server)',
          'Priority levels',
          'Extended archives',
          'Dark mode support',
          'Advanced statistics'
        ]
      }
    };
    
    await fs.writeFile(DATA_FILE, JSON.stringify(initialData, null, 2));
    console.log('📄 Fichier de données initialisé avec des exemples avancés');
    console.log('✨ Nouvelles fonctionnalités: ticket, client, serveur, priorité');
  }
};

// Lire les données
const readData = async () => {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    const parsedData = JSON.parse(data);
    
    // Migration automatique pour les anciennes données
    if (!parsedData.metadata) {
      parsedData.metadata = {
        version: '2.0',
        migrated: new Date().toISOString(),
        features: ['Legacy data migrated to v2.0']
      };
    }
    
    // Ajouter les nouveaux champs aux anciennes interventions
    parsedData.interventions = parsedData.interventions.map(intervention => ({
      ...intervention,
      priority: intervention.priority || 'Medium',
      ticket: intervention.ticket || '',
      client: intervention.client || '',
      serveur: intervention.serveur || ''
    }));
    
    return parsedData;
  } catch (error) {
    console.error('Erreur lecture données:', error);
    return { 
      interventions: [], 
      nextId: 1,
      metadata: {
        version: '2.0',
        error: 'Failed to read data',
        created: new Date().toISOString()
      }
    };
  }
};

// Écrire les données avec métadonnées
const writeData = async (data) => {
  try {
    // Mettre à jour les métadonnées
    data.metadata = {
      ...data.metadata,
      lastUpdated: new Date().toISOString(),
      totalInterventions: data.interventions.length
    };
    
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Erreur écriture données:', error);
    return false;
  }
};

// Validation des données d'intervention
const validateIntervention = (intervention) => {
  const required = ['date', 'heureDebut', 'heureFin', 'description'];
  const missing = required.filter(field => !intervention[field]);
  
  if (missing.length > 0) {
    return { valid: false, message: `Champs manquants: ${missing.join(', ')}` };
  }
  
  // Validation des heures
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(intervention.heureDebut) || !timeRegex.test(intervention.heureFin)) {
    return { valid: false, message: 'Format d\'heure invalide (HH:MM)' };
  }
  
  // Validation de la date
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(intervention.date)) {
    return { valid: false, message: 'Format de date invalide (YYYY-MM-DD)' };
  }
  
  // Validation des nouveaux champs (optionnels mais format)
  if (intervention.ticket && intervention.ticket.length > 50) {
    return { valid: false, message: 'Numéro de ticket trop long (max 50 caractères)' };
  }
  
  if (intervention.client && intervention.client.length > 100) {
    return { valid: false, message: 'Nom du client trop long (max 100 caractères)' };
  }
  
  if (intervention.serveur && intervention.serveur.length > 100) {
    return { valid: false, message: 'Nom du serveur trop long (max 100 caractères)' };
  }
  
  const validPriorities = ['High', 'Medium', 'Low'];
  if (intervention.priority && !validPriorities.includes(intervention.priority)) {
    return { valid: false, message: 'Priorité invalide (High, Medium, Low)' };
  }
  
  const validTypes = ['Urgence', 'Maintenance', 'Support', 'Surveillance', 'Autre'];
  if (intervention.type && !validTypes.includes(intervention.type)) {
    return { valid: false, message: 'Type invalide' };
  }
  
  return { valid: true };
};

// Statistiques avancées
const calculateStats = (interventions) => {
  const now = new Date();
  const stats = {
    total: interventions.length,
    thisMonth: 0,
    thisWeek: 0,
    byType: {},
    byPriority: {},
    byClient: {},
    byServer: {},
    avgDuration: 0,
    totalDuration: 0
  };
  
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisWeekStart = new Date(now);
  thisWeekStart.setDate(now.getDate() - now.getDay() + 1); // Lundi
  
  let totalMinutes = 0;
  
  interventions.forEach(intervention => {
    const interventionDate = new Date(intervention.date);
    
    // Compteurs temporels
    if (interventionDate >= thisMonthStart) stats.thisMonth++;
    if (interventionDate >= thisWeekStart) stats.thisWeek++;
    
    // Compteurs par catégorie
    stats.byType[intervention.type] = (stats.byType[intervention.type] || 0) + 1;
    stats.byPriority[intervention.priority || 'Medium'] = (stats.byPriority[intervention.priority || 'Medium'] || 0) + 1;
    
    if (intervention.client) {
      stats.byClient[intervention.client] = (stats.byClient[intervention.client] || 0) + 1;
    }
    
    if (intervention.serveur) {
      stats.byServer[intervention.serveur] = (stats.byServer[intervention.serveur] || 0) + 1;
    }
    
    // Calcul durée
    if (intervention.heureDebut && intervention.heureFin) {
      const [hDebut, mDebut] = intervention.heureDebut.split(':').map(Number);
      const [hFin, mFin] = intervention.heureFin.split(':').map(Number);
      let minutes = (hFin * 60 + mFin) - (hDebut * 60 + mDebut);
      if (minutes < 0) minutes += 24 * 60;
      totalMinutes += minutes;
    }
  });
  
  stats.totalDuration = totalMinutes;
  stats.avgDuration = interventions.length > 0 ? Math.round(totalMinutes / interventions.length) : 0;
  
  return stats;
};

// Routes API

// GET - Récupérer toutes les interventions avec statistiques
app.get('/api/interventions', async (req, res) => {
  try {
    const data = await readData();
    const stats = calculateStats(data.interventions);
    
    res.json({
      interventions: data.interventions,
      metadata: data.metadata,
      statistics: stats
    });
  } catch (error) {
    console.error('Erreur GET /api/interventions:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET - Récupérer une intervention spécifique
app.get('/api/interventions/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data = await readData();
    
    const intervention = data.interventions.find(i => i.id === id);
    if (!intervention) {
      return res.status(404).json({ error: 'Intervention non trouvée' });
    }
    
    res.json(intervention);
  } catch (error) {
    console.error('Erreur GET /api/interventions/:id:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST - Créer une nouvelle intervention
app.post('/api/interventions', async (req, res) => {
  try {
    const validation = validateIntervention(req.body);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.message });
    }
    
    const data = await readData();
    const newIntervention = {
      ...req.body,
      id: data.nextId,
      priority: req.body.priority || 'Medium',
      ticket: req.body.ticket || '',
      client: req.body.client || '',
      serveur: req.body.serveur || '',
      created: new Date().toISOString()
    };
    
    data.interventions.push(newIntervention);
    data.nextId++;
    
    const success = await writeData(data);
    if (success) {
      res.status(201).json(newIntervention);
      console.log(`✅ Nouvelle intervention créée: ${newIntervention.description}`);
      console.log(`   📋 Type: ${newIntervention.type} | 🚨 Priorité: ${newIntervention.priority}`);
      console.log(`   🎫 Ticket: ${newIntervention.ticket} | 🏢 Client: ${newIntervention.client}`);
    } else {
      res.status(500).json({ error: 'Erreur sauvegarde' });
    }
  } catch (error) {
    console.error('Erreur POST /api/interventions:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT - Modifier une intervention
app.put('/api/interventions/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const validation = validateIntervention(req.body);
    
    if (!validation.valid) {
      return res.status(400).json({ error: validation.message });
    }
    
    const data = await readData();
    const index = data.interventions.findIndex(i => i.id === id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Intervention non trouvée' });
    }
    
    const updatedIntervention = {
      ...req.body,
      id: id,
      priority: req.body.priority || 'Medium',
      ticket: req.body.ticket || '',
      client: req.body.client || '',
      serveur: req.body.serveur || '',
      updated: new Date().toISOString()
    };
    
    data.interventions[index] = updatedIntervention;
    
    const success = await writeData(data);
    if (success) {
      res.json(updatedIntervention);
      console.log(`📝 Intervention modifiée: ${updatedIntervention.description}`);
      console.log(`   🔄 Changements: Ticket=${updatedIntervention.ticket}, Client=${updatedIntervention.client}`);
    } else {
      res.status(500).json({ error: 'Erreur sauvegarde' });
    }
  } catch (error) {
    console.error('Erreur PUT /api/interventions/:id:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// DELETE - Supprimer une intervention
app.delete('/api/interventions/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data = await readData();
    
    const index = data.interventions.findIndex(i => i.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Intervention non trouvée' });
    }
    
    const deletedIntervention = data.interventions.splice(index, 1)[0];
    
    const success = await writeData(data);
    if (success) {
      res.json({ 
        message: 'Intervention supprimée',
        deleted: deletedIntervention 
      });
      console.log(`🗑️ Intervention supprimée: ${deletedIntervention.description}`);
      console.log(`   📋 ID: ${deletedIntervention.id} | Client: ${deletedIntervention.client}`);
    } else {
      res.status(500).json({ error: 'Erreur sauvegarde' });
    }
  } catch (error) {
    console.error('Erreur DELETE /api/interventions/:id:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET - Statistiques détaillées
app.get('/api/statistics', async (req, res) => {
  try {
    const data = await readData();
    const stats = calculateStats(data.interventions);
    
    // Statistiques enrichies
    const enrichedStats = {
      ...stats,
      topClients: Object.entries(stats.byClient)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([client, count]) => ({ client, count })),
      topServers: Object.entries(stats.byServer)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([server, count]) => ({ server, count })),
      priorityDistribution: stats.byPriority,
      typeDistribution: stats.byType,
      metadata: data.metadata
    };
    
    res.json(enrichedStats);
  } catch (error) {
    console.error('Erreur GET /api/statistics:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET - Export CSV amélioré
app.get('/api/export/csv', async (req, res) => {
  try {
    const data = await readData();
    
    const headers = [
      'ID', 'Date', 'Jour', 'Heure Début', 'Heure Fin', 'Durée', 
      'Type', 'Priorité', 'Ticket', 'Client', 'Serveur', 
      'Description', 'Observations', 'Créé le', 'Modifié le'
    ];
    
    const jours = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    
    const csvData = data.interventions.map(i => {
      const date = new Date(i.date);
      const jour = jours[date.getDay()];
      
      // Calcul durée
      let duree = '0:00';
      if (i.heureDebut && i.heureFin) {
        const [hDebut, mDebut] = i.heureDebut.split(':').map(Number);
        const [hFin, mFin] = i.heureFin.split(':').map(Number);
        let totalMinutes = (hFin * 60 + mFin) - (hDebut * 60 + mDebut);
        if (totalMinutes < 0) totalMinutes += 24 * 60;
        const heures = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        duree = `${heures}:${minutes.toString().padStart(2, '0')}`;
      }
      
      return [
        i.id,
        i.date,
        jour,
        i.heureDebut,
        i.heureFin,
        duree,
        i.type,
        i.priority || 'Medium',
        i.ticket || '',
        i.client || '',
        i.serveur || '',
        `"${i.description.replace(/"/g, '""')}"`,
        `"${(i.observations || '').replace(/"/g, '""')}"`,
        i.created || '',
        i.updated || ''
      ];
    });
    
    const csv = [headers, ...csvData].map(row => row.join(',')).join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="interventions_${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csv);
    
    console.log(`📊 Export CSV généré: ${data.interventions.length} interventions`);
  } catch (error) {
    console.error('Erreur GET /api/export/csv:', error);
    res.status(500).json({ error: 'Erreur export CSV' });
  }
});

// GET - Recherche avancée
app.get('/api/search', async (req, res) => {
  try {
    const { q, type, priority, client, server, dateFrom, dateTo } = req.query;
    const data = await readData();
    
    let results = data.interventions;
    
    // Filtre texte
    if (q) {
      const searchTerm = q.toLowerCase();
      results = results.filter(i => 
        i.description.toLowerCase().includes(searchTerm) ||
        (i.client && i.client.toLowerCase().includes(searchTerm)) ||
        (i.serveur && i.serveur.toLowerCase().includes(searchTerm)) ||
        (i.ticket && i.ticket.toLowerCase().includes(searchTerm)) ||
        (i.observations && i.observations.toLowerCase().includes(searchTerm))
      );
    }
    
    // Filtres spécifiques
    if (type && type !== 'all') {
      results = results.filter(i => i.type === type);
    }
    
    if (priority && priority !== 'all') {
      results = results.filter(i => (i.priority || 'Medium') === priority);
    }
    
    if (client) {
      results = results.filter(i => i.client && i.client.toLowerCase().includes(client.toLowerCase()));
    }
    
    if (server) {
      results = results.filter(i => i.serveur && i.serveur.toLowerCase().includes(server.toLowerCase()));
    }
    
    // Filtre de dates
    if (dateFrom) {
      results = results.filter(i => i.date >= dateFrom);
    }
    
    if (dateTo) {
      results = results.filter(i => i.date <= dateTo);
    }
    
    res.json({
      results,
      count: results.length,
      query: req.query
    });
    
  } catch (error) {
    console.error('Erreur GET /api/search:', error);
    res.status(500).json({ error: 'Erreur recherche' });
  }
});

// Servir l'application React pour toutes les autres routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Gestionnaire d'erreur global
app.use((error, req, res, next) => {
  console.error('💥 Erreur non gérée:', error);
  res.status(500).json({ 
    error: 'Erreur interne du serveur',
    timestamp: new Date().toISOString()
  });
});

// Démarrer le serveur
const startServer = async () => {
  try {
    await ensureDataDirectory();
    await initDataFile();
    
    app.listen(PORT, () => {
      console.log('🚀 ================================');
      console.log(`🚀 Serveur Astreinte v2.0 démarré !`);
      console.log(`🚀 ================================`);
      console.log(`📊 Application: http://localhost:${PORT}`);
      console.log(`🔗 API: http://localhost:${PORT}/api/interventions`);
      console.log(`📈 Stats: http://localhost:${PORT}/api/statistics`);
      console.log(`🔍 Recherche: http://localhost:${PORT}/api/search`);
      console.log(`📊 Export CSV: http://localhost:${PORT}/api/export/csv`);
      console.log('🚀 ================================');
      console.log('✨ Nouvelles fonctionnalités v2.0:');
      console.log('   • 🎫 Gestion des tickets');
      console.log('   • 🏢 Suivi par client');
      console.log('   • 🖥️ Gestion des serveurs');
      console.log('   • 🚨 Système de priorités');
      console.log('   • 📊 Statistiques avancées');
      console.log('   • 🔍 Recherche intelligente');
      console.log('   • 📱 Mode sombre');
      console.log('   • 📈 Dashboard temps réel');
      console.log('🚀 ================================');
    });
  } catch (error) {
    console.error('💥 Erreur démarrage serveur:', error);
    process.exit(1);
  }
};

// Gestion propre de l'arrêt
process.on('SIGINT', () => {
  console.log('\n👋 Arrêt du serveur...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Arrêt du serveur...');
  process.exit(0);
});

startServer();