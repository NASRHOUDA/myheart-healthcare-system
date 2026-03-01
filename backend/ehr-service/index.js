const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const PORT = 8084;

console.log('🚀 Starting EHR service...');
console.log('📡 Attempting to connect to MongoDB...');

app.use(cors());
app.use(express.json());

// Connexion MongoDB
mongoose.connect('mongodb://ehr-db:27017/ehrdb')
    .then(() => {
        console.log('✅ Successfully connected to MongoDB');
    })
    .catch(err => {
        console.error('❌ MongoDB connection error:', err.message);
    });

// Schema amélioré avec plus de champs
const ehrSchema = new mongoose.Schema({
    patientId: { type: Number, required: true },
    diagnosis: { type: String, required: true },
    symptoms: [String],
    vitalSigns: {
        bloodPressure: String,
        heartRate: String,
        temperature: String,
        oxygenSaturation: String
    },
    notes: String,
    date: { type: Date, default: Date.now }
});

const EHR = mongoose.model('EHR', ehrSchema);

// ========== ROUTES CRUD COMPLÈTES ==========

// GET - Récupérer tous les dossiers
app.get('/api/ehr', async (req, res) => {
    try {
        const records = await EHR.find().sort({ date: -1 });
        res.json(records);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET - Récupérer un dossier par son ID
app.get('/api/ehr/:id', async (req, res) => {
    try {
        const record = await EHR.findById(req.params.id);
        if (!record) {
            return res.status(404).json({ error: 'Dossier non trouvé' });
        }
        res.json(record);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET - Récupérer les dossiers d'un patient
app.get('/api/ehr/patient/:patientId', async (req, res) => {
    try {
        const records = await EHR.find({ 
            patientId: parseInt(req.params.patientId) 
        }).sort({ date: -1 });
        res.json(records);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST - Créer un nouveau dossier
app.post('/api/ehr', async (req, res) => {
    try {
        const ehr = new EHR(req.body);
        await ehr.save();
        res.status(201).json(ehr);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// PUT - Mettre à jour un dossier complet
app.put('/api/ehr/:id', async (req, res) => {
    try {
        const ehr = await EHR.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!ehr) {
            return res.status(404).json({ error: 'Dossier non trouvé' });
        }
        res.json(ehr);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// PATCH - Mise à jour partielle
app.patch('/api/ehr/:id', async (req, res) => {
    try {
        const ehr = await EHR.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );
        if (!ehr) {
            return res.status(404).json({ error: 'Dossier non trouvé' });
        }
        res.json(ehr);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE - Supprimer un dossier
app.delete('/api/ehr/:id', async (req, res) => {
    try {
        const ehr = await EHR.findByIdAndDelete(req.params.id);
        if (!ehr) {
            return res.status(404).json({ error: 'Dossier non trouvé' });
        }
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE - Supprimer tous les dossiers d'un patient
app.delete('/api/ehr/patient/:patientId', async (req, res) => {
    try {
        await EHR.deleteMany({ patientId: parseInt(req.params.patientId) });
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        service: 'ehr-service',
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        timestamp: new Date()
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route non trouvée' });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ EHR service running on port ${PORT}`);
    console.log(`   Health: http://localhost:${PORT}/health`);
    console.log(`   API: http://localhost:${PORT}/api/ehr`);
    console.log(`   Routes disponibles:`);
    console.log(`   - GET    /api/ehr`);
    console.log(`   - GET    /api/ehr/:id`);
    console.log(`   - GET    /api/ehr/patient/:patientId`);
    console.log(`   - POST   /api/ehr`);
    console.log(`   - PUT    /api/ehr/:id`);
    console.log(`   - PATCH  /api/ehr/:id`);
    console.log(`   - DELETE /api/ehr/:id`);
});
