
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ReceptionPatients() {
  const [patients, setPatients] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '', address: '', dateOfBirth: '', socialSecurityNumber: ''
  });
  const [message, setMessage] = useState({ text: '', type: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [selectedPendingUser, setSelectedPendingUser] = useState(null);

  useEffect(() => {
    fetchAllPatients();
  }, []);

  const fetchAllPatients = async () => {
    try {
      setLoading(true);
      
      // 1. Récupérer les patients existants (ceux créés par la réception)
      const patientsRes = await axios.get('http://localhost:8081/api/patients');
      
      // 2. Récupérer les utilisateurs avec rôle 'patient'
      let pendingUsersList = [];
      try {
        const usersRes = await axios.get('http://localhost:8081/api/users/role/patient');
        console.log('Utilisateurs patients récupérés:', usersRes.data);
        
        // Garder seulement ceux qui n'ont PAS de patient_id (pas encore convertis)
        pendingUsersList = usersRes.data.filter(user => !user.patientId);
        console.log('Utilisateurs en attente:', pendingUsersList);
      } catch (err) {
        console.error('Erreur récupération utilisateurs:', err);
      }

      setPatients(patientsRes.data);
      setPendingUsers(pendingUsersList);
      setLoading(false);
    } catch (err) {
      console.error('Erreur chargement:', err);
      setLoading(false);
    }
  };

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const handleAddPatient = async () => {
    try {
      if (!formData.firstName || !formData.lastName || !formData.email) {
        showMessage('Veuillez remplir tous les champs obligatoires', 'error');
        return;
      }

      const patientData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone?.trim() || null,
        address: formData.address?.trim() || null,
        dateOfBirth: formData.dateOfBirth ? formData.dateOfBirth + 'T00:00:00' : null,
        socialSecurityNumber: formData.socialSecurityNumber?.trim() || null
      };

      const response = await axios.post('http://localhost:8081/api/patients', patientData);
      
      setPatients([...patients, response.data]);
      setShowModal(false);
      resetForm();
      showMessage('✅ Patient ajouté avec succès');
    } catch (err) {
      console.error('Erreur ajout:', err);
      showMessage('❌ Erreur lors de l\'ajout', 'error');
    }
  };

  const handleEditPatient = async () => {
    try {
      if (!formData.firstName || !formData.lastName || !formData.email) {
        showMessage('Veuillez remplir les champs obligatoires', 'error');
        return;
      }

      const patientData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone?.trim() || null,
        address: formData.address?.trim() || null,
        dateOfBirth: formData.dateOfBirth ? formData.dateOfBirth + 'T00:00:00' : null,
        socialSecurityNumber: formData.socialSecurityNumber?.trim() || null
      };

      const response = await axios.put(
        `http://localhost:8081/api/patients/${selectedPatient.id}`,
        patientData
      );
      
      setPatients(patients.map(p => p.id === selectedPatient.id ? response.data : p));
      setShowModal(false);
      setEditMode(false);
      setSelectedPatient(null);
      resetForm();
      showMessage('✅ Patient modifié avec succès');
    } catch (err) {
      console.error('Erreur modification:', err);
      showMessage('❌ Erreur lors de la modification', 'error');
    }
  };

  const handleDeletePatient = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce patient ?')) return;
    
    try {
      await axios.delete(`http://localhost:8081/api/patients/${id}`);
      setPatients(patients.filter(p => p.id !== id));
      showMessage('✅ Patient supprimé avec succès');
    } catch (err) {
      console.error('Erreur suppression:', err);
      showMessage('❌ Erreur lors de la suppression', 'error');
    }
  };

  const handleConvertUserToPatient = async (user) => {
    try {
      console.log('Conversion de l\'utilisateur:', user);
      
      // Créer le patient avec les informations de l'utilisateur
      const patientData = {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone || '',
        address: user.address || ''
      };

      const response = await axios.post('http://localhost:8081/api/patients', patientData);
      console.log('Patient créé:', response.data);
      
      // Mettre à jour l'utilisateur avec le patient_id (si l'API le supporte)
      try {
        await axios.put(`http://localhost:8081/api/users/${user.id}`, {
          patientId: response.data.id
        });
      } catch (err) {
        console.log('Impossible de lier l\'utilisateur au patient');
      }

      // Rafraîchir les listes
      await fetchAllPatients();
      setShowPendingModal(false);
      setSelectedPendingUser(null);
      showMessage('✅ Utilisateur converti en patient avec succès');
    } catch (err) {
      console.error('Erreur conversion:', err);
      showMessage('❌ Erreur lors de la conversion', 'error');
    }
  };

  const openEditModal = (patient) => {
    setSelectedPatient(patient);
    setFormData({
      firstName: patient.firstName || '',
      lastName: patient.lastName || '',
      email: patient.email || '',
      phone: patient.phone || '',
      address: patient.address || '',
      dateOfBirth: patient.dateOfBirth ? patient.dateOfBirth.split('T')[0] : '',
      socialSecurityNumber: patient.socialSecurityNumber || ''
    });
    setEditMode(true);
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      firstName: '', lastName: '', email: '', phone: '', address: '', dateOfBirth: '', socialSecurityNumber: ''
    });
  };

  const filteredPatients = patients.filter(p => {
    const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase()) ||
           p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (p.phone && p.phone.includes(searchTerm));
  });

  const filteredPendingUsers = pendingUsers.filter(u => {
    const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase()) ||
           u.email.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '3px solid #f3f4f6',
            borderTopColor: '#2563eb',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px auto'
          }}></div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ color: '#6b7280' }}>Chargement des patients...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Gestion des patients</h1>
      
      {message.text && (
        <div style={{
          padding: '10px',
          marginBottom: '10px',
          borderRadius: '4px',
          background: message.type === 'success' ? '#dcfce7' : '#fee2e2',
          color: message.type === 'success' ? '#166534' : '#991b1b'
        }}>
          {message.text}
        </div>
      )}

      {/* Section des utilisateurs en attente */}
      {pendingUsers.length > 0 && (
        <div style={{
          marginBottom: '30px',
          padding: '16px',
          background: '#fef3c7',
          borderRadius: '8px',
          border: '1px solid #fde68a'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <i className="bi bi-person-plus" style={{ color: '#92400e', fontSize: '20px' }}></i>
            <h3 style={{ margin: 0, fontSize: '16px', color: '#92400e' }}>
              Utilisateurs en attente de conversion ({pendingUsers.length})
            </h3>
          </div>
          <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#92400e' }}>
            Ces utilisateurs ont créé un compte mais n'ont pas encore de dossier patient.
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filteredPendingUsers.map(user => (
              <div key={user.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px',
                background: 'white',
                borderRadius: '6px',
                border: '1px solid #fde68a'
              }}>
                <div>
                  <strong>{user.firstName} {user.lastName}</strong>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#6b7280' }}>
                    {user.email} {user.phone && ` • ${user.phone}`}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedPendingUser(user);
                    setShowPendingModal(true);
                  }}
                  style={{
                    padding: '6px 12px',
                    background: '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '13px'
                  }}
                >
                  Convertir en patient
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Barre de recherche et bouton d'ajout */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <input
          type="text"
          placeholder="Rechercher un patient..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: '8px', flex: 1, borderRadius: '4px', border: '1px solid #ddd' }}
        />
        <button
          onClick={() => { resetForm(); setEditMode(false); setShowModal(true); }}
          style={{
            padding: '8px 16px',
            background: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          + Nouveau patient
        </button>
      </div>

      {/* Tableau des patients */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
          <thead>
            <tr style={{ background: '#f3f4f6' }}>
              <th style={{ padding: '10px', textAlign: 'left' }}>ID</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Nom</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Email</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Téléphone</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Adresse</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Date naiss.</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                  Aucun patient trouvé
                </td>
              </tr>
            ) : (
              filteredPatients.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '10px' }}>#{p.id}</td>
                  <td style={{ padding: '10px' }}><strong>{p.firstName} {p.lastName}</strong></td>
                  <td style={{ padding: '10px' }}>{p.email}</td>
                  <td style={{ padding: '10px' }}>{p.phone || '-'}</td>
                  <td style={{ padding: '10px' }}>{p.address || '-'}</td>
                  <td style={{ padding: '10px' }}>
                    {p.dateOfBirth ? new Date(p.dateOfBirth).toLocaleDateString() : '-'}
                  </td>
                  <td style={{ padding: '10px' }}>
                    <button
                      onClick={() => openEditModal(p)}
                      style={{
                        marginRight: '5px',
                        padding: '5px 10px',
                        background: '#fef3c7',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      ✎ Modifier
                    </button>
                    <button
                      onClick={() => handleDeletePatient(p.id)}
                      style={{
                        padding: '5px 10px',
                        background: '#fee2e2',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      🗑️ Supprimer
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal d'ajout/modification de patient */}
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
            borderRadius: '8px',
            width: '400px',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <h3 style={{ marginTop: 0 }}>{editMode ? 'Modifier' : 'Nouveau'} patient</h3>
            
            <input
              placeholder="Prénom *"
              value={formData.firstName}
              onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              style={{ width: '100%', padding: '8px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
            <input
              placeholder="Nom *"
              value={formData.lastName}
              onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              style={{ width: '100%', padding: '8px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
            <input
              placeholder="Email *"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              style={{ width: '100%', padding: '8px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
            <input
              placeholder="Téléphone"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              style={{ width: '100%', padding: '8px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
            <input
              placeholder="Adresse"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              style={{ width: '100%', padding: '8px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
            <input
              type="date"
              placeholder="Date de naissance"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
              style={{ width: '100%', padding: '8px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
            />

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditMode(false);
                  setSelectedPatient(null);
                  resetForm();
                }}
                style={{ flex: 1, padding: '10px', background: '#f3f4f6', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Annuler
              </button>
              <button
                onClick={editMode ? handleEditPatient : handleAddPatient}
                style={{ flex: 1, padding: '10px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                {editMode ? 'Modifier' : 'Ajouter'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmation de conversion */}
      {showPendingModal && selectedPendingUser && (
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
            borderRadius: '8px',
            width: '400px'
          }}>
            <h3 style={{ marginTop: 0, color: '#2563eb' }}>Convertir en patient</h3>
            <p>Voulez-vous créer un dossier patient pour :</p>
            <p style={{ fontSize: '16px', fontWeight: 'bold', margin: '10px 0' }}>
              {selectedPendingUser.firstName} {selectedPendingUser.lastName}
            </p>
            <p style={{ color: '#6b7280', fontSize: '14px' }}>
              Email: {selectedPendingUser.email}<br />
              {selectedPendingUser.phone && `Téléphone: ${selectedPendingUser.phone}`}
            </p>
            <p style={{ fontSize: '14px', color: '#dc2626', marginTop: '15px' }}>
              Cette action créera un dossier patient et permettra à l'utilisateur de prendre des rendez-vous.
            </p>
            
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button
                onClick={() => {
                  setShowPendingModal(false);
                  setSelectedPendingUser(null);
                }}
                style={{ flex: 1, padding: '10px', background: '#f3f4f6', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Annuler
              </button>
              <button
                onClick={() => handleConvertUserToPatient(selectedPendingUser)}
                style={{ flex: 1, padding: '10px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Convertir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReceptionPatients;
