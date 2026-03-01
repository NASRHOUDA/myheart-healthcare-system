import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Outfit:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; }

  .rd-root {
    max-width: 1200px;
    margin: 0 auto;
    padding: 40px 28px;
    font-family: 'Outfit', sans-serif;
    color: #0f172a;
    background: #f8fafc;
    min-height: 100vh;
  }

  /* Header */
  .rd-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 32px;
    flex-wrap: wrap;
    gap: 16px;
  }
  .rd-title {
    font-family: 'Instrument Serif', serif;
    font-size: 2rem;
    font-weight: 400;
    color: #0f172a;
    margin: 0 0 4px;
    line-height: 1;
  }
  .rd-subtitle {
    font-size: 0.82rem;
    color: #94a3b8;
    font-weight: 300;
  }

  /* Welcome card */
  .rd-welcome {
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
    border-radius: 24px;
    padding: 32px;
    margin-bottom: 32px;
    color: white;
    position: relative;
    overflow: hidden;
  }
  .rd-welcome::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -10%;
    width: 300px;
    height: 300px;
    background: rgba(255,255,255,0.1);
    border-radius: 50%;
    pointer-events: none;
  }
  .rd-welcome::after {
    content: '';
    position: absolute;
    bottom: -30%;
    left: -5%;
    width: 250px;
    height: 250px;
    background: rgba(255,255,255,0.08);
    border-radius: 50%;
    pointer-events: none;
  }
  .rd-welcome-content {
    position: relative;
    z-index: 1;
  }
  .rd-welcome-title {
    font-family: 'Instrument Serif', serif;
    font-size: 2rem;
    font-weight: 400;
    margin: 0 0 8px;
  }
  .rd-welcome-text {
    font-size: 0.9rem;
    opacity: 0.9;
    max-width: 500px;
  }

  /* Stats grid */
  .rd-stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    margin-bottom: 40px;
  }

  /* Stat card */
  .rd-stat-card {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 20px;
    padding: 24px;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
    overflow: hidden;
  }
  .rd-stat-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04);
    border-color: transparent;
  }
  .rd-stat-card.patients:hover { box-shadow: 0 20px 25px -5px rgba(37,99,235,0.1); }
  .rd-stat-card.appointments:hover { box-shadow: 0 20px 25px -5px rgba(22,163,74,0.1); }
  .rd-stat-card.ehr:hover { box-shadow: 0 20px 25px -5px rgba(147,51,234,0.1); }

  .rd-stat-icon {
    width: 48px;
    height: 48px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
    font-size: 24px;
  }
  .rd-stat-icon.patients { background: #eff6ff; color: #2563eb; }
  .rd-stat-icon.appointments { background: #f0fdf4; color: #16a34a; }
  .rd-stat-icon.ehr { background: #faf5ff; color: #9333ea; }

  .rd-stat-value {
    font-family: 'Instrument Serif', serif;
    font-size: 2.5rem;
    font-weight: 400;
    line-height: 1;
    margin-bottom: 4px;
  }
  .rd-stat-label {
    font-size: 0.9rem;
    color: #64748b;
    margin-bottom: 12px;
  }
  .rd-stat-trend {
    font-size: 0.8rem;
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .rd-stat-trend.positive { color: #16a34a; }
  .rd-stat-trend.neutral { color: #94a3b8; }

  /* Section title */
  .rd-section-title {
    font-size: 1.2rem;
    font-weight: 500;
    color: #0f172a;
    margin: 0 0 20px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .rd-section-title i { color: #2563eb; font-size: 1.4rem; }

  /* Quick actions */
  .rd-quick-actions {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin-bottom: 40px;
  }

  .rd-action-card {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    padding: 24px;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s;
    text-decoration: none;
    color: inherit;
  }
  .rd-action-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
    border-color: transparent;
  }
  .rd-action-card.primary:hover { box-shadow: 0 20px 25px -5px rgba(37,99,235,0.15); }
  .rd-action-card.success:hover { box-shadow: 0 20px 25px -5px rgba(22,163,74,0.15); }
  .rd-action-card.purple:hover { box-shadow: 0 20px 25px -5px rgba(147,51,234,0.15); }

  .rd-action-icon {
    width: 56px;
    height: 56px;
    border-radius: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 16px;
    font-size: 28px;
  }
  .rd-action-icon.primary { background: #eff6ff; color: #2563eb; }
  .rd-action-icon.success { background: #f0fdf4; color: #16a34a; }
  .rd-action-icon.purple { background: #faf5ff; color: #9333ea; }

  .rd-action-title {
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 4px;
  }
  .rd-action-desc {
    font-size: 0.8rem;
    color: #64748b;
  }

  /* Recent activity */
  .rd-activity {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 20px;
    padding: 24px;
  }
  .rd-activity-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 12px 0;
    border-bottom: 1px solid #f1f5f9;
  }
  .rd-activity-item:last-child { border-bottom: none; }
  .rd-activity-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #2563eb;
  }
  .rd-activity-dot.success { background: #16a34a; }
  .rd-activity-dot.purple { background: #9333ea; }
  .rd-activity-content {
    flex: 1;
  }
  .rd-activity-title {
    font-size: 0.9rem;
    font-weight: 500;
    margin-bottom: 2px;
  }
  .rd-activity-time {
    font-size: 0.75rem;
    color: #94a3b8;
  }

  /* Loading */
  .rd-loading {
    min-height: 400px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 16px;
  }
  .rd-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #e2e8f0;
    border-top-color: #2563eb;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .rd-loading-text { color: #94a3b8; font-size: 0.9rem; }
`;

function ReceptionDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    patients: 0,
    appointments: 0,
    ehr: 0,
    todayAppointments: 0
  });
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('');
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetchStats();
    setGreeting(getGreeting());
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  const fetchStats = async () => {
    try {
      const [patientsRes, appointmentsRes, ehrRes] = await Promise.all([
        axios.get('http://localhost:8081/api/patients'),
        axios.get('http://localhost:8082/api/appointments'),
        axios.get('http://localhost:8084/api/ehr')
      ]);

      const today = new Date().toDateString();
      const todayAppointments = appointmentsRes.data.filter(apt => 
        new Date(apt.appointmentDateTime).toDateString() === today
      ).length;

      // Créer une activité récente simulée
      const recent = [
        { type: 'patient', action: 'Nouveau patient enregistré', time: 'Il y a 5 minutes', icon: '👤' },
        { type: 'appointment', action: 'Rendez-vous confirmé', time: 'Il y a 15 minutes', icon: '📅' },
        { type: 'ehr', action: 'Dossier médical créé', time: 'Il y a 30 minutes', icon: '📋' }
      ];

      setStats({
        patients: patientsRes.data.length,
        appointments: appointmentsRes.data.length,
        ehr: ehrRes.data.length,
        todayAppointments
      });
      setRecentActivity(recent);
      setLoading(false);
    } catch (err) {
      console.error('Erreur chargement stats:', err);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <style>{styles}</style>
        <div className="rd-root">
          <div className="rd-loading">
            <div className="rd-spinner" />
            <span className="rd-loading-text">Chargement du tableau de bord...</span>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div className="rd-root">
        {/* Header */}
        <div className="rd-header">
          <div>
            <h1 className="rd-title">Tableau de bord</h1>
            <p className="rd-subtitle">Gérez les patients et les rendez-vous</p>
          </div>
        </div>

        {/* Welcome card */}
        <div className="rd-welcome">
          <div className="rd-welcome-content">
            <h2 className="rd-welcome-title">{greeting}, {user?.firstName || 'Agent'}!</h2>
            <p className="rd-welcome-text">
              Bienvenue dans votre espace réception. Vous pouvez gérer les patients, 
              les rendez-vous et les dossiers médicaux depuis ce tableau de bord.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="rd-stats-grid">
          {/* Patients */}
          <div
            className="rd-stat-card patients"
            onClick={() => navigate('/reception/patients')}
          >
            <div className="rd-stat-icon patients">
              <i className="bi bi-people-fill" />
            </div>
            <div className="rd-stat-value">{stats.patients}</div>
            <div className="rd-stat-label">Patients</div>
            <div className="rd-stat-trend neutral">
              <i className="bi bi-arrow-up" /> +{Math.floor(stats.patients * 0.1)} ce mois
            </div>
          </div>

          {/* Rendez-vous */}
          <div
            className="rd-stat-card appointments"
            onClick={() => navigate('/reception/appointments')}
          >
            <div className="rd-stat-icon appointments">
              <i className="bi bi-calendar-check-fill" />
            </div>
            <div className="rd-stat-value">{stats.appointments}</div>
            <div className="rd-stat-label">Rendez-vous</div>
            <div className="rd-stat-trend positive">
              <i className="bi bi-calendar-day" /> {stats.todayAppointments} aujourd'hui
            </div>
          </div>

          {/* Dossiers médicaux */}
          <div
            className="rd-stat-card ehr"
            onClick={() => navigate('/reception/ehr')}
          >
            <div className="rd-stat-icon ehr">
              <i className="bi bi-file-medical-fill" />
            </div>
            <div className="rd-stat-value">{stats.ehr}</div>
            <div className="rd-stat-label">Dossiers médicaux</div>
            <div className="rd-stat-trend neutral">
              <i className="bi bi-files" /> {stats.ehr} documents
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <h3 className="rd-section-title">
          <i className="bi bi-lightning-charge-fill" />
          Actions rapides
        </h3>

        <div className="rd-quick-actions">
          <div
            className="rd-action-card primary"
            onClick={() => navigate('/reception/patients')}
          >
            <div className="rd-action-icon primary">
              <i className="bi bi-person-plus-fill" />
            </div>
            <div className="rd-action-title">Nouveau patient</div>
            <div className="rd-action-desc">Enregistrer un nouveau patient</div>
          </div>

          <div
            className="rd-action-card success"
            onClick={() => navigate('/reception/appointments')}
          >
            <div className="rd-action-icon success">
              <i className="bi bi-calendar-plus-fill" />
            </div>
            <div className="rd-action-title">Nouveau rendez-vous</div>
            <div className="rd-action-desc">Planifier un rendez-vous</div>
          </div>

          <div
            className="rd-action-card purple"
            onClick={() => navigate('/reception/ehr')}
          >
            <div className="rd-action-icon purple">
              <i className="bi bi-file-plus-fill" />
            </div>
            <div className="rd-action-title">Nouveau dossier</div>
            <div className="rd-action-desc">Créer un dossier médical</div>
          </div>
        </div>

        {/* Recent activity */}
        <h3 className="rd-section-title">
          <i className="bi bi-clock-history" />
          Activité récente
        </h3>

        <div className="rd-activity">
          {recentActivity.map((activity, index) => (
            <div key={index} className="rd-activity-item">
              <div className={`rd-activity-dot ${activity.type === 'appointment' ? 'success' : activity.type === 'ehr' ? 'purple' : ''}`} />
              <div className="rd-activity-content">
                <div className="rd-activity-title">{activity.action}</div>
                <div className="rd-activity-time">{activity.time}</div>
              </div>
              <span style={{ fontSize: '1.2rem' }}>{activity.icon}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default ReceptionDashboard;