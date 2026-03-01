import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const styles = `...`; // Gardez le même styles

function DoctorPatients() {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState({});
  const [ehrRecords, setEhrRecords] = useState({});
  const [labResults, setLabResults] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [activeTab, setActiveTab] = useState('info');
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    if (user?.id) fetchPatientsData();
  }, [user]);

  const fetchPatientsData = async () => {
    try {
      setLoading(true);
      const appointmentsRes = await axios.get(`http://localhost:8082/api/appointments/doctor/${user.id}`);
      const doctorAppointments = appointmentsRes.data;
      setAppointments(doctorAppointments);

      const patientIds = [...new Set(doctorAppointments.map(apt => apt.patientId))];
      const patientsData = [];
      for (const patientId of patientIds) {
        try {
          const patientRes = await axios.get(`http://localhost:8081/api/patients/${patientId}`);
          patientsData.push({ ...patientRes.data });
        } catch {}
      }
      setPatients(patientsData);
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  const fetchPatientCompleteData = async (patientId) => {
  setLoadingData(true);
  try {
    console.log(`🔄 Chargement des données pour patient ID: ${patientId}`);
    
    // Récupérer les prescriptions depuis le service pharmacie (port 8087)
    const prescRes = await axios.get(`http://localhost:8087/api/prescriptions/patient/${patientId}`);
    console.log(`✅ Prescriptions reçues pour ${patientId}:`, prescRes.data);
    setPrescriptions(prev => ({ ...prev, [patientId]: prescRes.data }));

    // Récupérer les dossiers médicaux (EHR)
    const ehrRes = await axios.get(`http://localhost:8084/api/ehr/patient/${patientId}`);
    console.log(`✅ Dossiers médicaux reçus pour ${patientId}:`, ehrRes.data);
    
    // FORCER la mise à jour de l'état avec une nouvelle référence
    setEhrRecords(prev => {
      const newState = { ...prev };
      newState[patientId] = ehrRes.data;
      console.log('📊 Nouvel état ehrRecords:', newState);
      return newState;
    });

    // Récupérer les résultats labo
    const labRes = await axios.get(`http://localhost:8085/api/lab/patient/${patientId}`);
    console.log(`✅ Résultats labo reçus pour ${patientId}:`, labRes.data);
    setLabResults(prev => ({ ...prev, [patientId]: labRes.data }));
    
  } catch (err) {
    console.error(`❌ Erreur chargement données patient ${patientId}:`, err);
  }
  setLoadingData(false);
};

  const openPatient = (patient) => {
    console.log('👤 Ouverture du patient:', patient);
    setSelectedPatient(patient);
    setActiveTab('info');
    fetchPatientCompleteData(patient.id);
  };

  const handleTabChange = (tab) => {
  console.log('📋 Changement d\'onglet vers:', tab);
  setActiveTab(tab);
  
  // Si on change vers l'onglet EHR et que les données ne sont pas chargées
  if (tab === 'ehr' && selectedPatient) {
    if (!ehrRecords[selectedPatient.id] || ehrRecords[selectedPatient.id].length === 0) {
      console.log('📋 Données EHR manquantes, rechargement...');
      fetchPatientCompleteData(selectedPatient.id);
    }
  }
  
  // Si on change vers l'onglet Prescriptions et que les données ne sont pas chargées
  if (tab === 'prescriptions' && selectedPatient) {
    if (!prescriptions[selectedPatient.id] || prescriptions[selectedPatient.id].length === 0) {
      console.log('💊 Données prescriptions manquantes, rechargement...');
      fetchPatientCompleteData(selectedPatient.id);
    }
  }
  
  // Si on change vers l'onglet Lab et que les données ne sont pas chargées
  if (tab === 'lab' && selectedPatient) {
    if (!labResults[selectedPatient.id] || labResults[selectedPatient.id].length === 0) {
      console.log('🔬 Données labo manquantes, rechargement...');
      fetchPatientCompleteData(selectedPatient.id);
    }
  }
};

  const getPatientAppointments = (patientId) =>
    appointments.filter(apt => apt.patientId === patientId);

  const getLastAppointmentDate = (patientId) => {
    const apts = getPatientAppointments(patientId);
    if (!apts.length) return 'Aucun';
    const last = [...apts].sort((a, b) => new Date(b.appointmentDateTime) - new Date(a.appointmentDateTime))[0];
    return new Date(last.appointmentDateTime).toLocaleDateString('fr-FR');
  };

  const getNextAppointment = (patientId) => {
    const now = new Date();
    const upcoming = getPatientAppointments(patientId)
      .filter(apt => new Date(apt.appointmentDateTime) > now && apt.status !== 'CANCELLED')
      .sort((a, b) => new Date(a.appointmentDateTime) - new Date(b.appointmentDateTime));
    return upcoming[0] || null;
  };

  const getInitials = (p) =>
    `${p?.firstName?.[0] || ''}${p?.lastName?.[0] || ''}`.toUpperCase();

  const getStatusBadge = (status) => {
    const map = {
      COMPLETED: ['completed', 'Terminé'],
      CANCELLED: ['cancelled', 'Annulé'],
      CONFIRMED: ['confirmed', 'Confirmé'],
      SCHEDULED: ['scheduled', 'Planifié'],
    };
    const [cls, label] = map[status] || ['scheduled', status];
    return <span className={`badge-apt ${cls}`}>{label}</span>;
  };

  const getPrescriptionStatusBadge = (status) => {
    const map = {
      ACTIVE: ['active', 'Active'],
      DISPENSED: ['dispensed', 'Délivrée'],
      CANCELLED: ['cancelled', 'Annulée'],
      EXPIRED: ['expired', 'Expirée'],
    };
    const [cls, label] = map[status] || ['expired', status];
    return <span className={`badge-prescription ${cls}`}>{label}</span>;
  };

  const getLabResultClass = (result) => {
    if (!result) return '';
    const lower = result.toLowerCase();
    if (lower.includes('normal') || lower.includes('négatif')) return 'dp-lab-normal';
    if (lower.includes('anormal') || lower.includes('positif')) return 'dp-lab-abnormal';
    return '';
  };

  const filteredPatients = patients.filter(p => {
    const q = searchTerm.toLowerCase();
    return `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
           p.email?.toLowerCase().includes(q) ||
           p.phone?.includes(q);
  });

  if (loading) return (
    <>
      <style>{styles}</style>
      <div className="dp-loading">
        <div className="dp-spinner" />
        <span className="dp-loading-text">Chargement de vos patients…</span>
      </div>
    </>
  );

  return (
    <>
      <style>{styles}</style>
      <div className="dp-root">

        {/* Header */}
        <div className="dp-header">
          <div>
            <h1 className="dp-title">Mes patients</h1>
            <p className="dp-subtitle">
              Dr. {user?.firstName} {user?.lastName} · {user?.specialty || 'Médecin'}
            </p>
          </div>
          <div className="dp-stats">
            <div className="dp-stat">
              <span className="dp-stat-num blue">{patients.length}</span>
              <span className="dp-stat-lbl">Patients</span>
            </div>
            <div className="dp-stat">
              <span className="dp-stat-num green">{appointments.length}</span>
              <span className="dp-stat-lbl">Rendez-vous</span>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="dp-search-wrap">
          <i className="bi bi-search dp-search-icon" />
          <input
            type="text"
            className="dp-search-input"
            placeholder="Rechercher un patient…"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="dp-search-clear" onClick={() => setSearchTerm('')}>
              <i className="bi bi-x" />
            </button>
          )}
        </div>

        {/* Grid */}
        <div className="dp-grid">
          {filteredPatients.length === 0 ? (
            <div className="dp-empty">
              <div className="dp-empty-icon"><i className="bi bi-people" /></div>
              <div className="dp-empty-title">Aucun patient trouvé</div>
              <div className="dp-empty-sub">Vos patients apparaîtront ici une fois des rendez-vous planifiés.</div>
            </div>
          ) : filteredPatients.map((patient, i) => {
            const next = getNextAppointment(patient.id);
            const aptCount = getPatientAppointments(patient.id).length;
            return (
              <div
                key={patient.id}
                className="dp-card"
                style={{ animationDelay: `${i * 40}ms` }}
                onClick={() => openPatient(patient)}
              >
                <div className="dp-card-top">
                  <div className="dp-avatar">{getInitials(patient)}</div>
                  <div>
                    <div className="dp-patient-name">{patient.firstName} {patient.lastName}</div>
                    <div className="dp-patient-email">{patient.email}</div>
                  </div>
                </div>

                <div className="dp-mini-stats">
                  <div className="dp-mini-stat">
                    <div className="dp-mini-num blue">{aptCount}</div>
                    <div className="dp-mini-lbl">Rendez-vous</div>
                  </div>
                  <div className="dp-mini-stat">
                    <div className="dp-mini-num green">{next ? '✓' : '—'}</div>
                    <div className="dp-mini-lbl">Prochain RDV</div>
                  </div>
                </div>

                <div className="dp-card-footer">
                  <div className="dp-card-footer-item">
                    <i className="bi bi-calendar3" />
                    <span>Dernier : {getLastAppointmentDate(patient.id)}</span>
                  </div>
                  <div className="dp-card-footer-item">
                    <i className="bi bi-telephone" />
                    <span>{patient.phone || 'N/A'}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal avec dossier médical complet */}
      {selectedPatient && (
        <div className="dp-overlay" onClick={() => setSelectedPatient(null)}>
          <div className="dp-modal" onClick={e => e.stopPropagation()}>

            {/* Modal header */}
            <div className="dp-modal-header">
              <div className="dp-modal-header-top">
                <div>
                  <div className="dp-modal-avatar">{getInitials(selectedPatient)}</div>
                  <div className="dp-modal-name">{selectedPatient.firstName} {selectedPatient.lastName}</div>
                  <div className="dp-modal-email">{selectedPatient.email}</div>
                </div>
                <button className="dp-close" onClick={() => setSelectedPatient(null)}>
                  <i className="bi bi-x" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="dp-modal-tabs">
              <button
                className={`dp-modal-tab${activeTab === 'info' ? ' active' : ''}`}
                onClick={() => handleTabChange('info')}
              >
                <i className="bi bi-person" /> Informations
              </button>
              <button
                className={`dp-modal-tab${activeTab === 'rdv' ? ' active' : ''}`}
                onClick={() => handleTabChange('rdv')}
              >
                <i className="bi bi-calendar3" /> Rendez-vous
              </button>
              <button
                className={`dp-modal-tab${activeTab === 'prescriptions' ? ' active' : ''}`}
                onClick={() => handleTabChange('prescriptions')}
              >
                <i className="bi bi-capsule" /> Prescriptions
              </button>
              <button
                className={`dp-modal-tab${activeTab === 'ehr' ? ' active' : ''}`}
                onClick={() => handleTabChange('ehr')}
              >
                <i className="bi bi-file-medical" /> Dossiers médicaux
              </button>
              <button
                className={`dp-modal-tab${activeTab === 'lab' ? ' active' : ''}`}
                onClick={() => handleTabChange('lab')}
              >
                <i className="bi bi-flask" /> Analyses
              </button>
            </div>

            {/* Modal body */}
            <div className="dp-modal-body">
              {loadingData ? (
                <div style={{textAlign:'center', padding:'40px'}}>
                  <div className="dp-spinner" style={{margin:'0 auto 15px'}} />
                  <span style={{fontSize:'0.85rem', color:'#94a3b8'}}>Chargement des données...</span>
                </div>
              ) : (
                <>
                  {/* Tab: Info */}
                  {activeTab === 'info' && (
                    <>
                      <div className="dp-section-label">Contact</div>
                      <div className="dp-info-row">
                        <i className="bi bi-envelope dp-info-icon" />
                        <span className="dp-info-label">Email</span>
                        <span>{selectedPatient.email}</span>
                      </div>
                      {selectedPatient.phone && (
                        <div className="dp-info-row">
                          <i className="bi bi-telephone dp-info-icon" />
                          <span className="dp-info-label">Téléphone</span>
                          <span>{selectedPatient.phone}</span>
                        </div>
                      )}
                      {selectedPatient.address && (
                        <div className="dp-info-row">
                          <i className="bi bi-geo-alt dp-info-icon" />
                          <span className="dp-info-label">Adresse</span>
                          <span>{selectedPatient.address}</span>
                        </div>
                      )}
                      {selectedPatient.dateOfBirth && (
                        <div className="dp-info-row">
                          <i className="bi bi-calendar-heart dp-info-icon" />
                          <span className="dp-info-label">Naissance</span>
                          <span>{new Date(selectedPatient.dateOfBirth).toLocaleDateString('fr-FR')}</span>
                        </div>
                      )}
                      {selectedPatient.socialSecurityNumber && (
                        <div className="dp-info-row">
                          <i className="bi bi-shield-check dp-info-icon" />
                          <span className="dp-info-label">N° sécu</span>
                          <span>{selectedPatient.socialSecurityNumber}</span>
                        </div>
                      )}

                      <div className="dp-section-label">Statistiques</div>
                      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'10px'}}>
                        {[
                          { num: getPatientAppointments(selectedPatient.id).length, lbl: 'Total RDV', color: '#2563eb' },
                          { num: getPatientAppointments(selectedPatient.id).filter(a => a.status === 'COMPLETED').length, lbl: 'Terminés', color: '#059669' },
                          { num: getPatientAppointments(selectedPatient.id).filter(a => a.status === 'CANCELLED').length, lbl: 'Annulés', color: '#dc2626' },
                        ].map((s, i) => (
                          <div key={i} className="dp-mini-stat">
                            <div className="dp-mini-num" style={{color: s.color}}>{s.num}</div>
                            <div className="dp-mini-lbl">{s.lbl}</div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {/* Tab: Rendez-vous */}
                  {activeTab === 'rdv' && (
                    <>
                      <div className="dp-section-label">Historique des rendez-vous</div>
                      {getPatientAppointments(selectedPatient.id).length === 0 ? (
                        <p style={{color:'#94a3b8', fontSize:'0.82rem', textAlign:'center', padding:'24px 0'}}>
                          Aucun rendez-vous
                        </p>
                      ) : (
                        [...getPatientAppointments(selectedPatient.id)]
                          .sort((a, b) => new Date(b.appointmentDateTime) - new Date(a.appointmentDateTime))
                          .map(apt => {
                            const d = new Date(apt.appointmentDateTime);
                            return (
                              <div key={apt.id} className="dp-apt-item">
                                <div>
                                  <div className="dp-apt-date">
                                    {d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
                                  </div>
                                  <div className="dp-apt-time">
                                    {d.toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' })}
                                    {apt.reason && ` · ${apt.reason}`}
                                  </div>
                                </div>
                                {getStatusBadge(apt.status)}
                              </div>
                            );
                          })
                      )}
                    </>
                  )}

                  {/* Tab: Prescriptions */}
                  {activeTab === 'prescriptions' && (
                    <>
                      <div className="dp-section-label">Prescriptions</div>
                      {!prescriptions[selectedPatient.id] || prescriptions[selectedPatient.id].length === 0 ? (
                        <div style={{textAlign:'center', padding:'40px 20px', background:'#f8fafc', borderRadius:'14px'}}>
                          <div style={{fontSize:'2rem', marginBottom:'10px'}}>💊</div>
                          <div style={{fontSize:'0.85rem', color:'#334155', marginBottom:'6px'}}>Aucune prescription</div>
                          <div style={{fontSize:'0.75rem', color:'#94a3b8'}}>Ce patient n'a pas de prescriptions actives.</div>
                        </div>
                      ) : (
                        prescriptions[selectedPatient.id].map(presc => (
                          <div key={presc.id} className="dp-prescription-item">
                            <div className="dp-prescription-header">
                              <span className="dp-prescription-name">{presc.medicationName}</span>
                              {getPrescriptionStatusBadge(presc.status)}
                            </div>
                            <div className="dp-prescription-detail">
                              <span><i className="bi bi-eyedropper" /> {presc.dosage}</span>
                              <span><i className="bi bi-clock" /> {presc.frequency}</span>
                              {presc.duration && <span><i className="bi bi-calendar-week" /> {presc.duration}</span>}
                            </div>
                            {presc.instructions && (
                              <div style={{marginTop:'8px', fontSize:'0.7rem', color:'#64748b', background:'white', padding:'6px', borderRadius:'6px'}}>
                                <i className="bi bi-info-circle" style={{marginRight:'4px', color:'#2563eb'}} />
                                {presc.instructions}
                              </div>
                            )}
                            <div style={{marginTop:'6px', fontSize:'0.65rem', color:'#94a3b8'}}>
                              Prescrit le {new Date(presc.prescribedDate).toLocaleDateString('fr-FR')}
                            </div>
                          </div>
                        ))
                      )}
                    </>
                  )}

                  {/* Tab: Dossiers médicaux (EHR) */}
                 
{activeTab === 'ehr' && (
  <>
    <div className="dp-section-label">Dossiers médicaux</div>
    {console.log('📁 Affichage EHR pour patient', selectedPatient.id, ':', ehrRecords[selectedPatient.id])}
    {loadingData ? (
      <div style={{textAlign:'center', padding:'40px'}}>
        <div className="dp-spinner" style={{margin:'0 auto 15px'}} />
        <span style={{fontSize:'0.85rem', color:'#94a3b8'}}>Chargement des dossiers médicaux...</span>
      </div>
    ) : !ehrRecords[selectedPatient.id] || ehrRecords[selectedPatient.id].length === 0 ? (
      <div style={{textAlign:'center', padding:'40px 20px', background:'#f8fafc', borderRadius:'14px'}}>
        <div style={{fontSize:'2rem', marginBottom:'10px'}}>📋</div>
        <div style={{fontSize:'0.85rem', color:'#334155', marginBottom:'6px'}}>Dossier vide</div>
        <div style={{fontSize:'0.75rem', color:'#94a3b8'}}>Aucun dossier médical pour ce patient.</div>
      </div>
    ) : (
      ehrRecords[selectedPatient.id].map(ehr => (
        <div key={ehr._id || ehr.id} className="dp-ehr-card">
          <div className="dp-ehr-header">
            <span className="dp-ehr-title">{ehr.diagnosis || 'Consultation'}</span>
            <span className="dp-ehr-date">
              {new Date(ehr.date || ehr.createdAt).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </span>
          </div>
          
          {ehr.symptoms && ehr.symptoms.length > 0 && (
            <div className="dp-ehr-content">
              <strong style={{color:'#475569'}}>Symptômes :</strong> {ehr.symptoms.join(', ')}
            </div>
          )}
          
          {ehr.vitalSigns && (
            <div className="dp-ehr-content">
              <strong style={{color:'#475569'}}>Signes vitaux :</strong>
              <div style={{display:'flex', flexWrap:'wrap', gap:'10px', marginTop:'4px'}}>
                {ehr.vitalSigns.bloodPressure && <span className="dp-ehr-tag"><i className="bi bi-heart-pulse" /> TA: {ehr.vitalSigns.bloodPressure}</span>}
                {ehr.vitalSigns.heartRate && <span className="dp-ehr-tag"><i className="bi bi-heart" /> FC: {ehr.vitalSigns.heartRate}</span>}
                {ehr.vitalSigns.temperature && <span className="dp-ehr-tag"><i className="bi bi-thermometer" /> T°: {ehr.vitalSigns.temperature}°C</span>}
                {ehr.vitalSigns.oxygenSaturation && <span className="dp-ehr-tag"><i className="bi bi-lungs" /> SpO₂: {ehr.vitalSigns.oxygenSaturation}%</span>}
              </div>
            </div>
          )}
          
          {ehr.notes && (
            <div className="dp-ehr-content" style={{marginTop:'8px', background:'white', padding:'8px', borderRadius:'6px'}}>
              <i className="bi bi-chat-dots" style={{marginRight:'4px', color:'#2563eb'}} />
              {ehr.notes}
            </div>
          )}
        </div>
      ))
    )}
  </>
)}

                  {/* Tab: Analyses labo */}
                  {activeTab === 'lab' && (
                    <>
                      <div className="dp-section-label">Résultats de laboratoire</div>
                      {!labResults[selectedPatient.id] || labResults[selectedPatient.id].length === 0 ? (
                        <div style={{textAlign:'center', padding:'40px 20px', background:'#f8fafc', borderRadius:'14px'}}>
                          <div style={{fontSize:'2rem', marginBottom:'10px'}}>🔬</div>
                          <div style={{fontSize:'0.85rem', color:'#334155', marginBottom:'6px'}}>Aucune analyse</div>
                          <div style={{fontSize:'0.75rem', color:'#94a3b8'}}>Ce patient n'a pas de résultats de laboratoire.</div>
                        </div>
                      ) : (
                        labResults[selectedPatient.id].map(lab => (
                          <div key={lab._id || lab.id} className="dp-lab-card">
                            <div className="dp-lab-header">
                              <span className="dp-lab-name">{lab.testName}</span>
                              <span className="dp-lab-date">{new Date(lab.date).toLocaleDateString('fr-FR')}</span>
                            </div>
                            <div className={`dp-lab-result ${getLabResultClass(lab.result)}`}>
                              {lab.result}
                            </div>
                            {lab.referenceRange && (
                              <div style={{fontSize:'0.7rem', color:'#94a3b8', marginTop:'4px'}}>
                                <i className="bi bi-info-circle" /> Référence : {lab.referenceRange}
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </>
                  )}
                </>
              )}
            </div>

            {/* Actions - Deux boutons : Prescrire et Voir analyses */}
            <div className="dp-modal-actions">
              <Link
                to={`/doctor/prescriptions?patientId=${selectedPatient.id}`}
                className="dp-action-btn primary"
              >
                <i className="bi bi-capsule" /> Prescrire
              </Link>
              <Link
                to={`/doctor/lab-results?patientId=${selectedPatient.id}`}
                className="dp-action-btn secondary"
              >
                <i className="bi bi-flask" /> Voir analyses
              </Link>
            </div>

          </div>
        </div>
      )}
    </>
  );
}

export default DoctorPatients;