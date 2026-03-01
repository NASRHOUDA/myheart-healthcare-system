import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Outfit:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .rg-root {
    min-height: 100vh;
    background: #050c1a;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 32px 24px;
    font-family: 'Outfit', sans-serif;
    position: relative;
    overflow: hidden;
  }

  .rg-orb {
    position: absolute; border-radius: 50%;
    filter: blur(80px); pointer-events: none;
  }
  .rg-orb-1 {
    width: 500px; height: 500px;
    background: radial-gradient(circle, rgba(37,99,235,0.16) 0%, transparent 70%);
    top: -120px; left: -100px;
    animation: orbA 12s ease-in-out infinite;
  }
  .rg-orb-2 {
    width: 380px; height: 380px;
    background: radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%);
    bottom: -80px; right: -80px;
    animation: orbB 15s ease-in-out infinite;
  }
  .rg-orb-3 {
    width: 300px; height: 300px;
    background: radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%);
    top: 50%; left: 50%;
    transform: translate(-50%,-50%);
    animation: orbC 18s ease-in-out infinite;
  }
  @keyframes orbA { 0%,100%{transform:translate(0,0)} 50%{transform:translate(40px,30px)} }
  @keyframes orbB { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-30px,-40px)} }
  @keyframes orbC { 0%,100%{transform:translate(-50%,-50%)scale(1)} 50%{transform:translate(-50%,-50%)scale(1.2)} }

  .rg-grid {
    position: absolute; inset: 0;
    background-image:
      linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px);
    background-size: 60px 60px;
    pointer-events: none;
  }

  /* Card */
  .rg-card {
    position: relative; z-index: 10;
    width: 100%; max-width: 680px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 32px;
    padding: 44px 48px 40px;
    backdrop-filter: blur(20px);
    animation: cardIn 0.55s cubic-bezier(.16,1,.3,1) both;
  }
  @keyframes cardIn {
    from { opacity:0; transform:translateY(22px) scale(0.97); }
    to   { opacity:1; transform:translateY(0) scale(1); }
  }

  /* Logo */
  .rg-logo {
    display: flex; align-items: center; gap: 10px;
    margin-bottom: 36px;
  }
  .rg-logo-icon {
    width: 36px; height: 36px;
    background: linear-gradient(135deg, #2563eb, #1d4ed8);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 1rem; color: white;
    box-shadow: 0 4px 16px rgba(37,99,235,0.4);
  }
  .rg-logo-text {
    font-family: 'Instrument Serif', serif;
    font-size: 1.25rem; color: white; font-weight: 400;
  }

  /* Back */
  .rg-back {
    display: inline-flex; align-items: center; gap: 7px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 100px;
    color: rgba(255,255,255,0.5);
    font-size: 0.78rem; font-family: 'Outfit', sans-serif;
    padding: 6px 14px 6px 10px;
    cursor: pointer; margin-bottom: 28px;
    transition: all 0.15s;
  }
  .rg-back:hover {
    background: rgba(255,255,255,0.08);
    color: rgba(255,255,255,0.8);
    border-color: rgba(255,255,255,0.15);
  }

  /* Role pill */
  .rg-role-pill {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 5px 12px 5px 8px;
    border-radius: 100px;
    border: 1px solid var(--rc);
    background: var(--rbg);
    margin-bottom: 20px;
    animation: pillIn 0.3s cubic-bezier(.34,1.56,.64,1) both;
  }
  @keyframes pillIn { from{opacity:0;transform:scale(0.85)} to{opacity:1;transform:scale(1)} }
  .rg-role-pill-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--rc); box-shadow: 0 0 6px var(--rc);
    animation: dotP 2.5s ease-in-out infinite;
  }
  @keyframes dotP { 0%,100%{opacity:1} 50%{opacity:0.4} }
  .rg-role-pill-text {
    font-size: 0.7rem; font-weight: 500;
    color: var(--rc); letter-spacing: 0.04em; text-transform: uppercase;
  }
  .rg-role-pill.patient   { --rc:#60a5fa; --rbg:rgba(96,165,250,0.08); }
  .rg-role-pill.doctor    { --rc:#34d399; --rbg:rgba(52,211,153,0.08); }
  .rg-role-pill.reception { --rc:#22d3ee; --rbg:rgba(34,211,238,0.08); }
  .rg-role-pill.pharmacy  { --rc:#fbbf24; --rbg:rgba(251,191,36,0.08); }
  .rg-role-pill.lab       { --rc:#f87171; --rbg:rgba(248,113,113,0.08); }
  .rg-role-pill.billing   { --rc:#a78bfa; --rbg:rgba(167,139,250,0.08); }

  /* Headline */
  .rg-headline {
    font-family: 'Instrument Serif', serif;
    font-size: 1.9rem; font-weight: 400; line-height: 1.1;
    color: white; margin-bottom: 6px;
  }
  .rg-headline em { font-style: italic; color: #60a5fa; }
  .rg-subhead {
    font-size: 0.82rem; color: rgba(255,255,255,0.3);
    font-weight: 300; margin-bottom: 32px; line-height: 1.5;
  }

  /* Error */
  .rg-error {
    display: flex; align-items: center; gap: 9px;
    background: rgba(248,113,113,0.08);
    border: 1px solid rgba(248,113,113,0.25);
    border-radius: 12px; padding: 11px 14px;
    margin-bottom: 20px; color: #f87171; font-size: 0.82rem;
    animation: shake 0.35s cubic-bezier(.36,.07,.19,.97);
  }
  @keyframes shake {
    0%,100%{transform:translateX(0)} 20%{transform:translateX(-6px)}
    40%{transform:translateX(6px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)}
  }

  /* Section divider */
  .rg-section {
    font-size: 0.65rem; font-weight: 500;
    letter-spacing: 0.1em; text-transform: uppercase;
    color: rgba(255,255,255,0.2);
    margin: 24px 0 14px;
    display: flex; align-items: center; gap: 10px;
  }
  .rg-section::after {
    content: ''; flex: 1; height: 1px;
    background: rgba(255,255,255,0.06);
  }

  /* Form grid */
  .rg-form { display: flex; flex-direction: column; gap: 0; }
  .rg-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
  .rg-row.full { grid-template-columns: 1fr; }

  .rg-field { display: flex; flex-direction: column; gap: 6px; }
  .rg-label {
    font-size: 0.68rem; font-weight: 500;
    letter-spacing: 0.07em; text-transform: uppercase;
    color: rgba(255,255,255,0.28);
  }
  .rg-req { color: #f87171; margin-left: 2px; }

  .rg-input-wrap { position: relative; }
  .rg-input-icon {
    position: absolute; left: 13px; top: 50%; transform: translateY(-50%);
    color: rgba(255,255,255,0.18); font-size: 0.85rem;
    pointer-events: none; transition: color 0.2s;
  }

  .rg-input, .rg-select {
    width: 100%;
    padding: 11px 12px 11px 36px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px;
    color: white; font-size: 0.85rem;
    font-family: 'Outfit', sans-serif; font-weight: 400;
    outline: none; transition: all 0.18s;
  }
  .rg-input::placeholder { color: rgba(255,255,255,0.18); }
  .rg-input:focus, .rg-select:focus {
    border-color: rgba(96,165,250,0.5);
    background: rgba(255,255,255,0.06);
    box-shadow: 0 0 0 3px rgba(96,165,250,0.07);
  }
  .rg-input-wrap:focus-within .rg-input-icon { color: #60a5fa; }

  .rg-select { appearance: none; cursor: pointer; }
  .rg-select option { background: #0f172a; color: white; }

  /* No-icon inputs */
  .rg-input.no-icon, .rg-select.no-icon { padding-left: 12px; }

  /* Submit */
  .rg-btn {
    margin-top: 28px; width: 100%; padding: 13px;
    background: linear-gradient(135deg, #2563eb, #1d4ed8);
    border: none; border-radius: 13px;
    color: white; font-size: 0.9rem; font-weight: 500;
    font-family: 'Outfit', sans-serif;
    cursor: pointer; display: flex; align-items: center;
    justify-content: center; gap: 8px;
    transition: all 0.18s;
    box-shadow: 0 4px 20px rgba(37,99,235,0.35);
    position: relative; overflow: hidden;
  }
  .rg-btn::after {
    content: ''; position: absolute; top:0; left:-100%; width:50%; height:100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
    transition: left 0.5s ease;
  }
  .rg-btn:hover:not(:disabled)::after { left: 160%; }
  .rg-btn:hover:not(:disabled) {
    background: linear-gradient(135deg, #1d4ed8, #1e40af);
    transform: translateY(-1px);
    box-shadow: 0 8px 28px rgba(37,99,235,0.45);
  }
  .rg-btn:disabled { opacity:0.5; cursor:not-allowed; }

  /* Footer */
  .rg-footer {
    text-align: center; margin-top: 24px; padding-top: 20px;
    border-top: 1px solid rgba(255,255,255,0.06);
  }
  .rg-footer-link {
    color: rgba(255,255,255,0.35); font-size: 0.8rem;
    text-decoration: none; transition: color 0.15s;
    display: inline-flex; align-items: center; gap: 6px;
  }
  .rg-footer-link:hover { color: #60a5fa; }

  @media (max-width: 600px) {
    .rg-card { padding: 36px 24px 32px; border-radius: 24px; }
    .rg-row { grid-template-columns: 1fr; }
    .rg-headline { font-size: 1.6rem; }
  }
`;

function Register() {
  const location = useLocation();
  const role = location.state?.role || 'patient';

  const [formData, setFormData] = useState({
    email: '', password: '', confirmPassword: '',
    firstName: '', lastName: '', phone: '', address: '',
    role, specialty: '', licenseNumber: '', department: '', employeeId: ''
  });
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { register, login } = useAuth();

  const roleConfig = {
    patient:   { label: 'Espace Patient',    title: 'Créer votre', sub: 'accès patient' },
    doctor:    { label: 'Espace Médecin',    title: 'Créer votre', sub: 'accès médecin' },
    reception: { label: 'Espace Réception',  title: 'Créer votre', sub: 'accès réception' },
    pharmacy:  { label: 'Espace Pharmacie',  title: 'Créer votre', sub: 'accès pharmacie' },
    lab:       { label: 'Espace Laboratoire',title: 'Créer votre', sub: 'accès laboratoire' },
    billing:   { label: 'Espace Caisse',     title: 'Créer votre', sub: 'accès caisse' },
  };
  const rc = roleConfig[role] || roleConfig.patient;

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    const result = await register(formData);
    if (!result.success) {
      setError(result.error);
      return;
    }
    navigate(`/${role}/dashboard`);
  };

  const Field = ({ label, name, type = 'text', placeholder, required, icon, half = true }) => (
    <div className="rg-field">
      <label className="rg-label">{label}{required && <span className="rg-req">*</span>}</label>
      <div className="rg-input-wrap">
        <input
          type={type} name={name} className="rg-input"
          value={formData[name]} onChange={handleChange}
          placeholder={placeholder} required={required}
        />
        {icon && <i className={`bi bi-${icon} rg-input-icon`} />}
      </div>
    </div>
  );

  return (
    <>
      <style>{styles}</style>
      <div className="rg-root">
        <div className="rg-orb rg-orb-1" />
        <div className="rg-orb rg-orb-2" />
        <div className="rg-orb rg-orb-3" />
        <div className="rg-grid" />

        <div className="rg-card">

          {/* Logo */}
          <div className="rg-logo">
            <div className="rg-logo-icon"><i className="bi bi-heart-pulse-fill" /></div>
            <span className="rg-logo-text">MyHeart</span>
          </div>

          {/* Back */}
          <button className="rg-back" onClick={() => navigate('/login')}>
            <i className="bi bi-arrow-left" /> Retour à la connexion
          </button>

          {/* Pill */}
          <div className={`rg-role-pill ${role}`}>
            <div className="rg-role-pill-dot" />
            <span className="rg-role-pill-text">{rc.label}</span>
          </div>

          {/* Headline */}
          <h1 className="rg-headline">{rc.title}<br /><em>{rc.sub}</em></h1>
          <p className="rg-subhead">Renseignez vos informations pour créer votre compte.</p>

          {error && (
            <div className="rg-error">
              <i className="bi bi-exclamation-triangle-fill" />{error}
            </div>
          )}

          <form className="rg-form" onSubmit={handleSubmit}>

            {/* Identité */}
            <div className="rg-section">Informations personnelles</div>
            <div className="rg-row">
              <div className="rg-field">
                <label className="rg-label">Prénom <span className="rg-req">*</span></label>
                <div className="rg-input-wrap">
                  <input type="text" name="firstName" className="rg-input"
                    value={formData.firstName} onChange={handleChange}
                    placeholder="Marie" required />
                  <i className="bi bi-person rg-input-icon" />
                </div>
              </div>
              <div className="rg-field">
                <label className="rg-label">Nom <span className="rg-req">*</span></label>
                <div className="rg-input-wrap">
                  <input type="text" name="lastName" className="rg-input"
                    value={formData.lastName} onChange={handleChange}
                    placeholder="Dupont" required />
                  <i className="bi bi-person rg-input-icon" />
                </div>
              </div>
            </div>

            <div className="rg-row">
              <div className="rg-field">
                <label className="rg-label">Email <span className="rg-req">*</span></label>
                <div className="rg-input-wrap">
                  <input type="email" name="email" className="rg-input"
                    value={formData.email} onChange={handleChange}
                    placeholder="vous@exemple.fr" required />
                  <i className="bi bi-envelope rg-input-icon" />
                </div>
              </div>
              <div className="rg-field">
                <label className="rg-label">Téléphone</label>
                <div className="rg-input-wrap">
                  <input type="tel" name="phone" className="rg-input"
                    value={formData.phone} onChange={handleChange}
                    placeholder="06 00 00 00 00" />
                  <i className="bi bi-telephone rg-input-icon" />
                </div>
              </div>
            </div>

            <div className="rg-row full" style={{marginBottom:'12px'}}>
              <div className="rg-field">
                <label className="rg-label">Adresse</label>
                <div className="rg-input-wrap">
                  <input type="text" name="address" className="rg-input"
                    value={formData.address} onChange={handleChange}
                    placeholder="123 rue de la Santé, Paris" />
                  <i className="bi bi-geo-alt rg-input-icon" />
                </div>
              </div>
            </div>

            {/* Role-specific fields */}
            {role === 'doctor' && (
              <>
                <div className="rg-section">Informations professionnelles</div>
                <div className="rg-row">
                  <div className="rg-field">
                    <label className="rg-label">Spécialité <span className="rg-req">*</span></label>
                    <div className="rg-input-wrap">
                      <select name="specialty" className="rg-select no-icon"
                        value={formData.specialty} onChange={handleChange} required>
                        <option value="">Sélectionner…</option>
                        <option value="cardiologie">Cardiologie</option>
                        <option value="dermatologie">Dermatologie</option>
                        <option value="pediatrie">Pédiatrie</option>
                        <option value="gynecologie">Gynécologie</option>
                        <option value="ophtalmologie">Ophtalmologie</option>
                        <option value="orthopedie">Orthopédie</option>
                        <option value="generaliste">Médecine générale</option>
                      </select>
                    </div>
                  </div>
                  <div className="rg-field">
                    <label className="rg-label">N° de licence <span className="rg-req">*</span></label>
                    <div className="rg-input-wrap">
                      <input type="text" name="licenseNumber" className="rg-input"
                        value={formData.licenseNumber} onChange={handleChange}
                        placeholder="LIC-000000" required />
                      <i className="bi bi-patch-check rg-input-icon" />
                    </div>
                  </div>
                </div>
              </>
            )}

            {role === 'reception' && (
              <>
                <div className="rg-section">Informations professionnelles</div>
                <div className="rg-row">
                  <div className="rg-field">
                    <label className="rg-label">N° d'employé <span className="rg-req">*</span></label>
                    <div className="rg-input-wrap">
                      <input type="text" name="employeeId" className="rg-input"
                        value={formData.employeeId} onChange={handleChange}
                        placeholder="EMP-001" required />
                      <i className="bi bi-credit-card rg-input-icon" />
                    </div>
                  </div>
                </div>
              </>
            )}

            {role === 'pharmacy' && (
              <>
                <div className="rg-section">Informations professionnelles</div>
                <div className="rg-row">
                  <div className="rg-field">
                    <label className="rg-label">N° de licence <span className="rg-req">*</span></label>
                    <div className="rg-input-wrap">
                      <input type="text" name="licenseNumber" className="rg-input"
                        value={formData.licenseNumber} onChange={handleChange}
                        placeholder="LIC-000000" required />
                      <i className="bi bi-patch-check rg-input-icon" />
                    </div>
                  </div>
                  <div className="rg-field">
                    <label className="rg-label">Département</label>
                    <div className="rg-input-wrap">
                      <input type="text" name="department" className="rg-input"
                        value={formData.department} onChange={handleChange}
                        placeholder="Pharmacie centrale" />
                      <i className="bi bi-building rg-input-icon" />
                    </div>
                  </div>
                </div>
              </>
            )}

            {role === 'lab' && (
              <>
                <div className="rg-section">Informations professionnelles</div>
                <div className="rg-row">
                  <div className="rg-field">
                    <label className="rg-label">Spécialité <span className="rg-req">*</span></label>
                    <div className="rg-input-wrap">
                      <select name="specialty" className="rg-select no-icon"
                        value={formData.specialty} onChange={handleChange} required>
                        <option value="">Sélectionner…</option>
                        <option value="hematologie">Hématologie</option>
                        <option value="biochimie">Biochimie</option>
                        <option value="microbiologie">Microbiologie</option>
                        <option value="immunologie">Immunologie</option>
                      </select>
                    </div>
                  </div>
                  <div className="rg-field">
                    <label className="rg-label">N° d'employé <span className="rg-req">*</span></label>
                    <div className="rg-input-wrap">
                      <input type="text" name="employeeId" className="rg-input"
                        value={formData.employeeId} onChange={handleChange}
                        placeholder="EMP-001" required />
                      <i className="bi bi-credit-card rg-input-icon" />
                    </div>
                  </div>
                </div>
              </>
            )}

            {role === 'billing' && (
              <>
                <div className="rg-section">Informations professionnelles</div>
                <div className="rg-row">
                  <div className="rg-field">
                    <label className="rg-label">N° d'employé <span className="rg-req">*</span></label>
                    <div className="rg-input-wrap">
                      <input type="text" name="employeeId" className="rg-input"
                        value={formData.employeeId} onChange={handleChange}
                        placeholder="CAI-001" required />
                      <i className="bi bi-credit-card rg-input-icon" />
                    </div>
                  </div>
                  <div className="rg-field">
                    <label className="rg-label">Service</label>
                    <div className="rg-input-wrap">
                      <input type="text" name="department" className="rg-input"
                        value={formData.department} onChange={handleChange}
                        placeholder="Caisse centrale" />
                      <i className="bi bi-building rg-input-icon" />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Password */}
            <div className="rg-section">Sécurité du compte</div>
            <div className="rg-row">
              <div className="rg-field">
                <label className="rg-label">Mot de passe <span className="rg-req">*</span></label>
                <div className="rg-input-wrap">
                  <input type="password" name="password" className="rg-input"
                    value={formData.password} onChange={handleChange}
                    placeholder="Min. 6 caractères" required minLength="6" />
                  <i className="bi bi-lock rg-input-icon" />
                </div>
              </div>
              <div className="rg-field">
                <label className="rg-label">Confirmer <span className="rg-req">*</span></label>
                <div className="rg-input-wrap">
                  <input type="password" name="confirmPassword" className="rg-input"
                    value={formData.confirmPassword} onChange={handleChange}
                    placeholder="••••••••" required />
                  <i className="bi bi-lock-fill rg-input-icon" />
                </div>
              </div>
            </div>

            <button type="submit" className="rg-btn">
              <i className="bi bi-person-check-fill" />
              Créer mon compte
            </button>
          </form>

          <div className="rg-footer">
            <Link to="/login" className="rg-footer-link">
              <i className="bi bi-box-arrow-in-right" />
              Déjà un compte ? Se connecter
            </Link>
          </div>

        </div>
      </div>
    </>
  );
}

export default Register;