import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

function PharmacyDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    pendingPrescriptions: 0,
    dispensedToday: 0,
    totalMedications: 0,
    lowStock: 0,
    expiringSoon: 0
  });
  const [recentPrescriptions, setRecentPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
  try {
    setLoading(true);
    
    // Récupérer les prescriptions depuis le service pharmacie (port 8087)
    const prescriptionsRes = await axios.get('http://localhost:8087/api/prescriptions');
    const prescriptions = prescriptionsRes.data;
    
    // Calculer les statistiques des prescriptions
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const pending = prescriptions.filter(p => p.status === 'ACTIVE').length;
    
    // Pour les délivrées aujourd'hui, on ne peut pas compter car pas de date
    // On compte juste toutes les prescriptions délivrées
    const dispensedTotal = prescriptions.filter(p => p.status === 'DISPENSED').length;
    
    // Ou si on veut vraiment celles d'aujourd'hui, on utilise la date de prescription
    // (mais ce n'est pas idéal car c'est la date de prescription, pas de délivrance)
    const dispensedToday = prescriptions.filter(p => {
      if (p.status !== 'DISPENSED') return false;
      
      // Utiliser prescribedDate comme fallback (pas idéal mais c'est la seule date disponible)
      const prescribedDate = new Date(p.prescribedDate).toISOString().split('T')[0];
      return prescribedDate === today;
    }).length;

    console.log('En attente:', pending, 'Délivrées total:', dispensedTotal);

    // Récupérer les médicaments depuis le service pharmacie (port 8087)
    let medications = [];
    try {
      const medsRes = await axios.get('http://localhost:8087/api/medications');
      medications = medsRes.data;
    } catch (err) {
      console.log('Service médicaments non disponible');
    }

    // Calculer les statistiques des médicaments
    const lowStock = medications.filter(m => m.stockQuantity < 10).length;
    const expiringSoon = medications.filter(m => {
      if (!m.expiryDate) return false;
      const expiry = new Date(m.expiryDate);
      const now = new Date();
      const daysUntilExpiry = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
    }).length;

    setStats({
      pendingPrescriptions: pending,
      dispensedToday: dispensedToday, // ou dispensedTotal selon ce que vous voulez
      totalMedications: medications.length,
      lowStock: lowStock,
      expiringSoon: expiringSoon
    });

    // Récupérer les 5 dernières prescriptions
    const recent = [...prescriptions]
      .sort((a, b) => new Date(b.prescribedDate) - new Date(a.prescribedDate))
      .slice(0, 5);
    
    // Enrichir avec les noms des patients
    const patientsMap = {};
    try {
      const patientsRes = await axios.get('http://localhost:8081/api/patients');
      patientsRes.data.forEach(patient => {
        patientsMap[patient.id] = `${patient.firstName} ${patient.lastName}`;
      });
    } catch (err) {
      console.log('Service patients non disponible');
    }

    const enrichedRecent = recent.map(presc => ({
      ...presc,
      patientName: patientsMap[presc.patientId] || 'Patient inconnu'
    }));
    
    setRecentPrescriptions(enrichedRecent);
    setLoading(false);
  } catch (err) {
    console.error('Erreur chargement tableau de bord:', err);
    setLoading(false);
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
        fontWeight: '500'
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
          <p style={{ color: '#64748b' }}>Chargement du tableau de bord...</p>
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
      {/* En-tête avec informations du pharmacien */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '500', color: '#0f172a', margin: '0 0 8px 0' }}>
            Tableau de bord Pharmacie
          </h1>
          <div style={{ fontSize: '14px', color: '#64748b' }}>
            <i className="bi bi-shield-check me-2" style={{ color: '#2563eb' }}></i>
            Pharmacien(ne): <strong>{user?.firstName} {user?.lastName}</strong>
            {user?.licenseNumber && (
              <span style={{ marginLeft: '16px' }}>
                <i className="bi bi-card-text me-1"></i>
                Licence: {user.licenseNumber}
              </span>
            )}
          </div>
        </div>
        <div style={{
          padding: '10px 20px',
          background: '#f8fafc',
          borderRadius: '8px',
          fontSize: '14px',
          color: '#2563eb',
          border: '1px solid #e2e8f0'
        }}>
          <i className="bi bi-calendar-check me-2"></i>
          {new Date().toLocaleDateString('fr-FR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* Cartes de statistiques */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        {/* Carte 1 - Prescriptions en attente */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '12px',
              background: '#dbeafe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <i className="bi bi-capsule" style={{ fontSize: '24px', color: '#2563eb' }}></i>
            </div>
            <div>
              <div style={{ fontSize: '14px', color: '#64748b' }}>Prescriptions en attente</div>
              <div style={{ fontSize: '28px', fontWeight: '600', color: '#0f172a' }}>
                {stats.pendingPrescriptions}
              </div>
            </div>
          </div>
        </div>

        {/* Carte 2 - Délivrées aujourd'hui */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '12px',
              background: '#dcfce7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <i className="bi bi-check-circle" style={{ fontSize: '24px', color: '#166534' }}></i>
            </div>
            <div>
              <div style={{ fontSize: '14px', color: '#64748b' }}>Délivrées aujourd'hui</div>
              <div style={{ fontSize: '28px', fontWeight: '600', color: '#0f172a' }}>
                {stats.dispensedToday}
              </div>
            </div>
          </div>
        </div>

        {/* Carte 3 - Médicaments en stock */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '12px',
              background: '#fef9c3',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <i className="bi bi-box" style={{ fontSize: '24px', color: '#854d0e' }}></i>
            </div>
            <div>
              <div style={{ fontSize: '14px', color: '#64748b' }}>Médicaments en stock</div>
              <div style={{ fontSize: '28px', fontWeight: '600', color: '#0f172a' }}>
                {stats.totalMedications}
              </div>
            </div>
          </div>
        </div>

        {/* Carte 4 - Alertes */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '12px',
              background: '#fee2e2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <i className="bi bi-exclamation-triangle" style={{ fontSize: '24px', color: '#991b1b' }}></i>
            </div>
            <div>
              <div style={{ fontSize: '14px', color: '#64748b' }}>Alertes</div>
              <div style={{ fontSize: '14px', color: '#0f172a', marginTop: '4px' }}>
                <div><span style={{ fontWeight: '600', color: '#b45309' }}>{stats.lowStock}</span> stock faible</div>
                <div><span style={{ fontWeight: '600', color: '#b45309' }}>{stats.expiringSoon}</span> expirent bientôt</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid #e2e8f0',
        marginBottom: '30px'
      }}>
        <h3 style={{ fontSize: '18px', margin: '0 0 16px 0', color: '#0f172a' }}>
          Actions rapides
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px'
        }}>
          <Link to="/pharmacy/prescriptions" style={{
            padding: '12px',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            textDecoration: 'none',
            color: '#2563eb',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#f8fafc'}>
            <i className="bi bi-capsule"></i>
            <span>Gérer les prescriptions</span>
          </Link>
          
          <Link to="/pharmacy/medications" style={{
            padding: '12px',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            textDecoration: 'none',
            color: '#2563eb',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#f8fafc'}>
            <i className="bi bi-box"></i>
            <span>Inventaire médicaments</span>
          </Link>
          
          <Link to="/pharmacy/prescriptions?status=ACTIVE" style={{
            padding: '12px',
            background: '#fee2e2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            textDecoration: 'none',
            color: '#dc2626',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            transition: 'all 0.2s',
            fontWeight: '500'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#fecaca'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#fee2e2'}>
            <i className="bi bi-clock-history"></i>
            <span>En attente ({stats.pendingPrescriptions})</span>
          </Link>
        </div>
      </div>

      {/* Prescriptions récentes */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <h3 style={{ fontSize: '18px', margin: 0, color: '#0f172a' }}>
            Prescriptions récentes à traiter
          </h3>
          <Link to="/pharmacy/prescriptions" style={{
            color: '#2563eb',
            textDecoration: 'none',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            Voir toutes les prescriptions
            <i className="bi bi-arrow-right"></i>
          </Link>
        </div>

        {recentPrescriptions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <i className="bi bi-inbox" style={{ fontSize: '48px', color: '#cbd5e1', marginBottom: '16px' }}></i>
            <p style={{ color: '#64748b', fontSize: '14px' }}>
              Aucune prescription récente à afficher
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentPrescriptions.map(prescription => (
              <Link 
                key={prescription.id} 
                to={`/pharmacy/prescriptions/${prescription.id}`}
                style={{
                  padding: '16px',
                  background: '#f8fafc',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  textDecoration: 'none',
                  color: 'inherit',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#f8fafc'}
              >
                <div>
                  <div style={{ fontWeight: '500', color: '#0f172a', marginBottom: '4px' }}>
                    {prescription.medicationName}
                  </div>
                  <div style={{ fontSize: '13px', color: '#64748b' }}>
                    <i className="bi bi-person me-1"></i>
                    Patient: <strong>{prescription.patientName}</strong> • {formatDate(prescription.prescribedDate)}
                  </div>
                  {prescription.medicationCode && (
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                      Code: {prescription.medicationCode}
                    </div>
                  )}
                </div>
                {getStatusBadge(prescription.status)}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default PharmacyDashboard;