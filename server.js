const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_FILE = path.join(__dirname, 'data.json');

// Middleware
app.use(cors());
app.use(express.json());

// Servir les fichiers statiques React
app.use(express.static(path.join(__dirname, 'build')));

// Initialiser le fichier de données s'il n'existe pas
const initDataFile = async () => {
  try {
    await fs.access(DATA_FILE);
  } catch (error) {
    // Le fichier n'existe pas, le créer avec des données d'exemple
    const initialData = {
      interventions: [
        {
          id: 1,
          date: '2025-06-05',
          heureDebut: '14:30',
          heureFin: '16:45',
          type: 'Urgence',
          description: 'Problème serveur principal',
          observations: 'Résolu rapidement'
        },
        {
          id: 2,
          date: '2025-06-05',
          heureDebut: '20:15',
          heureFin: '21:30',
          type: 'Maintenance',
          description: 'Problème réseau',
          observations: 'Nécessite suivi'
        }
      ],
      nextId: 3
    };
    await fs.writeFile(DATA_FILE, JSON.stringify(initialData, null, 2));
    console.log('📄 Fichier de données initialisé avec des exemples');
  }
};

// Lire les données
const readData = async () => {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Erreur lecture données:', error);
    return { interventions: [], nextId: 1 };
  }
};

// Écrire les données
const writeData = async (data) => {
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Erreur écriture données:', error);
    return false;
  }
};

// Routes API

// GET - Récupérer toutes les interventions
app.get('/api/interventions', async (req, res) => {
  try {
    const data = await readData();
    res.json(data.interventions);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST - Créer une nouvelle intervention
app.post('/api/interventions', async (req, res) => {
  try {
    const data = await readData();
    const newIntervention = {
      ...req.body,
      id: data.nextId
    };
    
    data.interventions.push(newIntervention);
    data.nextId++;
    
    const success = await writeData(data);
    if (success) {
      res.status(201).json(newIntervention);
      console.log(`✅ Nouvelle intervention créée: ${newIntervention.description}`);
    } else {
      res.status(500).json({ error: 'Erreur sauvegarde' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT - Modifier une intervention
app.put('/api/interventions/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data = await readData();
    
    const index = data.interventions.findIndex(i => i.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Intervention non trouvée' });
    }
    
    data.interventions[index] = { ...req.body, id };
    
    const success = await writeData(data);
    if (success) {
      res.json(data.interventions[index]);
      console.log(`📝 Intervention modifiée: ${data.interventions[index].description}`);
    } else {
      res.status(500).json({ error: 'Erreur sauvegarde' });
    }
  } catch (error) {
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
      res.json({ message: 'Intervention supprimée' });
      console.log(`🗑️ Intervention supprimée: ${deletedIntervention.description}`);
    } else {
      res.status(500).json({ error: 'Erreur sauvegarde' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Servir l'application React pour toutes les autres routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Démarrer le serveur
const startServer = async () => {
  await initDataFile();
  app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur le port ${PORT}`);
    console.log(`📊 Application: http://localhost:${PORT}`);
    console.log(`🔗 API: http://localhost:${PORT}/api/interventions`);
  });
};

startServer();