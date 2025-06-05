import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [interventions, setInterventions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showArchives, setShowArchives] = useState(false);

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

  // Convertir durée en minutes
  const dureeEnMinutes = (debut, fin) => {
    if (!debut || !fin) return 0;
    const [hDebut, mDebut] = debut.split(':').map(Number);
    const [hFin, mFin] = fin.split(':').map(Number);
    let totalMinutes = (hFin * 60 + mFin) - (hDebut * 60 + mDebut);
    if (totalMinutes < 0) totalMinutes += 24 * 60;
    return totalMinutes;
  };

  // Convertir minutes en format hh:mm
  const minutesEnDuree = (minutes) => {
    const heures = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${heures}:${mins.toString().padStart(2, '0')}`;
  };

  // Calcul du total journalier
  const calculerTotalJour = (dateRecherche) => {
    let totalMinutes = 0;
    interventions.filter(i => i.date === dateRecherche).forEach(intervention => {
      totalMinutes += dureeEnMinutes(intervention.heureDebut, intervention.heureFin);
    });
    return minutesEnDuree(totalMinutes);
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

  // Obtenir les 6 derniers mois pour les archives
  const obtenirMoisPrecedents = () => {
    const mois = [];
    const aujourd_hui = new Date();
    
    for (let i = 1; i <= 6; i++) {
      const date = new Date(aujourd_hui.getFullYear(), aujourd_hui.getMonth() - i, 1);
      const debutMois = new Date(date.getFullYear(), date.getMonth(), 1);
      const finMois = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      mois.push({
        nom: date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
        debut: debutMois.toISOString().split('T')[0],
        fin: finMois.toISOString().split('T')[0],
        annee: date.getFullYear(),
        mois: date.getMonth() + 1
      });
    }
    
    return mois;
  };

  // Calcul du total pour une période donnée
  const calculerTotalPeriode = (debut, fin) => {
    let totalMinutes = 0;
    interventions.forEach(intervention => {
      if (intervention.date >= debut && intervention.date <= fin) {
        totalMinutes += dureeEnMinutes(intervention.heureDebut, intervention.heureFin);
      }
    });
    return totalMinutes;
  };

  // Calcul du total de la semaine actuelle
  const calculerTotalSemaineActuelle = () => {
    const { debut, fin } = obtenirSemaineActuelle();
    return minutesEnDuree(calculerTotalPeriode(debut, fin));
  };

  // Calcul du total du mois actuel
  const calculerTotalMoisActuel = () => {
    const { debut, fin } = obtenirMoisActuel();
    return minutesEnDuree(calculerTotalPeriode(debut, fin));
  };

  // Statistiques par type d'intervention
  const obtenirStatistiquesParType = () => {
    const stats = {};
    interventions.forEach(intervention => {
      const type = intervention.type;
      if (!stats[type]) {
        stats[type] = { count: 0, minutes: 0 };
      }
      stats[type].count++;
      stats[type].minutes += dureeEnMinutes(intervention.heureDebut, intervention.heureFin);
    });
    
    return Object.entries(stats).map(([type, data]) => ({
      type,
      count: data.count,
      duree: minutesEnDuree(data.minutes),
      minutes: data.minutes
    })).sort((a, b) => b.minutes - a.minutes);
  };

  // Analyse des jours de la semaine les plus actifs
  const obtenirStatistiquesJours = () => {
    const jours = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const stats = jours.map(jour => ({ jour, minutes: 0, count: 0 }));
    
    interventions.forEach(intervention => {
      const jourIndex = new Date(intervention.date).getDay();
      stats[jourIndex].minutes += dureeEnMinutes(intervention.heureDebut, intervention.heureFin);
      stats[jourIndex].count++;
    });
    
    return stats.map(stat => ({
      ...stat,
      duree: minutesEnDuree(stat.minutes)
    }));
  };

  // Prédiction pour le mois en cours
  const obtenirPredictionMois = () => {
    const { debut } = obtenirMoisActuel();
    const aujourd_hui = new Date();
    const debutMois = new Date(debut);
    const joursEcoules = Math.floor((aujourd_hui - debutMois) / (1000 * 60 * 60 * 24)) + 1;
    const joursDansMois = new Date(aujourd_hui.getFullYear(), aujourd_hui.getMonth() + 1, 0).getDate();
    
    const totalActuel = calculerTotalPeriode(debut, aujourd_hui.toISOString().split('T')[0]);
    const moyenneParJour = totalActuel / joursEcoules;
    const predictionTotal = moyenneParJour * joursDansMois;
    
    return {
      joursEcoules,
      joursDansMois,
      moyenneParJour: minutesEnDuree(Math.round(moyenneParJour)),
      predictionTotal: minutesEnDuree(Math.round(predictionTotal)),
      progression: Math.round((joursEcoules / joursDansMois) * 100)
    };
  };

  // Badges de performance
  const obtenirBadges = () => {
    const badges = [];
    const totalMinutesMois = calculerTotalPeriode(...Object.values(obtenirMoisActuel()));
    const statsTypes = obtenirStatistiquesParType();
    const statsJours = obtenirStatistiquesJours();
    
    // Badge heures élevées
    if (totalMinutesMois > 2400) { // Plus de 40h
      badges.push({ type: 'gold', nom: '🏆 Expert Astreinte', description: 'Plus de 40h ce mois' });
    } else if (totalMinutesMois > 1200) { // Plus de 20h
      badges.push({ type: 'silver', nom: '🥈 Pro Astreinte', description: 'Plus de 20h ce mois' });
    }
    
    // Badge polyvalence
    if (statsTypes.length >= 4) {
      badges.push({ type: 'rainbow', nom: '🌈 Polyvalent', description: 'Maîtrise tous les types' });
    }
    
    // Badge régularité
    const joursMoisActuel = obtenirMoisActuel();
    const joursAvecInterventions = new Set(
      interventions
        .filter(i => i.date >= joursMoisActuel.debut && i.date <= joursMoisActuel.fin)
        .map(i => i.date)
    ).size;
    
    if (joursAvecInterventions >= 15) {
      badges.push({ type: 'blue', nom: '📅 Assidu', description: 'Actif 15+ jours ce mois' });
    }
    
    return badges;
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

  const moisPrecedents = obtenirMoisPrecedents();
  const statsTypes = obtenirStatistiquesParType();
  const statsJours = obtenirStatistiquesJours();
  const prediction = obtenirPredictionMois();
  const badges = obtenirBadges();

  return (
    <div className="app">
      <div className="container">
        <div className="header">
          <h1>🕐 Application Heures d'Astreinte</h1>
          <div className="header-actions">
            <button 
              onClick={() => setShowArchives(!showArchives)} 
              className={`btn ${showArchives ? 'btn-archives-active' : 'btn-archives'}`}
            >
              📊 {showArchives ? 'Masquer' : 'Archives'} & Stats
            </button>
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

        {/* Section Archives & Statistiques */}
        {showArchives && (
          <div className="archives-section">
            <div className="archives-header">
              <h2>📈 Archives & Statistiques Avancées</h2>
              <p>Analyse complète de vos performances d'astreinte</p>
            </div>

            {/* Badges de Performance */}
            {badges.length > 0 && (
              <div className="badges-container">
                <h3>🏅 Badges de Performance</h3>
                <div className="badges-grid">
                  {badges.map((badge, index) => (
                    <div key={index} className={`badge badge-${badge.type}`}>
                      <div className="badge-icon">{badge.nom.split(' ')[0]}</div>
                      <div className="badge-info">
                        <div className="badge-name">{badge.nom.split(' ').slice(1).join(' ')}</div>
                        <div className="badge-desc">{badge.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Prédiction du Mois */}
            <div className="prediction-container">
              <h3>🔮 Prédiction Mois Actuel</h3>
              <div className="prediction-card">
                <div className="prediction-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${prediction.progression}%` }}
                    ></div>
                  </div>
                  <span>{prediction.progression}% du mois écoulé</span>
                </div>
                <div className="prediction-stats">
                  <div className="prediction-stat">
                    <span className="prediction-label">Moyenne/jour</span>
                    <span className="prediction-value">{prediction.moyenneParJour}</span>
                  </div>
                  <div className="prediction-stat">
                    <span className="prediction-label">Prédiction totale</span>
                    <span className="prediction-value prediction-highlight">{prediction.predictionTotal}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline des Mois Précédents */}
            <div className="timeline-container">
              <h3>📅 Archives Mensuelles</h3>
              <div className="timeline">
                {moisPrecedents.map((mois, index) => {
                  const totalMinutes = calculerTotalPeriode(mois.debut, mois.fin);
                  const totalDuree = minutesEnDuree(totalMinutes);
                  const interventionsMois = interventions.filter(i => i.date >= mois.debut && i.date <= mois.fin).length;
                  
                  return (
                    <div key={index} className="timeline-item">
                      <div className="timeline-marker"></div>
                      <div className="timeline-content">
                        <div className="timeline-header">
                          <h4>{mois.nom}</h4>
                          <span className="timeline-total">{totalDuree}</span>
                        </div>
                        <div className="timeline-details">
                          <span>{interventionsMois} intervention{interventionsMois > 1 ? 's' : ''}</span>
                          {totalMinutes > 0 && (
                            <span>• Moy: {minutesEnDuree(Math.round(totalMinutes / Math.max(interventionsMois, 1)))}/intervention</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Statistiques par Type */}
            <div className="stats-types-container">
              <h3>🎯 Répartition par Type d'Intervention</h3>
              <div className="stats-types-grid">
                {statsTypes.map((stat, index) => (
                  <div key={index} className="stats-type-card">
                    <div className="stats-type-header">
                      <span className={`type-badge type-${stat.type.toLowerCase()}`}>
                        {stat.type}
                      </span>
                      <span className="stats-type-duration">{stat.duree}</span>
                    </div>
                    <div className="stats-type-count">{stat.count} intervention{stat.count > 1 ? 's' : ''}</div>
                    <div className="stats-type-bar">
                      <div 
                        className="stats-type-fill" 
                        style={{ 
                          width: `${(stat.minutes / Math.max(...statsTypes.map(s => s.minutes))) * 100}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Heatmap des Jours */}
            <div className="heatmap-container">
              <h3>🗓️ Activité par Jour de la Semaine</h3>
              <div className="heatmap-grid">
                {statsJours.map((stat, index) => {
                  const maxMinutes = Math.max(...statsJours.map(s => s.minutes));
                  const intensity = maxMinutes > 0 ? (stat.minutes / maxMinutes) : 0;
                  
                  return (
                    <div key={index} className="heatmap-day">
                      <div className="heatmap-day-label">{stat.jour.slice(0, 3)}</div>
                      <div 
                        className="heatmap-cell" 
                        style={{ 
                          backgroundColor: `rgba(59, 130, 246, ${0.1 + intensity * 0.9})`,
                          border: intensity > 0.5 ? '2px solid #3b82f6' : '1px solid #e5e7eb'
                        }}
                        title={`${stat.jour}: ${stat.duree} (${stat.count} interventions)`}
                      >
                        <div className="heatmap-duration">{stat.duree}</div>
                        <div className="heatmap-count">{stat.count}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

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