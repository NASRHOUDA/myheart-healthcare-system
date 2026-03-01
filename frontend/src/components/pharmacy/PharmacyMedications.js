import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function PharmacyMedications() {
  const [medications, setMedications] = useState([]);
  const [filteredMedications, setFilteredMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    generic_name: '',
    description: '',
    strength: '',
    dosage_form: '',
    manufacturer: '',
    category: '',
    code: '',
    stock_quantity: '',
    expiry_date: '',
    price: '',
    requires_prescription: true,
    unit: ''
  });
  const [showSuccessMessage, setShowSuccessMessage] = useState('');
  const [stockFilter, setStockFilter] = useState('ALL');

  // Fonction pour convertir snake_case en camelCase (pour l'API)
  const toCamelCase = (data) => {
    // Ne pas convertir les valeurs null/undefined en 0 ou false
    return {
      name: data.name,
      genericName: data.generic_name || null,
      description: data.description || null,
      strength: data.strength,
      dosageForm: data.dosage_form || null,
      manufacturer: data.manufacturer || null,
      category: data.category || null,
      code: data.code || null,
      stockQuantity: data.stock_quantity ? parseInt(data.stock_quantity) : null,
      expiryDate: data.expiry_date || null,
      price: data.price ? parseFloat(data.price) : null,
      requiresPrescription: data.requires_prescription, // Garder tel quel (boolean)
      unit: data.unit || null
    };
  };

  // Fonction pour convertir camelCase en snake_case (pour le frontend)
  const toSnakeCase = (data) => {
    return {
      ...data,
      generic_name: data.genericName,
      dosage_form: data.dosageForm,
      stock_quantity: data.stockQuantity,
      expiry_date: data.expiryDate,
      requires_prescription: data.requiresPrescription
    };
  };

  useEffect(() => {
    fetchMedications();
  }, []);

  useEffect(() => {
    filterMedications();
  }, [searchTerm, stockFilter, medications]);

  const fetchMedications = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8087/api/medications');
      
      // Convertir les données camelCase de l'API en snake_case pour le frontend
      const convertedData = response.data.map(med => toSnakeCase(med));
      
      setMedications(convertedData);
      setLoading(false);
    } catch (err) {
      console.error('Erreur chargement médicaments:', err);
      setLoading(false);
    }
  };

  const generateCode = (name, strength) => {
    if (!name) return '';
    const prefix = name.substring(0, 3).toUpperCase();
    const strengthNum = strength ? strength.replace(/[^0-9]/g, '') : '000';
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${strengthNum}-${random}`;
  };

  const filterMedications = () => {
    let filtered = [...medications];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(m => 
        m.name?.toLowerCase().includes(term) ||
        m.description?.toLowerCase().includes(term) ||
        m.manufacturer?.toLowerCase().includes(term) ||
        m.dosage_form?.toLowerCase().includes(term) ||
        m.category?.toLowerCase().includes(term) ||
        m.code?.toLowerCase().includes(term)
      );
    }

    if (stockFilter === 'LOW') {
      filtered = filtered.filter(m => m.stock_quantity < 10);
    } else if (stockFilter === 'EXPIRING') {
      const today = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(today.getDate() + 30);
      
      filtered = filtered.filter(m => {
        if (!m.expiry_date) return false;
        const expiry = new Date(m.expiry_date);
        return expiry > today && expiry <= thirtyDaysFromNow;
      });
    }

    setFilteredMedications(filtered);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      };
      
      if (name === 'name' || name === 'strength') {
        newData.code = generateCode(newData.name, newData.strength);
      }
      
      return newData;
    });
  };

  const handleAddMedication = () => {
    setFormData({
      name: '',
      generic_name: '',
      description: '',
      strength: '',
      dosage_form: '',
      manufacturer: '',
      category: '',
      code: '',
      stock_quantity: '',
      expiry_date: '',
      price: '',
      requires_prescription: true,
      unit: ''
    });
    setShowAddModal(true);
  };

  const handleEditMedication = (medication) => {
    setSelectedMedication(medication);
    setFormData({
      name: medication.name || '',
      generic_name: medication.generic_name || '',
      description: medication.description || '',
      strength: medication.strength || '',
      dosage_form: medication.dosage_form || '',
      manufacturer: medication.manufacturer || '',
      category: medication.category || '',
      code: medication.code || '',
      stock_quantity: medication.stock_quantity || '',
      expiry_date: medication.expiry_date ? medication.expiry_date.split('T')[0] : '',
      price: medication.price || '',
      requires_prescription: medication.requires_prescription === true, // Forcer boolean
      unit: medication.unit || ''
    });
    setShowEditModal(true);
  };

  const handleDeleteClick = (medication) => {
    setSelectedMedication(medication);
    setShowDeleteModal(true);
  };

  const confirmAdd = async () => {
    try {
      if (!formData.name || !formData.strength || !formData.stock_quantity) {
        alert('Veuillez remplir tous les champs obligatoires');
        return;
      }

      // Convertir en camelCase pour l'API
      const medicationData = toCamelCase(formData);

      console.log('Données envoyées (camelCase):', medicationData);

      const response = await axios.post('http://localhost:8087/api/medications', medicationData);
      
      // Convertir la réponse en snake_case pour le frontend
      const newMedication = toSnakeCase(response.data);
      
      setMedications([...medications, newMedication]);
      setShowAddModal(false);
      setShowSuccessMessage('Médicament ajouté avec succès');
      setTimeout(() => setShowSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Erreur ajout médicament:', err);
      alert(`Erreur: ${err.response?.data?.message || err.message}`);
    }
  };

  const confirmEdit = async () => {
    try {
      // Inclure l'ID dans les données
      const dataWithId = {
        ...formData,
        id: selectedMedication.id
      };

      // Convertir en camelCase pour l'API
      const medicationData = toCamelCase(dataWithId);

      console.log('Données modification (camelCase):', medicationData);
      console.log('URL:', `http://localhost:8087/api/medications/${selectedMedication.id}`);

      const response = await axios.put(
        `http://localhost:8087/api/medications/${selectedMedication.id}`, 
        medicationData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Réponse API:', response.data);
      
      // Convertir la réponse en snake_case pour le frontend
      const updatedMedication = toSnakeCase(response.data);
      
      setMedications(medications.map(m => 
        m.id === selectedMedication.id ? updatedMedication : m
      ));
      
      setShowEditModal(false);
      setSelectedMedication(null);
      setShowSuccessMessage('Médicament modifié avec succès');
      setTimeout(() => setShowSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Erreur modification médicament:', err);
      if (err.response) {
        console.error('Status:', err.response.status);
        console.error('Data:', err.response.data);
        alert(`Erreur ${err.response.status}: ${JSON.stringify(err.response.data)}`);
      } else if (err.request) {
        console.error('Pas de réponse du serveur');
        alert('Le serveur ne répond pas. Vérifiez qu\'il est bien lancé.');
      } else {
        alert(`Erreur: ${err.message}`);
      }
    }
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:8087/api/medications/${selectedMedication.id}`);
      setMedications(medications.filter(m => m.id !== selectedMedication.id));
      setShowDeleteModal(false);
      setSelectedMedication(null);
      setShowSuccessMessage('Médicament supprimé avec succès');
      setTimeout(() => setShowSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Erreur suppression médicament:', err);
      alert('Erreur lors de la suppression du médicament');
    }
  };

  const getStockStatus = (quantity, expiryDate) => {
    const isLowStock = quantity < 10;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    const isExpiringSoon = daysUntilExpiry > 0 && daysUntilExpiry <= 30;

    if (isLowStock && isExpiringSoon) {
      return { color: '#dc2626', text: 'Stock faible & Expire bientôt', bg: '#fee2e2' };
    } else if (isLowStock) {
      return { color: '#b45309', text: 'Stock faible', bg: '#ffedd5' };
    } else if (isExpiringSoon) {
      return { color: '#b45309', text: 'Expire bientôt', bg: '#ffedd5' };
    }
    return { color: '#059669', text: 'Stock normal', bg: '#d1fae5' };
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

  const formatPrice = (price) => {
    if (!price) return 'N/A';
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(price);
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
          <p style={{ color: '#64748b' }}>Chargement des médicaments...</p>
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
        <h1 style={{ fontSize: '28px', fontWeight: '500', color: '#0f172a', margin: 0 }}>
          Gestion des Médicaments
        </h1>
        <div style={{ display: 'flex', gap: '12px' }}>
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
            Retour
          </Link>
          <button
            onClick={handleAddMedication}
            style={{
              padding: '10px 20px',
              background: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <i className="bi bi-plus-lg"></i>
            Nouveau médicament
          </button>
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
              placeholder="Rechercher par nom, code, fabricant..."
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
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            style={{
              padding: '12px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '14px',
              background: 'white',
              minWidth: '180px',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="ALL">Tous les médicaments</option>
            <option value="LOW">Stock faible (&lt;10)</option>
            <option value="EXPIRING">Expire bientôt (30 jours)</option>
          </select>
        </div>

        <div style={{
          marginTop: '12px',
          fontSize: '13px',
          color: '#64748b',
          display: 'flex',
          gap: '20px'
        }}>
          <span><strong>{filteredMedications.length}</strong> médicament(s) trouvé(s)</span>
          <span><strong>{medications.filter(m => m.stock_quantity < 10).length}</strong> en stock faible</span>
        </div>
      </div>

      {/* Liste des médicaments */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid #e2e8f0'
      }}>
        {filteredMedications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <i className="bi bi-box" style={{ fontSize: '48px', color: '#cbd5e1', marginBottom: '16px' }}></i>
            <p style={{ color: '#64748b', fontSize: '16px', marginBottom: '8px' }}>
              Aucun médicament trouvé
            </p>
            <p style={{ color: '#94a3b8', fontSize: '14px' }}>
              {searchTerm ? 'Essayez de modifier votre recherche' : 'Cliquez sur "Nouveau médicament" pour ajouter'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
            {filteredMedications.map(medication => {
              const stockStatus = getStockStatus(medication.stock_quantity, medication.expiry_date);
              
              return (
                <div
                  key={medication.id}
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
                    marginBottom: '12px'
                  }}>
                    <div>
                      <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '600', color: '#0f172a' }}>
                        {medication.name}
                      </h3>
                      <div style={{ fontSize: '13px', color: '#64748b' }}>
                        {medication.strength} • {medication.dosage_form}
                      </div>
                      <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                        Code: {medication.code}
                      </div>
                    </div>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      background: stockStatus.bg,
                      color: stockStatus.color,
                      fontWeight: '500'
                    }}>
                      {stockStatus.text}
                    </span>
                  </div>

                  <p style={{
                    fontSize: '13px',
                    color: '#475569',
                    margin: '0 0 12px 0',
                    lineHeight: '1.5'
                  }}>
                    {medication.description || 'Aucune description'}
                  </p>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '12px',
                    marginBottom: '16px',
                    padding: '12px',
                    background: 'white',
                    borderRadius: '8px'
                  }}>
                    <div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>Fabricant</div>
                      <div style={{ fontSize: '13px', fontWeight: '500', color: '#0f172a' }}>
                        {medication.manufacturer || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>Stock</div>
                      <div style={{ fontSize: '13px', fontWeight: '500', color: '#0f172a' }}>
                        {medication.stock_quantity} unités
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>Expiration</div>
                      <div style={{ fontSize: '13px', fontWeight: '500', color: '#0f172a' }}>
                        {formatDate(medication.expiry_date)}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>Prix</div>
                      <div style={{ fontSize: '13px', fontWeight: '500', color: '#0f172a' }}>
                        {formatPrice(medication.price)}
                      </div>
                    </div>
                    {medication.category && (
                      <div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>Catégorie</div>
                        <div style={{ fontSize: '13px', fontWeight: '500', color: '#0f172a' }}>
                          {medication.category}
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    justifyContent: 'flex-end',
                    borderTop: '1px solid #e2e8f0',
                    paddingTop: '16px'
                  }}>
                    <button
                      onClick={() => handleEditMedication(medication)}
                      style={{
                        padding: '6px 12px',
                        background: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        fontSize: '12px',
                        color: '#2563eb',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <i className="bi bi-pencil"></i>
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDeleteClick(medication)}
                      style={{
                        padding: '6px 12px',
                        background: 'white',
                        border: '1px solid #fee2e2',
                        borderRadius: '6px',
                        fontSize: '12px',
                        color: '#dc2626',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <i className="bi bi-trash"></i>
                      Supprimer
                    </button>
                  </div>

                  {medication.requires_prescription && (
                    <div style={{
                      marginTop: '8px',
                      padding: '4px 8px',
                      background: '#f1f5f9',
                      borderRadius: '4px',
                      fontSize: '11px',
                      color: '#475569',
                      display: 'inline-block'
                    }}>
                      <i className="bi bi-file-text me-1"></i>
                      Prescription requise
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal d'ajout */}
      {showAddModal && (
        <MedicationModal
          title="Ajouter un médicament"
          formData={formData}
          onInputChange={handleInputChange}
          onSave={confirmAdd}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {/* Modal d'édition */}
      {showEditModal && (
        <MedicationModal
          title="Modifier le médicament"
          formData={formData}
          onInputChange={handleInputChange}
          onSave={confirmEdit}
          onClose={() => {
            setShowEditModal(false);
            setSelectedMedication(null);
          }}
        />
      )}

      {/* Modal de suppression */}
      {showDeleteModal && selectedMedication && (
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
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '400px',
            width: '90%'
          }}>
            <h3 style={{ fontSize: '20px', margin: '0 0 12px 0', color: '#0f172a' }}>
              Confirmer la suppression
            </h3>
            <p style={{ color: '#475569', marginBottom: '20px' }}>
              Êtes-vous sûr de vouloir supprimer <strong>{selectedMedication.name}</strong> ?
              Cette action est irréversible.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedMedication(null);
                }}
                style={{
                  padding: '10px 20px',
                  background: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Annuler
              </button>
              <button
                onClick={confirmDelete}
                style={{
                  padding: '10px 20px',
                  background: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

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
      `}</style>
    </div>
  );
}

