import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Outfit:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; }

  .ld-root {
    max-width: 1200px;
    margin: 0 auto;
    padding: 40px 28px;
    font-family: 'Outfit', sans-serif;
    color: #0f172a;
    background: #f8fafc;
    min-height: 100vh;
  }

  /* Header */
  .ld-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 32px;
    flex-wrap: wrap;
    gap: 16px;
  }
  .ld-title {
    font-family: 'Instrument Serif', serif;
    font-size: 2rem;
    font-weight: 400;
    color: #0f172a;
    margin: 0 0 4px;
    line-height: 1;
  }
  .ld-subtitle { font-size: 0.82rem; color: #94a3b8; font-weight: 300; }

  /* Stats */
  .ld-stats { display: flex; gap: 20px; align-items: center; }
  .ld-stat {
    display: flex; flex-direction: column; align-items: center;
    gap: 2px; min-width: 60px;
  }
  .ld-stat-num {
    font-family: 'Instrument Serif', serif;
    font-size: 1.8rem; line-height: 1;
  }
  .ld-stat-num.purple { color: #9333ea; }
  .ld-stat-num.blue { color: #2563eb; }
  .ld-stat-num.green { color: #16a34a; }
  .ld-stat-lbl { font-size: 0.65rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.06em; }

  /* Stats grid */
  .ld-stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 32px;
  }

  /* Stat card */
  .ld-stat-card {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    padding: 20px;
    transition: all 0.2s;
  }
  .ld-stat-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
  }

  .ld-stat-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
    font-size: 24px;
  }
  .ld-stat-icon.purple { background: #faf5ff; color: #9333ea; }
  .ld-stat-icon.blue { background: #eff6ff; color: #2563eb; }
  .ld-stat-icon.green { background: #f0fdf4; color: #16a34a; }
  .ld-stat-icon.orange { background: #fff7ed; color: #c2410c; }

  .ld-stat-value {
    font-family: 'Instrument Serif', serif;
    font-size: 2rem;
    font-weight: 400;
    line-height: 1;
    margin-bottom: 4px;
  }
  .ld-stat-label {
    font-size: 0.85rem;
    color: #64748b;
  }

  /* Welcome card */
  .ld-welcome {
    background: linear-gradient(135deg, #9333ea 0%, #7e22ce 100%);
    border-radius: 24px;
    padding: 32px;
    margin-bottom: 32px;
    color: white;
    position: relative;
    overflow: hidden;
  }
  .ld-welcome::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -10%;
    width: 300px;
    height: 300px;
    background: rgba(255,255,255,0.1);
    border-radius: 50%;
  }
  .ld-welcome::after {
    content: '';
    position: absolute;
    bottom: -30%;
    left: -5%;
    width: 250px;
    height: 250px;
    background: rgba(255,255,255,0.08);
    border-radius: 50%;
  }
  .ld-welcome-content {
    position: relative;
    z-index: 1;
  }
  .ld-welcome-title {
    font-family: 'Instrument Serif', serif;
    font-size: 2rem;
    font-weight: 400;
    margin: 0 0 8px;
  }
  .ld-welcome-text {
    font-size: 0.9rem;
    opacity: 0.9;
    max-width: 500px;
  }

  /* Quick actions */
  .ld-quick-actions {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    margin-bottom: 32px;
  }

  .ld-action-card {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    padding: 20px;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s;
    text-decoration: none;
    color: inherit;
  }
  .ld-action-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 25px -5px rgba(147,51,234,0.15);
    border-color: #9333ea;
  }

  .ld-action-icon {
    width: 64px;
    height: 64px;
    border-radius: 20px;
    background: #faf5ff;
    color: #9333ea;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 16px;
    font-size: 32px;
  }
  .ld-action-title {
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 4px;
  }
  .ld-action-desc {
    font-size: 0.8rem;
    color: #64748b;
  }

  /* Recent tests */
  .ld-tests {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 20px;
    padding: 24px;
  }
  .ld-tests-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  .ld-tests-title {
    font-size: 1.1rem;
    font-weight: 500;
    color: #0f172a;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .ld-tests-title i { color: #9333ea; }
  .ld-view-all {
    color: #9333ea;
    text-decoration: none;
    font-size: 0.85rem;
  }

  .ld-test-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid #f1f5f9;
  }
  .ld-test-item:last-child { border-bottom: none; }
  .ld-test-info {
    flex: 1;
  }
  .ld-test-name {
    font-size: 0.95rem;
    font-weight: 500;
    margin-bottom: 4px;
  }
  .ld-test-patient {
    font-size: 0.8rem;
    color: #64748b;
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .ld-test-status {
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 500;
  }
  .ld-test-status.pending { background: #fef9c3; color: #854d0e; }
  .ld-test-status.completed { background: #dcfce7; color: #166534; }
  .ld-test-status.urgent { background: #fee2e2; color: #991b1b; }

  /* Loading */
  .ld-loading {
    min-height: 400px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 16px;
  }
  .ld-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #e2e8f0;
    border-top-color: #9333ea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .ld-loading-text { color: #94a3b8; font-size: 0.9rem; }
`;

function LabDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    pendingTests: 0,
    completedTests: 0,
    urgentTests: 0,
    totalPatients: 0
  });
  const [recentTests, setRecentTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('');
  const [patients, setPatients] = useState({});

  useEffect(() => {
    setGreeting(getGreeting());
    fetchData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Récupérer les analyses depuis le service laboratoire (port 8085)
      let labData = [];
      try {
        const labRes = await axios.get('http://localhost:8085/api/lab');
        labData = labRes.data;
        console.log('Données laboratoire:', labData);
      } catch (err) {
        console.log('Service laboratoire non disponible');
      }

      // Récupérer les patients
      let patientsData = [];
      try {
        const patientsRes = await axios.get('http://localhost:8081/api/patients');
        patientsData = patientsRes.data;
        
        // Créer un map des patients
        const patientsMap = {};
        patientsData.forEach(p => patientsMap[p.id] = p);
        setPatients(patientsMap);
      } catch (err) {
        console.log('Service patients non disponible');
      }

      // Calculer les statistiques
      const pending = labData.filter(t => !t.status || t.status === 'PENDING').length;
      const completed = labData.filter(t => t.status === 'COMPLETED').length;
      const urgent = labData.filter(t => t.priority === 'URGENT').length;

      setStats({
        pendingTests: pending,
        completedTests: completed,
        urgentTests: urgent,
        totalPatients: patientsData.length
      });

      // Récupérer les 5 dernières analyses (par date)
      const recent = [...labData]
        .sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))
        .slice(0, 5);

      setRecentTests(recent);
      setLoading(false);
    } catch (err) {
      console.error('Erreur chargement données:', err);
      setLoading(false);
    }
  };

  const getPatientName = (patientId) => {
    const patient = patients[patientId];
    return patient ? `${patient.firstName} ${patient.lastName}` : `Patient #${patientId}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <>
        <style>{styles}</style>
        <div className="ld-root">
          <div className="ld-loading">
            <div className="ld-spinner" />
            <span className="ld-loading-text">Chargement du tableau de bord...</span>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div className="ld-root">
        {/* Header */}
        <div className="ld-header">
          <div>
            <h1 className="ld-title">Laboratoire</h1>
            <p className="ld-subtitle">
              {user?.firstName} {user?.lastName} · {user?.specialty || 'Biologiste'}
            </p>
          </div>
          <div className="ld-stats">
            <div className="ld-stat">
              <span className="ld-stat-num purple">{stats.pendingTests}</span>
              <span className="ld-stat-lbl">En attente</span>
            </div>
            <div className="ld-stat">
              <span className="ld-stat-num green">{stats.completedTests}</span>
              <span className="ld-stat-lbl">Terminées</span>
            </div>
          </div>
        </div>

        {/* Welcome card */}
        <div className="ld-welcome">
          <div className="ld-welcome-content">
            <h2 className="ld-welcome-title">{greeting}, {user?.firstName || 'Agent'}!</h2>
            <p className="ld-welcome-text">
              Bienvenue dans votre espace laboratoire. Vous pouvez gérer les analyses,
              enregistrer les résultats et suivre les demandes des patients.
            </p>
          </div>
        </div>

        {/* Stats cards */}
        <div className="ld-stats-grid">
          <div className="ld-stat-card">
            <div className="ld-stat-icon purple">
              <i className="bi bi-clock-history" />
            </div>
            <div className="ld-stat-value">{stats.pendingTests}</div>
            <div className="ld-stat-label">Analyses en attente</div>
          </div>
          <div className="ld-stat-card">
            <div className="ld-stat-icon green">
              <i className="bi bi-check-circle" />
            </div>
            <div className="ld-stat-value">{stats.completedTests}</div>
            <div className="ld-stat-label">Analyses terminées</div>
          </div>
          <div className="ld-stat-card">
            <div className="ld-stat-icon orange">
              <i className="bi bi-exclamation-triangle" />
            </div>
            <div className="ld-stat-value">{stats.urgentTests}</div>
            <div className="ld-stat-label">Analyses urgentes</div>
          </div>
          <div className="ld-stat-card">
            <div className="ld-stat-icon blue">
              <i className="bi bi-people" />
            </div>
            <div className="ld-stat-value">{stats.totalPatients}</div>
            <div className="ld-stat-label">Patients</div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="ld-quick-actions">
          <div
            className="ld-action-card"
            onClick={() => navigate('/lab/tests')}
          >
            <div className="ld-action-icon">
              <i className="bi bi-flask" />
            </div>
            <div className="ld-action-title">Analyses en cours</div>
            <div className="ld-action-desc">Gérer les analyses en attente</div>
          </div>
          <div
            className="ld-action-card"
            onClick={() => navigate('/lab/results')}
          >
            <div className="ld-action-icon">
              <i className="bi bi-file-text" />
            </div>
            <div className="ld-action-title">Résultats</div>
            <div className="ld-action-desc">Consulter les résultats</div>
          </div>
        </div>

        {/* Recent tests */}
        <div className="ld-tests">
          <div className="ld-tests-header">
            <h3 className="ld-tests-title">
              <i className="bi bi-flask-fill" />
              Analyses récentes
            </h3>
            <Link to="/lab/tests" className="ld-view-all">
              Voir tout →
            </Link>
          </div>

          {recentTests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
              <i className="bi bi-inbox" style={{ fontSize: '48px' }}></i>
              <p>Aucune analyse récente</p>
            </div>
          ) : (
            recentTests.map((test) => (
              <div key={test._id} className="ld-test-item">
                <div className="ld-test-info">
                  <div className="ld-test-name">{test.testName || 'Analyse'}</div>
                  <div className="ld-test-patient">
                    <i className="bi bi-person" />
                    {getPatientName(test.patientId)}
                    <span style={{ marginLeft: '8px' }}>•</span>
                    <i className="bi bi-calendar" />
                    {formatDate(test.date || test.createdAt)}
                  </div>
                </div>
                <div className={`ld-test-status ${
                  test.priority === 'URGENT' ? 'urgent' : 
                  test.status === 'COMPLETED' ? 'completed' : 'pending'
                }`}>
                  {test.priority === 'URGENT' ? 'Urgent' : 
                   test.status === 'COMPLETED' ? 'Terminé' : 'En attente'}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

export default LabDashboard;