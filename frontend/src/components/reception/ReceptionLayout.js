import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function ReceptionLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { path: '/reception/dashboard', label: 'Tableau de bord', icon: '📊' },
    { path: '/reception/patients', label: 'Patients', icon: '👥' },
    { path: '/reception/appointments', label: 'Rendez-vous', icon: '📅' },
    { path: '/reception/ehr', label: 'Dossiers médicaux', icon: '📋' }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <div style={{
        width: '250px',
        background: '#1e293b',
        color: 'white',
        padding: '20px'
      }}>
        <h2 style={{ margin: '0 0 30px 0', fontSize: '20px' }}>
          🏥 MyHeart
        </h2>
        
        <div style={{ marginBottom: '30px' }}>
          <div style={{
            background: '#334155',
            padding: '15px',
            borderRadius: '8px'
          }}>
            <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#94a3b8' }}>
              {user?.firstName} {user?.lastName}
            </p>
            <span style={{
              background: '#2563eb',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px'
            }}>
              Réception
            </span>
          </div>
        </div>

        <nav>
          {menuItems.map(item => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                display: 'block',
                width: '100%',
                padding: '12px 15px',
                marginBottom: '8px',
                border: 'none',
                borderRadius: '8px',
                background: location.pathname === item.path ? '#2563eb' : '#334155',
                color: 'white',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '14px'
              }}
            >
              <span style={{ marginRight: '10px' }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          style={{
            position: 'absolute',
            bottom: '20px',
            width: '210px',
            padding: '12px',
            border: 'none',
            borderRadius: '8px',
            background: '#dc2626',
            color: 'white',
            cursor: 'pointer'
          }}
        >
          🚪 Déconnexion
        </button>
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        background: '#f1f5f9',
        padding: '30px',
        overflowY: 'auto'
      }}>
        <Outlet />
      </div>
    </div>
  );
}

export default ReceptionLayout;