// Composant Modal (inchangé)
function MedicationModal({ title, formData, onInputChange, onSave, onClose }) {
  return (
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
      overflowY: 'auto',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '24px',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <h3 style={{ fontSize: '20px', margin: '0 0 20px 0', color: '#0f172a' }}>
          {title}
        </h3>

        <div style={{ display: 'grid', gap: '16px' }}>
          {/* Nom du médicament */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>
              Nom du médicament *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={onInputChange}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px'
              }}
              required
            />
          </div>

          {/* Nom générique */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>
              Nom générique
            </label>
            <input
              type="text"
              name="generic_name"
              value={formData.generic_name}
              onChange={onInputChange}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>

          {/* Description */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={onInputChange}
              rows="3"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Dosage et Forme */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>
                Dosage / Strength *
              </label>
              <input
                type="text"
                name="strength"
                value={formData.strength}
                onChange={onInputChange}
                placeholder="ex: 500mg"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>
                Forme *
              </label>
              <select
                name="dosage_form"
                value={formData.dosage_form}
                onChange={onInputChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  background: 'white'
                }}
                required
              >
                <option value="">Sélectionner</option>
                <option value="Comprimé">Comprimé</option>
                <option value="Gélule">Gélule</option>
                <option value="Sirop">Sirop</option>
                <option value="Injection">Injection</option>
                <option value="Crème">Crème</option>
                <option value="Aérosol">Aérosol</option>
                <option value="Suppositoire">Suppositoire</option>
              </select>
            </div>
          </div>

          {/* Fabricant */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>
              Fabricant
            </label>
            <input
              type="text"
              name="manufacturer"
              value={formData.manufacturer}
              onChange={onInputChange}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>

          {/* Catégorie */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>
              Catégorie
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={onInputChange}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px',
                background: 'white'
              }}
            >
              <option value="">Sélectionner</option>
              <option value="ANALGESIQUE">Analgésique</option>
              <option value="ANTIBIOTIQUE">Antibiotique</option>
              <option value="ANTI_INFLAMMATOIRE">Anti-inflammatoire</option>
              <option value="CARDIOVASCULAIRE">Cardiovasculaire</option>
              <option value="SYSTEME_NERVEUX">Système nerveux</option>
              <option value="DIGESTIF">Digestif</option>
            </select>
          </div>

          {/* Code */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>
              Code médicament
            </label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={onInputChange}
              readOnly
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px',
                background: '#f1f5f9',
                color: '#475569'
              }}
            />
            <small style={{ fontSize: '11px', color: '#94a3b8' }}>
              Généré automatiquement
            </small>
          </div>

          {/* Quantité et Unité */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>
                Quantité en stock *
              </label>
              <input
                type="number"
                name="stock_quantity"
                value={formData.stock_quantity}
                onChange={onInputChange}
                min="0"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>
                Unité
              </label>
              <select
                name="unit"
                value={formData.unit}
                onChange={onInputChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  background: 'white'
                }}
              >
                <option value="">Sélectionner</option>
                <option value="comprimé(s)">comprimé(s)</option>
                <option value="gélule(s)">gélule(s)</option>
                <option value="ml">ml</option>
                <option value="mg">mg</option>
                <option value="g">g</option>
              </select>
            </div>
          </div>

          {/* Date expiration et Prix */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>
                Date d'expiration
              </label>
              <input
                type="date"
                name="expiry_date"
                value={formData.expiry_date}
                onChange={onInputChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>
                Prix (€)
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={onInputChange}
                min="0"
                step="0.01"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>

          {/* Prescription requise */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              name="requires_prescription"
              checked={formData.requires_prescription}
              onChange={onInputChange}
              id="requires_prescription"
              style={{ marginRight: '8px' }}
            />
            <label htmlFor="requires_prescription" style={{ fontSize: '14px', color: '#475569' }}>
              Prescription requise
            </label>
          </div>
        </div>

        {/* Boutons */}
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end',
          marginTop: '24px',
          borderTop: '1px solid #e2e8f0',
          paddingTop: '20px'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              background: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            Annuler
          </button>
          <button
            onClick={onSave}
            style={{
              padding: '10px 20px',
              background: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}

export default PharmacyMedications;