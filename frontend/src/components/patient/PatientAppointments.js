import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Outfit:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; }

  .pa-root {
    max-width: 860px; margin: 0 auto;
    padding: 40px 28px; font-family: 'Outfit', sans-serif;
    background: #f8fafc; min-height: 100vh;
  }

  /* ── Header ── */
  .pa-header {
    display: flex; justify-content: space-between;
    align-items: flex-end; margin-bottom: 32px;
    flex-wrap: wrap; gap: 12px;
  }
  .pa-title {
    font-family: 'Instrument Serif', serif;
    font-size: 1.9rem; font-weight: 400; color: #0f172a;
    margin: 0 0 3px; line-height: 1;
  }
  .pa-subtitle { font-size: 0.78rem; color: #94a3b8; font-weight: 300; margin: 0; }

  /* ── Stats row ── */
  .pa-stats {
    display: grid; grid-template-columns: repeat(4,1fr);
    gap: 10px; margin-bottom: 28px;
  }
  .pa-stat {
    background: white; border: 1px solid #e2e8f0;
    border-radius: 14px; padding: 16px 14px;
    display: flex; align-items: center; gap: 12px;
    transition: box-shadow 0.15s;
  }
  .pa-stat:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.04); }
  .pa-stat-icon {
    width: 36px; height: 36px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.9rem; flex-shrink: 0;
  }
  .pa-stat-num {
    font-family: 'Instrument Serif', serif;
    font-size: 1.5rem; line-height: 1; color: #0f172a;
  }
  .pa-stat-lbl {
    font-size: 0.62rem; color: #94a3b8;
    text-transform: uppercase; letter-spacing: 0.06em;
    margin-top: 1px;
  }

  /* ── Toolbar ── */
  .pa-toolbar {
    display: flex; justify-content: space-between;
    align-items: center; margin-bottom: 20px;
    gap: 12px; flex-wrap: wrap;
  }
  .pa-filters {
    display: flex; gap: 3px;
    background: white; border: 1px solid #e2e8f0;
    border-radius: 12px; padding: 4px;
  }
  .pa-filter {
    padding: 6px 14px; border: none; background: none;
    font-family: 'Outfit', sans-serif; font-size: 0.76rem;
    font-weight: 400; color: #94a3b8; border-radius: 9px;
    cursor: pointer; transition: all 0.15s; white-space: nowrap;
  }
  .pa-filter:hover { color: #475569; }
  .pa-filter.active { background: #0f172a; color: white; font-weight: 500; }
  .pa-count { font-size: 0.7rem; color: #94a3b8; }

  /* ── Loading ── */
  .pa-loading {
    min-height: 300px; display: flex; align-items: center;
    justify-content: center; flex-direction: column; gap: 12px;
  }
  .pa-spinner {
    width: 28px; height: 28px; border: 2px solid #e2e8f0;
    border-top-color: #2563eb; border-radius: 50%;
    animation: spin 0.75s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── Empty ── */
  .pa-empty {
    background: white; border: 1px dashed #e2e8f0;
    border-radius: 20px; padding: 60px 20px; text-align: center;
  }
  .pa-empty-icon { font-size: 2rem; color: #e2e8f0; margin-bottom: 12px; }
  .pa-empty-title { font-size: 0.95rem; font-weight: 500; color: #334155; margin-bottom: 5px; }
  .pa-empty-sub { font-size: 0.78rem; color: #94a3b8; max-width: 280px; margin: 0 auto 18px; line-height: 1.5; }
  .pa-info-box {
    display: inline-flex; align-items: center; gap: 7px;
    background: #eff6ff; border: 1px solid #bfdbfe;
    border-radius: 10px; padding: 8px 14px;
    font-size: 0.75rem; color: #1e40af;
  }

  /* ── Month group ── */
  .pa-month-label {
    font-size: 0.68rem; font-weight: 500;
    letter-spacing: 0.1em; text-transform: uppercase;
    color: #94a3b8; margin: 24px 0 10px;
    display: flex; align-items: center; gap: 10px;
  }
  .pa-month-label::after {
    content: ''; flex: 1; height: 1px; background: #f1f5f9;
  }
  .pa-month-label:first-child { margin-top: 0; }

  /* ── Appointment card ── */
  .pa-card {
    background: white; border: 1px solid #e2e8f0;
    border-radius: 16px; padding: 18px 20px;
    margin-bottom: 8px;
    display: grid;
    grid-template-columns: 48px 1px 1fr auto;
    gap: 0 16px; align-items: center;
    transition: all 0.18s;
    animation: cardIn 0.3s ease both;
  }
  .pa-card:hover {
    border-color: #cbd5e1;
    box-shadow: 0 4px 16px rgba(0,0,0,0.05);
    transform: translateY(-1px);
  }
  @keyframes cardIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }

  /* Date col */
  .pa-date-col { text-align: center; }
  .pa-date-day {
    font-family: 'Instrument Serif', serif;
    font-size: 1.6rem; line-height: 1; color: #0f172a;
  }
  .pa-date-dow {
    font-size: 0.58rem; text-transform: uppercase;
    letter-spacing: 0.08em; color: #94a3b8; font-weight: 500;
  }

  /* Sep */
  .pa-sep { background: #f1f5f9; align-self: stretch; }

  /* Body col */
  .pa-body {}
  .pa-body-top {
    display: flex; align-items: center; gap: 8px;
    margin-bottom: 5px;
  }
  .pa-doctor {
    font-size: 0.88rem; font-weight: 600; color: #0f172a;
  }
  .pa-body-meta {
    display: flex; gap: 14px; flex-wrap: wrap;
  }
  .pa-meta-item {
    display: flex; align-items: center; gap: 4px;
    font-size: 0.72rem; color: #94a3b8;
  }
  .pa-reason {
    font-size: 0.75rem; color: #64748b;
    margin-top: 4px;
  }

  /* Right col */
  .pa-right {
    display: flex; flex-direction: column;
    align-items: flex-end; gap: 6px;
  }

  /* Badge */
  .pa-badge {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 0.62rem; font-weight: 500; padding: 4px 10px;
    border-radius: 100px; white-space: nowrap;
    letter-spacing: 0.02em;
  }
  .pa-badge-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }
  .b-scheduled { background: #eff6ff; color: #2563eb; }
  .b-scheduled .pa-badge-dot { background: #2563eb; }
  .b-confirmed  { background: #d1fae5; color: #065f46; }
  .b-confirmed  .pa-badge-dot { background: #059669; }
  .b-completed  { background: #f3e8ff; color: #7c3aed; }
  .b-completed  .pa-badge-dot { background: #7c3aed; }
  .b-cancelled  { background: #fee2e2; color: #991b1b; }
  .b-cancelled  .pa-badge-dot { background: #dc2626; }
  .b-past       { background: #f1f5f9; color: #64748b; }
  .b-past       .pa-badge-dot { background: #94a3b8; }

  /* Time chip */
  .pa-time {
    font-size: 0.7rem; color: #94a3b8; font-weight: 400;
    background: #f8fafc; border: 1px solid #f1f5f9;
    border-radius: 6px; padding: 3px 8px;
  }

  @media (max-width: 580px) {
    .pa-root { padding: 24px 16px; }
    .pa-stats { grid-template-columns: repeat(2,1fr); }
    .pa-card { grid-template-columns: 1fr; gap: 10px; }
    .pa-sep { display: none; }
    .pa-right { flex-direction: row; align-items: center; }
  }
`;

const badgeCfg = {
  SCHEDULED: { cls: 'b-scheduled', label: 'Planifié' },
  CONFIRMED:  { cls: 'b-confirmed',  label: 'Confirmé' },
  COMPLETED:  { cls: 'b-completed',  label: 'Terminé'  },
  CANCELLED:  { cls: 'b-cancelled',  label: 'Annulé'   },
};

const statIcons = [
  { icon: 'bi-calendar3',      bg: '#f1f5f9', color: '#475569' },
  { icon: 'bi-calendar-check', bg: '#eff6ff', color: '#2563eb' },
  { icon: 'bi-check2-circle',  bg: '#f3e8ff', color: '#7c3aed' },
  { icon: 'bi-x-circle',       bg: '#fee2e2', color: '#dc2626' },
];

function PatientAppointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [filter, setFilter]             = useState('all');

  useEffect(() => { if (user) fetchAppointments(); }, [user]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const patientId = user?.patientId || user?.id;
      if (!patientId) { setLoading(false); return; }
      const res = await axios.get(`http://localhost:8082/api/appointments/patient/${patientId}`);
      setAppointments(res.data);
    } catch {}
    setLoading(false);
  };

  const now = new Date();

  const getFiltered = () => {
    switch (filter) {
      case 'upcoming':  return appointments.filter(a => new Date(a.appointmentDateTime) > now && a.status !== 'CANCELLED');
      case 'past':      return appointments.filter(a => new Date(a.appointmentDateTime) <= now || a.status === 'COMPLETED');
      case 'cancelled': return appointments.filter(a => a.status === 'CANCELLED');
      default:          return appointments;
    }
  };

  const getBadge = (status, date) => {
    const isPast = new Date(date) < now && status !== 'COMPLETED' && status !== 'CANCELLED';
    if (isPast && status === 'SCHEDULED') return { cls: 'b-past', label: 'Passé' };
    return badgeCfg[status] || badgeCfg.SCHEDULED;
  };

  const stats = [
    { num: appointments.length,                                                                               lbl: 'Total',    color: '#0f172a' },
    { num: appointments.filter(a => new Date(a.appointmentDateTime) > now && a.status !== 'CANCELLED').length, lbl: 'À venir',  color: '#2563eb' },
    { num: appointments.filter(a => a.status === 'COMPLETED').length,                                         lbl: 'Terminés', color: '#7c3aed' },
    { num: appointments.filter(a => a.status === 'CANCELLED').length,                                         lbl: 'Annulés',  color: '#dc2626' },
  ];

  // Grouper par mois
  const filtered = getFiltered().sort((a,b) => new Date(b.appointmentDateTime) - new Date(a.appointmentDateTime));

  const grouped = filtered.reduce((acc, apt) => {
    const key = new Date(apt.appointmentDateTime).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    if (!acc[key]) acc[key] = [];
    acc[key].push(apt);
    return acc;
  }, {});

  const filters = [
    { id: 'all',       label: 'Tous'    },
    { id: 'upcoming',  label: 'À venir' },
    { id: 'past',      label: 'Passés'  },
    { id: 'cancelled', label: 'Annulés' },
  ];

  if (loading) return (
    <>
      <style>{styles}</style>
      <div className="pa-loading">
        <div className="pa-spinner" />
        <span style={{fontSize:'0.78rem', color:'#94a3b8'}}>Chargement…</span>
      </div>
    </>
  );

  return (
    <>
      <style>{styles}</style>
      <div className="pa-root">

        {/* Header */}
        <div className="pa-header">
          <div>
            <h1 className="pa-title">Mes rendez-vous</h1>
            <p className="pa-subtitle">Historique et suivi de vos consultations médicales</p>
          </div>
        </div>

        {/* Stats */}
        <div className="pa-stats">
          {stats.map((s, i) => (
            <div key={i} className="pa-stat">
              <div className="pa-stat-icon" style={{background: statIcons[i].bg}}>
                <i className={`bi ${statIcons[i].icon}`} style={{color: statIcons[i].color}} />
              </div>
              <div>
                <div className="pa-stat-num" style={{color: s.color}}>{s.num}</div>
                <div className="pa-stat-lbl">{s.lbl}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="pa-toolbar">
          <div className="pa-filters">
            {filters.map(f => (
              <button
                key={f.id}
                className={`pa-filter${filter === f.id ? ' active' : ''}`}
                onClick={() => setFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
          <span className="pa-count">{filtered.length} résultat{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="pa-empty">
            <div className="pa-empty-icon"><i className="bi bi-calendar3" /></div>
            <div className="pa-empty-title">Aucun rendez-vous</div>
            <p className="pa-empty-sub">Vous n'avez pas de rendez-vous dans cette catégorie.</p>
            <div className="pa-info-box">
              <i className="bi bi-telephone" />
              Contactez l'accueil pour prendre rendez-vous
            </div>
          </div>
        ) : (
          Object.entries(grouped).map(([month, apts]) => (
            <div key={month}>
              <div className="pa-month-label">{month}</div>
              {apts.map((apt, i) => {
                const d     = new Date(apt.appointmentDateTime);
                const badge = getBadge(apt.status, apt.appointmentDateTime);
                const dow   = d.toLocaleDateString('fr-FR', {weekday:'short'}).replace('.','');
                const time  = d.toLocaleTimeString('fr-FR', {hour:'2-digit', minute:'2-digit'});
                return (
                  <div key={apt.id} className="pa-card" style={{animationDelay:`${i*35}ms`}}>

                    {/* Date */}
                    <div className="pa-date-col">
                      <div className="pa-date-day">{d.getDate()}</div>
                      <div className="pa-date-dow">{dow}</div>
                    </div>

                    {/* Sep */}
                    <div className="pa-sep" />

                    {/* Body */}
                    <div className="pa-body">
                      <div className="pa-body-top">
                        <span className="pa-doctor">
                          {apt.doctorName ? `Dr. ${apt.doctorName}` : apt.doctorId ? `Dr. #${apt.doctorId}` : 'Médecin'}
                        </span>
                      </div>
                      <div className="pa-body-meta">
                        <div className="pa-meta-item">
                          <i className="bi bi-clock" />
                          {time}
                        </div>
                        {apt.reason && (
                          <div className="pa-meta-item">
                            <i className="bi bi-chat-square-text" />
                            {apt.reason}
                          </div>
                        )}
                      </div>
                      {apt.notes && (
                        <div className="pa-reason" style={{fontStyle:'italic', color:'#94a3b8', marginTop:'5px'}}>
                          {apt.notes}
                        </div>
                      )}
                    </div>

                    {/* Right */}
                    <div className="pa-right">
                      <span className={`pa-badge ${badge.cls}`}>
                        <span className="pa-badge-dot" />
                        {badge.label}
                      </span>
                    </div>

                  </div>
                );
              })}
            </div>
          ))
        )}

      </div>
    </>
  );
}

export default PatientAppointments;