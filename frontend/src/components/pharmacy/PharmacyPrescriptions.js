import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

function PharmacyPrescriptions() {
  const { user } = useAuth();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialStatus = queryParams.get('status') || 'ALL';
  
  const [prescriptions, setPrescriptions] = useState([]);
  const [filteredPrescriptions, setFilteredPrescriptions] = useState([]);
  const [patients, setPatients] = useState({});
  const [doctors, setDoctors] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [showDispenseModal, setShowDispenseModal] = useState(false);
  const [dispenseNotes, setDispenseNotes] = useState('');
  const [processingId, setProcessingId] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState('');

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    filterPrescriptions();
  }, [searchTerm, statusFilter, prescriptions]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // Récupérer toutes les prescriptions du service pharmacie (port 8087)
      const prescriptionsRes = await axios.get('http://localhost:8087/api/prescriptions');
      const prescriptionsData = prescriptionsRes.data;
      
      // Récupérer tous les patients
      const patientsRes = await axios.get('http://localhost:8081/api/patients');
      const patientsMap = {};
      patientsRes.data.forEach(patient => {
        patientsMap[patient.id] = patient;
      });
      setPatients(patientsMap);
      
      // Récupérer tous les médecins (si service disponible)
      try {
        const doctorsRes = await axios.get('http://localhost:8082/api/doctors');
        const doctorsMap = {};
        doctorsRes.data.forEach(doctor => {
          doctorsMap[doctor.id] = doctor;
        });
        setDoctors(doctorsMap);
      } catch (err) {
        console.log('Service médecins non disponible');
      }
      
      // Enrichir les prescriptions avec les noms des patients
      const enrichedPrescriptions = prescriptionsData.map(presc => {
        const patient = patientsMap[presc.patientId];
        return {
          ...presc,
          patientName: patient ? `${patient.firstName} ${patient.lastName}` : 'Patient inconnu',
          patientFirstName: patient?.firstName,
          patientLastName: patient?.lastName
        };
      });
      
      setPrescriptions(enrichedPrescriptions);
      setLoading(false);
    } catch (err) {
      console.error('Erreur chargement prescriptions:', err);
      setLoading(false);
    }
  };

  const filterPrescriptions = () => {
    let filtered = [...prescriptions];

    // Filtre par recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.medicationName?.toLowerCase().includes(term) ||
        p.patientName?.toLowerCase().includes(term) ||
        p.id?.toString().includes(term) ||
        p.medicationCode?.toLowerCase().includes(term)
      );
    }

    // Filtre par statut
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    // Trier par date (plus récent d'abord)
    filtered.sort((a, b) => new Date(b.prescribedDate) - new Date(a.prescribedDate));

    setFilteredPrescriptions(filtered);
  };

  const handleDispense = (prescription) => {
    setSelectedPrescription(prescription);
    setShowDispenseModal(true);
  };

  const confirmDispense = async () => {
    try {
      setProcessingId(selectedPrescription.id);
      
      // Appel API pour délivrer la prescription
      const response = await axios.put(
        `http://localhost:8087/api/prescriptions/${selectedPrescription.id}/dispense?pharmacist=${encodeURIComponent(user?.firstName + ' ' + user?.lastName)}`
      );

      // Mettre à jour la liste localement
      setPrescriptions(prescriptions.map(p => 
        p.id === selectedPrescription.id ? response.data : p
      ));

      setShowSuccessMessage(`Prescription #${selectedPrescription.id} délivrée avec succès`);
      setShowDispenseModal(false);
      setSelectedPrescription(null);
      setDispenseNotes('');
      setProcessingId(null);
      
      setTimeout(() => setShowSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Erreur lors de la délivrance:', err);
      alert('Erreur lors de la délivrance de la prescription');
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      'ACTIVE': { bg: '#dcfce7', color: '#166534', text: 'Active' },
      'DISPENSED': { bg: '#dbeafe', color: '#1e40af', text: 'Délivrée' },
      'CANCELLED': { bg: '#fee2e2', color: '#991b1b', text: 'Annulée' },
      'EXPIRED': { bg: '#f1f5f9', color: '#64748b', text: 'Expirée' }
    };
    const style = colors[status] || colors['EXPIRED'];
    return (
      <span style={{
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        background: style.bg,
        color: style.color,
        fontWeight: '500',
        display: 'inline-block'
      }}>
        {style.text}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid #f1f5f9',
            borderTopColor: '#2563eb',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 15px auto'
          }}></div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ color: '#64748b' }}>Chargement des prescriptions...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '24px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
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

      {/* En-tête */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '500', color: '#0f172a', margin: '0 0 4px 0' }}>
            Gestion des Prescriptions
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
            {filteredPrescriptions.length} prescription(s) au total
          </p>
        </div>
        <Link to="/pharmacy/dashboard" style={{
          padding: '8px 16px',
          background: '#f8fafc',
          borderRadius: '8px',
          color: '#64748b',
          textDecoration: 'none',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          border: '1px solid #e2e8f0'
        }}>
          <i className="bi bi-arrow-left"></i>
          Retour au tableau de bord
        </Link>
      </div>

      {/* Statistiques rapides */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{
          background: 'white',
          padding: '16px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', fontWeight: '600', color: '#2563eb' }}>
            {prescriptions.filter(p => p.status === 'ACTIVE').length}
          </div>
          <div style={{ fontSize: '13px', color: '#64748b' }}>Actives</div>
        </div>
        <div style={{
          background: 'white',
          padding: '16px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', fontWeight: '600', color: '#059669' }}>
            {prescriptions.filter(p => p.status === 'DISPENSED').length}
          </div>
          <div style={{ fontSize: '13px', color: '#64748b' }}>Délivrées</div>
        </div>
        <div style={{
          background: 'white',
          padding: '16px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', fontWeight: '600', color: '#dc2626' }}>
            {prescriptions.filter(p => p.status === 'CANCELLED').length}
          </div>
          <div style={{ fontSize: '13px', color: '#64748b' }}>Annulées</div>
        </div>
        <div style={{
          background: 'white',
          padding: '16px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', fontWeight: '600', color: '#64748b' }}>
            {prescriptions.filter(p => p.status === 'EXPIRED').length}
          </div>
          <div style={{ fontSize: '13px', color: '#64748b' }}>Expirées</div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '20px',
        border: '1px solid #e2e8f0',
        marginBottom: '24px'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gap: '16px',
          alignItems: 'center'
        }}>
          <div style={{ position: 'relative' }}>
            <i className="bi bi-search" style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94a3b8'
            }}></i>
            <input
              type="text"
              placeholder="Rechercher par médicament, patient, code ou ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 12px 12px 40px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#2563eb'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '12px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '14px',
              background: 'white',
              minWidth: '150px',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="ALL">Tous les statuts</option>
            <option value="ACTIVE">Actives</option>
            <option value="DISPENSED">Délivrées</option>
            <option value="CANCELLED">Annulées</option>
            <option value="EXPIRED">Expirées</option>
          </select>
        </div>

        {/* Résumé des filtres */}
        <div style={{
          marginTop: '12px',
          fontSize: '13px',
          color: '#64748b',
          display: 'flex',
          gap: '20px'
        }}>
          <span><strong>{filteredPrescriptions.length}</strong> prescription(s) trouvée(s)</span>
          {statusFilter !== 'ALL' && (
            <span>Filtre actif: <strong>{statusFilter}</strong></span>
          )}
        </div>
      </div>

      {/* Liste des prescriptions */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid #e2e8f0'
      }}>
        {filteredPrescriptions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <i className="bi bi-capsule" style={{ fontSize: '48px', color: '#cbd5e1', marginBottom: '16px' }}></i>
            <p style={{ color: '#64748b', fontSize: '16px', marginBottom: '8px' }}>
              Aucune prescription trouvée
            </p>
            <p style={{ color: '#94a3b8', fontSize: '14px' }}>
              {searchTerm ? 'Essayez de modifier votre recherche' : 'Les prescriptions apparaîtront ici'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredPrescriptions.map(prescription => (
              <div
                key={prescription.id}
                style={{
                  padding: '20px',
                  background: '#f8fafc',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '16px'
                }}>
                  <div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      marginBottom: '8px',
                      flexWrap: 'wrap'
                    }}>
                      <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#0f172a' }}>
                        {prescription.medicationName}
                      </h3>
                      {getStatusBadge(prescription.status)}
                    </div>
                    <div style={{ fontSize: '15px', color: '#2563eb', fontWeight: '500', marginBottom: '4px' }}>
                      {prescription.patientName}
                    </div>
                    <div style={{ fontSize: '13px', color: '#64748b' }}>
                      <i className="bi bi-person-badge me-1"></i>
                      Médecin: {doctors[prescription.doctorId] ? 
                        `Dr. ${doctors[prescription.doctorId].firstName} ${doctors[prescription.doctorId].lastName}` : 
                        `ID: ${prescription.doctorId}`}
                    </div>
                    <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                      <i className="bi bi-tag me-1"></i>
                      Code: {prescription.medicationCode || 'N/A'} • ID: #{prescription.id}
                    </div>
                  </div>
                  
                  {prescription.status === 'ACTIVE' && (
                    <button
                      onClick={() => handleDispense(prescription)}
                      disabled={processingId === prescription.id}
                      style={{
                        padding: '10px 20px',
                        background: processingId === prescription.id ? '#94a3b8' : '#2563eb',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: processingId === prescription.id ? 'wait' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'background 0.2s'
                      }}
                    >
                      {processingId === prescription.id ? (
                        <>
                          <i className="bi bi-arrow-repeat" style={{ animation: 'spin 1s linear infinite' }}></i>
                          Traitement...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-circle"></i>
                          Délivrer
                        </>
                      )}
                    </button>
                  )}
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: '16px',
                  padding: '16px',
                  background: 'white',
                  borderRadius: '8px',
                  marginTop: '8px'
                }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Dosage</div>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: '#0f172a' }}>
                      {prescription.dosage}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Fréquence</div>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: '#0f172a' }}>
                      {prescription.frequency}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Durée</div>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: '#0f172a' }}>
                      {prescription.duration || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Prescrit le</div>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: '#0f172a' }}>
                      {formatDate(prescription.prescribedDate)}
                    </div>
                  </div>
                  {prescription.dispensedDate && (
                    <div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Délivrée le</div>
                      <div style={{ fontSize: '14px', fontWeight: '500', color: '#0f172a' }}>
                        {formatDate(prescription.dispensedDate)}
                      </div>
                    </div>
                  )}
                  {prescription.expiryDate && (
                    <div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Expire le</div>
                      <div style={{ fontSize: '14px', fontWeight: '500', color: '#0f172a' }}>
                        {formatDate(prescription.expiryDate)}
                      </div>
                    </div>
                  )}
                </div>

                {prescription.instructions && (
                  <div style={{
                    marginTop: '12px',
                    padding: '12px 16px',
                    background: '#fff7ed',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: '#9a3412',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px'
                  }}>
                    <i className="bi bi-info-circle" style={{ marginTop: '2px' }}></i>
                    <span><strong>Instructions:</strong> {prescription.instructions}</span>
                  </div>
                )}

                {prescription.dispenseNotes && (
                  <div style={{
                    marginTop: '8px',
                    padding: '8px 16px',
                    background: '#f1f5f9',
                    borderRadius: '8px',
                    fontSize: '13px',
                    color: '#475569',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px'
                  }}>
                    <i className="bi bi-chat"></i>
                    <span><strong>Note de délivrance:</strong> {prescription.dispenseNotes}</span>
                  </div>
                )}

                {prescription.dispensedBy && (
                  <div style={{
                    marginTop: '8px',
                    fontSize: '12px',
                    color: '#64748b',
                    textAlign: 'right'
                  }}>
                    <i className="bi bi-person-check me-1"></i>
                    Délivrée par: {prescription.dispensedBy}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de délivrance */}
      {showDispenseModal && selectedPrescription && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          animation: 'fadeIn 0.2s ease'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ fontSize: '20px', margin: '0 0 20px 0', color: '#0f172a' }}>
              Confirmer la délivrance
            </h3>
            
            <div style={{
              background: '#f8fafc',
              padding: '16px',
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <p style={{ margin: '0 0 8px 0', color: '#475569' }}>
                <strong style={{ color: '#0f172a' }}>Médicament:</strong> {selectedPrescription.medicationName}
              </p>
              <p style={{ margin: '0 0 8px 0', color: '#475569' }}>
                <strong style={{ color: '#0f172a' }}>Patient:</strong> {selectedPrescription.patientName}
              </p>
              <p style={{ margin: '0 0 8px 0', color: '#475569' }}>
                <strong style={{ color: '#0f172a' }}>Dosage:</strong> {selectedPrescription.dosage}
              </p>
              <p style={{ margin: '0', color: '#475569' }}>
                <strong style={{ color: '#0f172a' }}>Prescrit le:</strong> {formatDate(selectedPrescription.prescribedDate)}
              </p>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#475569',
                marginBottom: '8px'
              }}>
                Notes de délivrance (optionnel)
              </label>
              <textarea
                value={dispenseNotes}
                onChange={(e) => setDispenseNotes(e.target.value)}
                rows="3"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  resize: 'vertical',
                  outline: 'none'
                }}
                placeholder="Ajouter des notes concernant la délivrance..."
                onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => {
                  setShowDispenseModal(false);
                  setSelectedPrescription(null);
                  setDispenseNotes('');
                }}
                style={{
                  padding: '10px 20px',
                  background: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
              >
                Annuler
              </button>
              <button
                onClick={confirmDispense}
                disabled={processingId === selectedPrescription.id}
                style={{
                  padding: '10px 20px',
                  background: processingId === selectedPrescription.id ? '#94a3b8' : '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: processingId === selectedPrescription.id ? 'wait' : 'pointer',
                  transition: 'background 0.2s'
                }}
              >
                {processingId === selectedPrescription.id ? 'Traitement...' : 'Confirmer la délivrance'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Styles d'animation */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default PharmacyPrescriptions;