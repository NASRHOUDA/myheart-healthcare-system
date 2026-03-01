import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ReceptionEHR() {
  const [ehrRecords, setEhrRecords] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedEHR, setSelectedEHR] = useState(null);
  const [formData, setFormData] = useState({
    patientId: '', diagnosis: '', symptoms: '', notes: ''
  });
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [ehrRes, patRes] = await Promise.all([
        axios.get('http://localhost:8084/api/ehr'),
        axios.get('http://localhost:8081/api/patients')
      ]);
      setEhrRecords(ehrRes.data);
      setPatients(patRes.data);
      setLoading(false);
    } catch (err) {
      console.error('Erreur:', err);
      setLoading(false);
    }
  };

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const handleAddEHR = async () => {
    try {
      if (!formData.patientId || !formData.diagnosis) {
        showMessage('Veuillez remplir tous les champs obligatoires', 'error');
        return;
      }

      const response = await axios.post('http://localhost:8084/api/ehr', {
        patientId: parseInt(formData.patientId),
        diagnosis: formData.diagnosis,
        notes: formData.notes,
        symptoms: formData.symptoms ? formData.symptoms.split(',').map(s => s.trim()) : []
      });
      
      setEhrRecords([...ehrRecords, response.data]);
      setShowModal(false);
      resetForm();
      showMessage('✅ Dossier créé avec succès');
    } catch (err) {
      showMessage('❌ Erreur lors de la création', 'error');
    }
  };

  const handleEditEHR = async () => {
    try {
      if (!formData.diagnosis) {
        showMessage('Veuillez remplir le diagnostic', 'error');
        return;
      }

      const response = await axios.put(
        `http://localhost:8084/api/ehr/${selectedEHR._id}`,
        {
          patientId: parseInt(formData.patientId),
          diagnosis: formData.diagnosis,
          notes: formData.notes,
          symptoms: formData.symptoms ? formData.symptoms.split(',').map(s => s.trim()) : []
        }
      );
      
      setEhrRecords(ehrRecords.map(e => e._id === selectedEHR._id ? response.data : e));
      setShowModal(false);
      setEditMode(false);
      setSelectedEHR(null);
      resetForm();
      showMessage('✅ Dossier modifié avec succès');
    } catch (err) {
      showMessage('❌ Erreur lors de la modification', 'error');
    }
  };

  const handleDeleteEHR = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce dossier ?')) return;
    
    try {
      await axios.delete(`http://localhost:8084/api/ehr/${id}`);
      setEhrRecords(ehrRecords.filter(e => e._id !== id));
      showMessage('✅ Dossier supprimé avec succès');
    } catch (err) {
      showMessage('❌ Erreur lors de la suppression', 'error');
    }
  };

  const getPatientName = (id) => {
    const patient = patients.find(p => p.id === id);
    return patient ? `${patient.firstName} ${patient.lastName}` : `Patient #${id}`;
  };

  const openEditModal = (ehr) => {
    setSelectedEHR(ehr);
    setFormData({
      patientId: ehr.patientId,
      diagnosis: ehr.diagnosis || '',
      symptoms: ehr.symptoms ? ehr.symptoms.join(', ') : '',
      notes: ehr.notes || ''
    });
    setEditMode(true);
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({ patientId: '', diagnosis: '', symptoms: '', notes: '' });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          border: '2px solid #f3f4f6',
          borderTopColor: '#9333ea',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>Dossiers médicaux</h1>
      
      {message.text && (
        <div style={{
          padding: '10px',
          marginBottom: '20px',
          borderRadius: '4px',
          background: message.type === 'success' ? '#dcfce7' : '#fee2e2',
          color: message.type === 'success' ? '#166534' : '#991b1b'
        }}>
          {message.text}
        </div>
      )}

      <button
        onClick={() => { resetForm(); setEditMode(false); setShowModal(true); }}
        style={{
          padding: '10px 20px',
          background: '#9333ea',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          marginBottom: '20px',
          cursor: 'pointer',
          fontSize: '14px'
        }}
      >
        + Nouveau dossier
      </button>

      <div style={{ display: 'grid', gap: '15px' }}>
        {ehrRecords.map(ehr => (
          <div key={ehr._id} style={{
            border: '1px solid #eaeaea',
            padding: '20px',
            borderRadius: '8px',
            background: 'white',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ margin: '0 0 10px 0', color: '#1a1a1a' }}>
                  {getPatientName(ehr.patientId)}
                </h3>
                <p style={{ margin: '5px 0' }}>
                  <strong>Diagnostic:</strong> {ehr.diagnosis}
                </p>
                {ehr.symptoms && ehr.symptoms.length > 0 && (
                  <p style={{ margin: '5px 0' }}>
                    <strong>Symptômes:</strong> {ehr.symptoms.join(', ')}
                  </p>
                )}
                {ehr.notes && (
                  <p style={{ margin: '5px 0', color: '#4b5563' }}>
                    <strong>Notes:</strong> {ehr.notes}
                  </p>
                )}
                <p style={{ margin: '10px 0 0 0', fontSize: '12px', color: '#9ca3af' }}>
                  📅 {new Date(ehr.date).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <div>
                <button
                  onClick={() => openEditModal(ehr)}
                  style={{
                    padding: '5px 10px',
                    marginRight: '5px',
                    background: '#fef3c7',
                    color: '#92400e',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  ✎ Modifier
                </button>
                <button
                  onClick={() => handleDeleteEHR(ehr._id)}
                  style={{
                    padding: '5px 10px',
                    background: '#fee2e2',
                    color: '#dc2626',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  🗑️ Supprimer
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '12px',
            width: '500px',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <h3 style={{ marginTop: 0 }}>
              {editMode ? 'Modifier le dossier' : 'Nouveau dossier médical'}
            </h3>
            
            <select
              value={formData.patientId}
              onChange={(e) => setFormData({...formData, patientId: e.target.value})}
              style={{
                width: '100%',
                padding: '10px',
                marginBottom: '15px',
                border: '1px solid #eaeaea',
                borderRadius: '8px',
                fontSize: '14px'
              }}
              disabled={editMode}
            >
              <option value="">Sélectionner un patient</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>
                  {p.firstName} {p.lastName}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Diagnostic *"
              value={formData.diagnosis}
              onChange={(e) => setFormData({...formData, diagnosis: e.target.value})}
              style={{
                width: '100%',
                padding: '10px',
                marginBottom: '15px',
                border: '1px solid #eaeaea',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />

            <input
              type="text"
              placeholder="Symptômes (séparés par des virgules)"
              value={formData.symptoms}
              onChange={(e) => setFormData({...formData, symptoms: e.target.value})}
              style={{
                width: '100%',
                padding: '10px',
                marginBottom: '15px',
                border: '1px solid #eaeaea',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />

            <textarea
              placeholder="Notes"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              style={{
                width: '100%',
                padding: '10px',
                marginBottom: '20px',
                border: '1px solid #eaeaea',
                borderRadius: '8px',
                fontSize: '14px',
                minHeight: '100px'
              }}
            />

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditMode(false);
                  setSelectedEHR(null);
                  resetForm();
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#f3f4f6',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Annuler
              </button>
              <button
                onClick={editMode ? handleEditEHR : handleAddEHR}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#9333ea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                {editMode ? 'Modifier' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReceptionEHR;
