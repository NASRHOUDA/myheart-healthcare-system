import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useParams, Link, useNavigate } from 'react-router-dom';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Outfit:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; }

  .pd-root {
    max-width: 1100px; margin: 0 auto;
    padding: 40px 28px; font-family: 'Outfit', sans-serif;
    background: #f8fafc; min-height: 100vh; color: #0f172a;
  }

  /* Back */
  .pd-back {
    display: inline-flex; align-items: center; gap: 7px;
    background: none; border: none; color: #2563eb;
    font-size: 0.82rem; font-family: 'Outfit', sans-serif;
    cursor: pointer; padding: 0; margin-bottom: 28px;
    transition: gap 0.15s;
  }
  .pd-back:hover { gap: 10px; }

  /* Hero card */
  .pd-hero {
    background: white; border: 1px solid #e2e8f0;
    border-radius: 24px; padding: 28px 32px;
    margin-bottom: 24px;
    display: flex; align-items: center;
    justify-content: space-between; gap: 20px;
    flex-wrap: wrap;
  }
  .pd-hero-left { display: flex; align-items: center; gap: 20px; }
  .pd-avatar {
    width: 72px; height: 72px; border-radius: 20px;
    background: linear-gradient(135deg, #eff6ff, #dbeafe);
    border: 1px solid #bfdbfe;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.5rem; font-weight: 700; color: #2563eb;
    flex-shrink: 0;
  }
  .pd-name {
    font-family: 'Instrument Serif', serif;
    font-size: 1.8rem; font-weight: 400; color: #0f172a;
    margin: 0 0 6px; line-height: 1;
  }
  .pd-meta { display: flex; gap: 18px; flex-wrap: wrap; }
  .pd-meta-item {
    display: flex; align-items: center; gap: 6px;
    font-size: 0.78rem; color: #64748b;
  }
  .pd-meta-item i { color: #2563eb; }

  /* Action btn */
  .pd-btn-primary {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 10px 20px; background: #2563eb; color: white;
    border: none; border-radius: 12px; font-size: 0.82rem;
    font-weight: 500; font-family: 'Outfit', sans-serif;
    cursor: pointer; text-decoration: none;
    box-shadow: 0 2px 10px rgba(37,99,235,0.25);
    transition: all 0.15s;
  }
  .pd-btn-primary:hover { background: #1d4ed8; transform: translateY(-1px); }

  /* Tabs */
  .pd-tabs {
    display: flex; gap: 4px; margin-bottom: 20px;
    background: white; border: 1px solid #e2e8f0;
    border-radius: 16px; padding: 5px;
    overflow-x: auto; flex-wrap: nowrap;
  }
  .pd-tab {
    display: flex; align-items: center; gap: 7px;
    padding: 9px 16px; border: none; background: none;
    font-family: 'Outfit', sans-serif; font-size: 0.8rem;
    font-weight: 400; color: #94a3b8; border-radius: 11px;
    cursor: pointer; white-space: nowrap; transition: all 0.15s;
  }
  .pd-tab:hover { color: #475569; background: #f8fafc; }
  .pd-tab.active { background: #0f172a; color: white; font-weight: 500; }
  .pd-tab-count {
    font-size: 0.65rem; padding: 1px 6px; border-radius: 100px;
    background: rgba(255,255,255,0.2); color: inherit;
  }
  .pd-tab:not(.active) .pd-tab-count { background: #f1f5f9; color: #94a3b8; }

  /* Content card */
  .pd-content {
    background: white; border: 1px solid #e2e8f0;
    border-radius: 20px; padding: 28px;
    animation: fadeUp 0.2s ease both;
  }
  @keyframes fadeUp { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }

  .pd-section-title {
    font-family: 'Instrument Serif', serif;
    font-size: 1.2rem; font-weight: 400; color: #0f172a;
    margin: 0 0 20px;
  }

  /* Info grid */
  .pd-info-grid {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 16px;
  }
  .pd-info-block {
    background: #f8fafc; border: 1px solid #f1f5f9;
    border-radius: 14px; padding: 18px;
  }
  .pd-info-block-title {
    font-size: 0.7rem; font-weight: 600; letter-spacing: 0.08em;
    text-transform: uppercase; margin-bottom: 14px;
    display: flex; align-items: center; gap: 6px;
  }
  .pd-info-row { margin-bottom: 10px; }
  .pd-info-lbl { font-size: 0.68rem; color: #94a3b8; margin-bottom: 2px; text-transform: uppercase; letter-spacing: 0.05em; }
  .pd-info-val { font-size: 0.85rem; font-weight: 500; color: #0f172a; }

  /* Stat strip */
  .pd-stat-strip {
    display: grid; grid-template-columns: repeat(3,1fr);
    gap: 12px; margin-top: 20px;
  }
  .pd-stat-box {
    background: #f8fafc; border: 1px solid #f1f5f9;
    border-radius: 12px; padding: 14px; text-align: center;
  }
  .pd-stat-num {
    font-family: 'Instrument Serif', serif;
    font-size: 1.6rem; line-height: 1;
  }
  .pd-stat-lbl { font-size: 0.62rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 3px; }

  /* Appointment item */
  .pd-apt {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 16px; background: #f8fafc;
    border: 1px solid #f1f5f9; border-radius: 12px; margin-bottom: 8px;
    transition: border-color 0.12s;
  }
  .pd-apt:hover { border-color: #e2e8f0; }
  .pd-apt-date { font-size: 0.85rem; font-weight: 500; color: #0f172a; margin-bottom: 3px; }
  .pd-apt-sub { font-size: 0.72rem; color: #94a3b8; }

  /* Prescription card */
  .pd-presc {
    background: #f8fafc; border: 1px solid #f1f5f9;
    border-radius: 14px; padding: 18px; margin-bottom: 12px;
  }
  .pd-presc-header {
    display: flex; justify-content: space-between; align-items: flex-start;
    margin-bottom: 12px;
  }
  .pd-presc-name { font-size: 0.95rem; font-weight: 600; color: #0f172a; }
  .pd-presc-row {
    font-size: 0.78rem; color: #64748b; margin-bottom: 5px;
    display: flex; gap: 6px; align-items: baseline;
  }
  .pd-presc-row strong { color: #475569; font-weight: 500; }
  .pd-presc-instructions {
    margin-top: 10px; padding: 8px 12px;
    background: white; border-radius: 8px;
    font-size: 0.75rem; color: #64748b;
    border: 1px solid #f1f5f9;
  }
  .pd-presc-date { font-size: 0.68rem; color: #94a3b8; margin-top: 10px; }

  /* EHR card */
  .pd-ehr {
    background: #f8fafc; border: 1px solid #f1f5f9;
    border-radius: 14px; padding: 18px; margin-bottom: 12px;
  }
  .pd-ehr-header {
    display: flex; justify-content: space-between; align-items: flex-start;
    margin-bottom: 10px;
  }
  .pd-ehr-title { font-size: 0.95rem; font-weight: 600; color: #0f172a; }
  .pd-ehr-date { font-size: 0.7rem; color: #94a3b8; }
  .pd-ehr-body { font-size: 0.78rem; color: #64748b; line-height: 1.6; margin-bottom: 5px; }
  .pd-ehr-body strong { color: #475569; }
  .pd-tag {
    display: inline-flex; align-items: center; gap: 4px;
    font-size: 0.65rem; font-weight: 500;
    padding: 3px 8px; border-radius: 100px;
    background: #dbeafe; color: #1e40af;
    margin: 4px 4px 0 0;
  }

  /* Lab card */
  .pd-lab {
    background: #f8fafc; border: 1px solid #f1f5f9;
    border-radius: 14px; padding: 18px; margin-bottom: 12px;
  }
  .pd-lab-header {
    display: flex; justify-content: space-between; align-items: flex-start;
    margin-bottom: 10px;
  }
  .pd-lab-name { font-size: 0.95rem; font-weight: 600; color: #0f172a; }
  .pd-lab-result {
    padding: 10px 14px; border-radius: 10px;
    background: white; font-size: 0.84rem; font-weight: 500;
    border: 1px solid #f1f5f9;
  }

  /* Badges */
  .badge { display: inline-flex; align-items: center; font-size: 0.65rem; font-weight: 500; padding: 3px 9px; border-radius: 100px; }
  .badge-scheduled { background: #dbeafe; color: #1e40af; }
  .badge-confirmed { background: #d1fae5; color: #065f46; }
  .badge-completed { background: #dcfce7; color: #166534; }
  .badge-cancelled { background: #fee2e2; color: #991b1b; }
  .badge-active     { background: #dcfce7; color: #166534; }
  .badge-dispensed  { background: #dbeafe; color: #1e40af; }
  .badge-expired    { background: #f1f5f9; color: #64748b; }

  /* Empty */
  .pd-empty {
    text-align: center; padding: 52px 20px;
    background: #f8fafc; border-radius: 14px;
    border: 1px dashed #e2e8f0;
  }
  .pd-empty-icon { font-size: 2rem; margin-bottom: 10px; color: #e2e8f0; }
  .pd-empty-text { font-size: 0.82rem; color: #94a3b8; }

  /* Loading */
  .pd-loading {
    min-height: 400px; display: flex; align-items: center;
    justify-content: center; flex-direction: column; gap: 12px;
  }
  .pd-spinner {
    width: 30px; height: 30px; border: 2px solid #e2e8f0;
    border-top-color: #2563eb; border-radius: 50%;
    animation: spin 0.75s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  @media (max-width: 640px) {
    .pd-root { padding: 24px 16px; }
    .pd-hero { flex-direction: column; align-items: flex-start; }
    .pd-tabs { gap: 2px; }
  }
`;

function DoctorPatientDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [ehrRecords, setEhrRecords] = useState([]);
  const [labResults, setLabResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => { if (id) fetchPatientData(); }, [id]);

  const fetchPatientData = async () => {
    setLoading(true);
    try {
      const [patRes, aptRes, prescRes, ehrRes, labRes] = await Promise.allSettled([
        axios.get(`http://localhost:8081/api/patients/${id}`),
        axios.get(`http://localhost:8082/api/appointments/patient/${id}`),
        axios.get(`http://localhost:8087/api/prescriptions/patient/${id}`),
        axios.get(`http://localhost:8084/api/ehr/patient/${id}`),
        axios.get(`http://localhost:8085/api/lab/patient/${id}`),
      ]);
      if (patRes.status === 'fulfilled')   setPatient(patRes.value.data);
      if (aptRes.status === 'fulfilled')   setAppointments(aptRes.value.data || []);
      if (prescRes.status === 'fulfilled') setPrescriptions(prescRes.value.data || []);
      if (ehrRes.status === 'fulfilled')   setEhrRecords(ehrRes.value.data || []);
      if (labRes.status === 'fulfilled')   setLabResults(labRes.value.data || []);
    } catch {}
    setLoading(false);
  };

  const getInitials = (p) =>
    `${p?.firstName?.[0] || ''}${p?.lastName?.[0] || ''}`.toUpperCase();

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR', { day:'numeric', month:'long', year:'numeric' }) : '—';
  const formatDateTime = (d) => d ? new Date(d).toLocaleDateString('fr-FR', { day:'numeric', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit' }) : '—';

  const aptBadge = { SCHEDULED:'scheduled', CONFIRMED:'confirmed', COMPLETED:'completed', CANCELLED:'cancelled' };
  const aptLabel = { SCHEDULED:'Planifié', CONFIRMED:'Confirmé', COMPLETED:'Terminé', CANCELLED:'Annulé' };
  const prescBadge = { ACTIVE:'active', DISPENSED:'dispensed', CANCELLED:'cancelled', EXPIRED:'expired' };
  const prescLabel = { ACTIVE:'Active', DISPENSED:'Délivrée', CANCELLED:'Annulée', EXPIRED:'Expirée' };

  const tabs = [
    { id: 'info',          label: 'Informations',    icon: 'bi-person',        count: 0 },
    { id: 'appointments',  label: 'Rendez-vous',     icon: 'bi-calendar-check',count: appointments.length },
    { id: 'prescriptions', label: 'Prescriptions',   icon: 'bi-capsule',       count: prescriptions.length },
    { id: 'ehr',           label: 'Dossier médical', icon: 'bi-file-medical',  count: ehrRecords.length },
    { id: 'lab',           label: 'Analyses',        icon: 'bi-flask',         count: labResults.length },
  ];

  if (loading) return (
    <>
      <style>{styles}</style>
      <div className="pd-loading">
        <div className="pd-spinner" />
        <span style={{fontSize:'0.8rem', color:'#94a3b8'}}>Chargement du dossier…</span>
      </div>
    </>
  );

  if (!patient) return (
    <>
      <style>{styles}</style>
      <div className="pd-root" style={{textAlign:'center', paddingTop:'80px'}}>
        <div style={{fontSize:'2rem', marginBottom:'12px'}}>🔍</div>
        <div style={{fontSize:'1rem', fontWeight:'500', marginBottom:'6px'}}>Patient introuvable</div>
        <div style={{fontSize:'0.8rem', color:'#94a3b8', marginBottom:'24px'}}>L'identifiant #{id} ne correspond à aucun patient.</div>
        <button className="pd-btn-primary" onClick={() => navigate('/doctor/patients')}>
          <i className="bi bi-arrow-left" /> Retour à la liste
        </button>
      </div>
    </>
  );

  const age = patient.dateOfBirth
    ? Math.floor((new Date() - new Date(patient.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000))
    : null;

  return (
    <>
      <style>{styles}</style>
      <div className="pd-root">

        {/* Back */}
        <button className="pd-back" onClick={() => navigate('/doctor/patients')}>
          <i className="bi bi-arrow-left" /> Retour à la liste des patients
        </button>

        {/* Hero */}
        <div className="pd-hero">
          <div className="pd-hero-left">
            <div className="pd-avatar">{getInitials(patient)}</div>
            <div>
              <h1 className="pd-name">{patient.firstName} {patient.lastName}</h1>
              <div className="pd-meta">
                <div className="pd-meta-item"><i className="bi bi-envelope" />{patient.email}</div>
                {patient.phone && <div className="pd-meta-item"><i className="bi bi-telephone" />{patient.phone}</div>}
                {age !== null && <div className="pd-meta-item"><i className="bi bi-person" />{age} ans</div>}
                {patient.address && <div className="pd-meta-item"><i className="bi bi-geo-alt" />{patient.address}</div>}
              </div>
            </div>
          </div>
          <Link to={`/doctor/prescriptions/new?patientId=${patient.id}`} className="pd-btn-primary">
            <i className="bi bi-capsule" /> Nouvelle prescription
          </Link>
        </div>

        {/* Tabs */}
        <div className="pd-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`pd-tab${activeTab === tab.id ? ' active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <i className={`bi ${tab.icon}`} />
              {tab.label}
              {tab.count > 0 && <span className="pd-tab-count">{tab.count}</span>}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="pd-content">

          {/* INFO */}
          {activeTab === 'info' && (
            <>
              <div className="pd-section-title">Informations du patient</div>
              <div className="pd-info-grid">
                <div className="pd-info-block">
                  <div className="pd-info-block-title" style={{color:'#2563eb'}}>
                    <i className="bi bi-person-badge" /> Identité
                  </div>
                  <div className="pd-info-row">
                    <div className="pd-info-lbl">ID Patient</div>
                    <div className="pd-info-val">#{patient.id}</div>
                  </div>
                  <div className="pd-info-row">
                    <div className="pd-info-lbl">Nom complet</div>
                    <div className="pd-info-val">{patient.firstName} {patient.lastName}</div>
                  </div>
                  {patient.socialSecurityNumber && (
                    <div className="pd-info-row">
                      <div className="pd-info-lbl">N° Sécu</div>
                      <div className="pd-info-val">{patient.socialSecurityNumber}</div>
                    </div>
                  )}
                  {patient.dateOfBirth && (
                    <div className="pd-info-row">
                      <div className="pd-info-lbl">Naissance</div>
                      <div className="pd-info-val">{formatDate(patient.dateOfBirth)} ({age} ans)</div>
                    </div>
                  )}
                </div>

                <div className="pd-info-block">
                  <div className="pd-info-block-title" style={{color:'#059669'}}>
                    <i className="bi bi-envelope" /> Contact
                  </div>
                  <div className="pd-info-row">
                    <div className="pd-info-lbl">Email</div>
                    <div className="pd-info-val">{patient.email}</div>
                  </div>
                  {patient.phone && (
                    <div className="pd-info-row">
                      <div className="pd-info-lbl">Téléphone</div>
                      <div className="pd-info-val">{patient.phone}</div>
                    </div>
                  )}
                  {patient.address && (
                    <div className="pd-info-row">
                      <div className="pd-info-lbl">Adresse</div>
                      <div className="pd-info-val">{patient.address}</div>
                    </div>
                  )}
                </div>
              </div>

              <div className="pd-stat-strip" style={{marginTop:'20px'}}>
                {[
                  { num: appointments.length, lbl: 'Rendez-vous', color: '#2563eb' },
                  { num: prescriptions.length, lbl: 'Prescriptions', color: '#059669' },
                  { num: appointments.filter(a => a.status === 'COMPLETED').length, lbl: 'Consultations', color: '#7c3aed' },
                ].map((s, i) => (
                  <div key={i} className="pd-stat-box">
                    <div className="pd-stat-num" style={{color:s.color}}>{s.num}</div>
                    <div className="pd-stat-lbl">{s.lbl}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* APPOINTMENTS */}
          {activeTab === 'appointments' && (
            <>
              <div className="pd-section-title">Historique des rendez-vous</div>
              {appointments.length === 0 ? (
                <div className="pd-empty">
                  <div className="pd-empty-icon"><i className="bi bi-calendar3" /></div>
                  <div className="pd-empty-text">Aucun rendez-vous pour ce patient</div>
                </div>
              ) : (
                [...appointments]
                  .sort((a,b) => new Date(b.appointmentDateTime) - new Date(a.appointmentDateTime))
                  .map(apt => (
                    <div key={apt.id} className="pd-apt">
                      <div>
                        <div className="pd-apt-date">{formatDateTime(apt.appointmentDateTime)}</div>
                        <div className="pd-apt-sub">{apt.reason || 'Consultation'}{apt.notes ? ` · ${apt.notes}` : ''}</div>
                      </div>
                      <span className={`badge badge-${aptBadge[apt.status] || 'scheduled'}`}>
                        {aptLabel[apt.status] || apt.status}
                      </span>
                    </div>
                  ))
              )}
            </>
          )}

          {/* PRESCRIPTIONS */}
          {activeTab === 'prescriptions' && (
            <>
              <div className="pd-section-title">Prescriptions médicales</div>
              {prescriptions.length === 0 ? (
                <div className="pd-empty">
                  <div className="pd-empty-icon"><i className="bi bi-capsule" /></div>
                  <div className="pd-empty-text">Aucune prescription pour ce patient</div>
                </div>
              ) : (
                prescriptions.map(presc => (
                  <div key={presc.id} className="pd-presc">
                    <div className="pd-presc-header">
                      <div className="pd-presc-name">{presc.medicationName}</div>
                      <span className={`badge badge-${prescBadge[presc.status] || 'expired'}`}>
                        {prescLabel[presc.status] || presc.status}
                      </span>
                    </div>
                    {presc.dosage && <div className="pd-presc-row"><strong>Dosage :</strong>{presc.dosage}</div>}
                    {presc.frequency && <div className="pd-presc-row"><strong>Fréquence :</strong>{presc.frequency}</div>}
                    {presc.duration && <div className="pd-presc-row"><strong>Durée :</strong>{presc.duration}</div>}
                    {presc.instructions && (
                      <div className="pd-presc-instructions">
                        <i className="bi bi-info-circle" style={{color:'#2563eb', marginRight:'6px'}} />
                        {presc.instructions}
                      </div>
                    )}
                    <div className="pd-presc-date">Prescrit le {formatDate(presc.prescribedDate)}</div>
                  </div>
                ))
              )}
            </>
          )}

          {/* EHR */}
          {activeTab === 'ehr' && (
            <>
              <div className="pd-section-title">Dossier médical électronique</div>
              {ehrRecords.length === 0 ? (
                <div className="pd-empty">
                  <div className="pd-empty-icon"><i className="bi bi-file-medical" /></div>
                  <div className="pd-empty-text">Aucun dossier médical pour ce patient</div>
                </div>
              ) : (
                ehrRecords.map((ehr, i) => (
                  <div key={ehr._id || ehr.id || i} className="pd-ehr">
                    <div className="pd-ehr-header">
                      <div className="pd-ehr-title">{ehr.diagnosis || 'Consultation'}</div>
                      <div className="pd-ehr-date">{formatDate(ehr.date || ehr.createdAt)}</div>
                    </div>
                    {ehr.symptoms && ehr.symptoms.length > 0 && (
                      <div style={{marginBottom:'8px'}}>
                        <div style={{fontSize:'0.68rem', color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'5px'}}>Symptômes</div>
                        {(Array.isArray(ehr.symptoms) ? ehr.symptoms : [ehr.symptoms]).map((s, idx) => (
                          <span key={idx} className="pd-tag"><i className="bi bi-dot" />{s}</span>
                        ))}
                      </div>
                    )}
                    {ehr.treatment && <div className="pd-ehr-body"><strong>Traitement :</strong> {ehr.treatment}</div>}
                    {ehr.notes && <div className="pd-ehr-body"><strong>Notes :</strong> {ehr.notes}</div>}
                    {ehr.medications?.length > 0 && (
                      <div style={{marginTop:'8px'}}>
                        {ehr.medications.map((m, idx) => (
                          <span key={idx} className="pd-tag" style={{background:'#d1fae5', color:'#065f46'}}>
                            <i className="bi bi-capsule" />{m}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </>
          )}

          {/* LAB */}
          {activeTab === 'lab' && (
            <>
              <div className="pd-section-title">Résultats de laboratoire</div>
              {labResults.length === 0 ? (
                <div className="pd-empty">
                  <div className="pd-empty-icon"><i className="bi bi-flask" /></div>
                  <div className="pd-empty-text">Aucune analyse pour ce patient</div>
                </div>
              ) : (
                labResults.map((lab, i) => {
                  const isNormal = lab.result?.toLowerCase().includes('normal');
                  const isAbnormal = lab.result?.toLowerCase().includes('anormal');
                  const resultColor = isNormal ? '#059669' : isAbnormal ? '#dc2626' : '#0f172a';
                  return (
                    <div key={lab._id || lab.id || i} className="pd-lab">
                      <div className="pd-lab-header">
                        <div className="pd-lab-name">{lab.testName}</div>
                        <div style={{fontSize:'0.7rem', color:'#94a3b8'}}>{formatDate(lab.date)}</div>
                      </div>
                      <div className="pd-lab-result" style={{color: resultColor}}>
                        {lab.result}
                      </div>
                      {lab.notes && (
                        <div style={{fontSize:'0.75rem', color:'#64748b', marginTop:'8px'}}>
                          <i className="bi bi-info-circle" style={{color:'#2563eb', marginRight:'5px'}} />
                          {lab.notes}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </>
          )}

        </div>
      </div>
    </>
  );
}

export default DoctorPatientDetail;