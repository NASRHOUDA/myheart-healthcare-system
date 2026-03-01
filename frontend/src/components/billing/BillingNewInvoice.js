import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; }

  .bni-root {
    max-width: 800px;
    margin: 0 auto;
    padding: 40px 28px;
    font-family: 'Outfit', sans-serif;
    color: #0f172a;
    background: #f8fafc;
    min-height: 100vh;
  }

  .bni-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32px;
  }
  .bni-title {
    font-size: 2rem;
    font-weight: 300;
    color: #0f172a;
    margin: 0;
  }

  .bni-card {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 20px;
    padding: 32px;
  }

  .bni-form-group {
    margin-bottom: 24px;
  }
  .bni-label {
    display: block;
    font-size: 0.85rem;
    font-weight: 500;
    color: #475569;
    margin-bottom: 6px;
  }
  .bni-select, .bni-input, .bni-textarea {
    width: 100%;
    padding: 12px 14px;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    font-size: 0.95rem;
    font-family: 'Outfit', sans-serif;
    outline: none;
  }
  .bni-select:focus, .bni-input:focus, .bni-textarea:focus {
    border-color: #059669;
  }

  .bni-items {
    background: #f8fafc;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 24px;
  }
  .bni-item {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
    align-items: center;
  }
  .bni-item-type {
    width: 200px;
  }
  .bni-item-desc {
    flex: 2;
  }
  .bni-item-qty {
    width: 100px;
  }
  .bni-item-price {
    width: 120px;
  }
  .bni-item-total {
    width: 120px;
    font-weight: 600;
  }
  .bni-remove-item {
    background: none;
    border: none;
    color: #dc2626;
    cursor: pointer;
    font-size: 1.2rem;
  }

  .bni-add-item {
    display: flex;
    gap: 12px;
    margin-top: 16px;
  }
  .bni-add-btn {
    padding: 10px 20px;
    background: #f1f5f9;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    color: #475569;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .bni-add-btn:hover {
    background: #e2e8f0;
  }

  .bni-summary {
    background: #f8fafc;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 24px;
    text-align: right;
  }
  .bni-total {
    font-size: 1.5rem;
    font-weight: 600;
    color: #059669;
  }

  .bni-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
  }
  .bni-btn {
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }
  .bni-btn-primary {
    background: #059669;
    color: white;
  }
  .bni-btn-primary:hover { background: #047857; }
  .bni-btn-secondary {
    background: #f1f5f9;
    color: #475569;
  }
  .bni-btn-secondary:hover { background: #e2e8f0; }
`;

function BillingNewInvoice() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [labResults, setLabResults] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [formData, setFormData] = useState({
    patientId: '',
    date: new Date().toISOString().split('T')[0],
    items: [],
    notes: ''
  });
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    calculateTotal();
  }, [formData.items]);

  const fetchData = async () => {
    try {
      // Récupérer tous les patients
      const patientsRes = await axios.get('http://localhost:8081/api/patients');
      setPatients(patientsRes.data);

      // Récupérer les rendez-vous
      const appRes = await axios.get('http://localhost:8082/api/appointments');
      setAppointments(appRes.data);

      // Récupérer les analyses
      const labRes = await axios.get('http://localhost:8085/api/lab');
      setLabResults(labRes.data);

      // Récupérer les prescriptions
      const prescRes = await axios.get('http://localhost:8087/api/prescriptions');
      setPrescriptions(prescRes.data);
    } catch (err) {
      console.error('Erreur chargement données:', err);
    }
  };

  const calculateTotal = () => {
    const sum = formData.items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
    setTotal(sum);
  };

  const handlePatientChange = (e) => {
    const patientId = parseInt(e.target.value);
    setFormData({ ...formData, patientId, items: [] });
  };

  const addAppointmentItem = (appointment) => {
    const newItem = {
      id: `apt-${appointment.id}`,
      type: 'appointment',
      description: `Rendez-vous: ${appointment.reason || 'Consultation'}`,
      quantity: 1,
      price: 50.00,
      details: appointment
    };
    setFormData({
      ...formData,
      items: [...formData.items, newItem]
    });
  };

  const addLabItem = (lab) => {
    const newItem = {
      id: `lab-${lab._id}`,
      type: 'lab',
      description: `Analyse: ${lab.testName}`,
      quantity: 1,
      price: 75.00,
      details: lab
    };
    setFormData({
      ...formData,
      items: [...formData.items, newItem]
    });
  };

  const addPrescriptionItem = (prescription) => {
    const newItem = {
      id: `presc-${prescription.id}`,
      type: 'prescription',
      description: `Médicament: ${prescription.medicationName}`,
      quantity: 1,
      price: 25.00,
      details: prescription
    };
    setFormData({
      ...formData,
      items: [...formData.items, newItem]
    });
  };

  const removeItem = (index) => {
    const newItems = [...formData.items];
    newItems.splice(index, 1);
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.patientId || formData.items.length === 0) {
      alert('Veuillez sélectionner un patient et au moins un service');
      return;
    }

    setLoading(true);
    try {
      // Calculer le montant total
      const totalAmount = formData.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
      
      // Créer une description des services
      const servicesDescription = formData.items.map(item => item.description).join(', ');
      
      // Formater les données pour le backend - basé sur la structure existante
      const billData = {
        patientId: parseInt(formData.patientId),
        amount: totalAmount,
        description: servicesDescription.substring(0, 255),
        status: 'PENDING'
      };

      console.log('Données envoyées:', billData);

      const response = await axios.post('http://localhost:8083/api/bills', billData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Réponse:', response.data);
      alert('✅ Facture créée avec succès');
      navigate('/billing');
    } catch (err) {
      console.error('❌ Erreur complète:', err);
      
      if (err.response) {
        console.error('Status:', err.response.status);
        console.error('Data:', err.response.data);
        alert(`Erreur ${err.response.status}: ${JSON.stringify(err.response.data)}`);
      } else if (err.request) {
        alert('Le serveur ne répond pas. Vérifiez que le service billing est lancé sur le port 8083');
      } else {
        alert(`Erreur: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const getPatientAppointments = () => {
    return appointments.filter(a => a.patientId === formData.patientId && a.status === 'COMPLETED');
  };

  const getPatientLabResults = () => {
    return labResults.filter(l => l.patientId === formData.patientId && l.status === 'COMPLETED');
  };

  const getPatientPrescriptions = () => {
    return prescriptions.filter(p => p.patientId === formData.patientId && p.status === 'DISPENSED');
  };

  return (
    <>
      <style>{styles}</style>
      <div className="bni-root">
        <div className="bni-header">
          <h1 className="bni-title">Nouvelle facture</h1>
          <Link to="/billing" className="bni-btn bni-btn-secondary">
            <i className="bi bi-arrow-left" /> Retour
          </Link>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="bni-card">
            {/* Sélection du patient */}
            <div className="bni-form-group">
              <label className="bni-label">Patient *</label>
              <select
                className="bni-select"
                value={formData.patientId}
                onChange={handlePatientChange}
                required
              >
                <option value="">Sélectionner un patient</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.firstName} {p.lastName} - {p.email}
                  </option>
                ))}
              </select>
            </div>

            {formData.patientId > 0 && (
              <>
                {/* Services du patient */}
                <div className="bni-items">
                  <h3 style={{ marginTop: 0, marginBottom: 16 }}>Services à facturer</h3>

                  {/* Rendez-vous */}
                  <div style={{ marginBottom: 20 }}>
                    <h4 style={{ fontSize: '0.9rem', color: '#475569', marginBottom: 8 }}>
                      Rendez-vous (50€)
                    </h4>
                    {getPatientAppointments().length === 0 ? (
                      <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Aucun rendez-vous terminé</p>
                    ) : (
                      getPatientAppointments().map(apt => (
                        <div key={apt.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <span>{new Date(apt.appointmentDateTime).toLocaleDateString()} - {apt.reason || 'Consultation'}</span>
                          <button
                            type="button"
                            className="bni-add-btn"
                            onClick={() => addAppointmentItem(apt)}
                          >
                            <i className="bi bi-plus" /> Ajouter
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Analyses */}
                  <div style={{ marginBottom: 20 }}>
                    <h4 style={{ fontSize: '0.9rem', color: '#475569', marginBottom: 8 }}>
                      Analyses (75€)
                    </h4>
                    {getPatientLabResults().length === 0 ? (
                      <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Aucune analyse terminée</p>
                    ) : (
                      getPatientLabResults().map(lab => (
                        <div key={lab._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <span>{lab.testName} - {new Date(lab.date).toLocaleDateString()}</span>
                          <button
                            type="button"
                            className="bni-add-btn"
                            onClick={() => addLabItem(lab)}
                          >
                            <i className="bi bi-plus" /> Ajouter
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Prescriptions */}
                  <div style={{ marginBottom: 20 }}>
                    <h4 style={{ fontSize: '0.9rem', color: '#475569', marginBottom: 8 }}>
                      Médicaments (25€)
                    </h4>
                    {getPatientPrescriptions().length === 0 ? (
                      <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Aucune prescription délivrée</p>
                    ) : (
                      getPatientPrescriptions().map(presc => (
                        <div key={presc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <span>{presc.medicationName} - {presc.dosage}</span>
                          <button
                            type="button"
                            className="bni-add-btn"
                            onClick={() => addPrescriptionItem(presc)}
                          >
                            <i className="bi bi-plus" /> Ajouter
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Items sélectionnés */}
                {formData.items.length > 0 && (
                  <div className="bni-items">
                    <h3 style={{ marginTop: 0, marginBottom: 16 }}>Services sélectionnés</h3>
                    {formData.items.map((item, index) => (
                      <div key={index} className="bni-item">
                        <div className="bni-item-desc">{item.description}</div>
                        <div className="bni-item-qty">x{item.quantity}</div>
                        <div className="bni-item-price">{item.price} €</div>
                        <div className="bni-item-total">{item.quantity * item.price} €</div>
                        <button
                          type="button"
                          className="bni-remove-item"
                          onClick={() => removeItem(index)}
                        >
                          <i className="bi bi-trash" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Notes */}
                <div className="bni-form-group">
                  <label className="bni-label">Notes (optionnel)</label>
                  <textarea
                    className="bni-textarea"
                    rows="3"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Informations complémentaires..."
                  />
                </div>

                {/* Total */}
                <div className="bni-summary">
                  <div style={{ marginBottom: 8 }}>Total à payer</div>
                  <div className="bni-total">{total.toFixed(2)} €</div>
                </div>

                {/* Actions */}
                <div className="bni-actions">
                  <button
                    type="button"
                    className="bni-btn bni-btn-secondary"
                    onClick={() => navigate('/billing')}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="bni-btn bni-btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Création...' : 'Créer la facture'}
                  </button>
                </div>
              </>
            )}
          </div>
        </form>
      </div>
    </>
  );
}

export default BillingNewInvoice;