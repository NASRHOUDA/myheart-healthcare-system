import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

function DoctorAppointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user?.id) {
      fetchAppointments();
    }
  }, [user]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      
      const doctorId = user?.id;
      console.log('Médecin connecté ID:', doctorId);
      
      const response = await axios.get(`http://localhost:8082/api/appointments/doctor/${doctorId}`);
      console.log('Rendez-vous reçus:', response.data);
      
      const patientsIds = [...new Set(response.data.map(apt => apt.patientId))];
      const patientsData = {};
      
      for (const patientId of patientsIds) {
        try {
          const patientRes = await axios.get(`http://localhost:8081/api/patients/${patientId}`);
          patientsData[patientId] = patientRes.data;
        } catch (err) {
          console.error(`Erreur chargement patient ${patientId}:`, err);
          patientsData[patientId] = { firstName: 'Patient', lastName: `#${patientId}` };
        }
      }
      
      setAppointments(response.data);
      setPatients(patientsData);
      setLoading(false);
    } catch (err) {
      console.error('Erreur chargement rendez-vous:', err);
      setLoading(false);
    }
  };

  const getFilteredAppointments = () => {
    const now = new Date();
    const today = new Date(now.setHours(0, 0, 0, 0));
    
    return appointments.filter(apt => {
      const aptDate = new Date(apt.appointmentDateTime);
      const patientName = getPatientName(apt.patientId).toLowerCase();
      
      const matchesSearch = patientName.includes(searchTerm.toLowerCase()) ||
                           (apt.reason && apt.reason.toLowerCase().includes(searchTerm.toLowerCase()));
      
      let matchesFilter = true;
      switch(filter) {
        case 'today':
          matchesFilter = aptDate.toDateString() === today.toDateString();
          break;
        case 'upcoming':
          matchesFilter = aptDate > new Date() && apt.status !== 'CANCELLED';
          break;
        case 'past':
          matchesFilter = aptDate < new Date() || apt.status === 'COMPLETED';
          break;
        case 'cancelled':
          matchesFilter = apt.status === 'CANCELLED';
          break;
        default:
          matchesFilter = true;
      }
      
      return matchesSearch && matchesFilter;
    });
  };

  const getPatientName = (patientId) => {
    const patient = patients[patientId];
    return patient ? `${patient.firstName} ${patient.lastName}` : `Patient #${patientId}`;
  };

  const getStatusBadge = (status, date) => {
    const aptDate = new Date(date);
    const now = new Date();
    const isPast = aptDate < now && status !== 'COMPLETED' && status !== 'CANCELLED';
    
    const badges = {
      'SCHEDULED': { 
        bg: isPast ? '#f1f5f9' : '#dbeafe', 
        color: isPast ? '#64748b' : '#1e40af', 
        icon: isPast ? 'bi-clock-history' : 'bi-calendar-check',
        text: isPast ? 'Passé' : 'Planifié' 
      },
      'CONFIRMED': { 
        bg: '#dbeafe', 
        color: '#1e40af', 
        icon: 'bi-check-circle',
        text: 'Confirmé' 
      },
      'COMPLETED': { 
        bg: '#dcfce7', 
        color: '#166534', 
        icon: 'bi-check2-circle',
        text: 'Terminé' 
      },
      'CANCELLED': { 
        bg: '#fee2e2', 
        color: '#991b1b', 
        icon: 'bi-x-circle',
        text: 'Annulé' 
      }
    };
    
    const badge = badges[status] || badges['SCHEDULED'];
    
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '4px 10px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '500',
        background: badge.bg,
        color: badge.color
      }}>
        <i className={`bi ${badge.icon}`}></i>
        {badge.text}
      </span>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return "Aujourd'hui";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Demain";
    } else {
      return date.toLocaleDateString('fr-FR', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long',
        year: 'numeric'
      });
    }
  };

  const filteredAppointments = getFilteredAppointments();

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
          <p style={{ color: '#64748b' }}>Chargement des rendez-vous...</p>
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
      {/* En-tête */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '28px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '500', margin: '0 0 4px 0', color: '#0f172a' }}>
            Mes rendez-vous
          </h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
            Dr. {user?.firstName} {user?.lastName} • {user?.specialty || 'Médecin'}
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '20px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: '600', color: '#2563eb' }}>
              {appointments.filter(a => new Date(a.appointmentDateTime).toDateString() === new Date().toDateString()).length}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Aujourd'hui</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: '600', color: '#16a34a' }}>
              {appointments.filter(a => new Date(a.appointmentDateTime) > new Date() && a.status !== 'CANCELLED').length}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>À venir</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: '600', color: '#64748b' }}>
              {appointments.filter(a => a.status === 'COMPLETED').length}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Terminés</div>
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '24px',
        border: '1px solid #e2e8f0',
        display: 'flex',
        gap: '16px',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['all', 'today', 'upcoming', 'past', 'cancelled'].map(filterType => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              style={{
                padding: '8px 16px',
                borderRadius: '40px',
                border: 'none',
                background: filter === filterType ? '#2563eb' : '#f1f5f9',
                color: filter === filterType ? 'white' : '#334155',
                fontSize: '13px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {filterType === 'all' && 'Tous'}
              {filterType === 'today' && "Aujourd'hui"}
              {filterType === 'upcoming' && 'À venir'}
              {filterType === 'past' && 'Passés'}
              {filterType === 'cancelled' && 'Annulés'}
            </button>
          ))}
        </div>
        
        <div style={{ flex: 1, maxWidth: '300px', marginLeft: 'auto' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: '#f8fafc',
            borderRadius: '40px',
            padding: '0 12px',
            border: '1px solid #e2e8f0'
          }}>
            <i className="bi bi-search" style={{ color: '#94a3b8' }}></i>
            <input
              type="text"
              placeholder="Rechercher un patient..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                flex: 1,
                padding: '10px 12px',
                border: 'none',
                background: 'transparent',
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
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '0 4px'
                }}
              >
                <i className="bi bi-x"></i>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Liste des rendez-vous */}
      {filteredAppointments.length === 0 ? (
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '60px 20px',
          textAlign: 'center',
          border: '1px solid #e2e8f0'
        }}>
          <i className="bi bi-calendar-x" style={{ fontSize: '48px', color: '#cbd5e1' }}></i>
          <h3 style={{ margin: '16px 0 8px 0', color: '#334155', fontWeight: '500' }}>Aucun rendez-vous</h3>
          <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
            {filter === 'all' ? "Vous n'avez pas encore de rendez-vous." : `Aucun rendez-vous ${filter === 'today' ? "aujourd'hui" : filter === 'upcoming' ? 'à venir' : filter === 'past' ? 'passés' : 'annulés'}.`}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredAppointments
            .sort((a, b) => new Date(a.appointmentDateTime) - new Date(b.appointmentDateTime))
            .map(apt => {
              const patient = patients[apt.patientId];
              const aptDate = new Date(apt.appointmentDateTime);
              
              return (
                <div
                  key={apt.id}
                  style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '20px',
                    border: '1px solid #e2e8f0',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
                    e.currentTarget.style.borderColor = '#2563eb';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.borderColor = '#e2e8f0';
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: '16px'
                  }}>
                    {/* Informations patient */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 2 }}>
                      <div style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '16px',
                        background: '#f1f5f9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#475569'
                      }}>
                        <i className="bi bi-person-circle" style={{ fontSize: '32px' }}></i>
                      </div>
                      
                      <div>
                        <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600', color: '#0f172a' }}>
                          {getPatientName(apt.patientId)}
                        </h3>
                        {patient && patient.phone && (
                          <div style={{ fontSize: '13px', color: '#64748b' }}>
                            <i className="bi bi-telephone me-1"></i>
                            {patient.phone}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Date et statut */}
                    <div style={{ textAlign: 'right', flex: 1 }}>
                      <div style={{ fontWeight: '500', color: '#0f172a', marginBottom: '4px' }}>
                        {formatDate(apt.appointmentDateTime)}
                      </div>
                      <div style={{ fontSize: '14px', color: '#475569', marginBottom: '8px' }}>
                        {aptDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      {getStatusBadge(apt.status, apt.appointmentDateTime)}
                    </div>
                  </div>

                  {/* Motif et actions - CORRIGÉ */}
                  <div style={{
                    marginTop: '16px',
                    paddingTop: '16px',
                    borderTop: '1px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}>
                    <div>
                      <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>
                        <i className="bi bi-chat-dots me-1"></i>
                        Motif
                      </div>
                      <div style={{ fontSize: '14px', color: '#0f172a' }}>
                        {apt.reason || 'Consultation générale'}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      {/* Lien vers le dossier patient - CORRIGÉ */}
                      <Link
                        to={`/doctor/patients/${apt.patientId}`}
                        style={{
                          padding: '8px 16px',
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '40px',
                          color: '#2563eb',
                          textDecoration: 'none',
                          fontSize: '13px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#eff6ff';
                          e.currentTarget.style.borderColor = '#2563eb';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#f8fafc';
                          e.currentTarget.style.borderColor = '#e2e8f0';
                        }}
                      >
                        <i className="bi bi-folder-medical"></i>
                        Dossier médical
                      </Link>

                      {/* Lien vers les prescriptions - CORRIGÉ (plus de /new) */}
                      <Link
                        to={`/doctor/prescriptions?patientId=${apt.patientId}`}
                        style={{
                          padding: '8px 16px',
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '40px',
                          color: '#16a34a',
                          textDecoration: 'none',
                          fontSize: '13px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#f0fdf4';
                          e.currentTarget.style.borderColor = '#16a34a';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#f8fafc';
                          e.currentTarget.style.borderColor = '#e2e8f0';
                        }}
                      >
                        <i className="bi bi-capsule"></i>
                        Prescriptions
                      </Link>

                      {/* NOUVEAU : Lien vers les analyses */}
                      <Link
                        to={`/doctor/lab-results?patientId=${apt.patientId}`}
                        style={{
                          padding: '8px 16px',
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '40px',
                          color: '#9333ea',
                          textDecoration: 'none',
                          fontSize: '13px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#faf5ff';
                          e.currentTarget.style.borderColor = '#9333ea';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#f8fafc';
                          e.currentTarget.style.borderColor = '#e2e8f0';
                        }}
                      >
                        <i className="bi bi-flask"></i>
                        Analyses
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}

export default DoctorAppointments;