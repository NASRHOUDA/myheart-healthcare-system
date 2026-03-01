import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

function PatientPrescriptions() {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [doctors, setDoctors] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, active, dispensed, expired

  useEffect(() => {
    if (user) {
      fetchPrescriptions();
    }
  }, [user]);

  const fetchDoctorInfo = async (doctorId) => {
    try {
      // Essayer de récupérer depuis le service d'authentification
      const response = await axios.get(`http://localhost:8081/api/users/${doctorId}`);
      return { id: doctorId, ...response.data };
    } catch (err) {
      console.log(`Médecin ID ${doctorId} non trouvé dans auth service`);
      
      // Essayer de récupérer depuis le service des médecins (si existe)
      try {
        const response = await axios.get(`http://localhost:8082/api/doctors/${doctorId}`);
        return { id: doctorId, ...response.data };
      } catch (err2) {
        console.log(`Médecin ID ${doctorId} non trouvé non plus`);
        return null;
      }
    }
  };

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      
      // Déterminer l'ID du patient
      const patientId = user?.patientId || user?.id;
      console.log('🔍 Recherche des prescriptions pour patient ID:', patientId);
      
      if (!patientId) {
        console.error('❌ ID patient non trouvé');
        setLoading(false);
        return;
      }

      // Récupérer les prescriptions du patient depuis le service pharmacie (port 8087)
      const response = await axios.get(`http://localhost:8087/api/prescriptions/patient/${patientId}`);
      console.log('✅ Prescriptions trouvées:', response.data);
      
      const prescriptionsData = response.data;
      
      // Récupérer les informations des médecins pour chaque prescription
      const doctorsMap = { ...doctors };
      
      for (const presc of prescriptionsData) {
        if (presc.doctorId && !doctorsMap[presc.doctorId]) {
          const doctorInfo = await fetchDoctorInfo(presc.doctorId);
          if (doctorInfo) {
            doctorsMap[presc.doctorId] = doctorInfo;
          }
        }
      }
      
      setDoctors(doctorsMap);
      
      // Trier par date (du plus récent au plus ancien)
      const sortedPrescriptions = prescriptionsData.sort((a, b) => 
        new Date(b.prescribedDate) - new Date(a.prescribedDate)
      );
      
      setPrescriptions(sortedPrescriptions);
      setLoading(false);
    } catch (err) {
      console.error('❌ Erreur chargement prescriptions:', err);
      if (err.response?.status === 404) {
        console.log('Aucune prescription trouvée pour ce patient');
        setPrescriptions([]);
      }
      setLoading(false);
    }
  };

  const getDoctorName = (doctorId) => {
    const doctor = doctors[doctorId];
    if (doctor) {
      return `Dr. ${doctor.firstName || ''} ${doctor.lastName || ''}`.trim();
    }
    return `Médecin (ID: ${doctorId})`;
  };

  const getDoctorSpecialty = (doctorId) => {
    const doctor = doctors[doctorId];
    return doctor?.specialty || '';
  };

  const getFilteredPrescriptions = () => {
    switch(filter) {
      case 'active':
        return prescriptions.filter(p => p.status === 'ACTIVE');
      case 'dispensed':
        return prescriptions.filter(p => p.status === 'DISPENSED');
      case 'expired':
        return prescriptions.filter(p => p.status === 'EXPIRED' || p.status === 'CANCELLED');
      default:
        return prescriptions;
    }
  };

  const stats = {
    total: prescriptions.length,
    active: prescriptions.filter(p => p.status === 'ACTIVE').length,
    dispensed: prescriptions.filter(p => p.status === 'DISPENSED').length,
    expired: prescriptions.filter(p => p.status === 'EXPIRED' || p.status === 'CANCELLED').length
  };

  const getStatusStyle = (status) => {
    const styles = {
      'ACTIVE': {
        bg: '#dbeafe',
        color: '#1e40af',
        icon: '✓',
        label: 'Active'
      },
      'DISPENSED': {
        bg: '#dcfce7',
        color: '#166534',
        icon: '✓✓',
        label: 'Délivrée'
      },
      'CANCELLED': {
        bg: '#fee2e2',
        color: '#991b1b',
        icon: '✗',
        label: 'Annulée'
      },
      'EXPIRED': {
        bg: '#f3f4f6',
        color: '#4b5563',
        icon: '!',
        label: 'Expirée'
      }
    };
    return styles[status] || styles['EXPIRED'];
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
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
        <div style={{
          width: '40px',
          height: '40px',
          border: '2px solid #f0f0f0',
          borderTopColor: '#2563eb',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  const filteredPrescriptions = getFilteredPrescriptions();

  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    header: {
      marginBottom: '30px'
    },
    title: {
      fontSize: '28px',
      fontWeight: '300',
      color: '#1a1a1a',
      margin: '0 0 5px 0'
    },
    subtitle: {
      fontSize: '14px',
      color: '#666',
      margin: 0
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '15px',
      marginBottom: '30px'
    },
    statCard: {
      backgroundColor: 'white',
      border: '1px solid #eaeaea',
      borderRadius: '12px',
      padding: '20px'
    },
    statNumber: {
      fontSize: '28px',
      fontWeight: '500',
      marginBottom: '5px'
    },
    statLabel: {
      fontSize: '14px',
      color: '#666'
    },
    filtersContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '25px',
      borderBottom: '1px solid #eaeaea',
      paddingBottom: '15px'
    },
    filters: {
      display: 'flex',
      gap: '5px',
      backgroundColor: '#f5f5f5',
      padding: '4px',
      borderRadius: '8px'
    },
    filterButton: (isActive) => ({
      padding: '8px 16px',
      border: 'none',
      borderRadius: '6px',
      fontSize: '14px',
      cursor: 'pointer',
      backgroundColor: isActive ? 'white' : 'transparent',
      color: isActive ? '#2563eb' : '#666',
      boxShadow: isActive ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
    }),
    resultCount: {
      fontSize: '14px',
      color: '#666'
    },
    emptyState: {
      textAlign: 'center',
      padding: '60px 20px',
      backgroundColor: 'white',
      border: '1px solid #eaeaea',
      borderRadius: '12px'
    },
    emptyEmoji: {
      fontSize: '48px',
      marginBottom: '15px',
      opacity: 0.3
    },
    emptyTitle: {
      fontSize: '18px',
      fontWeight: '500',
      color: '#1a1a1a',
      marginBottom: '10px'
    },
    emptyText: {
      fontSize: '14px',
      color: '#666',
      marginBottom: '25px',
      maxWidth: '400px',
      margin: '0 auto'
    },
    prescriptionsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
      gap: '20px'
    },
    prescriptionCard: {
      backgroundColor: 'white',
      border: '1px solid #eaeaea',
      borderRadius: '12px',
      padding: '20px',
      transition: 'all 0.2s',
      position: 'relative',
      overflow: 'hidden'
    },
    statusBar: (status) => ({
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '4px',
      backgroundColor: getStatusStyle(status).bg,
      borderTopLeftRadius: '12px',
      borderTopRightRadius: '12px'
    }),
    medicationName: {
      fontSize: '18px',
      fontWeight: '500',
      color: '#1a1a1a',
      marginBottom: '10px',
      paddingRight: '80px'
    },
    doctorInfo: {
      fontSize: '14px',
      color: '#2563eb',
      marginBottom: '15px',
      fontWeight: '500'
    },
    doctorSpecialty: {
      fontSize: '12px',
      color: '#666',
      marginLeft: '5px',
      fontWeight: 'normal'
    },
    statusBadge: (status) => {
      const style = getStatusStyle(status);
      return {
        position: 'absolute',
        top: '20px',
        right: '20px',
        padding: '4px 10px',
        borderRadius: '20px',
        fontSize: '12px',
        backgroundColor: style.bg,
        color: style.color,
        display: 'flex',
        alignItems: 'center',
        gap: '4px'
      };
    },
    infoGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '12px',
      marginBottom: '15px'
    },
    infoItem: {
      display: 'flex',
      flexDirection: 'column'
    },
    infoLabel: {
      fontSize: '12px',
      color: '#666',
      marginBottom: '2px'
    },
    infoValue: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#1a1a1a'
    },
    instructionsBox: {
      backgroundColor: '#f9fafb',
      borderRadius: '8px',
      padding: '12px',
      marginTop: '10px',
      border: '1px solid #eaeaea'
    },
    instructionsText: {
      fontSize: '13px',
      color: '#444',
      margin: 0,
      lineHeight: '1.5'
    },
    footer: {
      marginTop: '15px',
      paddingTop: '15px',
      borderTop: '1px solid #eaeaea',
      fontSize: '12px',
      color: '#999',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Mes prescriptions</h1>
        <p style={styles.subtitle}>
          {stats.active} traitement{stats.active > 1 ? 's' : ''} en cours
        </p>
      </div>

      {/* Statistiques */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={{ ...styles.statNumber, color: '#1a1a1a' }}>{stats.total}</div>
          <div style={styles.statLabel}>Total</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statNumber, color: '#1e40af' }}>{stats.active}</div>
          <div style={styles.statLabel}>Actives</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statNumber, color: '#166534' }}>{stats.dispensed}</div>
          <div style={styles.statLabel}>Délivrées</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statNumber, color: '#4b5563' }}>{stats.expired}</div>
          <div style={styles.statLabel}>Expirées</div>
        </div>
      </div>

      {/* Filtres */}
      <div style={styles.filtersContainer}>
        <div style={styles.filters}>
          {[
            { id: 'all', label: 'Toutes' },
            { id: 'active', label: 'Actives' },
            { id: 'dispensed', label: 'Délivrées' },
            { id: 'expired', label: 'Expirées' }
          ].map((option) => (
            <button
              key={option.id}
              onClick={() => setFilter(option.id)}
              style={styles.filterButton(filter === option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>
        <div style={styles.resultCount}>
          {filteredPrescriptions.length} prescription{filteredPrescriptions.length > 1 ? 's' : ''}
        </div>
      </div>

      {/* Liste des prescriptions */}
      {filteredPrescriptions.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyEmoji}>💊</div>
          <h3 style={styles.emptyTitle}>Aucune prescription</h3>
          <p style={styles.emptyText}>
            {filter === 'all' 
              ? "Vous n'avez pas encore de prescriptions."
              : "Aucune prescription dans cette catégorie."}
          </p>
        </div>
      ) : (
        <div style={styles.prescriptionsGrid}>
          {filteredPrescriptions.map(presc => {
            const statusStyle = getStatusStyle(presc.status);
            const doctorName = getDoctorName(presc.doctorId);
            const doctorSpecialty = getDoctorSpecialty(presc.doctorId);
            
            return (
              <div 
                key={presc.id} 
                style={styles.prescriptionCard}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
                  e.currentTarget.style.borderColor = '#d0d0d0';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = '#eaeaea';
                }}
              >
                <div style={styles.statusBar(presc.status)}></div>
                
                <div style={styles.medicationName}>
                  {presc.medicationName}
                </div>
                
                <div style={styles.doctorInfo}>
                  {doctorName}
                  {doctorSpecialty && (
                    <span style={styles.doctorSpecialty}>• {doctorSpecialty}</span>
                  )}
                </div>
                
                <div style={styles.statusBadge(presc.status)}>
                  <span>{statusStyle.icon}</span>
                  {statusStyle.label}
                </div>

                <div style={styles.infoGrid}>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Dosage</span>
                    <span style={styles.infoValue}>{presc.dosage}</span>
                  </div>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Fréquence</span>
                    <span style={styles.infoValue}>{presc.frequency}</span>
                  </div>
                  {presc.duration && (
                    <div style={styles.infoItem}>
                      <span style={styles.infoLabel}>Durée</span>
                      <span style={styles.infoValue}>{presc.duration}</span>
                    </div>
                  )}
                </div>

                {presc.instructions && (
                  <div style={styles.instructionsBox}>
                    <p style={styles.instructionsText}>
                      📝 {presc.instructions}
                    </p>
                  </div>
                )}

                <div style={styles.footer}>
                  <span>Prescrit le {formatDate(presc.prescribedDate)}</span>
                  {presc.expiryDate && (
                    <span>Expire le {formatDate(presc.expiryDate)}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default PatientPrescriptions;