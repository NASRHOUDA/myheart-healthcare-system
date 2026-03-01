import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Outfit:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; }

  .dp-root {
    max-width: 1200px;
    margin: 0 auto;
    padding: 40px 28px;
    font-family: 'Outfit', sans-serif;
    color: #0f172a;
    background: #f8fafc;
    min-height: 100vh;
  }

  /* Header */
  .dp-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 32px;
    flex-wrap: wrap;
    gap: 16px;
  }
  .dp-title {
    font-family: 'Instrument Serif', serif;
    font-size: 2rem;
    font-weight: 400;
    color: #0f172a;
    margin: 0 0 4px;
    line-height: 1;
  }
  .dp-subtitle { font-size: 0.82rem; color: #94a3b8; font-weight: 300; }

  /* Stats */
  .dp-stats { display: flex; gap: 20px; align-items: center; }
  .dp-stat {
    display: flex; flex-direction: column; align-items: center;
    gap: 2px; min-width: 60px;
  }
  .dp-stat-num {
    font-family: 'Instrument Serif', serif;
    font-size: 1.8rem; line-height: 1;
  }
  .dp-stat-num.blue { color: #2563eb; }
  .dp-stat-num.green { color: #059669; }
  .dp-stat-lbl { font-size: 0.65rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.06em; }

  /* Search */
  .dp-search-wrap {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    padding: 14px 18px;
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    gap: 10px;
    max-width: 400px;
    transition: border-color 0.15s;
  }
  .dp-search-wrap:focus-within { border-color: #2563eb; }
  .dp-search-icon { color: #cbd5e1; font-size: 0.9rem; }
  .dp-search-input {
    flex: 1; border: none; background: transparent;
    font-size: 0.85rem; font-family: 'Outfit', sans-serif;
    color: #0f172a; outline: none;
  }
  .dp-search-input::placeholder { color: #cbd5e1; }
  .dp-search-clear {
    background: none; border: none; color: #cbd5e1;
    cursor: pointer; font-size: 1rem; padding: 0;
    transition: color 0.1s;
  }
  .dp-search-clear:hover { color: #94a3b8; }

  /* Grid */
  .dp-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: 16px;
  }

  /* Patient card */
  .dp-card {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 20px;
    padding: 22px;
    cursor: pointer;
    transition: all 0.18s;
    animation: cardIn 0.3s ease both;
  }
  .dp-card:hover {
    border-color: #2563eb;
    box-shadow: 0 8px 28px rgba(37,99,235,0.08);
    transform: translateY(-2px);
  }
  @keyframes cardIn {
    from { opacity:0; transform:translateY(10px); }
    to   { opacity:1; transform:translateY(0); }
  }

  .dp-card-top {
    display: flex; align-items: center;
    gap: 14px; margin-bottom: 18px;
  }
  .dp-avatar {
    width: 52px; height: 52px;
    border-radius: 14px;
    background: linear-gradient(135deg, #eff6ff, #dbeafe);
    border: 1px solid #bfdbfe;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.85rem; font-weight: 600; color: #2563eb;
    flex-shrink: 0;
  }
  .dp-patient-name {
    font-size: 0.95rem; font-weight: 600; color: #0f172a; margin-bottom: 2px;
  }
  .dp-patient-email { font-size: 0.75rem; color: #94a3b8; }

  /* Mini stats */
  .dp-mini-stats {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 10px; margin-bottom: 16px;
  }
  .dp-mini-stat {
    background: #f8fafc;
    border: 1px solid #f1f5f9;
    border-radius: 10px;
    padding: 10px;
    text-align: center;
  }
  .dp-mini-num {
    font-family: 'Instrument Serif', serif;
    font-size: 1.3rem; line-height: 1;
  }
  .dp-mini-num.blue { color: #2563eb; }
  .dp-mini-num.green { color: #059669; }
  .dp-mini-lbl { font-size: 0.62rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 2px; }

  .dp-card-footer {
    display: flex; justify-content: space-between;
    font-size: 0.72rem; color: #94a3b8; align-items: center;
  }
  .dp-card-footer-item { display: flex; align-items: center; gap: 5px; }

  /* Empty state */
  .dp-empty {
    background: white; border: 1px solid #e2e8f0;
    border-radius: 20px; padding: 64px 20px;
    text-align: center; grid-column: 1 / -1;
  }
  .dp-empty-icon { font-size: 2.5rem; color: #e2e8f0; margin-bottom: 14px; }
  .dp-empty-title { font-size: 1rem; font-weight: 500; color: #334155; margin-bottom: 6px; }
  .dp-empty-sub { font-size: 0.8rem; color: #94a3b8; }

  /* Loading */
  .dp-loading {
    min-height: 400px; display: flex;
    align-items: center; justify-content: center; flex-direction: column; gap: 12px;
  }
  .dp-spinner {
    width: 32px; height: 32px;
    border: 2px solid #e2e8f0;
    border-top-color: #2563eb;
    border-radius: 50%;
    animation: spin 0.75s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .dp-loading-text { font-size: 0.82rem; color: #94a3b8; }

  /* ===================== MODAL ===================== */
  .dp-overlay {
    position: fixed; inset: 0;
    background: rgba(15,23,42,0.5);
    display: flex; align-items: center; justify-content: center;
    z-index: 1000; padding: 20px;
    backdrop-filter: blur(6px);
    animation: fadeIn 0.18s ease;
  }
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }

  .dp-modal {
    background: white;
    border-radius: 24px;
    width: 100%; max-width: 800px;
    max-height: 88vh;
    overflow: hidden;
    display: flex; flex-direction: column;
    animation: slideUp 0.22s cubic-bezier(.16,1,.3,1);
    box-shadow: 0 24px 60px rgba(15,23,42,0.2);
  }
  @keyframes slideUp {
    from { opacity:0; transform:translateY(16px) scale(0.97); }
    to   { opacity:1; transform:translateY(0) scale(1); }
  }

  /* Modal header */
  .dp-modal-header {
    padding: 28px 28px 0;
    flex-shrink: 0;
  }
  .dp-modal-header-top {
    display: flex; justify-content: space-between; align-items: flex-start;
    margin-bottom: 20px;
  }
  .dp-modal-avatar {
    width: 56px; height: 56px;
    border-radius: 16px;
    background: linear-gradient(135deg, #eff6ff, #dbeafe);
    border: 1px solid #bfdbfe;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.1rem; font-weight: 700; color: #2563eb;
    margin-bottom: 10px;
  }
  .dp-modal-name {
    font-family: 'Instrument Serif', serif;
    font-size: 1.5rem; font-weight: 400; color: #0f172a; margin-bottom: 2px;
  }
  .dp-modal-email { font-size: 0.78rem; color: #94a3b8; }
  .dp-close {
    width: 32px; height: 32px;
    border-radius: 8px;
    background: #f1f5f9;
    border: none; cursor: pointer; color: #64748b;
    display: flex; align-items: center; justify-content: center;
    font-size: 1rem; transition: background 0.12s;
  }
  .dp-close:hover { background: #e2e8f0; }

  /* Modal body scroll */
  .dp-modal-body {
    padding: 20px 28px 28px;
    overflow-y: auto; flex: 1;
  }

  /* Form styles */
  .dp-form-group {
    margin-bottom: 20px;
  }
  .dp-form-label {
    display: block;
    font-size: 0.8rem;
    font-weight: 500;
    color: #475569;
    margin-bottom: 6px;
  }
  .dp-form-control {
    width: 100%;
    padding: 12px 14px;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    font-size: 0.85rem;
    font-family: 'Outfit', sans-serif;
    transition: border-color 0.15s;
  }
  .dp-form-control:focus {
    outline: none;
    border-color: #2563eb;
  }
  .dp-form-select {
    width: 100%;
    padding: 12px 14px;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    font-size: 0.85rem;
    font-family: 'Outfit', sans-serif;
    background: white;
  }

  /* Medication grid - modifié pour permettre la sélection multiple */
  .dp-med-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 8px;
    max-height: 300px;
    overflow-y: auto;
    padding: 8px;
    border: 1px solid #f1f5f9;
    border-radius: 12px;
    background: #f8fafc;
  }
  .dp-med-item {
    padding: 10px;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    background: white;
    cursor: pointer;
    transition: all 0.12s;
    position: relative;
  }
  .dp-med-item:hover {
    border-color: #2563eb;
    background: #eff6ff;
  }
  .dp-med-item.selected {
    border-color: #2563eb;
    background: #eff6ff;
    box-shadow: 0 2px 8px rgba(37,99,235,0.1);
  }
  .dp-med-check {
    position: absolute;
    top: 5px;
    right: 5px;
    color: #2563eb;
    font-size: 1rem;
  }
  .dp-med-name {
    font-size: 0.8rem;
    font-weight: 600;
    color: #0f172a;
    margin-bottom: 2px;
    padding-right: 20px;
  }
  .dp-med-detail {
    font-size: 0.65rem;
    color: #64748b;
  }
  .dp-med-stock {
    font-size: 0.6rem;
    color: #059669;
    margin-top: 4px;
  }

  /* Liste des médicaments sélectionnés */
  .dp-selected-meds {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 20px;
  }
  .dp-selected-title {
    font-size: 0.85rem;
    font-weight: 600;
    color: #0f172a;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .dp-selected-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    margin-bottom: 6px;
  }
  .dp-selected-info {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .dp-selected-name {
    font-weight: 500;
    font-size: 0.85rem;
  }
  .dp-selected-dosage {
    font-size: 0.75rem;
    color: #64748b;
  }
  .dp-remove-med {
    background: none;
    border: none;
    color: #dc2626;
    cursor: pointer;
    font-size: 0.9rem;
    padding: 4px;
  }

  /* Prescription item */
  .dp-prescription-item {
    padding: 16px;
    background: #f8fafc;
    border: 1px solid #f1f5f9;
    border-radius: 14px;
    margin-bottom: 10px;
  }
  .dp-prescription-header {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 8px;
  }
  .dp-prescription-name {
    font-size: 0.9rem; font-weight: 600; color: #0f172a;
  }
  .badge-prescription {
    font-size: 0.65rem; font-weight: 500; padding: 3px 8px;
    border-radius: 100px;
  }
  .badge-prescription.active { background: #dcfce7; color: #166534; }
  .badge-prescription.dispensed { background: #dbeafe; color: #1e40af; }
  .badge-prescription.cancelled { background: #fee2e2; color: #991b1b; }
  .badge-prescription.expired { background: #f1f5f9; color: #64748b; }

  .dp-prescription-detail {
    display: flex; gap: 12px; flex-wrap: wrap;
    font-size: 0.75rem; color: #64748b;
  }
  .dp-prescription-detail span { display: flex; align-items: center; gap: 4px; }

  /* Info row */
  .dp-info-row {
    display: flex; align-items: center; gap: 10px;
    padding: 8px 0;
    border-bottom: 1px solid #f8fafc;
    font-size: 0.8rem; color: #0f172a;
  }
  .dp-info-icon { color: #2563eb; width: 18px; text-align: center; }

  /* Section label */
  .dp-section-label {
    font-size: 0.65rem; font-weight: 500; letter-spacing: 0.1em;
    text-transform: uppercase; color: #94a3b8;
    margin: 20px 0 10px;
    display: flex; align-items: center; gap: 8px;
  }
  .dp-section-label::after {
    content: ''; flex: 1; height: 1px; background: #f1f5f9;
  }

  /* Buttons */
  .dp-btn {
    padding: 11px 14px;
    border: none; border-radius: 12px;
    font-size: 0.82rem; font-weight: 500;
    font-family: 'Outfit', sans-serif;
    cursor: pointer; text-decoration: none;
    display: inline-flex; align-items: center; justify-content: center; gap: 7px;
    transition: all 0.15s;
  }
  .dp-btn-primary {
    background: #2563eb; color: white;
    box-shadow: 0 2px 10px rgba(37,99,235,0.25);
  }
  .dp-btn-primary:hover { background: #1d4ed8; transform: translateY(-1px); }
  .dp-btn-secondary {
    background: white; color: #64748b;
    border: 1px solid #e2e8f0;
  }
  .dp-btn-secondary:hover { background: #f8fafc; }
  
  .dp-btn-small {
    padding: 6px 12px;
    font-size: 0.75rem;
    border-radius: 8px;
  }
  
  .dp-btn-danger {
    background: #fee2e2;
    color: #dc2626;
    border: 1px solid #fecaca;
  }
  .dp-btn-danger:hover { background: #fecaca; }

  .dp-modal-actions {
    display: flex; gap: 12px;
    padding: 16px 28px;
    border-top: 1px solid #f1f5f9;
    flex-shrink: 0;
  }
  
  .dp-prescription-actions {
    display: flex;
    gap: 8px;
    margin-top: 12px;
    justify-content: flex-end;
  }

  @media (max-width: 640px) {
    .dp-root { padding: 24px 16px; }
    .dp-grid { grid-template-columns: 1fr; }
    .dp-modal { border-radius: 20px; }
  }
`;

function DoctorPrescriptions() {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [medications, setMedications] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [medSearchTerm, setMedSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showForm, setShowForm] = useState(false);
  
  // Nouvel état pour gérer plusieurs médicaments
  const [selectedMedications, setSelectedMedications] = useState([]);
  const [medicationEntries, setMedicationEntries] = useState([]);
  
  const [formData, setFormData] = useState({
    patientId: '',
    frequency: '',
    duration: '',
    instructions: ''
  });
  
  const [showSuccessMessage, setShowSuccessMessage] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [prescriptionToCancel, setPrescriptionToCancel] = useState(null);

  useEffect(() => {
    if (user?.id) fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Récupérer les patients du médecin via ses rendez-vous
      const appointmentsRes = await axios.get(`http://localhost:8082/api/appointments/doctor/${user.id}`);
      const doctorAppointments = appointmentsRes.data;

      const patientIds = [...new Set(doctorAppointments.map(apt => apt.patientId))];
      const patientsData = [];
      for (const patientId of patientIds) {
        try {
          const patientRes = await axios.get(`http://localhost:8081/api/patients/${patientId}`);
          patientsData.push({ ...patientRes.data });
        } catch {}
      }
      setPatients(patientsData);

      // Récupérer tous les médicaments disponibles
      const medsRes = await axios.get('http://localhost:8087/api/medications');
      setMedications(medsRes.data);

      // Récupérer toutes les prescriptions
      const prescriptionsRes = await axios.get('http://localhost:8087/api/prescriptions');
      // Filtrer pour garder seulement celles du médecin connecté
      const doctorPrescriptions = prescriptionsRes.data.filter(p => p.doctorId === user.id);
      setPrescriptions(doctorPrescriptions);

      setLoading(false);
    } catch (err) {
      console.error('Erreur chargement données:', err);
      setLoading(false);
    }
  };

  const getInitials = (p) =>
    `${p?.firstName?.[0] || ''}${p?.lastName?.[0] || ''}`.toUpperCase();

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

  // Fonction pour gérer la sélection/désélection des médicaments
  const handleMedicationToggle = (medication) => {
    const isSelected = selectedMedications.some(m => m.id === medication.id);
    
    if (isSelected) {
      setSelectedMedications(selectedMedications.filter(m => m.id !== medication.id));
    } else {
      setSelectedMedications([...selectedMedications, medication]);
    }
  };

  // Fonction pour ajouter le médicament avec sa posologie spécifique
  const addMedicationEntry = (medication) => {
    const dosage = prompt(`Dosage pour ${medication.name} (ex: ${medication.strength}) :`, medication.strength);
    if (!dosage) return;
    
    const frequency = prompt(`Fréquence pour ${medication.name} (ex: 2 fois par jour) :`, '2 fois par jour');
    if (!frequency) return;
    
    const newEntry = {
      medicationId: medication.id,
      medicationName: medication.name,
      medicationCode: medication.code,
      dosage: dosage,
      frequency: frequency
    };
    
    setMedicationEntries([...medicationEntries, newEntry]);
    setSelectedMedications(selectedMedications.filter(m => m.id !== medication.id));
  };

  // Fonction pour retirer un médicament de la liste
  const removeMedicationEntry = (index) => {
    const newEntries = [...medicationEntries];
    newEntries.splice(index, 1);
    setMedicationEntries(newEntries);
  };

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    setFormData({
      ...formData,
      patientId: patient.id
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      patientId: '',
      frequency: '',
      duration: '',
      instructions: ''
    });
    setSelectedMedications([]);
    setMedicationEntries([]);
    setShowForm(false);
    setSelectedPatient(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (!formData.patientId || medicationEntries.length === 0) {
        alert('Veuillez sélectionner au moins un médicament');
        return;
      }

      // Créer une prescription pour chaque médicament
      const prescriptionPromises = medicationEntries.map(entry => {
        const prescriptionData = {
          patientId: parseInt(formData.patientId),
          doctorId: parseInt(user?.id),
          medicationName: entry.medicationName,
          medicationCode: entry.medicationCode,
          dosage: entry.dosage,
          frequency: entry.frequency,
          duration: formData.duration || '',
          instructions: formData.instructions || '',
          status: 'ACTIVE'
        };

        return axios.post('http://localhost:8087/api/prescriptions', prescriptionData, {
          headers: { 'Content-Type': 'application/json' }
        });
      });

      const responses = await Promise.all(prescriptionPromises);
      const newPrescriptions = responses.map(r => r.data);
      
      setPrescriptions([...prescriptions, ...newPrescriptions]);
      resetForm();
      setShowSuccessMessage(`${newPrescriptions.length} prescription(s) créée(s) avec succès`);
      setTimeout(() => setShowSuccessMessage(''), 3000);
      
    } catch (err) {
      console.error('Erreur complète:', err);
      console.error('Réponse erreur:', err.response?.data);
      alert(`Erreur: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleCancelPrescription = async () => {
    if (!prescriptionToCancel) return;
    
    try {
      const response = await axios.put(`http://localhost:8087/api/prescriptions/${prescriptionToCancel.id}/cancel`);
      
      setPrescriptions(prescriptions.map(p => 
        p.id === prescriptionToCancel.id ? response.data : p
      ));
      
      setShowCancelModal(false);
      setPrescriptionToCancel(null);
      setShowSuccessMessage('Prescription annulée avec succès');
      setTimeout(() => setShowSuccessMessage(''), 3000);
      
    } catch (err) {
      console.error('Erreur annulation:', err);
      alert('Erreur lors de l\'annulation de la prescription');
    }
  };

  const openCancelModal = (prescription) => {
    setPrescriptionToCancel(prescription);
    setShowCancelModal(true);
  };

  const filteredPatients = patients.filter(p => {
    const q = searchTerm.toLowerCase();
    return `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
           p.email?.toLowerCase().includes(q);
  });

  const filteredMedications = medications.filter(med => {
    const q = medSearchTerm.toLowerCase();
    return med.name?.toLowerCase().includes(q) ||
           med.genericName?.toLowerCase().includes(q) ||
           med.category?.toLowerCase().includes(q);
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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

        {/* Message de succès */}
        {showSuccessMessage && (
          <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: '#dcfce7',
            color: '#166534',
            padding: '12px 24px',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            zIndex: 1100,
            animation: 'slideIn 0.3s ease'
          }}>
            <i className="bi bi-check-circle-fill me-2"></i>
            {showSuccessMessage}
          </div>
        )}

        {/* Header */}
        <div className="dp-header">
          <div>
            <h1 className="dp-title">Prescriptions</h1>
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
              <span className="dp-stat-num green">{prescriptions.length}</span>
              <span className="dp-stat-lbl">Prescriptions</span>
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

        {/* Grid des patients */}
        <div className="dp-grid">
          {filteredPatients.length === 0 ? (
            <div className="dp-empty">
              <div className="dp-empty-icon"><i className="bi bi-people" /></div>
              <div className="dp-empty-title">Aucun patient trouvé</div>
              <div className="dp-empty-sub">Vous n'avez pas encore de patients avec des rendez-vous.</div>
            </div>
          ) : filteredPatients.map((patient, i) => {
            const patientPrescriptions = prescriptions.filter(p => p.patientId === patient.id);
            const activeCount = patientPrescriptions.filter(p => p.status === 'ACTIVE').length;
            
            return (
              <div
                key={patient.id}
                className="dp-card"
                style={{ animationDelay: `${i * 40}ms` }}
                onClick={() => handlePatientSelect(patient)}
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
                    <div className="dp-mini-num blue">
                      {patientPrescriptions.length}
                    </div>
                    <div className="dp-mini-lbl">Total</div>
                  </div>
                  <div className="dp-mini-stat">
                    <div className="dp-mini-num green">
                      {activeCount}
                    </div>
                    <div className="dp-mini-lbl">Actives</div>
                  </div>
                </div>

                <div className="dp-card-footer">
                  <div className="dp-card-footer-item">
                    <i className="bi bi-calendar3" />
                    <span>Dernière: {patientPrescriptions.length > 0 ? 
                      formatDate(patientPrescriptions[0].prescribedDate) : 'N/A'}</span>
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

        {/* Modal de prescription (multi-médicaments) */}
        {showForm && selectedPatient && (
          <div className="dp-overlay" onClick={resetForm}>
            <div className="dp-modal" onClick={e => e.stopPropagation()}>
              
              {/* Modal header */}
              <div className="dp-modal-header">
                <div className="dp-modal-header-top">
                  <div>
                    <div className="dp-modal-avatar">{getInitials(selectedPatient)}</div>
                    <div className="dp-modal-name">{selectedPatient.firstName} {selectedPatient.lastName}</div>
                    <div className="dp-modal-email">{selectedPatient.email}</div>
                  </div>
                  <button className="dp-close" onClick={resetForm}>
                    <i className="bi bi-x" />
                  </button>
                </div>
              </div>

              {/* Modal body */}
              <div className="dp-modal-body">
                <form onSubmit={handleSubmit}>
                  
                  {/* Recherche de médicament */}
                  <div className="dp-form-group">
                    <label className="dp-form-label">Rechercher un médicament</label>
                    <input
                      type="text"
                      className="dp-form-control"
                      placeholder="Nom, catégorie..."
                      value={medSearchTerm}
                      onChange={(e) => setMedSearchTerm(e.target.value)}
                    />
                  </div>

                  {/* Liste des médicaments sélectionnés */}
                  {medicationEntries.length > 0 && (
                    <div className="dp-selected-meds">
                      <div className="dp-selected-title">
                        <i className="bi bi-check-circle-fill" style={{ color: '#2563eb' }} />
                        Médicaments prescrits ({medicationEntries.length})
                      </div>
                      {medicationEntries.map((entry, index) => (
                        <div key={index} className="dp-selected-item">
                          <div className="dp-selected-info">
                            <i className="bi bi-capsule" style={{ color: '#2563eb' }} />
                            <div>
                              <div className="dp-selected-name">{entry.medicationName}</div>
                              <div className="dp-selected-dosage">{entry.dosage} · {entry.frequency}</div>
                            </div>
                          </div>
                          <button
                            type="button"
                            className="dp-remove-med"
                            onClick={() => removeMedicationEntry(index)}
                            title="Retirer"
                          >
                            <i className="bi bi-x-circle" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Liste des médicaments disponibles */}
                  <div className="dp-form-group">
                    <label className="dp-form-label">
                      {medicationEntries.length > 0 ? 'Ajouter un autre médicament' : 'Sélectionner un médicament *'}
                    </label>
                    <div className="dp-med-grid">
                      {filteredMedications.length === 0 ? (
                        <div style={{textAlign:'center', padding:'20px', color:'#94a3b8', gridColumn:'1/-1'}}>
                          Aucun médicament trouvé
                        </div>
                      ) : (
                        filteredMedications.map(med => {
                          const isSelected = selectedMedications.some(m => m.id === med.id);
                          const isAlreadyAdded = medicationEntries.some(m => m.medicationId === med.id);
                          
                          if (isAlreadyAdded) return null;
                          
                          return (
                            <div
                              key={med.id}
                              className={`dp-med-item ${isSelected ? 'selected' : ''}`}
                              onClick={() => handleMedicationToggle(med)}
                            >
                              {isSelected && <i className="bi bi-check-circle-fill dp-med-check" />}
                              <div className="dp-med-name">{med.name}</div>
                              <div className="dp-med-detail">{med.strength} • {med.dosageForm}</div>
                              <div className="dp-med-stock">
                                <i className="bi bi-box-seam" /> Stock: {med.stockQuantity}
                              </div>
                              {isSelected && (
                                <button
                                  type="button"
                                  className="dp-btn dp-btn-small"
                                  style={{
                                    marginTop: '8px',
                                    width: '100%',
                                    background: '#2563eb',
                                    color: 'white',
                                    border: 'none',
                                    fontSize: '0.7rem'
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    addMedicationEntry(med);
                                  }}
                                >
                                  <i className="bi bi-plus" /> Ajouter
                                </button>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Durée (commune à tous les médicaments) */}
                  <div className="dp-form-group">
                    <label className="dp-form-label">Durée du traitement</label>
                    <input
                      type="text"
                      name="duration"
                      className="dp-form-control"
                      placeholder="ex: 7 jours"
                      value={formData.duration}
                      onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    />
                  </div>

                  {/* Instructions (communes à tous les médicaments) */}
                  <div className="dp-form-group">
                    <label className="dp-form-label">Instructions</label>
                    <textarea
                      name="instructions"
                      className="dp-form-control"
                      rows="3"
                      placeholder="Instructions spéciales pour le patient..."
                      value={formData.instructions}
                      onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                    />
                  </div>

                  {/* Actions */}
                  <div className="dp-modal-actions">
                    <button type="button" className="dp-btn dp-btn-secondary" onClick={resetForm}>
                      Annuler
                    </button>
                    <button 
                      type="submit" 
                      className="dp-btn dp-btn-primary"
                      disabled={medicationEntries.length === 0}
                    >
                      <i className="bi bi-capsule" /> 
                      Prescrire {medicationEntries.length > 0 ? `(${medicationEntries.length})` : ''}
                    </button>
                  </div>

                </form>
              </div>
            </div>
          </div>
        )}

        {/* Liste des prescriptions */}
        <div style={{marginTop: '40px'}}>
          <div className="dp-section-label">Toutes les prescriptions</div>
          {prescriptions.length === 0 ? (
            <div className="dp-empty">
              <div className="dp-empty-icon"><i className="bi bi-capsule" /></div>
              <div className="dp-empty-title">Aucune prescription</div>
              <div className="dp-empty-sub">Sélectionnez un patient pour créer une prescription.</div>
            </div>
          ) : (
            prescriptions.map(presc => {
              const patient = patients.find(p => p.id === presc.patientId);
              return (
                <div key={presc.id} className="dp-prescription-item">
                  <div className="dp-prescription-header">
                    <div>
                      <span className="dp-prescription-name">{presc.medicationName}</span>
                      <span style={{marginLeft: '8px', fontSize: '0.75rem', color: '#64748b'}}>
                        {presc.dosage}
                      </span>
                    </div>
                    {getPrescriptionStatusBadge(presc.status)}
                  </div>
                  
                  <div className="dp-prescription-detail">
                    <span><i className="bi bi-person" /> {patient?.firstName} {patient?.lastName}</span>
                    <span><i className="bi bi-clock" /> {presc.frequency}</span>
                    {presc.duration && <span><i className="bi bi-calendar-week" /> {presc.duration}</span>}
                  </div>
                  
                  {presc.instructions && (
                    <div style={{
                      marginTop: '8px',
                      padding: '8px 12px',
                      background: '#fff7ed',
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      color: '#9a3412'
                    }}>
                      <i className="bi bi-info-circle me-1" />
                      {presc.instructions}
                    </div>
                  )}
                  
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '12px'
                  }}>
                    <div style={{fontSize: '0.7rem', color: '#94a3b8'}}>
                      Prescrit le {formatDate(presc.prescribedDate)}
                    </div>
                    
                    {presc.status === 'ACTIVE' && (
                      <button
                        className="dp-btn dp-btn-small dp-btn-danger"
                        onClick={() => openCancelModal(presc)}
                      >
                        <i className="bi bi-x-circle" /> Annuler
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal d'annulation */}
      {showCancelModal && prescriptionToCancel && (
        <div className="dp-overlay" onClick={() => setShowCancelModal(false)}>
          <div className="dp-modal" style={{maxWidth: '400px'}} onClick={e => e.stopPropagation()}>
            <div className="dp-modal-header">
              <div className="dp-modal-header-top">
                <h3 style={{margin: 0, color: '#0f172a'}}>Confirmer l'annulation</h3>
                <button className="dp-close" onClick={() => setShowCancelModal(false)}>
                  <i className="bi bi-x" />
                </button>
              </div>
            </div>
            
            <div className="dp-modal-body">
              <p style={{color: '#475569', marginBottom: '20px'}}>
                Êtes-vous sûr de vouloir annuler la prescription de <strong>{prescriptionToCancel.medicationName}</strong> pour <strong>
                  {patients.find(p => p.id === prescriptionToCancel.patientId)?.firstName} {patients.find(p => p.id === prescriptionToCancel.patientId)?.lastName}
                </strong> ?
              </p>
              
              <div style={{display: 'flex', gap: '12px', justifyContent: 'flex-end'}}>
                <button className="dp-btn dp-btn-secondary" onClick={() => setShowCancelModal(false)}>
                  Non, conserver
                </button>
                <button className="dp-btn dp-btn-danger" onClick={handleCancelPrescription}>
                  Oui, annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default DoctorPrescriptions;