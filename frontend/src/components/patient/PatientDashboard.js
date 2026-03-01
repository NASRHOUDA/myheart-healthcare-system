import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Outfit:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; }

  .pd-root {
    max-width: 960px; margin: 0 auto;
    padding: 40px 28px; font-family: 'Outfit', sans-serif;
    background: #f8fafc; min-height: 100vh; color: #0f172a;
  }

  /* ── Loading ── */
  .pd-loading {
    min-height: 400px; display: flex; align-items: center;
    justify-content: center; flex-direction: column; gap: 12px;
  }
  .pd-spinner {
    width: 28px; height: 28px; border: 2px solid #e2e8f0;
    border-top-color: #2563eb; border-radius: 50%;
    animation: spin 0.75s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── Welcome hero ── */
  .pd-hero {
    background: white; border: 1px solid #e2e8f0;
    border-radius: 24px; padding: 28px 32px;
    margin-bottom: 20px;
    display: flex; align-items: center;
    justify-content: space-between; gap: 20px;
    flex-wrap: wrap;
    animation: fadeUp 0.4s ease both;
  }
  @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }

  .pd-greeting {
    font-family: 'Instrument Serif', serif;
    font-size: 1.9rem; font-weight: 400; color: #0f172a;
    margin: 0 0 4px; line-height: 1.1;
  }
  .pd-greeting em { font-style: italic; color: #2563eb; }
  .pd-date { font-size: 0.78rem; color: #94a3b8; font-weight: 300; }

  .pd-user-pill {
    display: flex; align-items: center; gap: 10px;
    background: #f8fafc; border: 1px solid #e2e8f0;
    border-radius: 100px; padding: 8px 16px 8px 10px;
  }
  .pd-user-avatar {
    width: 34px; height: 34px; border-radius: 50%;
    background: linear-gradient(135deg, #eff6ff, #dbeafe);
    border: 1px solid #bfdbfe;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.75rem; font-weight: 700; color: #2563eb;
  }
  .pd-user-name { font-size: 0.82rem; font-weight: 500; color: #0f172a; }
  .pd-user-role {
    font-size: 0.62rem; font-weight: 500; padding: 3px 8px;
    border-radius: 100px; background: #eff6ff;
    color: #2563eb; letter-spacing: 0.04em; text-transform: uppercase;
  }

  /* ── Stats ── */
  .pd-stats {
    display: grid; grid-template-columns: repeat(5,1fr);
    gap: 10px; margin-bottom: 20px;
    animation: fadeUp 0.4s 0.05s ease both;
  }
  .pd-stat {
    background: white; border: 1px solid #e2e8f0;
    border-radius: 14px; padding: 16px 14px;
    display: flex; align-items: center; gap: 12px;
    transition: box-shadow 0.15s;
  }
  .pd-stat:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
  .pd-stat-icon {
    width: 36px; height: 36px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.88rem; flex-shrink: 0;
  }
  .pd-stat-num {
    font-family: 'Instrument Serif', serif;
    font-size: 1.5rem; line-height: 1;
  }
  .pd-stat-lbl {
    font-size: 0.62rem; color: #94a3b8;
    text-transform: uppercase; letter-spacing: 0.06em; margin-top: 1px;
  }

  /* ── Next appointment banner ── */
  .pd-next {
    background: #0f172a; border-radius: 20px;
    padding: 22px 28px; margin-bottom: 20px;
    display: flex; align-items: center; justify-content: space-between;
    gap: 20px; flex-wrap: wrap;
    animation: fadeUp 0.4s 0.1s ease both;
    position: relative; overflow: hidden;
  }
  .pd-next::before {
    content: '';
    position: absolute; top: -40px; right: -40px;
    width: 160px; height: 160px; border-radius: 50%;
    background: rgba(37,99,235,0.12);
    pointer-events: none;
  }
  .pd-next-eyebrow {
    font-size: 0.62rem; font-weight: 500;
    letter-spacing: 0.1em; text-transform: uppercase;
    color: #60a5fa; margin-bottom: 8px;
    display: flex; align-items: center; gap: 6px;
  }
  .pd-next-eyebrow-dot {
    width: 5px; height: 5px; border-radius: 50%;
    background: #60a5fa;
    animation: dotP 2.5s ease-in-out infinite;
  }
  @keyframes dotP { 0%,100%{opacity:1} 50%{opacity:0.4} }
  .pd-next-doctor {
    font-family: 'Instrument Serif', serif;
    font-size: 1.3rem; color: white; font-weight: 400;
    margin-bottom: 6px;
  }
  .pd-next-meta {
    display: flex; gap: 16px; flex-wrap: wrap;
  }
  .pd-next-meta-item {
    display: flex; align-items: center; gap: 5px;
    font-size: 0.75rem; color: rgba(255,255,255,0.5);
  }
  .pd-next-btn {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 10px 18px; background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 12px; color: white; text-decoration: none;
    font-size: 0.78rem; font-weight: 500;
    font-family: 'Outfit', sans-serif;
    transition: all 0.15s; white-space: nowrap;
  }
  .pd-next-btn:hover {
    background: rgba(255,255,255,0.14);
    border-color: rgba(255,255,255,0.2);
  }

  /* ── Two column layout ── */
  .pd-cols {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 16px; margin-bottom: 16px;
    animation: fadeUp 0.4s 0.15s ease both;
  }

  /* ── Section card ── */
  .pd-section {
    background: white; border: 1px solid #e2e8f0;
    border-radius: 20px; padding: 22px 24px;
  }
  .pd-section-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 16px;
  }
  .pd-section-title {
    font-size: 0.82rem; font-weight: 600; color: #0f172a;
    display: flex; align-items: center; gap: 8px;
  }
  .pd-section-icon {
    width: 28px; height: 28px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.78rem;
  }
  .pd-section-link {
    font-size: 0.7rem; color: #2563eb; text-decoration: none;
    font-weight: 500; transition: opacity 0.15s;
  }
  .pd-section-link:hover { opacity: 0.7; }

  /* Mini appointment row */
  .pd-mini-apt {
    display: flex; align-items: center; gap: 12px;
    padding: 10px 12px; border-radius: 12px;
    background: #f8fafc; border: 1px solid #f1f5f9;
    margin-bottom: 8px; transition: border-color 0.12s;
  }
  .pd-mini-apt:hover { border-color: #e2e8f0; }
  .pd-mini-apt:last-child { margin-bottom: 0; }
  .pd-mini-date-box {
    width: 36px; height: 36px; border-radius: 10px;
    background: white; border: 1px solid #e2e8f0;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .pd-mini-day {
    font-family: 'Instrument Serif', serif;
    font-size: 1rem; line-height: 1; color: #0f172a;
  }
  .pd-mini-month {
    font-size: 0.5rem; color: #94a3b8;
    text-transform: uppercase; letter-spacing: 0.05em;
  }
  .pd-mini-info { flex: 1; min-width: 0; }
  .pd-mini-doctor { font-size: 0.78rem; font-weight: 500; color: #0f172a; }
  .pd-mini-time { font-size: 0.68rem; color: #94a3b8; }

  /* Mini badge */
  .pd-mini-badge {
    font-size: 0.58rem; font-weight: 500; padding: 3px 7px;
    border-radius: 100px; white-space: nowrap;
  }
  .mb-scheduled { background: #eff6ff; color: #2563eb; }
  .mb-confirmed  { background: #d1fae5; color: #065f46; }
  .mb-completed  { background: #f3e8ff; color: #7c3aed; }
  .mb-cancelled  { background: #fee2e2; color: #991b1b; }

  /* Mini prescription row */
  .pd-mini-presc {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 12px; border-radius: 12px;
    background: #f8fafc; border: 1px solid #f1f5f9;
    margin-bottom: 8px;
  }
  .pd-mini-presc:last-child { margin-bottom: 0; }
  .pd-presc-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: #059669; flex-shrink: 0;
  }
  .pd-presc-name { font-size: 0.78rem; font-weight: 500; color: #0f172a; }
  .pd-presc-dosage { font-size: 0.68rem; color: #94a3b8; }

  /* Mini lab result row */
  .pd-mini-lab {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 12px; border-radius: 12px;
    background: #f8fafc; border: 1px solid #f1f5f9;
    margin-bottom: 8px;
  }
  .pd-mini-lab:last-child { margin-bottom: 0; }
  .pd-lab-icon {
    width: 28px; height: 28px; border-radius: 8px;
    background: #faf5ff; color: #9333ea;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.8rem; flex-shrink: 0;
  }
  .pd-lab-name { font-size: 0.78rem; font-weight: 500; color: #0f172a; }
  .pd-lab-result {
    font-size: 0.68rem; color: #64748b;
    display: flex; align-items: center; gap: 4px;
  }
  .pd-lab-result-normal { color: #16a34a; }
  .pd-lab-result-abnormal { color: #dc2626; }

  /* ── Quick actions ── */
  .pd-actions {
    display: grid; grid-template-columns: repeat(4,1fr);
    gap: 10px; animation: fadeUp 0.4s 0.2s ease both;
  }
  .pd-action {
    background: white; border: 1px solid #e2e8f0;
    border-radius: 16px; padding: 18px 16px;
    text-decoration: none; text-align: center;
    transition: all 0.15s; display: block;
  }
  .pd-action:hover {
    border-color: var(--ac);
    box-shadow: 0 4px 16px rgba(0,0,0,0.06);
    transform: translateY(-2px);
  }
  .pd-action-icon {
    width: 40px; height: 40px; border-radius: 12px;
    background: var(--abg); border: 1px solid var(--ab);
    display: flex; align-items: center; justify-content: center;
    font-size: 1rem; margin: 0 auto 10px; color: var(--ac);
  }
  .pd-action-label {
    font-size: 0.78rem; font-weight: 500; color: #0f172a;
    margin-bottom: 2px;
  }
  .pd-action-sub { font-size: 0.65rem; color: #94a3b8; }

  /* ── Tip ── */
  .pd-tip {
    margin-top: 16px; padding: 14px 18px;
    background: white; border: 1px solid #e2e8f0;
    border-radius: 14px; display: flex; align-items: center; gap: 10px;
    font-size: 0.75rem; color: #64748b;
    animation: fadeUp 0.4s 0.25s ease both;
  }
  .pd-tip-icon {
    width: 30px; height: 30px; border-radius: 8px;
    background: #fef9c3; border: 1px solid #fef08a;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.85rem; flex-shrink: 0;
  }

  /* Empty */
  .pd-mini-empty {
    text-align: center; padding: 20px 10px;
    font-size: 0.75rem; color: #94a3b8;
  }

  @media (max-width: 680px) {
    .pd-root { padding: 24px 16px; }
    .pd-stats { grid-template-columns: repeat(2,1fr); }
    .pd-cols  { grid-template-columns: 1fr; }
    .pd-actions { grid-template-columns: 1fr 1fr; }
    .pd-hero { flex-direction: column; align-items: flex-start; }
  }
`;

const badgeCfg = {
  SCHEDULED: { cls: 'mb-scheduled', label: 'Planifié' },
  CONFIRMED:  { cls: 'mb-confirmed',  label: 'Confirmé' },
  COMPLETED:  { cls: 'mb-completed',  label: 'Terminé'  },
  CANCELLED:  { cls: 'mb-cancelled',  label: 'Annulé'   },
};

function PatientDashboard() {
  const { user } = useAuth();
  const [appointments,   setAppointments]   = useState([]);
  const [prescriptions,  setPrescriptions]  = useState([]);
  const [labResults,     setLabResults]     = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [currentTime,    setCurrentTime]    = useState(new Date());

  useEffect(() => {
    fetchData();
    const t = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const fetchData = async () => {
    try {
      const patientId = user?.patientId || user?.id;
      
      // Récupérer les rendez-vous, prescriptions et résultats de laboratoire
      const [aptRes, prescRes, labRes] = await Promise.allSettled([
        axios.get(`http://localhost:8082/api/appointments/patient/${patientId}`),
        axios.get(`http://localhost:8087/api/prescriptions/patient/${patientId}`),
        axios.get(`http://localhost:8085/api/lab/patient/${patientId}`),
      ]);
      
      if (aptRes.status === 'fulfilled') setAppointments(aptRes.value.data || []);
      if (prescRes.status === 'fulfilled') setPrescriptions(prescRes.value.data || []);
      if (labRes.status === 'fulfilled') {
        // Filtrer pour n'avoir que les analyses terminées
        const completedResults = labRes.value.data.filter(l => l.status === 'COMPLETED');
        setLabResults(completedResults || []);
      }
    } catch (err) {
      console.error('Erreur chargement données:', err);
    }
    setLoading(false);
  };

  const now     = new Date();
  const hour    = now.getHours();
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';

  const upcoming = appointments
    .filter(a => new Date(a.appointmentDateTime) > now && a.status !== 'CANCELLED')
    .sort((a,b) => new Date(a.appointmentDateTime) - new Date(b.appointmentDateTime));

  const nextApt        = upcoming[0];
  const activePrescript = prescriptions.filter(p => p.status === 'ACTIVE');
  const recentLabResults = labResults.slice(0, 3); // 3 derniers résultats
  
  const getInitials    = () => `${user?.firstName?.[0]||''}${user?.lastName?.[0]||''}`.toUpperCase();

  const dateStr = currentTime.toLocaleDateString('fr-FR', {
    weekday:'long', day:'numeric', month:'long', year:'numeric'
  });

  const getResultClass = (result) => {
    if (!result) return '';
    const lower = result.toLowerCase();
    if (lower.includes('normal') || lower.includes('négatif') || lower.includes('negatif')) return 'pd-lab-result-normal';
    if (lower.includes('anormal') || lower.includes('positif')) return 'pd-lab-result-abnormal';
    return '';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) return (
    <>
      <style>{styles}</style>
      <div className="pd-loading">
        <div className="pd-spinner" />
        <span style={{fontSize:'0.78rem', color:'#94a3b8'}}>Chargement…</span>
      </div>
    </>
  );

  return (
    <>
      <style>{styles}</style>
      <div className="pd-root">

        {/* ── Hero ── */}
        <div className="pd-hero">
          <div>
            <h1 className="pd-greeting">
              {greeting}, <em>{user?.firstName}</em> !
            </h1>
            <p className="pd-date">{dateStr.charAt(0).toUpperCase() + dateStr.slice(1)}</p>
          </div>
          <div className="pd-user-pill">
            <div className="pd-user-avatar">{getInitials()}</div>
            <span className="pd-user-name">{user?.firstName} {user?.lastName}</span>
            <span className="pd-user-role">Patient</span>
          </div>
        </div>

        {/* ── Stats (5 colonnes) ── */}
        <div className="pd-stats">
          {[
            { num: appointments.length,                                  lbl: 'Total RDV',       icon: 'bi-calendar3',      ibg:'#f1f5f9', ic:'#475569', nc:'#0f172a' },
            { num: upcoming.length,                                      lbl: 'À venir',          icon: 'bi-calendar-check', ibg:'#eff6ff', ic:'#2563eb', nc:'#2563eb' },
            { num: appointments.filter(a=>a.status==='COMPLETED').length,lbl: 'Consultations',    icon: 'bi-check2-circle',  ibg:'#f3e8ff', ic:'#7c3aed', nc:'#7c3aed' },
            { num: activePrescript.length,                               lbl: 'Prescriptions',    icon: 'bi-capsule',        ibg:'#f0fdf4', ic:'#059669', nc:'#059669' },
            { num: labResults.length,                                    lbl: 'Analyses',         icon: 'bi-flask',          ibg:'#faf5ff', ic:'#9333ea', nc:'#9333ea' },
          ].map((s,i) => (
            <div key={i} className="pd-stat">
              <div className="pd-stat-icon" style={{background:s.ibg}}>
                <i className={`bi ${s.icon}`} style={{color:s.ic}} />
              </div>
              <div>
                <div className="pd-stat-num" style={{color:s.nc}}>{s.num}</div>
                <div className="pd-stat-lbl">{s.lbl}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Next appointment banner ── */}
        {nextApt && (
          <div className="pd-next">
            <div>
              <div className="pd-next-eyebrow">
                <div className="pd-next-eyebrow-dot" />
                Prochain rendez-vous
              </div>
              <div className="pd-next-doctor">
                {nextApt.doctorName ? `Dr. ${nextApt.doctorName}` : `Dr. #${nextApt.doctorId}`}
              </div>
              <div className="pd-next-meta">
                <div className="pd-next-meta-item">
                  <i className="bi bi-calendar3" />
                  {new Date(nextApt.appointmentDateTime).toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'})}
                </div>
                <div className="pd-next-meta-item">
                  <i className="bi bi-clock" />
                  {new Date(nextApt.appointmentDateTime).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}
                </div>
                {nextApt.reason && (
                  <div className="pd-next-meta-item">
                    <i className="bi bi-chat-square-text" />
                    {nextApt.reason}
                  </div>
                )}
              </div>
            </div>
            <Link to="/patient/appointments" className="pd-next-btn">
              Voir tous les RDV <i className="bi bi-arrow-right" />
            </Link>
          </div>
        )}

        {/* ── Two columns ── */}
        <div className="pd-cols">

          {/* Upcoming appointments */}
          <div className="pd-section">
            <div className="pd-section-header">
              <div className="pd-section-title">
                <div className="pd-section-icon" style={{background:'#eff6ff'}}>
                  <i className="bi bi-calendar-check" style={{color:'#2563eb'}} />
                </div>
                Rendez-vous à venir
              </div>
              <Link to="/patient/appointments" className="pd-section-link">Voir tout</Link>
            </div>
            {upcoming.length === 0 ? (
              <div className="pd-mini-empty">
                <i className="bi bi-calendar3" style={{display:'block',fontSize:'1.5rem',marginBottom:'6px',color:'#e2e8f0'}} />
                Aucun rendez-vous à venir
              </div>
            ) : (
              upcoming.slice(0,4).map(apt => {
                const d = new Date(apt.appointmentDateTime);
                const b = badgeCfg[apt.status] || badgeCfg.SCHEDULED;
                return (
                  <div key={apt.id} className="pd-mini-apt">
                    <div className="pd-mini-date-box">
                      <div className="pd-mini-day">{d.getDate()}</div>
                      <div className="pd-mini-month">{d.toLocaleDateString('fr-FR',{month:'short'}).replace('.','')}</div>
                    </div>
                    <div className="pd-mini-info">
                      <div className="pd-mini-doctor">
                        {apt.doctorName ? `Dr. ${apt.doctorName}` : `Dr. #${apt.doctorId}`}
                      </div>
                      <div className="pd-mini-time">
                        {d.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}
                        {apt.reason ? ` · ${apt.reason}` : ''}
                      </div>
                    </div>
                    <span className={`pd-mini-badge ${b.cls}`}>{b.label}</span>
                  </div>
                );
              })
            )}
          </div>

          {/* Active prescriptions */}
          <div className="pd-section">
            <div className="pd-section-header">
              <div className="pd-section-title">
                <div className="pd-section-icon" style={{background:'#f0fdf4'}}>
                  <i className="bi bi-capsule" style={{color:'#059669'}} />
                </div>
                Prescriptions actives
              </div>
              <Link to="/patient/prescriptions" className="pd-section-link">Voir tout</Link>
            </div>
            {activePrescript.length === 0 ? (
              <div className="pd-mini-empty">
                <i className="bi bi-capsule" style={{display:'block',fontSize:'1.5rem',marginBottom:'6px',color:'#e2e8f0'}} />
                Aucune prescription active
              </div>
            ) : (
              activePrescript.slice(0,4).map(p => (
                <div key={p.id} className="pd-mini-presc">
                  <div className="pd-presc-dot" />
                  <div>
                    <div className="pd-presc-name">{p.medicationName}</div>
                    <div className="pd-presc-dosage">{p.dosage}{p.frequency ? ` · ${p.frequency}` : ''}</div>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>

        {/* ── Résultats de laboratoire récents (nouvelle section) ── */}
        {labResults.length > 0 && (
          <div className="pd-section" style={{ marginBottom: '16px' }}>
            <div className="pd-section-header">
              <div className="pd-section-title">
                <div className="pd-section-icon" style={{background:'#faf5ff'}}>
                  <i className="bi bi-flask" style={{color:'#9333ea'}} />
                </div>
                Résultats d'analyses récents
              </div>
              <Link to="/patient/lab-results" className="pd-section-link">Voir tout</Link>
            </div>
            {recentLabResults.map(result => {
              const resultClass = getResultClass(result.result);
              return (
                <div key={result._id} className="pd-mini-lab">
                  <div className="pd-lab-icon">
                    <i className="bi bi-flask" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="pd-lab-name">{result.testName}</div>
                    <div className="pd-lab-result">
                      <span className={resultClass}>
                        {result.result?.substring(0, 30)}...
                      </span>
                      <span style={{ marginLeft: '8px', color: '#94a3b8' }}>
                        {formatDate(result.date || result.completedDate)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Quick actions (4 actions) ── */}
        <div className="pd-actions">
          {[
            { to:'/patient/appointments', icon:'bi-calendar-check', label:'Mes rendez-vous', sub:'Voir l\'historique', ac:'#2563eb', abg:'#eff6ff', ab:'#bfdbfe' },
            { to:'/patient/prescriptions',icon:'bi-capsule',        label:'Mes prescriptions',sub:'Traitements actifs', ac:'#059669', abg:'#f0fdf4', ab:'#bbf7d0' },
            { to:'/patient/medications',  icon:'bi-bag-plus',       label:'Médicaments',     sub:'Informations',       ac:'#ca8a04', abg:'#fefce8', ab:'#fef08a' },
            { to:'/patient/lab-results',  icon:'bi-flask',          label:'Analyses',        sub:'Résultats labo',     ac:'#9333ea', abg:'#faf5ff', ab:'#d8b4fe' },
          ].map((a,i) => (
            <Link
              key={i}
              to={a.to}
              className="pd-action"
              style={{'--ac':a.ac,'--abg':a.abg,'--ab':a.ab}}
            >
              <div className="pd-action-icon">
                <i className={`bi ${a.icon}`} />
              </div>
              <div className="pd-action-label">{a.label}</div>
              <div className="pd-action-sub">{a.sub}</div>
            </Link>
          ))}
        </div>

        {/* ── Tip ── */}
        <div className="pd-tip">
          <div className="pd-tip-icon">💡</div>
          <span>N'oubliez pas de prendre vos traitements aux heures prescrites. Consultez régulièrement vos résultats d'analyses.</span>
        </div>

      </div>
    </>
  );
}

export default PatientDashboard;