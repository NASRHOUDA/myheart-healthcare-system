import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

function PatientMedications() {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, active, past

  useEffect(() => {
    fetchPatientPrescriptions();
  }, []);

  const fetchPatientPrescriptions = async () => {
    try {
      setLoading(true);
      
      // Déterminer l'ID du patient
      const patientId = user?.patientId || user?.id;
      console.log('🔍 Patient ID:', patientId);
      
      if (!patientId) {
        console.error('❌ ID patient non trouvé');
        setLoading(false);
        return;
      }

      // Récupérer les prescriptions du patient depuis le service pharmacie (port 8087)
      const response = await axios.get(`http://localhost:8087/api/prescriptions/patient/${patientId}`);
      console.log('✅ Prescriptions trouvées:', response.data);
      
      setPrescriptions(response.data);
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

  const getFilteredPrescriptions = () => {
    const now = new Date();
    
    switch(filter) {
      case 'active':
        return prescriptions.filter(p => 
          p.status === 'ACTIVE' && (!p.expiryDate || new Date(p.expiryDate) > now)
        );
      case 'past':
        return prescriptions.filter(p => 
          p.status === 'DISPENSED' || p.status === 'EXPIRED' || p.status === 'CANCELLED' ||
          (p.expiryDate && new Date(p.expiryDate) <= now)
        );
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

  const getStatusStyle = (status, expiryDate) => {
    const now = new Date();
    const isExpired = expiryDate && new Date(expiryDate) <= now;
    
    const styles = {
      'ACTIVE': {
        bg: isExpired ? '#f3f4f6' : '#dbeafe',
        color: isExpired ? '#4b5563' : '#1e40af',
        icon: isExpired ? '⏰' : '✓',
        label: isExpired ? 'Expiré' : 'En cours'
      },
      'DISPENSED': {
        bg: '#dcfce7',
        color: '#166534',
        icon: '✓✓',
        label: 'Terminé'
      },
      'CANCELLED': {
        bg: '#fee2e2',
        color: '#991b1b',
        icon: '✗',
        label: 'Annulé'
      },
      'EXPIRED': {
        bg: '#f3f4f6',
        color: '#4b5563',
        icon: '⏰',
        label: 'Expiré'
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

  const getDosageInstructions = (presc) => {
    const parts = [];
    if (presc.dosage) parts.push(presc.dosage);
    if (presc.frequency) parts.push(presc.frequency);
    if (presc.duration) parts.push(`pendant ${presc.duration}`);
    return parts.join(' • ');
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
      gridTemplateColumns: 'repeat(3, 1fr)',
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
    medicationsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
      gap: '20px'
    },
    medicationCard: {
      backgroundColor: 'white',
      border: '1px solid #eaeaea',
      borderRadius: '12px',
      padding: '20px',
      transition: 'all 0.2s',
      position: 'relative'
    },
    medicationHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '15px'
    },
    medicationName: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#1a1a1a',
      margin: 0
    },
    statusBadge: (status, expiryDate) => {
      const style = getStatusStyle(status, expiryDate);
      return {
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
    dosageInfo: {
      backgroundColor: '#f9fafb',
      borderRadius: '8px',
      padding: '12px',
      marginBottom: '15px',
      fontSize: '14px',
      color: '#444',
      border: '1px solid #eaeaea'
    },
    instructionsBox: {
      backgroundColor: '#f0f9ff',
      borderRadius: '8px',
      padding: '12px',
      marginBottom: '15px',
      border: '1px solid #bae6fd'
    },
    instructionsText: {
      fontSize: '13px',
      color: '#0369a1',
      margin: 0,
      lineHeight: '1.5'
    },
    footer: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: '12px',
      color: '#999',
      paddingTop: '15px',
      borderTop: '1px solid #eaeaea'
    },
    warningBox: {
      backgroundColor: '#fff3cd',
      border: '1px solid #ffeeba',
      borderRadius: '8px',
      padding: '15px',
      marginTop: '20px',
      fontSize: '14px',
      color: '#856404',
      textAlign: 'center'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Mes médicaments</h1>
        <p style={styles.subtitle}>
          Traitements prescrits par votre médecin
        </p>
      </div>

      {/* Statistiques */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={{ ...styles.statNumber, color: '#1a1a1a' }}>{stats.total}</div>
          <div style={styles.statLabel}>Total prescriptions</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statNumber, color: '#1e40af' }}>{stats.active}</div>
          <div style={styles.statLabel}>En cours</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statNumber, color: '#4b5563' }}>{stats.expired}</div>
          <div style={styles.statLabel}>Terminés</div>
        </div>
      </div>

      {/* Filtres */}
      <div style={styles.filtersContainer}>
        <div style={styles.filters}>
          {[
            { id: 'all', label: 'Tous' },
            { id: 'active', label: 'En cours' },
            { id: 'past', label: 'Passés' }
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
          {filteredPrescriptions.length} médicament{filteredPrescriptions.length > 1 ? 's' : ''}
        </div>
      </div>

      {/* Liste des médicaments */}
      {filteredPrescriptions.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyEmoji}>💊</div>
          <h3 style={styles.emptyTitle}>Aucun médicament</h3>
          <p style={styles.emptyText}>
            {filter === 'all' 
              ? "Vous n'avez pas de médicaments prescrits pour le moment."
              : filter === 'active' 
                ? "Vous n'avez aucun traitement en cours."
                : "Aucun traitement passé."}
          </p>
        </div>
      ) : (
        <div style={styles.medicationsGrid}>
          {filteredPrescriptions.map(presc => {
            const now = new Date();
            const isExpired = presc.expiryDate && new Date(presc.expiryDate) <= now;
            const statusStyle = getStatusStyle(presc.status, presc.expiryDate);
            
            return (
              <div 
                key={presc.id} 
                style={styles.medicationCard}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
                  e.currentTarget.style.borderColor = '#d0d0d0';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = '#eaeaea';
                }}
              >
                <div style={styles.medicationHeader}>
                  <h3 style={styles.medicationName}>
                    {presc.medicationName}
                  </h3>
                  <div style={styles.statusBadge(presc.status, presc.expiryDate)}>
                    <span>{statusStyle.icon}</span>
                    {isExpired ? 'Expiré' : statusStyle.label}
                  </div>
                </div>

                <div style={styles.dosageInfo}>
                  <div style={{ marginBottom: '5px' }}>
                    <strong>Posologie:</strong> {getDosageInstructions(presc)}
                  </div>
                  {presc.duration && (
                    <div>
                      <strong>Traitement:</strong> {presc.duration}
                    </div>
                  )}
                </div>

                {presc.instructions && (
                  <div style={styles.instructionsBox}>
                    <p style={styles.instructionsText}>
                      <strong>📝 Mode d'emploi:</strong> {presc.instructions}
                    </p>
                  </div>
                )}

                <div style={styles.footer}>
                  <span>Prescrit le {formatDate(presc.prescribedDate)}</span>
                  {presc.expiryDate && (
                    <span>Expire le {formatDate(presc.expiryDate)}</span>
                  )}
                </div>

                {presc.status === 'ACTIVE' && !isExpired && (
                  <div style={styles.warningBox}>
                    ⏰ Pensez à prendre votre médicament selon la prescription
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default PatientMedications;