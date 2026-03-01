import React, { useState, useEffect } from 'react';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Outfit:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .mh-root {
    min-height: 100vh;
    background: #050c1a;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    font-family: 'Outfit', sans-serif;
    position: relative;
    overflow: hidden;
  }

  /* Ambient background orbs */
  .mh-orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    pointer-events: none;
  }
  .mh-orb-1 {
    width: 500px; height: 500px;
    background: radial-gradient(circle, rgba(37,99,235,0.18) 0%, transparent 70%);
    top: -100px; left: -100px;
    animation: orbFloat1 12s ease-in-out infinite;
  }
  .mh-orb-2 {
    width: 400px; height: 400px;
    background: radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%);
    bottom: -80px; right: -80px;
    animation: orbFloat2 15s ease-in-out infinite;
  }
  .mh-orb-3 {
    width: 300px; height: 300px;
    background: radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%);
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    animation: orbFloat3 18s ease-in-out infinite;
  }

  @keyframes orbFloat1 {
    0%,100% { transform: translate(0,0); }
    50% { transform: translate(40px, 30px); }
  }
  @keyframes orbFloat2 {
    0%,100% { transform: translate(0,0); }
    50% { transform: translate(-30px, -40px); }
  }
  @keyframes orbFloat3 {
    0%,100% { transform: translate(-50%,-50%) scale(1); }
    50% { transform: translate(-50%,-50%) scale(1.2); }
  }

  /* Grid lines decoration */
  .mh-grid-lines {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px);
    background-size: 60px 60px;
    pointer-events: none;
  }

  /* Main card */
  .mh-card {
    position: relative;
    z-index: 10;
    width: 100%;
    max-width: 900px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 32px;
    padding: 52px 48px 44px;
    backdrop-filter: blur(20px);
    animation: cardIn 0.6s cubic-bezier(.16,1,.3,1) both;
  }

  @keyframes cardIn {
    from { opacity: 0; transform: translateY(24px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }

  /* Top bar */
  .mh-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 52px;
  }

  .mh-logo {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .mh-logo-icon {
    width: 38px; height: 38px;
    background: linear-gradient(135deg, #2563eb, #1d4ed8);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.1rem;
    color: white;
    box-shadow: 0 4px 16px rgba(37,99,235,0.4);
  }

  .mh-logo-text {
    font-family: 'Instrument Serif', serif;
    font-size: 1.35rem;
    color: white;
    font-weight: 400;
    letter-spacing: -0.01em;
  }

  .mh-badge {
    font-size: 0.65rem;
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.3);
    border: 1px solid rgba(255,255,255,0.1);
    padding: 4px 10px;
    border-radius: 100px;
  }

  /* Hero text */
  .mh-hero {
    margin-bottom: 44px;
  }

  .mh-eyebrow {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 14px;
  }

  .mh-eyebrow-line {
    width: 24px; height: 1px;
    background: linear-gradient(90deg, #2563eb, transparent);
  }

  .mh-eyebrow-text {
    font-size: 0.7rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #60a5fa;
    font-weight: 500;
  }

  .mh-headline {
    font-family: 'Instrument Serif', serif;
    font-size: 2.6rem;
    line-height: 1.08;
    color: white;
    font-weight: 400;
    margin-bottom: 12px;
  }

  .mh-headline em {
    font-style: italic;
    color: #60a5fa;
  }

  .mh-subhead {
    font-size: 0.88rem;
    color: rgba(255,255,255,0.38);
    font-weight: 300;
    line-height: 1.6;
    max-width: 520px;
  }

  /* Role section label */
  .mh-section-label {
    font-size: 0.68rem;
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.25);
    margin-bottom: 14px;
  }

  /* Roles grid - 6 colonnes */
  .mh-roles {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 10px;
    margin-bottom: 40px;
  }

  .mh-role {
    position: relative;
    padding: 18px 12px 16px;
    border-radius: 18px;
    border: 1px solid rgba(255,255,255,0.07);
    background: rgba(255,255,255,0.025);
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    transition: all 0.22s cubic-bezier(.34,1.56,.64,1);
    overflow: hidden;
  }

  /* Glow fill on active */
  .mh-role::before {
    content: '';
    position: absolute;
    inset: 0;
    background: var(--glow-bg);
    opacity: 0;
    transition: opacity 0.2s;
    border-radius: 17px;
  }

  /* Bottom accent bar */
  .mh-role::after {
    content: '';
    position: absolute;
    bottom: 0; left: 20%; right: 20%;
    height: 2px;
    background: var(--c);
    border-radius: 2px 2px 0 0;
    opacity: 0;
    transform: scaleX(0);
    transition: opacity 0.2s, transform 0.25s cubic-bezier(.34,1.56,.64,1);
  }

  .mh-role:hover {
    border-color: var(--c-faint);
    transform: translateY(-3px);
    box-shadow: 0 12px 32px rgba(0,0,0,0.4), 0 0 0 1px var(--c-faint);
  }

  .mh-role:hover::before { opacity: 0.5; }
  .mh-role:hover::after  { opacity: 1; transform: scaleX(1); }

  .mh-role.active {
    border-color: var(--c);
    transform: translateY(-4px);
    box-shadow: 0 16px 40px rgba(0,0,0,0.45), 0 0 0 1px var(--c-faint), 0 0 20px var(--c-shadow);
  }

  .mh-role.active::before { opacity: 1; }
  .mh-role.active::after  { opacity: 1; transform: scaleX(1); }

  /* Couleurs distinctes pour chaque rôle */
  .mh-role.patient   { --c: #60a5fa; --c-faint: rgba(96,165,250,0.3);  --c-shadow: rgba(96,165,250,0.15);  --glow-bg: rgba(96,165,250,0.06); } /* Bleu */
  .mh-role.doctor    { --c: #34d399; --c-faint: rgba(52,211,153,0.3);  --c-shadow: rgba(52,211,153,0.15);  --glow-bg: rgba(52,211,153,0.06); } /* Vert */
  .mh-role.reception { --c: #22d3ee; --c-faint: rgba(34,211,238,0.3);  --c-shadow: rgba(34,211,238,0.15);  --glow-bg: rgba(34,211,238,0.06); } /* Cyan */
  .mh-role.pharmacy  { --c: #fbbf24; --c-faint: rgba(251,191,36,0.3);  --c-shadow: rgba(251,191,36,0.15);  --glow-bg: rgba(251,191,36,0.06); } /* Jaune */
  .mh-role.lab       { --c: #f87171; --c-faint: rgba(248,113,113,0.3); --c-shadow: rgba(248,113,113,0.15); --glow-bg: rgba(248,113,113,0.06); } /* Rouge */
  .mh-role.billing   { --c: #a78bfa; --c-faint: rgba(167,139,250,0.3); --c-shadow: rgba(167,139,250,0.15); --glow-bg: rgba(167,139,250,0.06); } /* Violet */

  .mh-role-icon {
    width: 42px; height: 42px;
    border-radius: 12px;
    border: 1px solid rgba(255,255,255,0.06);
    background: rgba(255,255,255,0.04);
    display: flex; align-items: center; justify-content: center;
    font-size: 1.2rem;
    color: rgba(255,255,255,0.25);
    transition: color 0.2s, border-color 0.2s, background 0.2s;
    position: relative; z-index: 1;
  }

  .mh-role:hover .mh-role-icon,
  .mh-role.active .mh-role-icon {
    color: var(--c);
    border-color: var(--c-faint);
    background: var(--c-shadow);
  }

  .mh-role-name {
    font-size: 0.75rem;
    font-weight: 500;
    color: rgba(255,255,255,0.3);
    letter-spacing: 0.02em;
    transition: color 0.2s;
    position: relative; z-index: 1;
  }

  .mh-role:hover .mh-role-name,
  .mh-role.active .mh-role-name {
    color: var(--c);
  }

  .mh-role-feat {
    font-size: 0.62rem;
    color: rgba(255,255,255,0.18);
    font-weight: 300;
    transition: color 0.2s;
    position: relative; z-index: 1;
  }

  .mh-role.active .mh-role-feat { color: rgba(255,255,255,0.4); }

  /* Active check */
  .mh-check {
    position: absolute;
    top: 9px; right: 9px;
    width: 18px; height: 18px;
    border-radius: 50%;
    background: var(--c);
    display: flex; align-items: center; justify-content: center;
    opacity: 0;
    transform: scale(0) rotate(-45deg);
    transition: all 0.25s cubic-bezier(.34,1.56,.64,1);
    z-index: 2;
    box-shadow: 0 0 10px var(--c-shadow);
  }

  .mh-check::after {
    content: '';
    width: 6px; height: 4px;
    border-left: 1.5px solid #050c1a;
    border-bottom: 1.5px solid #050c1a;
    transform: rotate(-45deg) translateY(-1px);
  }

  .mh-role.active .mh-check {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }

  /* Stagger */
  .mh-role { animation: roleIn 0.45s cubic-bezier(.34,1.56,.64,1) both; }
  .mh-role:nth-child(1) { animation-delay: 0.1s; }
  .mh-role:nth-child(2) { animation-delay: 0.15s; }
  .mh-role:nth-child(3) { animation-delay: 0.2s; }
  .mh-role:nth-child(4) { animation-delay: 0.25s; }
  .mh-role:nth-child(5) { animation-delay: 0.3s; }
  .mh-role:nth-child(6) { animation-delay: 0.35s; }

  @keyframes roleIn {
    from { opacity: 0; transform: translateY(16px) scale(0.92); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }

  /* Bottom bar */
  .mh-bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 28px;
    border-top: 1px solid rgba(255,255,255,0.06);
  }

  .mh-stats {
    display: flex;
    gap: 28px;
  }

  .mh-stat {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .mh-stat-num {
    font-family: 'Instrument Serif', serif;
    font-size: 1.3rem;
    color: white;
    line-height: 1;
  }

  .mh-stat-lbl {
    font-size: 0.62rem;
    color: rgba(255,255,255,0.25);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    font-weight: 400;
  }

  .mh-status {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.72rem;
    color: rgba(255,255,255,0.25);
  }

  .mh-status-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: #34d399;
    box-shadow: 0 0 8px rgba(52,211,153,0.6);
    animation: statusPulse 2.5s ease-in-out infinite;
  }

  @keyframes statusPulse {
    0%,100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  @media (max-width: 768px) {
    .mh-card { padding: 36px 24px 32px; border-radius: 24px; }
    .mh-headline { font-size: 1.9rem; }
    .mh-roles { 
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
    }
    .mh-stats { gap: 18px; }
  }

  @media (max-width: 480px) {
    .mh-roles { 
      grid-template-columns: repeat(2, 1fr);
    }
  }
`;

function RoleSelector({ selectedRole, onSelectRole }) {
  const roles = [
    { id: 'patient',   label: 'Patient',   icon: 'bi-person-circle',    feat: 'Suivi médical' },
    { id: 'doctor',    label: 'Médecin',   icon: 'bi-heart-pulse-fill', feat: 'Consultations' },
    { id: 'reception', label: 'Réception', icon: 'bi-hospital',         feat: 'Gestion accueil' },
    { id: 'pharmacy',  label: 'Pharmacie', icon: 'bi-capsule-fill',     feat: 'Médicaments' },
    { id: 'lab',       label: 'Labo',      icon: 'bi-microscope',       feat: 'Analyses' },
    { id: 'billing',   label: 'Caisse',    icon: 'bi-currency-euro',    feat: 'Facturation' },
  ];

  return (
    <>
      <style>{styles}</style>
      <div className="mh-root">
        <div className="mh-orb mh-orb-1" />
        <div className="mh-orb mh-orb-2" />
        <div className="mh-orb mh-orb-3" />
        <div className="mh-grid-lines" />

        <div className="mh-card">

          {/* Top bar */}
          <div className="mh-topbar">
            <div className="mh-logo">
              <div className="mh-logo-icon">
                <i className="bi bi-heart-pulse-fill" />
              </div>
              <span className="mh-logo-text">MyHeart</span>
            </div>
            <span className="mh-badge">v1.0 · Projet SOA</span>
          </div>

          {/* Hero */}
          <div className="mh-hero">
            <div className="mh-eyebrow">
              <div className="mh-eyebrow-line" />
              <span className="mh-eyebrow-text">Système de soins de santé</span>
            </div>
            <h1 className="mh-headline">
              Bienvenue sur<br /><em>votre espace</em> médical
            </h1>
            <p className="mh-subhead">
              Sélectionnez votre rôle pour accéder à votre tableau de bord personnalisé.
            </p>
          </div>

          {/* Roles */}
          <div className="mh-section-label">Choisir un espace</div>
          <div className="mh-roles">
            {roles.map(role => (
              <div
                key={role.id}
                className={`mh-role ${role.id}${selectedRole === role.id ? ' active' : ''}`}
                onClick={() => onSelectRole(role.id)}
              >
                <div className="mh-check" />
                <div className="mh-role-icon">
                  <i className={`bi ${role.icon}`} />
                </div>
                <span className="mh-role-name">{role.label}</span>
                <span className="mh-role-feat">{role.feat}</span>
              </div>
            ))}
          </div>

          {/* Bottom */}
          <div className="mh-bottom">
            <div className="mh-stats">
              <div className="mh-stat">
                <span className="mh-stat-num">6</span>
                <span className="mh-stat-lbl">Services</span>
              </div>
              <div className="mh-stat">
                <span className="mh-stat-num">6</span>
                <span className="mh-stat-lbl">Microservices</span>
              </div>
              <div className="mh-stat">
                <span className="mh-stat-num">REST</span>
                <span className="mh-stat-lbl">Architecture</span>
              </div>
            </div>
            <div className="mh-status">
              <div className="mh-status-dot" />
              <span>Système opérationnel</span>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

export default RoleSelector;