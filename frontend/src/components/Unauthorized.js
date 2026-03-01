import React from 'react';
import { Link } from 'react-router-dom';

const styles = `
  .unauthorized-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f8fafc;
    font-family: 'Outfit', sans-serif;
  }
  .unauthorized-card {
    background: white;
    border-radius: 24px;
    padding: 48px;
    text-align: center;
    max-width: 400px;
    box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
  }
  .unauthorized-icon {
    font-size: 64px;
    margin-bottom: 24px;
  }
  .unauthorized-title {
    font-size: 24px;
    font-weight: 600;
    color: #0f172a;
    margin-bottom: 12px;
  }
  .unauthorized-text {
    color: #64748b;
    margin-bottom: 24px;
    line-height: 1.5;
  }
  .unauthorized-btn {
    display: inline-block;
    padding: 12px 24px;
    background: #2563eb;
    color: white;
    text-decoration: none;
    border-radius: 8px;
    font-weight: 500;
    transition: background 0.2s;
  }
  .unauthorized-btn:hover {
    background: #1d4ed8;
  }
`;

function Unauthorized() {
  return (
    <>
      <style>{styles}</style>
      <div className="unauthorized-container">
        <div className="unauthorized-card">
          <div className="unauthorized-icon">🚫</div>
          <h1 className="unauthorized-title">Accès non autorisé</h1>
          <p className="unauthorized-text">
            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
          </p>
          <Link to="/login" className="unauthorized-btn">
            Retour à la connexion
          </Link>
        </div>
      </div>
    </>
  );
}

export default Unauthorized;
