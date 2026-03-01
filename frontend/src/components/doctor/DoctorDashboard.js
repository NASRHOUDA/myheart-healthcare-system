import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

function DoctorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [myAppointments, setMyAppointments] = useState([]);
  const [myPatients, setMyPatients] = useState([]);
  const [recentPrescriptions, setRecentPrescriptions] = useState([]);
  const [recentLabResults, setRecentLabResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [stats, setStats] = useState({
    todayAppointments: 0,
    totalPatients: 0,
    pendingPrescriptions: 0,
    recentLabResults: 0,
    totalAppointments: 0
  });

  useEffect(() => {
    fetchDoctorData();
    setGreeting(getGreeting());
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  const fetchDoctorData = async () => {
    try {
      setLoading(true);
      
      // Utiliser l'ID du médecin depuis user
      const doctorId = user?.id || 2;
      
      // Récupérer les rendez-vous du médecin
      const appointmentsRes = await axios.get(`http://localhost:8082/api/appointments/doctor/${doctorId}`);
      
      // Récupérer tous les patients
      const patientsRes = await axios.get('http://localhost:8081/api/patients');
      
      // Récupérer les prescriptions depuis le service pharmacie (port 8087)
      const prescriptionsRes = await axios.get('http://localhost:8087/api/prescriptions');
      
      // Récupérer les résultats de laboratoire
      const labRes = await axios.get('http://localhost:8085/api/lab');

      // Filtrer les patients uniques de ce médecin
      const uniquePatientIds = [...new Set(appointmentsRes.data.map(apt => apt.patientId))];
      const doctorPatients = patientsRes.data.filter(p => uniquePatientIds.includes(p.id));

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayStr = today.toDateString();
      const todayAppointments = appointmentsRes.data.filter(apt => 
        new Date(apt.appointmentDateTime).toDateString() === todayStr
      );

      // Filtrer les prescriptions du médecin
      const doctorPrescriptions = prescriptionsRes.data.filter(p => p.doctorId === doctorId);
      
      const pendingPrescriptions = doctorPrescriptions.filter(p => p.status === 'ACTIVE');

      // Récupérer les prescriptions récentes
      const recentPrescs = doctorPrescriptions
        .sort((a, b) => new Date(b.prescribedDate) - new Date(a.prescribedDate))
        .slice(0, 5);

      // Récupérer les résultats de laboratoire récents
      const recentLab = labRes.data
        .filter(l => uniquePatientIds.includes(l.patientId))
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

      setMyAppointments(appointmentsRes.data);
      setMyPatients(doctorPatients);
      setRecentPrescriptions(recentPrescs);
      setRecentLabResults(recentLab);
      setStats({
        todayAppointments: todayAppointments.length,
        totalPatients: doctorPatients.length,
        pendingPrescriptions: pendingPrescriptions.length,
        recentLabResults: recentLab.length,
        totalAppointments: appointmentsRes.data.length
      });
      setLoading(false);
    } catch (err) {
      console.error('Erreur:', err);
      setLoading(false);
    }
  };

  const getPatientName = (patientId) => {
    const patient = myPatients.find(p => p.id === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : `Patient #${patientId}`;
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
            width: '50px',
            height: '50px',
            border: '3px solid #f3f4f6',
            borderTopColor: '#16a34a',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px auto'
          }}></div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ color: '#6b7280' }}>Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '24px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* En-tête avec les informations du médecin */}
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '28px',
        marginBottom: '28px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        border: '1px solid #eef2f6'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '500', margin: '0 0 6px 0', color: '#0f172a' }}>
              {greeting}, Dr. {user?.lastName}
            </h1>
            <p style={{ margin: '0', color: '#475569', fontSize: '15px' }}>
              {currentTime.toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <div style={{
            background: '#f8fafc',
            padding: '16px 24px',
            borderRadius: '40px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end'
          }}>
            <span style={{ fontWeight: '600', color: '#0f172a' }}>Dr. {user?.firstName} {user?.lastName}</span>
            <span style={{
              marginTop: '4px',
              background: '#e2e8f0',
              padding: '4px 12px',
              borderRadius: '40px',
              fontSize: '13px',
              color: '#1e293b'
            }}>
              {user?.specialty || 'Médecin'} • Licence: {user?.licenseNumber || 'DOC12345'}
            </span>
          </div>
        </div>
      </div>

      {/* Statistiques - cartes cliquables */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '28px'
      }}>
        {/* Carte Rendez-vous */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '20px',
          border: '1px solid #eef2f6',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
        onClick={() => navigate('/doctor/appointments')}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 10px 20px -8px rgba(0,0,0,0.1)';
          e.currentTarget.style.borderColor = '#2563eb';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
          e.currentTarget.style.borderColor = '#eef2f6';
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              background: '#eff6ff',
              borderRadius: '12px',
              padding: '10px',
              color: '#2563eb'
            }}>
              <i className="bi bi-calendar-check" style={{ fontSize: '24px' }}></i>
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: '600', color: '#2563eb' }}>{stats.totalAppointments}</div>
              <div style={{ fontSize: '13px', color: '#64748b' }}>Rendez-vous</div>
            </div>
          </div>
          <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '12px' }}>
            {stats.todayAppointments} aujourd'hui
          </div>
        </div>

        {/* Carte Patients */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '20px',
          border: '1px solid #eef2f6',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
        onClick={() => navigate('/doctor/patients')}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 10px 20px -8px rgba(0,0,0,0.1)';
          e.currentTarget.style.borderColor = '#16a34a';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
          e.currentTarget.style.borderColor = '#eef2f6';
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              background: '#f0fdf4',
              borderRadius: '12px',
              padding: '10px',
              color: '#16a34a'
            }}>
              <i className="bi bi-people-fill" style={{ fontSize: '24px' }}></i>
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: '600', color: '#16a34a' }}>{stats.totalPatients}</div>
              <div style={{ fontSize: '13px', color: '#64748b' }}>Patients</div>
            </div>
          </div>
          <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '12px' }}>
            Dossiers actifs
          </div>
        </div>

        {/* Carte Prescriptions */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '20px',
          border: '1px solid #eef2f6',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
        onClick={() => navigate('/doctor/prescriptions')}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 10px 20px -8px rgba(0,0,0,0.1)';
          e.currentTarget.style.borderColor = '#ca8a04';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
          e.currentTarget.style.borderColor = '#eef2f6';
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              background: '#fefce8',
              borderRadius: '12px',
              padding: '10px',
              color: '#ca8a04'
            }}>
              <i className="bi bi-capsule-fill" style={{ fontSize: '24px' }}></i>
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: '600', color: '#ca8a04' }}>{stats.pendingPrescriptions}</div>
              <div style={{ fontSize: '13px', color: '#64748b' }}>Prescriptions</div>
            </div>
          </div>
          <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '12px' }}>
            En attente
          </div>
        </div>

        {/* Carte Laboratoire */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '20px',
          border: '1px solid #eef2f6',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
        onClick={() => navigate('/doctor/lab-results')}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 10px 20px -8px rgba(0,0,0,0.1)';
          e.currentTarget.style.borderColor = '#0891b2';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
          e.currentTarget.style.borderColor = '#eef2f6';
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              background: '#ecfeff',
              borderRadius: '12px',
              padding: '10px',
              color: '#0891b2'
            }}>
              <i className="bi bi-flask-fill" style={{ fontSize: '24px' }}></i>
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: '600', color: '#0891b2' }}>{stats.recentLabResults}</div>
              <div style={{ fontSize: '13px', color: '#64748b' }}>Analyses</div>
            </div>
          </div>
          <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '12px' }}>
            Résultats récents
          </div>
        </div>
      </div>

      {/* Actions du médecin */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '16px',
        marginBottom: '28px'
      }}>
        <Link to="/doctor/prescriptions" style={{ textDecoration: 'none' }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid #eef2f6',
            textAlign: 'center',
            transition: 'all 0.2s',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 10px 20px -8px rgba(202, 138, 4, 0.2)';
            e.currentTarget.style.borderColor = '#ca8a04';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.borderColor = '#eef2f6';
          }}>
            <i className="bi bi-capsule" style={{ fontSize: '32px', color: '#ca8a04' }}></i>
            <h3 style={{ margin: '12px 0 4px 0', fontSize: '16px', color: '#0f172a' }}>Prescriptions</h3>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Gérer et créer des prescriptions</p>
          </div>
        </Link>

        <Link to="/doctor/patients" style={{ textDecoration: 'none' }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid #eef2f6',
            textAlign: 'center',
            transition: 'all 0.2s',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 10px 20px -8px rgba(22, 163, 74, 0.2)';
            e.currentTarget.style.borderColor = '#16a34a';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.borderColor = '#eef2f6';
          }}>
            <i className="bi bi-folder-medical" style={{ fontSize: '32px', color: '#16a34a' }}></i>
            <h3 style={{ margin: '12px 0 4px 0', fontSize: '16px', color: '#0f172a' }}>Dossiers patients</h3>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Consulter les dossiers</p>
          </div>
        </Link>

        <Link to="/doctor/lab-results" style={{ textDecoration: 'none' }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid #eef2f6',
            textAlign: 'center',
            transition: 'all 0.2s',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 10px 20px -8px rgba(8, 145, 178, 0.2)';
            e.currentTarget.style.borderColor = '#0891b2';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.borderColor = '#eef2f6';
          }}>
            <i className="bi bi-flask" style={{ fontSize: '32px', color: '#0891b2' }}></i>
            <h3 style={{ margin: '12px 0 4px 0', fontSize: '16px', color: '#0f172a' }}>Résultats labo</h3>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Voir les analyses</p>
          </div>
        </Link>
      </div>

      {/* Rendez-vous du jour */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid #eef2f6'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <h3 style={{ fontSize: '16px', margin: 0, color: '#0f172a', fontWeight: '500' }}>
            <i className="bi bi-calendar-check-fill me-2" style={{ color: '#2563eb' }}></i>
            Rendez-vous du jour
            <span style={{
              marginLeft: '10px',
              background: '#e2e8f0',
              padding: '2px 8px',
              borderRadius: '40px',
              fontSize: '12px',
              color: '#1e293b'
            }}>{stats.todayAppointments}</span>
          </h3>
          <Link to="/doctor/appointments" style={{ fontSize: '13px', color: '#2563eb', textDecoration: 'none' }}>
            Voir tout
          </Link>
        </div>

        {myAppointments.filter(apt => 
          new Date(apt.appointmentDateTime).toDateString() === new Date().toDateString()
        ).length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
            <i className="bi bi-calendar-x" style={{ fontSize: '32px' }}></i>
            <p style={{ marginTop: '8px', fontSize: '14px' }}>Aucun rendez-vous aujourd'hui</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {myAppointments
              .filter(apt => new Date(apt.appointmentDateTime).toDateString() === new Date().toDateString())
              .sort((a, b) => new Date(a.appointmentDateTime) - new Date(b.appointmentDateTime))
              .map(apt => {
                const patient = myPatients.find(p => p.id === apt.patientId);
                return (
                  <div key={apt.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px',
                    background: '#f8fafc',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '20px',
                        background: '#e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#475569'
                      }}>
                        <i className="bi bi-person-circle" style={{ fontSize: '24px' }}></i>
                      </div>
                      <div>
                        <div style={{ fontWeight: '500', color: '#0f172a' }}>
                          {patient ? `${patient.firstName} ${patient.lastName}` : `Patient #${apt.patientId}`}
                        </div>
                        <div style={{ fontSize: '13px', color: '#64748b' }}>
                          {new Date(apt.appointmentDateTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          {' • '}
                          {apt.reason || 'Consultation'}
                        </div>
                      </div>
                    </div>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '40px',
                      fontSize: '11px',
                      fontWeight: '500',
                      background: apt.status === 'SCHEDULED' ? '#fef9c3' :
                                 apt.status === 'CONFIRMED' ? '#dbeafe' :
                                 apt.status === 'COMPLETED' ? '#dcfce7' : '#fee2e2',
                      color: apt.status === 'SCHEDULED' ? '#854d0e' :
                             apt.status === 'CONFIRMED' ? '#1e40af' :
                             apt.status === 'COMPLETED' ? '#166534' : '#991b1b'
                    }}>
                      {apt.status}
                    </span>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* Section prescriptions récentes */}
      {recentPrescriptions.length > 0 && (
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid #eef2f6',
          marginTop: '24px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <h3 style={{ fontSize: '16px', margin: 0, color: '#0f172a', fontWeight: '500' }}>
              <i className="bi bi-capsule-fill me-2" style={{ color: '#ca8a04' }}></i>
              Prescriptions récentes
            </h3>
            <Link to="/doctor/prescriptions" style={{ fontSize: '13px', color: '#2563eb', textDecoration: 'none' }}>
              Voir tout
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentPrescriptions.map(presc => {
              const patient = myPatients.find(p => p.id === presc.patientId);
              return (
                <div key={presc.id} style={{
                  padding: '16px',
                  background: '#f8fafc',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: '500', color: '#0f172a' }}>{presc.medicationName}</div>
                      <div style={{ fontSize: '13px', color: '#64748b' }}>
                        {patient ? `${patient.firstName} ${patient.lastName}` : `Patient #${presc.patientId}`} • {presc.dosage} • {presc.frequency}
                      </div>
                    </div>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '40px',
                      fontSize: '11px',
                      fontWeight: '500',
                      background: presc.status === 'ACTIVE' ? '#dcfce7' :
                                 presc.status === 'DISPENSED' ? '#dbeafe' : '#f1f5f9',
                      color: presc.status === 'ACTIVE' ? '#166534' :
                             presc.status === 'DISPENSED' ? '#1e40af' : '#64748b'
                    }}>
                      {presc.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default DoctorDashboard;