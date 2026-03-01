import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import RoleSelector from './RoleSelector';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Outfit:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .lg-root {
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

  /* Orbs */
  .lg-orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    pointer-events: none;
  }
  .lg-orb-1 {
    width: 500px; height: 500px;
    background: radial-gradient(circle, rgba(37,99,235,0.18) 0%, transparent 70%);
    top: -120px; left: -100px;
    animation: orbA 12s ease-in-out infinite;
  }
  .lg-orb-2 {
    width: 380px; height: 380px;
    background: radial-gradient(circle, rgba(16,185,129,0.11) 0%, transparent 70%);
    bottom: -80px; right: -80px;
    animation: orbB 15s ease-in-out infinite;
  }
  .lg-orb-3 {
    width: 280px; height: 280px;
    background: radial-gradient(circle, rgba(139,92,246,0.09) 0%, transparent 70%);
    top: 50%; left: 50%;
    transform: translate(-50%,-50%);
    animation: orbC 18s ease-in-out infinite;
  }
  @keyframes orbA { 0%,100%{transform:translate(0,0)} 50%{transform:translate(40px,30px)} }
  @keyframes orbB { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-30px,-40px)} }
  @keyframes orbC { 0%,100%{transform:translate(-50%,-50%) scale(1)} 50%{transform:translate(-50%,-50%) scale(1.2)} }

  .lg-grid {
    position: absolute; inset: 0;
    background-image:
      linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px);
    background-size: 60px 60px;
    pointer-events: none;
  }

  /* Card */
  .lg-card {
    position: relative; z-index: 10;
    width: 100%; max-width: 440px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 32px;
    padding: 44px 40px 40px;
    backdrop-filter: blur(20px);
    animation: cardIn 0.55s cubic-bezier(.16,1,.3,1) both;
  }
  @keyframes cardIn {
    from { opacity:0; transform:translateY(22px) scale(0.97); }
    to   { opacity:1; transform:translateY(0) scale(1); }
  }

  /* Logo */
  .lg-logo {
    display: flex; align-items: center; gap: 10px;
    margin-bottom: 40px;
  }
  .lg-logo-icon {
    width: 36px; height: 36px;
    background: linear-gradient(135deg, #2563eb, #1d4ed8);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 1rem; color: white;
    box-shadow: 0 4px 16px rgba(37,99,235,0.4);
  }
  .lg-logo-text {
    font-family: 'Instrument Serif', serif;
    font-size: 1.25rem; color: white; font-weight: 400;
  }

  /* Back button */
  .lg-back {
    display: inline-flex; align-items: center; gap: 7px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 100px;
    color: rgba(255,255,255,0.5);
    font-size: 0.78rem; font-family: 'Outfit', sans-serif;
    padding: 6px 14px 6px 10px;
    cursor: pointer;
    margin-bottom: 32px;
    transition: all 0.15s;
  }
  .lg-back:hover {
    background: rgba(255,255,255,0.08);
    color: rgba(255,255,255,0.8);
    border-color: rgba(255,255,255,0.15);
  }
  .lg-back:disabled { opacity: 0.4; cursor: not-allowed; }

  /* Role pill */
  .lg-role-pill {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 5px 12px 5px 8px;
    border-radius: 100px;
    border: 1px solid var(--rc);
    background: var(--rbg);
    margin-bottom: 28px;
    animation: pillIn 0.3s cubic-bezier(.34,1.56,.64,1) both;
  }
  @keyframes pillIn {
    from { opacity:0; transform: scale(0.85); }
    to   { opacity:1; transform: scale(1); }
  }
  .lg-role-pill-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--rc);
    box-shadow: 0 0 6px var(--rc);
    animation: dotPulse 2.5s ease-in-out infinite;
  }
  @keyframes dotPulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
  .lg-role-pill-text {
    font-size: 0.7rem; font-weight: 500;
    color: var(--rc); letter-spacing: 0.04em; text-transform: uppercase;
  }

  /* Role colors */
  .lg-role-pill.patient   { --rc: #60a5fa; --rbg: rgba(96,165,250,0.08); }
  .lg-role-pill.doctor    { --rc: #34d399; --rbg: rgba(52,211,153,0.08); }
  .lg-role-pill.reception { --rc: #22d3ee; --rbg: rgba(34,211,238,0.08); }
  .lg-role-pill.pharmacy  { --rc: #fbbf24; --rbg: rgba(251,191,36,0.08); }
  .lg-role-pill.lab       { --rc: #f87171; --rbg: rgba(248,113,113,0.08); }
  .lg-role-pill.billing   { --rc: #a78bfa; --rbg: rgba(167,139,250,0.08); }

  /* Heading */
  .lg-headline {
    font-family: 'Instrument Serif', serif;
    font-size: 2rem; font-weight: 400; line-height: 1.1;
    color: white; margin-bottom: 6px;
  }
  .lg-headline em { font-style: italic; color: #60a5fa; }
  .lg-subhead {
    font-size: 0.82rem; color: rgba(255,255,255,0.3);
    font-weight: 300; margin-bottom: 32px; line-height: 1.5;
  }

  /* Error */
  .lg-error {
    display: flex; align-items: center; gap: 9px;
    background: rgba(248,113,113,0.08);
    border: 1px solid rgba(248,113,113,0.25);
    border-radius: 12px;
    padding: 11px 14px;
    margin-bottom: 20px;
    color: #f87171;
    font-size: 0.82rem;
    animation: shake 0.35s cubic-bezier(.36,.07,.19,.97);
  }
  @keyframes shake {
    0%,100%{transform:translateX(0)}
    20%{transform:translateX(-6px)}
    40%{transform:translateX(6px)}
    60%{transform:translateX(-4px)}
    80%{transform:translateX(4px)}
  }

  /* Form */
  .lg-form { display: flex; flex-direction: column; gap: 16px; }

  .lg-field { display: flex; flex-direction: column; gap: 7px; }

  .lg-label {
    font-size: 0.72rem; font-weight: 500;
    letter-spacing: 0.07em; text-transform: uppercase;
    color: rgba(255,255,255,0.3);
  }

  .lg-input-wrap { position: relative; }

  .lg-input-icon {
    position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
    color: rgba(255,255,255,0.2); font-size: 0.9rem;
    pointer-events: none; transition: color 0.2s;
  }

  .lg-input {
    width: 100%;
    padding: 12px 14px 12px 38px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.09);
    border-radius: 13px;
    color: white;
    font-size: 0.88rem;
    font-family: 'Outfit', sans-serif;
    font-weight: 400;
    outline: none;
    transition: all 0.18s;
  }
  .lg-input::placeholder { color: rgba(255,255,255,0.2); }
  .lg-input:focus {
    border-color: rgba(96,165,250,0.5);
    background: rgba(255,255,255,0.06);
    box-shadow: 0 0 0 3px rgba(96,165,250,0.08);
  }
  .lg-input:focus + .lg-input-icon,
  .lg-input-wrap:focus-within .lg-input-icon { color: #60a5fa; }
  .lg-input:disabled { opacity: 0.5; cursor: not-allowed; }

  /* Fix icon inside wrap */
  .lg-input-wrap .lg-input-icon { left: 14px; }

  /* Submit btn */
  .lg-btn {
    margin-top: 6px;
    width: 100%;
    padding: 13px;
    background: linear-gradient(135deg, #2563eb, #1d4ed8);
    border: none; border-radius: 13px;
    color: white; font-size: 0.9rem; font-weight: 500;
    font-family: 'Outfit', sans-serif;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    transition: all 0.18s;
    box-shadow: 0 4px 20px rgba(37,99,235,0.35);
    position: relative; overflow: hidden;
  }
  .lg-btn::after {
    content: '';
    position: absolute; top:0; left:-100%; width:50%; height:100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
    transition: left 0.5s ease;
  }
  .lg-btn:hover:not(:disabled)::after { left: 160%; }
  .lg-btn:hover:not(:disabled) {
    background: linear-gradient(135deg, #1d4ed8, #1e40af);
    transform: translateY(-1px);
    box-shadow: 0 8px 28px rgba(37,99,235,0.45);
  }
  .lg-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .lg-spinner {
    width: 17px; height: 17px;
    border: 2px solid rgba(255,255,255,0.25);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.75s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* Footer */
  .lg-footer {
    text-align: center; margin-top: 24px;
    padding-top: 20px;
    border-top: 1px solid rgba(255,255,255,0.06);
  }
  .lg-footer-link {
    color: rgba(255,255,255,0.35);
    font-size: 0.8rem; text-decoration: none;
    transition: color 0.15s; font-weight: 400;
    display: inline-flex; align-items: center; gap: 6px;
  }
  .lg-footer-link:hover { color: #60a5fa; }

  @media (max-width: 480px) {
    .lg-card { padding: 36px 24px 32px; border-radius: 24px; }
    .lg-headline { font-size: 1.7rem; }
  }
`;

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const navigate = useNavigate();
  const { login } = useAuth();

  const roleConfig = {
    patient:   { label: 'Espace Patient',    headline: 'Votre espace', sub: 'santé' },
    doctor:    { label: 'Espace Médecin',    headline: 'Votre espace', sub: 'médical' },
    reception: { label: 'Espace Réception',  headline: 'Votre espace', sub: 'accueil' },
    pharmacy:  { label: 'Espace Pharmacie',  headline: 'Votre espace', sub: 'pharmacie' },
    lab:       { label: 'Espace Laboratoire',headline: 'Votre espace', sub: 'laboratoire' },
    billing:   { label: 'Espace Caisse',     headline: 'Votre espace', sub: 'facturation' },
  };

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const result = await login(email, password, role);
    if (result.success) {
      navigate(`/${role}/dashboard`);
    } else {
      setError(result.error || 'Identifiants incorrects');
      setLoading(false);
    }
  };

  if (step === 1) {
    return (
      <>
        <style>{styles}</style>
        <RoleSelector selectedRole={role} onSelectRole={handleRoleSelect} />
      </>
    );
  }

  const rc = roleConfig[role] || { label: role, headline: 'Votre espace', sub: role };

  return (
    <>
      <style>{styles}</style>
      <div className="lg-root">
        <div className="lg-orb lg-orb-1" />
        <div className="lg-orb lg-orb-2" />
        <div className="lg-orb lg-orb-3" />
        <div className="lg-grid" />

        <div className="lg-card">

          {/* Logo */}
          <div className="lg-logo">
            <div className="lg-logo-icon">
              <i className="bi bi-heart-pulse-fill" />
            </div>
            <span className="lg-logo-text">MyHeart</span>
          </div>

          {/* Back */}
          <button className="lg-back" onClick={() => setStep(1)} disabled={loading}>
            <i className="bi bi-arrow-left" />
            Changer de rôle
          </button>

          {/* Role pill */}
          <div className={`lg-role-pill ${role}`}>
            <div className="lg-role-pill-dot" />
            <span className="lg-role-pill-text">{rc.label}</span>
          </div>

          {/* Headline */}
          <h1 className="lg-headline">
            {rc.headline}<br /><em>{rc.sub}</em>
          </h1>
          <p className="lg-subhead">Connectez-vous pour accéder à votre tableau de bord.</p>

          {/* Error */}
          {error && (
            <div className="lg-error">
              <i className="bi bi-exclamation-triangle-fill" />
              {error}
            </div>
          )}

          {/* Form */}
          <form className="lg-form" onSubmit={handleSubmit}>
            <div className="lg-field">
              <label className="lg-label">Adresse email</label>
              <div className="lg-input-wrap">
                <input
                  type="email"
                  className="lg-input"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="vous@exemple.fr"
                  required disabled={loading}
                />
                <i className="bi bi-envelope lg-input-icon" />
              </div>
            </div>

            <div className="lg-field">
              <label className="lg-label">Mot de passe</label>
              <div className="lg-input-wrap">
                <input
                  type="password"
                  className="lg-input"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required disabled={loading}
                />
                <i className="bi bi-lock lg-input-icon" />
              </div>
            </div>

            <button type="submit" className="lg-btn" disabled={loading}>
              {loading ? (
                <><div className="lg-spinner" /> Connexion…</>
              ) : (
                <><i className="bi bi-box-arrow-in-right" /> Se connecter</>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="lg-footer">
            <Link to="/register" state={{ role }} className="lg-footer-link">
              <i className="bi bi-person-plus" />
              Pas encore de compte ? Créer un accès
            </Link>
          </div>

        </div>
      </div>
    </>
  );
}

export default Login;