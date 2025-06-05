import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [interventions, setInterventions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [newIntervention, setNewIntervention] = useState({
    date: new Date().toISOString().split('T')[0],
    heureDebut: '',
    heureFin: '',
    type: 'Urgence',
    description: '',
    observations: ''
  });

  const [editingId, setEditingId] = useState(null);

  // API URL (s'adapte automatiquement à l'environnement)
  const API_URL = process.env.NODE_ENV === 'production' 
    ? '/api/interventions' 
    : 'http://localhost:3001/api/interventions';

  // Charger les interventions au démarrage
  useEffect(() => {
    loadInterventions();
  }, []);

  // Charger les interventions depuis l'API
  const loadInterventions = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error('Erreur de chargement des données');
      }
      const data = await response.json();
      setInterventions(data);
      setError(null);
    } catch (err) {
      setError('Impossible de charger les interventions');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calcul de la durée en heures:minutes
  const calculerDuree = (debut, fin) => {
    if (!debut || !fin) return '0:00';
    
    const [hDebut, mDebut] = debut.split(':').map(Number);
    const [hFin, mFin] = fin.split(':').map(Number);
    
    let totalMinutes = (hFin * 60 + mFin) - (hDebut * 60 + mDebut);
    if (totalMinutes < 0) totalMinutes += 24 * 60; // Gestion des heures qui passent minuit
    
    const heures = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    return `${heures}:${minutes.toString().padStart(2, '0')}`;
  };

  // Calcul du total journalier
  const calculerTotalJour = (dateRecherche) => {
    let totalMinutes = 0;
    interventions.filter(i => i.date === dateRecherche).forEach(intervention => {
      const duree = calculerDuree(intervention.heureDebut, intervention.heureFin);
      const [h, m] = duree.split(':').map(Number);
      totalMinutes += h * 60 + m;
    });
    
    const heures = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${heures}:${minutes.toString().padStart(2, '0')}`;
  };

  // Calculer le début et la fin de la semaine actuelle (Lundi à Dimanche)
  const obtenirSemaineActuelle = () => {
    const aujourd_hui = new Date();
    const jourSemaine = aujourd_hui.getDay(); // 0 = Dimanche, 1 = Lundi, etc.
    const joursDepuisLundi = jourSemaine === 0 ? 6 : jourSemaine - 1; // Ajuster pour que Lundi = 0
    
    const debutSemaine = new Date(aujourd_hui);
    debutSemaine.setDate(aujourd_hui.getDate() - joursDepuisLundi);
    
    const finSemaine = new Date(debutSemaine);
    finSemaine.setDate(debutSemaine.getDate() + 6);
    
    return {
      debut: debutSemaine.toISOString().split('T')[0],
      fin: finSemaine.toISOString().split('T')[0]
    };
  };

  // Calculer le début et la fin du mois actuel
  const obtenirMoisActuel = () => {
    const aujourd_hui = new Date();
    const debutMois = new Date(aujourd_hui.getFullYear(), aujourd_hui.getMonth(), 1);
    const finMois = new Date(aujourd_hui.getFullYear(), aujourd_hui.getMonth() + 1, 0);
    
    return {
      debut: debutMois.toISOString().split('T')[0],
      fin: finMois.toISOString().split('T')[0]
    };
  };

  // Calcul du total de la semaine actuelle
  const calculerTotalSemaineActuelle = () => {
    const { debut, fin } = obtenirSemaineActuelle();
    let totalMinutes = 0;
    
    interventions.forEach(intervention => {
      if (intervention.date >= debut && intervention.date <= fin) {
        const duree = calculerDuree(intervention.heureDebut, intervention.heureFin);
        const [h, m] = duree.split(':').map(Number);
        totalMinutes += h * 60 + m;
      }
    });
    
    const heures = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${heures}:${minutes.toString().padStart(2, '0')}`;
  };

  // Calcul du total du mois actuel
  const calculerTotalMoisActuel = () => {
    const { debut, fin } = obtenirMoisActuel();
    let totalMinutes = 0;
    
    interventions.forEach(intervention => {
      if (intervention.date >= debut && intervention.date <= fin) {
        const duree = calculerDuree(intervention.heureDebut, intervention.heureFin);
        const [h, m] = duree.split(':').map(Number);
        totalMinutes += h * 60 + m;
      }
    });
    
    const heures = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${heures}:${minutes.toString().padStart(2, '0')}`;
  };

  // Obtenir le jour de la semaine
  const obtenirJour = (date) => {
    const jours = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    return jours[new Date(date).getDay()];
  };

  // Ajouter une intervention
  const ajouterIntervention = async () => {
    if (!newIntervention.heureDebut || !newIntervention.heureFin || !newIntervention.description) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newIntervention),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'ajout');
      }

      const nouvelleDonnee = await response.json();
      setInterventions([...interventions, nouvelleDonnee]);
      setNewIntervention({
        date: new Date().toISOString().split('T')[0],
        heureDebut: '',
        heureFin: '',
        type: 'Urgence',
        description: '',
        observations: ''
      });
      
      setError(null);
    } catch (err) {
      setError('Erreur lors de l\'ajout de l\'intervention');
      console.error('Erreur:', err);
    }
  };

  // Supprimer une intervention
  const supprimerIntervention = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }

      setInterventions(interventions.filter(i => i.id !== id));
      setError(null);
    } catch (err) {
      setError('Erreur lors de la suppression');
      console.error('Erreur:', err);
    }
  };

  // Démarrer l'édition
  const demarrerEdition = (intervention) => {
    setEditingId(intervention.id);
    setNewIntervention({...intervention});
  };

  // Sauvegarder l'édition
  const sauvegarderEdition = async () => {
    try {
      const response = await fetch(`${API_URL}/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newIntervention),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la modification');
      }

      const interventionModifiee = await response.json();
      setInterventions(interventions.map(i => 
        i.id === editingId ? interventionModifiee : i
      ));
      
      setEditingId(null);
      setNewIntervention({
        date: new Date().toISOString().split('T')[0],
        heureDebut: '',
        heureFin: '',
        type: 'Urgence',
        description: '',
        observations: ''
      });
      
      setError(null);
    } catch (err) {
      setError('Erreur lors de la modification');
      console.error('Erreur:', err);
    }
  };

  // Exporter en CSV
  const exporterCSV = () => {
    const headers = ['Date', 'Jour', 'Heure Début', 'Heure Fin', 'Durée', 'Type', 'Description', 'Total Jour', 'Observations'];
    const data = interventions.map(i => [
      i.date,
      obtenirJour(i.date),
      i.heureDebut,
      i.heureFin,
      calculerDuree(i.heureDebut, i.heureFin),
      i.type,
      i.description,
      calculerTotalJour(i.date),
      i.observations
    ]);

    const csvContent = [headers, ...data].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `heures_astreinte_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="app">
        <div className="container">
          <div className="loading-state">
            <h2>⏳ Chargement des données...</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="container">
        <div className="header">
          <h1>🕐 Application Heures d'Astreinte</h1>
          <div className="header-actions">
            <button onClick={loadInterventions} className="btn btn-refresh" title="Actualiser">
              🔄 Actualiser
            </button>
            <button onClick={exporterCSV} className="btn btn-export">
              📊 Exporter CSV
            </button>
          </div>
        </div>

        {error && (
          <div className="error-message">
            ❌ {error}
            <button onClick={loadInterventions} className="btn-retry">Réessayer</button>
          </div>
        )}

        {/* Statistiques */}
        <div className="stats-grid">
          <div className="stat-card stat-blue">
            <h3>📊 Total Semaine Actuelle</h3>
            <p className="stat-value">{calculerTotalSemaineActuelle()}</p>
          </div>
          <div className="stat-card stat-green">
            <h3>📈 Total Mois Actuel</h3>
            <p className="stat-value">{calculerTotalMoisActuel()}</p>
          </div>
          <div className="stat-card stat-purple">
            <h3>📋 Total Interventions</h3>
            <p className="stat-value">{interventions.length}</p>
          </div>
        </div>

        {/* Formulaire d'ajout */}
        <div className="form-container">
          <h2>➕ {editingId ? 'Modifier' : 'Nouvelle'} Intervention</h2>
          
          <div className="form-grid">
            <div className="form-group">
              <label>Date *</label>
              <input
                type="date"
                value={newIntervention.date}
                onChange={(e) => setNewIntervention({...newIntervention, date: e.target.value})}
              />
            </div>
            
            <div className="form-group">
              <label>Heure Début *</label>
              <input
                type="time"
                value={newIntervention.heureDebut}
                onChange={(e) => setNewIntervention({...newIntervention, heureDebut: e.target.value})}
              />
            </div>
            
            <div className="form-group">
              <label>Heure Fin *</label>
              <input
                type="time"
                value={newIntervention.heureFin}
                onChange={(e) => setNewIntervention({...newIntervention, heureFin: e.target.value})}
              />
            </div>
            
            <div className="form-group">
              <label>Type *</label>
              <select
                value={newIntervention.type}
                onChange={(e) => setNewIntervention({...newIntervention, type: e.target.value})}
              >
                <option value="Urgence">Urgence</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Support">Support</option>
                <option value="Surveillance">Surveillance</option>
                <option value="Autre">Autre</option>
              </select>
            </div>
            
            <div className="form-group form-wide">
              <label>Description *</label>
              <input
                type="text"
                value={newIntervention.description}
                onChange={(e) => setNewIntervention({...newIntervention, description: e.target.value})}
                placeholder="Description de l'intervention"
              />
            </div>
            
            <div className="form-group form-full">
              <label>Observations</label>
              <input
                type="text"
                value={newIntervention.observations}
                onChange={(e) => setNewIntervention({...newIntervention, observations: e.target.value})}
                placeholder="Observations optionnelles"
              />
            </div>
          </div>
          
          <div className="form-actions">
            <button onClick={editingId ? sauvegarderEdition : ajouterIntervention} className="btn btn-primary">
              {editingId ? '💾 Sauvegarder' : '➕ Ajouter'} Intervention
            </button>
            {editingId && (
              <button
                onClick={() => {
                  setEditingId(null);
                  setNewIntervention({
                    date: new Date().toISOString().split('T')[0],
                    heureDebut: '',
                    heureFin: '',
                    type: 'Urgence',
                    description: '',
                    observations: ''
                  });
                }}
                className="btn btn-secondary"
              >
                ❌ Annuler
              </button>
            )}
          </div>
        </div>

        {/* Tableau des interventions */}
        <div className="table-container">
          <table className="interventions-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Jour</th>
                <th>Début</th>
                <th>Fin</th>
                <th>Durée</th>
                <th>Type</th>
                <th>Description</th>
                <th>Total Jour</th>
                <th>Observations</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {interventions.map((intervention) => (
                <tr key={intervention.id}>
                  <td>{intervention.date}</td>
                  <td>{obtenirJour(intervention.date)}</td>
                  <td>{intervention.heureDebut}</td>
                  <td>{intervention.heureFin}</td>
                  <td className="duration">{calculerDuree(intervention.heureDebut, intervention.heureFin)}</td>
                  <td>
                    <span className={`type-badge type-${intervention.type.toLowerCase()}`}>
                      {intervention.type}
                    </span>
                  </td>
                  <td>{intervention.description}</td>
                  <td className="total-day">{calculerTotalJour(intervention.date)}</td>
                  <td>{intervention.observations}</td>
                  <td>
                    <div className="actions">
                      <button onClick={() => demarrerEdition(intervention)} className="btn-action btn-edit" title="Modifier">
                        ✏️
                      </button>
                      <button onClick={() => supprimerIntervention(intervention.id)} className="btn-action btn-delete" title="Supprimer">
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {interventions.length === 0 && !loading && (
          <div className="empty-state">
            <p>📅 Aucune intervention enregistrée</p>
            <p>Ajoutez votre première intervention ci-dessus</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;