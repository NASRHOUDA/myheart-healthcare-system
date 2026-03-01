
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ReceptionAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [formData, setFormData] = useState({
    patientId: '', doctorId: '', appointmentDateTime: '', reason: '', notes: '', status: 'SCHEDULED'
  });
  const [message, setMessage] = useState({ text: '', type: '' });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Récupérer les rendez-vous
      const appRes = await axios.get('http://localhost:8082/api/appointments');
      
      // Récupérer les patients
      const patRes = await axios.get('http://localhost:8081/api/patients');
      
      // Récupérer les vrais médecins depuis la base de données
      let doctorsData = [];
      try {
        const doctorsRes = await axios.get('http://localhost:8081/api/users/role/doctor');
        doctorsData = doctorsRes.data.map(doctor => ({
          id: doctor.id,
          name: `Dr. ${doctor.firstName} ${doctor.lastName}`,
          specialty: doctor.specialty || 'Médecin',
          licenseNumber: doctor.licenseNumber
        }));
        console.log('Médecins chargés:', doctorsData);
      } catch (err) {
        console.error('Erreur chargement médecins:', err);
        // Fallback au cas où l'API ne fonctionne pas
        doctorsData = [
          { id: 2, name: 'Dr. Marie Martin', specialty: 'Cardiologie' }
        ];
      }

      setAppointments(appRes.data);
      setPatients(patRes.data);
      setDoctors(doctorsData);
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

  const handleAddAppointment = async () => {
    try {
      if (!formData.patientId || !formData.doctorId || !formData.appointmentDateTime) {
        showMessage('Veuillez remplir tous les champs obligatoires', 'error');
        return;
      }

      const response = await axios.post('http://localhost:8082/api/appointments', {
        patientId: parseInt(formData.patientId),
        doctorId: parseInt(formData.doctorId),
        appointmentDateTime: formData.appointmentDateTime,
        reason: formData.reason || 'Consultation',
        notes: formData.notes || null,
        status: 'SCHEDULED'
      });
      
      setAppointments([...appointments, response.data]);
      setShowModal(false);
      resetForm();
      showMessage('✅ Rendez-vous créé avec succès');
    } catch (err) {
      console.error('Erreur création:', err);
      showMessage('❌ Erreur lors de la création', 'error');
    }
  };

  const handleEditAppointment = async () => {
    try {
      if (!formData.doctorId || !formData.appointmentDateTime) {
        showMessage('Veuillez remplir tous les champs obligatoires', 'error');
        return;
      }

      const response = await axios.put(
        `http://localhost:8082/api/appointments/${selectedAppointment.id}`,
        {
          patientId: parseInt(formData.patientId),
          doctorId: parseInt(formData.doctorId),
          appointmentDateTime: formData.appointmentDateTime,
          reason: formData.reason || 'Consultation',
          notes: formData.notes || null,
          status: formData.status
        }
      );
      setAppointments(appointments.map(a => a.id === selectedAppointment.id ? response.data : a));
      setShowModal(false);
      setEditMode(false);
      setSelectedAppointment(null);
      resetForm();
      showMessage('✅ Rendez-vous modifié avec succès');
    } catch (err) {
      console.error('Erreur modification:', err);
      showMessage('❌ Erreur lors de la modification', 'error');
    }
  };

  const handleStatusChange = async (id, action) => {
    try {
      const response = await axios.put(`http://localhost:8082/api/appointments/${id}/${action}`);
      setAppointments(appointments.map(a => a.id === id ? response.data : a));
      showMessage(`✅ Statut mis à jour`);
    } catch (err) {
      console.error('Erreur statut:', err);
      showMessage('❌ Erreur lors du changement de statut', 'error');
    }
  };

  const handleDeleteAppointment = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce rendez-vous ?')) return;
    try {
      await axios.delete(`http://localhost:8082/api/appointments/${id}`);
      setAppointments(appointments.filter(a => a.id !== id));
      showMessage('✅ Rendez-vous supprimé avec succès');
    } catch (err) {
      console.error('Erreur suppression:', err);
      showMessage('❌ Erreur lors de la suppression', 'error');
    }
  };

  const getPatientName = (id) => {
    const p = patients.find(p => p.id === id);
    return p ? `${p.firstName} ${p.lastName}` : `Patient #${id}`;
  };

  const getDoctorName = (id) => {
    const doctor = doctors.find(d => d.id === id);
    return doctor ? doctor.name : `Dr. #${id}`;
  };

  const getDoctorSpecialty = (id) => {
    const doctor = doctors.find(d => d.id === id);
    return doctor ? doctor.specialty : '';
  };

  const getStatusBadge = (status) => {
    const colors = {
      'SCHEDULED': { bg: '#e8f0fe', color: '#2563eb', text: 'Planifié', icon: '⏳' },
      'CONFIRMED': { bg: '#dbeafe', color: '#1e40af', text: 'Confirmé', icon: '✓' },
      'COMPLETED': { bg: '#dcfce7', color: '#166534', text: 'Terminé', icon: '✓✓' },
      'CANCELLED': { bg: '#fee2e2', color: '#dc2626', text: 'Annulé', icon: '✗' }
    };
    const style = colors[status] || colors['SCHEDULED'];
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '6px 12px',
        borderRadius: '20px',
        background: style.bg,
        color: style.color,
        fontSize: '13px',
        fontWeight: '500'
      }}>
        <span>{style.icon}</span>
        {style.text}
      </span>
    );
  };

  const openEditModal = (appointment) => {
    setSelectedAppointment(appointment);
    setFormData({
      patientId: appointment.patientId,
      doctorId: appointment.doctorId || '',
      appointmentDateTime: appointment.appointmentDateTime.slice(0, 16),
      reason: appointment.reason || '',
      notes: appointment.notes || '',
      status: appointment.status
    });
    setEditMode(true);
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({ patientId: '', doctorId: '', appointmentDateTime: '', reason: '', notes: '', status: 'SCHEDULED' });
  };

  const filteredAppointments = appointments.filter(a => {
    const patientName = getPatientName(a.patientId).toLowerCase();
    const doctorName = getDoctorName(a.doctorId).toLowerCase();
    return patientName.includes(searchTerm.toLowerCase()) || 
           doctorName.includes(searchTerm.toLowerCase()) ||
           a.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           a.id.toString().includes(searchTerm);
  });

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '3px solid #f3f4f6',
            borderTopColor: '#16a34a',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px auto'
          }}></div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ color: '#6b7280' }}>Chargement des rendez-vous...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '30px 20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* En-tête */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px'
      }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '300', color: '#1a1a1a', margin: '0 0 5px 0' }}>
            Gestion des rendez-vous
          </h1>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
            {appointments.length} rendez-vous au total • {doctors.length} médecins disponibles
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setEditMode(false); setShowModal(true); }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            background: '#16a34a',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#15803d'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#16a34a'}
        >
          <span style={{ fontSize: '20px', lineHeight: 1 }}>+</span>
          Nouveau rendez-vous
        </button>
      </div>

      {/* Message de notification */}
      {message.text && (
        <div style={{
          padding: '15px 20px',
          marginBottom: '20px',
          borderRadius: '8px',
          background: message.type === 'success' ? '#dcfce7' : '#fee2e2',
          color: message.type === 'success' ? '#166534' : '#991b1b',
          border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
          fontSize: '14px'
        }}>
          {message.text}
        </div>
      )}

      {/* Barre de recherche */}
      <div style={{ marginBottom: '25px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '0 15px',
          maxWidth: '400px'
        }}>
          <span style={{ color: '#9ca3af', marginRight: '10px' }}>🔍</span>
          <input
            type="text"
            placeholder="Rechercher par patient, médecin, motif..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1,
              padding: '12px 0',
              border: 'none',
              outline: 'none',
              fontSize: '14px'
            }}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              style={{
                background: 'none',
                border: 'none',
                color: '#9ca3af',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Statistiques rapides */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '15px',
        marginBottom: '30px'
      }}>
        {[
          { label: 'Planifiés', value: appointments.filter(a => a.status === 'SCHEDULED').length, color: '#2563eb' },
          { label: 'Confirmés', value: appointments.filter(a => a.status === 'CONFIRMED').length, color: '#1e40af' },
          { label: 'Terminés', value: appointments.filter(a => a.status === 'COMPLETED').length, color: '#166534' },
          { label: 'Annulés', value: appointments.filter(a => a.status === 'CANCELLED').length, color: '#dc2626' }
        ].map(stat => (
          <div key={stat.label} style={{
            background: 'white',
            border: '1px solid #f0f0f0',
            borderRadius: '10px',
            padding: '15px'
          }}>
            <div style={{ fontSize: '24px', fontWeight: '600', color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: '13px', color: '#6b7280' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Tableau des rendez-vous */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        border: '1px solid #f0f0f0',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9fafb', borderBottom: '1px solid #f0f0f0' }}>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#374151' }}>ID</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#374151' }}>Patient</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#374151' }}>Médecin</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#374151' }}>Date & Heure</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#374151' }}>Motif</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#374151' }}>Statut</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#374151' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAppointments.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ padding: '50px', textAlign: 'center', color: '#6b7280' }}>
                  Aucun rendez-vous trouvé
                </td>
              </tr>
            ) : (
              filteredAppointments.map(a => {
                const doctor = doctors.find(d => d.id === a.doctorId);
                return (
                  <tr key={a.id} style={{ borderBottom: '1px solid #f0f0f0', transition: 'background 0.2s' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'white'}>
                    <td style={{ padding: '16px', fontSize: '14px', color: '#1f2937' }}>#{a.id}</td>
                    <td style={{ padding: '16px', fontSize: '14px', color: '#1f2937' }}>
                      <div style={{ fontWeight: '500' }}>{getPatientName(a.patientId)}</div>
                    </td>
                    <td style={{ padding: '16px', fontSize: '14px', color: '#4b5563' }}>
                      <div>{getDoctorName(a.doctorId)}</div>
                      {doctor?.specialty && (
                        <div style={{ fontSize: '12px', color: '#9ca3af' }}>{doctor.specialty}</div>
                      )}
                    </td>
                    <td style={{ padding: '16px', fontSize: '14px', color: '#4b5563' }}>
                      <div>{new Date(a.appointmentDateTime).toLocaleDateString('fr-FR')}</div>
                      <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                        {new Date(a.appointmentDateTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td style={{ padding: '16px', fontSize: '14px', color: '#4b5563' }}>
                      {a.reason || '-'}
                    </td>
                    <td style={{ padding: '16px' }}>
                      {getStatusBadge(a.status)}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button
                          onClick={() => openEditModal(a)}
                          style={{
                            padding: '6px 10px',
                            background: '#fef3c7',
                            color: '#92400e',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '13px',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#fde68a'}
                          onMouseLeave={(e) => e.currentTarget.style.background = '#fef3c7'}
                          title="Modifier"
                        >
                          ✎
                        </button>
                        {a.status === 'SCHEDULED' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(a.id, 'confirm')}
                              style={{
                                padding: '6px 10px',
                                background: '#dbeafe',
                                color: '#1e40af',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '13px',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = '#bfdbfe'}
                              onMouseLeave={(e) => e.currentTarget.style.background = '#dbeafe'}
                              title="Confirmer"
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => handleStatusChange(a.id, 'cancel')}
                              style={{
                                padding: '6px 10px',
                                background: '#fee2e2',
                                color: '#dc2626',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '13px',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = '#fecaca'}
                              onMouseLeave={(e) => e.currentTarget.style.background = '#fee2e2'}
                              title="Annuler"
                            >
                              ✗
                            </button>
                          </>
                        )}
                        {a.status === 'CONFIRMED' && (
                          <button
                            onClick={() => handleStatusChange(a.id, 'complete')}
                            style={{
                              padding: '6px 10px',
                              background: '#dcfce7',
                              color: '#166534',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '13px',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#bbf7d0'}
                            onMouseLeave={(e) => e.currentTarget.style.background = '#dcfce7'}
                            title="Terminer"
                          >
                            ✓✓
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteAppointment(a.id)}
                          style={{
                            padding: '6px 10px',
                            background: '#fee2e2',
                            color: '#dc2626',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '13px',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#fecaca'}
                          onMouseLeave={(e) => e.currentTarget.style.background = '#fee2e2'}
                          title="Supprimer"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
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
          zIndex: 1000,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '16px',
            width: '450px',
            maxHeight: '80vh',
            overflowY: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: '500', color: '#1a1a1a' }}>
              {editMode ? 'Modifier le rendez-vous' : 'Nouveau rendez-vous'}
            </h3>
            
            {!editMode && (
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '5px' }}>
                  Patient *
                </label>
                <select
                  value={formData.patientId}
                  onChange={(e) => setFormData({...formData, patientId: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                >
                  <option value="">Sélectionner un patient</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.firstName} {p.lastName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '5px' }}>
                Médecin *
              </label>
              <select
                value={formData.doctorId}
                onChange={(e) => setFormData({...formData, doctorId: e.target.value})}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none'
                }}
              >
                <option value="">Sélectionner un médecin</option>
                {doctors.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name} {d.specialty && `- ${d.specialty}`}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '5px' }}>
                Date et heure *
              </label>
              <input
                type="datetime-local"
                value={formData.appointmentDateTime}
                onChange={(e) => setFormData({...formData, appointmentDateTime: e.target.value})}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '5px' }}>
                Motif
              </label>
              <input
                type="text"
                placeholder="Ex: Consultation, Suivi, Urgence..."
                value={formData.reason}
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>

            {editMode && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '5px' }}>
                  Statut
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                >
                  <option value="SCHEDULED">Planifié</option>
                  <option value="CONFIRMED">Confirmé</option>
                  <option value="COMPLETED">Terminé</option>
                  <option value="CANCELLED">Annulé</option>
                </select>
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', marginTop: '25px' }}>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditMode(false);
                  setSelectedAppointment(null);
                  resetForm();
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#f3f4f6',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#4b5563',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#e5e7eb'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#f3f4f6'}
              >
                Annuler
              </button>
              <button
                onClick={editMode ? handleEditAppointment : handleAddAppointment}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#16a34a',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#15803d'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#16a34a'}
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

export default ReceptionAppointments;
