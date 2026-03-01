import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Outfit:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .ml-root {
    display: flex;
    height: 100vh;
    background: #050c1a;
    font-family: 'Outfit', sans-serif;
    overflow: hidden;
  }

  /* ========== SIDEBAR ========== */
  .ml-sidebar {
    width: 240px;
    flex-shrink: 0;
    background: rgba(255,255,255,0.02);
    border-right: 1px solid rgba(255,255,255,0.06);
    display: flex;
    flex-direction: column;
    padding: 24px 16px;
    position: relative;
    z-index: 10;
    backdrop-filter: blur(20px);
    transition: width 0.2s ease;
  }

  /* Ambient orb in sidebar */
  .ml-sidebar::before {
    content: '';
    position: absolute;
    top: -60px; left: -60px;
    width: 220px; height: 220px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%);
    pointer-events: none;
    filter: blur(40px);
  }

  /* Logo */
  .ml-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0 8px;
    margin-bottom: 32px;
  }
  .ml-logo-icon {
    width: 34px; height: 34px;
    background: linear-gradient(135deg, #2563eb, #1d4ed8);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.95rem; color: white;
    box-shadow: 0 4px 14px rgba(37,99,235,0.4);
    flex-shrink: 0;
  }
  .ml-logo-text {
    font-family: 'Instrument Serif', serif;
    font-size: 1.2rem; color: white; font-weight: 400;
  }

  /* User card */
  .ml-user-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 16px;
    padding: 14px;
    margin-bottom: 28px;
    position: relative;
  }
  .ml-user-avatar {
    width: 42px; height: 42px;
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.85rem; font-weight: 700;
    margin-bottom: 10px;
    border: 1px solid var(--rc);
    background: var(--rbg);
    color: var(--rc);
  }
  .ml-user-name {
    font-size: 0.88rem; font-weight: 500; color: white;
    margin-bottom: 4px; line-height: 1.2;
  }
  .ml-user-pill {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 3px 9px 3px 6px;
    border-radius: 100px;
    border: 1px solid var(--rc);
    background: var(--rbg);
  }
  .ml-user-pill-dot {
    width: 5px; height: 5px; border-radius: 50%;
    background: var(--rc);
    animation: dotPulse 2.5s ease-in-out infinite;
  }
  @keyframes dotPulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
  .ml-user-pill-text {
    font-size: 0.62rem; font-weight: 500;
    color: var(--rc); letter-spacing: 0.04em; text-transform: uppercase;
  }

  /* Role colors - AJOUT DE BILLING */
  .ml-role-patient   { --rc: #60a5fa; --rbg: rgba(96,165,250,0.08); }
  .ml-role-doctor    { --rc: #34d399; --rbg: rgba(52,211,153,0.08); }
  .ml-role-reception { --rc: #22d3ee; --rbg: rgba(34,211,238,0.08); }
  .ml-role-pharmacy  { --rc: #fbbf24; --rbg: rgba(251,191,36,0.08); }
  .ml-role-lab       { --rc: #f87171; --rbg: rgba(248,113,113,0.08); }
  .ml-role-billing   { --rc: #a78bfa; --rbg: rgba(167,139,250,0.08); }
  .ml-role-admin     { --rc: #a78bfa; --rbg: rgba(167,139,250,0.08); }

  /* Nav section label */
  .ml-nav-label {
    font-size: 0.6rem; font-weight: 500;
    letter-spacing: 0.1em; text-transform: uppercase;
    color: rgba(255,255,255,0.2);
    padding: 0 8px; margin-bottom: 8px;
  }

  /* Nav */
  .ml-nav { flex: 1; display: flex; flex-direction: column; gap: 3px; }

  .ml-nav-item {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 12px;
    border: none; background: none;
    font-family: 'Outfit', sans-serif;
    font-size: 0.82rem; font-weight: 400;
    color: rgba(255,255,255,0.35);
    border-radius: 12px;
    cursor: pointer;
    text-align: left; width: 100%;
    transition: all 0.15s;
    position: relative;
    white-space: nowrap;
  }
  .ml-nav-item:hover {
    color: rgba(255,255,255,0.7);
    background: rgba(255,255,255,0.04);
  }
  .ml-nav-item.active {
    color: white;
    background: rgba(255,255,255,0.07);
    font-weight: 500;
  }
  .ml-nav-item.active::before {
    content: '';
    position: absolute; left: 0; top: 20%; bottom: 20%;
    width: 3px; border-radius: 0 3px 3px 0;
    background: var(--rc, #60a5fa);
  }
  .ml-nav-icon {
    width: 30px; height: 30px;
    border-radius: 9px;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.85rem; flex-shrink: 0;
    background: rgba(255,255,255,0.04);
    transition: background 0.15s;
  }
  .ml-nav-item.active .ml-nav-icon {
    background: var(--rbg, rgba(96,165,250,0.1));
  }

  /* Divider */
  .ml-divider {
    height: 1px;
    background: rgba(255,255,255,0.05);
    margin: 12px 0;
  }

  /* Logout */
  .ml-logout {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 12px;
    border: 1px solid rgba(248,113,113,0.15);
    background: rgba(248,113,113,0.04);
    border-radius: 12px;
    color: rgba(248,113,113,0.6);
    font-size: 0.82rem; font-weight: 400;
    font-family: 'Outfit', sans-serif;
    cursor: pointer; width: 100%;
    transition: all 0.15s;
  }
  .ml-logout:hover {
    background: rgba(248,113,113,0.1);
    border-color: rgba(248,113,113,0.3);
    color: #f87171;
  }
  .ml-logout-icon {
    width: 30px; height: 30px;
    border-radius: 9px;
    background: rgba(248,113,113,0.08);
    display: flex; align-items: center; justify-content: center;
    font-size: 0.85rem;
  }

  /* ========== MAIN CONTENT ========== */
  .ml-main {
    flex: 1;
    background: #f8fafc;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
  }

  /* Top bar */
  .ml-topbar {
    height: 60px;
    background: white;
    border-bottom: 1px solid #e2e8f0;
    display: flex; align-items: center;
    padding: 0 28px;
    justify-content: space-between;
    flex-shrink: 0;
    position: sticky; top: 0; z-index: 5;
  }
  .ml-topbar-title {
    font-family: 'Instrument Serif', serif;
    font-size: 1.1rem; font-weight: 400; color: #0f172a;
  }
  .ml-topbar-right {
    display: flex; align-items: center; gap: 12px;
  }
  .ml-topbar-time {
    font-size: 0.72rem; color: #94a3b8; font-weight: 300;
  }
  .ml-topbar-status {
    display: flex; align-items: center; gap: 5px;
    font-size: 0.7rem; color: #94a3b8;
  }
  .ml-topbar-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: #34d399;
    box-shadow: 0 0 6px rgba(52,211,153,0.5);
    animation: dotPulse 2.5s ease-in-out infinite;
  }

  /* Page content area */
  .ml-page {
    flex: 1;
    padding: 0;
  }

  @media (max-width: 768px) {
    .ml-sidebar { width: 64px; padding: 16px 8px; }
    .ml-logo-text, .ml-user-name, .ml-user-pill,
    .ml-nav-label, .ml-nav-item span:last-child,
    .ml-logout span:last-child { display: none; }
    .ml-logo { justify-content: center; }
    .ml-user-card { padding: 8px; }
    .ml-user-avatar { margin: 0 auto; }
    .ml-nav-item { justify-content: center; padding: 10px; }
    .ml-nav-item.active::before { display: none; }
    .ml-logout { justify-content: center; padding: 10px; }
    .ml-topbar-title { font-size: 0.9rem; }
  }
`;

const roleConfig = {
  patient:   { label: 'Patient',    colorClass: 'ml-role-patient',   icon: 'bi-person-circle' },
  doctor:    { label: 'Médecin',    colorClass: 'ml-role-doctor',    icon: 'bi-heart-pulse-fill' },
  reception: { label: 'Réception',  colorClass: 'ml-role-reception', icon: 'bi-hospital' },
  pharmacy:  { label: 'Pharmacie',  colorClass: 'ml-role-pharmacy',  icon: 'bi-capsule-fill' },
  pharmacist:{ label: 'Pharmacien', colorClass: 'ml-role-pharmacy',  icon: 'bi-capsule-fill' },
  lab:       { label: 'Laboratoire',colorClass: 'ml-role-lab',       icon: 'bi-microscope' },
  billing:   { label: 'Caisse',     colorClass: 'ml-role-billing',   icon: 'bi-currency-euro' },
  admin:     { label: 'Admin',      colorClass: 'ml-role-admin',     icon: 'bi-shield-check' },
};

const navConfig = {
  patient: [
    { path: '/patient/dashboard',     label: 'Tableau de bord', icon: 'bi-grid' },
    { path: '/patient/appointments',  label: 'Rendez-vous',     icon: 'bi-calendar-check' },
    { path: '/patient/prescriptions', label: 'Prescriptions',   icon: 'bi-capsule' },
  ],
  doctor: [
    { path: '/doctor/dashboard',     label: 'Tableau de bord', icon: 'bi-grid' },
    { path: '/doctor/patients',      label: 'Mes patients',    icon: 'bi-people' },
    { path: '/doctor/appointments',  label: 'Rendez-vous',     icon: 'bi-calendar-check' },
    { path: '/doctor/prescriptions', label: 'Prescriptions',   icon: 'bi-capsule' },
  ],
  reception: [
    { path: '/reception/dashboard', label: 'Tableau de bord', icon: 'bi-grid' },
    { path: '/reception/patients',  label: 'Patients',        icon: 'bi-people' },
    { path: '/reception/appointments', label: 'Rendez-vous',  icon: 'bi-calendar-check' },
  ],
  pharmacy: [
    { path: '/pharmacy/dashboard',     label: 'Tableau de bord', icon: 'bi-grid' },
    { path: '/pharmacy/prescriptions', label: 'Prescriptions',   icon: 'bi-capsule' },
    { path: '/pharmacy/medications',   label: 'Médicaments',     icon: 'bi-bag-plus' },
  ],
  pharmacist: [
    { path: '/pharmacy/dashboard',     label: 'Tableau de bord', icon: 'bi-grid' },
    { path: '/pharmacy/prescriptions', label: 'Prescriptions',   icon: 'bi-capsule' },
    { path: '/pharmacy/medications',   label: 'Médicaments',     icon: 'bi-bag-plus' },
  ],
  lab: [
    { path: '/lab/dashboard', label: 'Tableau de bord', icon: 'bi-grid' },
    { path: '/lab/tests',     label: 'Analyses en cours', icon: 'bi-flask' },
    { path: '/lab/results',   label: 'Résultats',       icon: 'bi-file-text' },
  ],
  billing: [
    { path: '/billing/dashboard', label: 'Tableau de bord', icon: 'bi-grid' },
    { path: '/billing',           label: 'Factures',       icon: 'bi-receipt' },
    { path: '/billing/new',       label: 'Nouvelle facture', icon: 'bi-plus-circle' },
  ],
  admin: [
    { path: '/admin/dashboard', label: 'Tableau de bord', icon: 'bi-grid' },
    { path: '/admin/users',     label: 'Utilisateurs',    icon: 'bi-people' },
    { path: '/admin/services',  label: 'Services',        icon: 'bi-gear' },
  ],
};

const pageTitles = {
  dashboard:     'Tableau de bord',
  patients:      'Mes patients',
  appointments:  'Rendez-vous',
  prescriptions: 'Prescriptions',
  medications:   'Médicaments',
  tests:         'Analyses en cours',
  results:       'Résultats',
  orders:        'Demandes',
  users:         'Utilisateurs',
  services:      'Services',
  '':            'Tableau de bord', // Pour la route racine
};

function MainLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const role = user?.role?.toLowerCase() || 'patient';
  const rc = roleConfig[role] || roleConfig.patient;
  const navItems = navConfig[role] || navConfig.patient;

  const getInitials = () =>
    `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase() || '?';

  const getPageTitle = () => {
    const parts = location.pathname.split('/');
    const key = parts[parts.length - 1];
    return pageTitles[key] || 'MyHeart';
  };

  const now = new Date();
  const timeStr = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <>
      <style>{styles}</style>
      <div className="ml-root">

        {/* SIDEBAR */}
        <aside className={`ml-sidebar ${rc.colorClass}`}>

          {/* Logo */}
          <div className="ml-logo">
            <div className="ml-logo-icon">
              <i className="bi bi-heart-pulse-fill" />
            </div>
            <span className="ml-logo-text">MyHeart</span>
          </div>

          {/* User card */}
          <div className={`ml-user-card ${rc.colorClass}`}>
            <div className="ml-user-avatar">
              {getInitials()}
            </div>
            <div className="ml-user-name">{user?.firstName} {user?.lastName}</div>
            <div className="ml-user-pill">
              <div className="ml-user-pill-dot" />
              <span className="ml-user-pill-text">{rc.label}</span>
            </div>
          </div>

          {/* Nav */}
          <div className="ml-nav-label">Navigation</div>
          <nav className={`ml-nav ${rc.colorClass}`}>
            {navItems.map(item => (
              <button
                key={item.path}
                className={`ml-nav-item${location.pathname === item.path || location.pathname.startsWith(item.path + '/') ? ' active' : ''}`}
                onClick={() => navigate(item.path)}
              >
                <div className="ml-nav-icon">
                  <i className={`bi ${item.icon}`} />
                </div>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="ml-divider" />

          {/* Logout */}
          <button
            className="ml-logout"
            onClick={() => { logout(); navigate('/login'); }}
          >
            <div className="ml-logout-icon">
              <i className="bi bi-box-arrow-left" />
            </div>
            <span>Déconnexion</span>
          </button>

        </aside>

        {/* MAIN */}
        <div className="ml-main">

          {/* Top bar */}
          <header className="ml-topbar">
            <span className="ml-topbar-title">{getPageTitle()}</span>
            <div className="ml-topbar-right">
              <span className="ml-topbar-time">{dateStr} · {timeStr}</span>
              <div className="ml-topbar-status">
                <div className="ml-topbar-dot" />
                <span>Système actif</span>
              </div>
            </div>
          </header>

          {/* Page content */}
          <div className="ml-page">
            <Outlet />
          </div>

        </div>
      </div>
    </>
  );
}

export default MainLayout;