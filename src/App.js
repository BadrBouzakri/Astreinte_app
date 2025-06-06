import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [interventions, setInterventions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showArchives, setShowArchives] = useState(false);
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  const [viewMode, setViewMode] = useState('table'); // table, calendar, dashboard
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  const [newIntervention, setNewIntervention] = useState({
    date: new Date().toISOString().split('T')[0],
    heureDebut: '',
    heureFin: '',
    type: 'Urgence',
    priority: 'Medium',
    ticket: '',
    client: '',
    serveur: '',
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
    // Notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Dark mode
  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

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

  // Notification desktop
  const showNotification = (title, body) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        tag: 'astreinte-notification'
      });
    }
  };

  // Calcul de la durée en heures:minutes
  const calculerDuree = (debut, fin) => {
    if (!debut || !fin) return '0:00';
    
    const [hDebut, mDebut] = debut.split(':').map(Number);
    const [hFin, mFin] = fin.split(':').map(Number);
    
    let totalMinutes = (hFin * 60 + mFin) - (hDebut * 60 + mDebut);
    if (totalMinutes < 0) totalMinutes += 24 * 60;
    
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

  // Calculer le début et la fin de la semaine actuelle
  const obtenirSemaineActuelle = () => {
    const aujourd_hui = new Date();
    const jourSemaine = aujourd_hui.getDay();
    const joursDepuisLundi = jourSemaine === 0 ? 6 : jourSemaine - 1;
    
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

  // Obtenir les 12 derniers mois pour les archives
  const obtenirMoisPrecedents = () => {
    const mois = [];
    const aujourd_hui = new Date();
    
    for (let i = 1; i <= 12; i++) {
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

  // Statistiques avancées
  const obtenirStatistiquesAvancees = () => {
    const stats = {
      totalInterventions: interventions.length,
      tempsTotal: minutesEnDuree(interventions.reduce((acc, i) => acc + dureeEnMinutes(i.heureDebut, i.heureFin), 0)),
      moyenneDuree: minutesEnDuree(Math.round(interventions.reduce((acc, i) => acc + dureeEnMinutes(i.heureDebut, i.heureFin), 0) / Math.max(interventions.length, 1))),
      urgencesCount: interventions.filter(i => i.type === 'Urgence').length,
      highPriorityCount: interventions.filter(i => i.priority === 'High').length,
      clientsUniques: [...new Set(interventions.map(i => i.client).filter(c => c))].length,
      serveursUniques: [...new Set(interventions.map(i => i.serveur).filter(s => s))].length
    };
    return stats;
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

  // Filtrer les interventions
  const filteredInterventions = interventions.filter(intervention => {
    const matchSearch = intervention.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       intervention.client?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       intervention.serveur?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       intervention.ticket?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = filterType === 'all' || intervention.type === filterType;
    const matchPriority = filterPriority === 'all' || intervention.priority === filterPriority;
    
    return matchSearch && matchType && matchPriority;
  });

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
        priority: 'Medium',
        ticket: '',
        client: '',
        serveur: '',
        description: '',
        observations: ''
      });
      
      // Notification
      showNotification('Nouvelle intervention ajoutée', newIntervention.description);
      setError(null);
    } catch (err) {
      setError('Erreur lors de l\'ajout de l\'intervention');
      console.error('Erreur:', err);
    }
  };

  // Supprimer une intervention
  const supprimerIntervention = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette intervention ?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }

      setInterventions(interventions.filter(i => i.id !== id));
      showNotification('Intervention supprimée', 'L\'intervention a été supprimée avec succès');
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
        priority: 'Medium',
        ticket: '',
        client: '',
        serveur: '',
        description: '',
        observations: ''
      });
      
      showNotification('Intervention modifiée', 'Les modifications ont été sauvegardées');
      setError(null);
    } catch (err) {
      setError('Erreur lors de la modification');
      console.error('Erreur:', err);
    }
  };

  // Exporter en CSV avec nouveaux champs
  const exporterCSV = () => {
    const headers = ['Date', 'Jour', 'Heure Début', 'Heure Fin', 'Durée', 'Type', 'Priorité', 'Ticket', 'Client', 'Serveur', 'Description', 'Total Jour', 'Observations'];
    const data = filteredInterventions.map(i => [
      i.date,
      obtenirJour(i.date),
      i.heureDebut,
      i.heureFin,
      calculerDuree(i.heureDebut, i.heureFin),
      i.type,
      i.priority || 'Medium',
      i.ticket || '',
      i.client || '',
      i.serveur || '',
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

  // Générer rapport automatique
  const genererRapport = () => {
    const stats = obtenirStatistiquesAvancees();
    const rapport = `
=== RAPPORT D'ACTIVITÉ ASTREINTE ===
Date: ${new Date().toLocaleDateString('fr-FR')}

📊 STATISTIQUES GÉNÉRALES
• Total interventions: ${stats.totalInterventions}
• Temps total: ${stats.tempsTotal}
• Durée moyenne: ${stats.moyenneDuree}
• Urgences: ${stats.urgencesCount}
• Priorité haute: ${stats.highPriorityCount}

🏢 CLIENTS & SERVEURS
• Clients uniques: ${stats.clientsUniques}
• Serveurs uniques: ${stats.serveursUniques}

📈 PÉRIODES
• Semaine actuelle: ${calculerTotalSemaineActuelle()}
• Mois actuel: ${calculerTotalMoisActuel()}

Généré automatiquement par Astreinte App 🚀
    `;

    const blob = new Blob([rapport], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapport_astreinte_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
  };

  if (loading) {
    return (
      <div className={`app ${darkMode ? 'dark-mode' : ''}`}>
        <div className="container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <h2>⏳ Chargement des données...</h2>
          </div>
        </div>
      </div>
    );
  }

  const moisPrecedents = obtenirMoisPrecedents();
  const statsAvancees = obtenirStatistiquesAvancees();

  return (
    <div className={`app ${darkMode ? 'dark-mode' : ''}`}>
      <div className="container">
        <div className="header">
          <h1>🕐 Application Heures d'Astreinte v2.0</h1>
          <div className="header-actions">
            <div className="view-mode-switcher">
              <button 
                onClick={() => setViewMode('table')} 
                className={`btn btn-view ${viewMode === 'table' ? 'active' : ''}`}
              >
                📋 Table
              </button>
              <button 
                onClick={() => setViewMode('dashboard')} 
                className={`btn btn-view ${viewMode === 'dashboard' ? 'active' : ''}`}
              >
                📊 Dashboard
              </button>
            </div>
            <button 
              onClick={() => setDarkMode(!darkMode)} 
              className="btn btn-theme"
              title="Changer de thème"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
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
              📊 Export CSV
            </button>
            <button onClick={genererRapport} className="btn btn-report">
              📋 Rapport
            </button>
          </div>
        </div>

        {error && (
          <div className="error-message">
            ❌ {error}
            <button onClick={loadInterventions} className="btn-retry">Réessayer</button>
          </div>
        )}

        {/* Statistiques générales */}
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
          <div className="stat-card stat-orange">
            <h3>🚨 Urgences</h3>
            <p className="stat-value">{statsAvancees.urgencesCount}</p>
          </div>
        </div>

        {/* Dashboard Mode */}
        {viewMode === 'dashboard' && (
          <div className="dashboard-section">
            <h2>📊 Dashboard Temps Réel</h2>
            <div className="dashboard-grid">
              <div className="dashboard-card">
                <h3>⏱️ Métriques de Performance</h3>
                <div className="metrics-list">
                  <div className="metric">
                    <span>Temps total:</span>
                    <strong>{statsAvancees.tempsTotal}</strong>
                  </div>
                  <div className="metric">
                    <span>Durée moyenne:</span>
                    <strong>{statsAvancees.moyenneDuree}</strong>
                  </div>
                  <div className="metric">
                    <span>Clients uniques:</span>
                    <strong>{statsAvancees.clientsUniques}</strong>
                  </div>
                  <div className="metric">
                    <span>Serveurs gérés:</span>
                    <strong>{statsAvancees.serveursUniques}</strong>
                  </div>
                </div>
              </div>
              
              <div className="dashboard-card">
                <h3>🔥 Top Activités Aujourd'hui</h3>
                <div className="activity-list">
                  {interventions
                    .filter(i => i.date === new Date().toISOString().split('T')[0])
                    .slice(0, 3)
                    .map((intervention, index) => (
                      <div key={index} className="activity-item">
                        <span className={`priority-dot priority-${intervention.priority?.toLowerCase() || 'medium'}`}></span>
                        <div>
                          <strong>{intervention.description}</strong>
                          <br />
                          <small>{intervention.client} • {calculerDuree(intervention.heureDebut, intervention.heureFin)}</small>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section Archives Améliorée */}
        {showArchives && (
          <div className="archives-section">
            <div className="archives-header">
              <h2>📈 Archives Détaillées & Statistiques Avancées</h2>
              <p>Analyse complète de vos performances sur 12 mois</p>
            </div>

            {/* Archives mensuelles détaillées */}
            <div className="monthly-archives">
              <h3>📅 Historique Mensuel Complet</h3>
              <div className="monthly-grid">
                {moisPrecedents.map((mois, index) => {
                  const totalMinutes = calculerTotalPeriode(mois.debut, mois.fin);
                  const totalDuree = minutesEnDuree(totalMinutes);
                  const interventionsMois = interventions.filter(i => i.date >= mois.debut && i.date <= mois.fin);
                  const urgencesMois = interventionsMois.filter(i => i.type === 'Urgence').length;
                  const clientsUniques = [...new Set(interventionsMois.map(i => i.client).filter(c => c))].length;
                  
                  return (
                    <div key={index} className="monthly-card">
                      <div className="monthly-header">
                        <h4>{mois.nom}</h4>
                        <span className="monthly-total">{totalDuree}</span>
                      </div>
                      <div className="monthly-stats">
                        <div className="monthly-stat">
                          <span className="stat-icon">📋</span>
                          <span>{interventionsMois.length} interventions</span>
                        </div>
                        <div className="monthly-stat">
                          <span className="stat-icon">🚨</span>
                          <span>{urgencesMois} urgences</span>
                        </div>
                        <div className="monthly-stat">
                          <span className="stat-icon">🏢</span>
                          <span>{clientsUniques} clients</span>
                        </div>
                        {totalMinutes > 0 && (
                          <div className="monthly-stat">
                            <span className="stat-icon">⏱️</span>
                            <span>Moy: {minutesEnDuree(Math.round(totalMinutes / Math.max(interventionsMois.length, 1)))}</span>
                          </div>
                        )}
                      </div>
                      <div className="monthly-progress">
                        <div 
                          className="progress-bar"
                          style={{ 
                            width: `${Math.min((totalMinutes / 2400) * 100, 100)}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Comparaison par trimestre */}
            <div className="quarterly-comparison">
              <h3>📊 Analyse Trimestrielle</h3>
              <div className="quarters-grid">
                {[0, 3, 6, 9].map(offset => {
                  const trimestre = moisPrecedents.slice(offset, offset + 3);
                  const totalTrimestre = trimestre.reduce((acc, mois) => {
                    return acc + calculerTotalPeriode(mois.debut, mois.fin);
                  }, 0);
                  const nomTrimestre = `T${Math.floor((12 - offset) / 3)} ${trimestre[0]?.annee}`;
                  
                  return (
                    <div key={offset} className="quarter-card">
                      <h4>{nomTrimestre}</h4>
                      <div className="quarter-total">{minutesEnDuree(totalTrimestre)}</div>
                      <div className="quarter-months">
                        {trimestre.map(mois => (
                          <span key={mois.mois} className="quarter-month">
                            {mois.nom.split(' ')[0].slice(0, 3)}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Filtres avancés */}
        <div className="filters-section">
          <div className="filters-grid">
            <div className="filter-group">
              <label>🔍 Recherche</label>
              <input
                type="text"
                placeholder="Rechercher ticket, client, serveur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="filter-input"
              />
            </div>
            <div className="filter-group">
              <label>📋 Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="filter-select"
              >
                <option value="all">Tous les types</option>
                <option value="Urgence">Urgence</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Support">Support</option>
                <option value="Surveillance">Surveillance</option>
                <option value="Autre">Autre</option>
              </select>
            </div>
            <div className="filter-group">
              <label>🚨 Priorité</label>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="filter-select"
              >
                <option value="all">Toutes priorités</option>
                <option value="High">Haute</option>
                <option value="Medium">Moyenne</option>
                <option value="Low">Basse</option>
              </select>
            </div>
          </div>
        </div>

        {/* Formulaire d'ajout amélioré */}
        <div className="form-container">
          <h2>➕ {editingId ? 'Modifier' : 'Nouvelle'} Intervention</h2>
          
          <div className="form-grid">
            <div className="form-group">
              <label>📅 Date *</label>
              <input
                type="date"
                value={newIntervention.date}
                onChange={(e) => setNewIntervention({...newIntervention, date: e.target.value})}
              />
            </div>
            
            <div className="form-group">
              <label>⏰ Heure Début *</label>
              <input
                type="time"
                value={newIntervention.heureDebut}
                onChange={(e) => setNewIntervention({...newIntervention, heureDebut: e.target.value})}
              />
            </div>
            
            <div className="form-group">
              <label>⏰ Heure Fin *</label>
              <input
                type="time"
                value={newIntervention.heureFin}
                onChange={(e) => setNewIntervention({...newIntervention, heureFin: e.target.value})}
              />
            </div>
            
            <div className="form-group">
              <label>📋 Type *</label>
              <select
                value={newIntervention.type}
                onChange={(e) => setNewIntervention({...newIntervention, type: e.target.value})}
              >
                <option value="Urgence">🚨 Urgence</option>
                <option value="Maintenance">🔧 Maintenance</option>
                <option value="Support">💬 Support</option>
                <option value="Surveillance">👁️ Surveillance</option>
                <option value="Autre">📝 Autre</option>
              </select>
            </div>

            <div className="form-group">
              <label>🚨 Priorité</label>
              <select
                value={newIntervention.priority}
                onChange={(e) => setNewIntervention({...newIntervention, priority: e.target.value})}
              >
                <option value="High">🔴 Haute</option>
                <option value="Medium">🟡 Moyenne</option>
                <option value="Low">🟢 Basse</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>🎫 Ticket</label>
              <input
                type="text"
                value={newIntervention.ticket}
                onChange={(e) => setNewIntervention({...newIntervention, ticket: e.target.value})}
                placeholder="Numéro de ticket"
              />
            </div>
            
            <div className="form-group">
              <label>🏢 Client</label>
              <input
                type="text"
                value={newIntervention.client}
                onChange={(e) => setNewIntervention({...newIntervention, client: e.target.value})}
                placeholder="Nom du client"
              />
            </div>
            
            <div className="form-group">
              <label>🖥️ Serveur</label>
              <input
                type="text"
                value={newIntervention.serveur}
                onChange={(e) => setNewIntervention({...newIntervention, serveur: e.target.value})}
                placeholder="Nom du serveur"
              />
            </div>
            
            <div className="form-group form-wide">
              <label>📝 Description *</label>
              <input
                type="text"
                value={newIntervention.description}
                onChange={(e) => setNewIntervention({...newIntervention, description: e.target.value})}
                placeholder="Description de l'intervention"
              />
            </div>
            
            <div className="form-group form-full">
              <label>📋 Observations</label>
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
                    priority: 'Medium',
                    ticket: '',
                    client: '',
                    serveur: '',
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

        {/* Tableau amélioré */}
        {viewMode === 'table' && (
          <div className="table-container">
            <div className="table-header">
              <h3>📋 Interventions ({filteredInterventions.length})</h3>
            </div>
            <table className="interventions-table">
              <thead>
                <tr>
                  <th>📅 Date</th>
                  <th>📆 Jour</th>
                  <th>⏰ Début</th>
                  <th>⏰ Fin</th>
                  <th>⏱️ Durée</th>
                  <th>🚨 Priorité</th>
                  <th>📋 Type</th>
                  <th>🎫 Ticket</th>
                  <th>🏢 Client</th>
                  <th>🖥️ Serveur</th>
                  <th>📝 Description</th>
                  <th>⏱️ Total Jour</th>
                  <th>📋 Observations</th>
                  <th>⚙️ Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInterventions.map((intervention) => (
                  <tr key={intervention.id}>
                    <td>{intervention.date}</td>
                    <td>{obtenirJour(intervention.date)}</td>
                    <td>{intervention.heureDebut}</td>
                    <td>{intervention.heureFin}</td>
                    <td className="duration">{calculerDuree(intervention.heureDebut, intervention.heureFin)}</td>
                    <td>
                      <span className={`priority-badge priority-${intervention.priority?.toLowerCase() || 'medium'}`}>
                        {intervention.priority === 'High' ? '🔴' : intervention.priority === 'Low' ? '🟢' : '🟡'}
                      </span>
                    </td>
                    <td>
                      <span className={`type-badge type-${intervention.type.toLowerCase()}`}>
                        {intervention.type}
                      </span>
                    </td>
                    <td className="ticket-cell">{intervention.ticket || '-'}</td>
                    <td className="client-cell">{intervention.client || '-'}</td>
                    <td className="serveur-cell">{intervention.serveur || '-'}</td>
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
        )}

        {filteredInterventions.length === 0 && !loading && (
          <div className="empty-state">
            <p>📅 {searchTerm || filterType !== 'all' || filterPriority !== 'all' ? 'Aucun résultat trouvé' : 'Aucune intervention enregistrée'}</p>
            <p>{searchTerm || filterType !== 'all' || filterPriority !== 'all' ? 'Essayez de modifier vos filtres' : 'Ajoutez votre première intervention ci-dessus'}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;