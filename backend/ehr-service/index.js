const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const ConsulRegistry = require('./consul-register');
const ehrProducer = require('./kafka/producer');
const ehrConsumer = require('./kafka/consumer');

const app = express();
const PORT = process.env.SERVICE_PORT || 8084;
const SERVICE_NAME = process.env.SERVICE_NAME || 'ehr-service';

console.log('🚀 Starting EHR service...');
console.log('📡 Attempting to connect to MongoDB...');
console.log('📡 Attempting to connect to Kafka...');

// Initialisation Consul
const consulRegistry = new ConsulRegistry(SERVICE_NAME, PORT);

app.use(cors());
app.use(express.json());

// Middleware pour forcer l'UTF-8
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

// Connexion MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://ehr-db:27017/ehrdb';
mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('✅ Successfully connected to MongoDB');
    })
    .catch(err => {
        console.error('❌ MongoDB connection error:', err.message);
    });

// Connexion Kafka
async function setupKafka() {
    try {
        await ehrProducer.connect();
        await ehrConsumer.connect();
        await ehrConsumer.subscribe();
        console.log('✅ Kafka setup completed');
    } catch (error) {
        console.error('❌ Kafka connection error:', error.message);
    }
}
setupKafka();

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

// ========== ROUTES CRUD EXISTANTES ==========

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

// ========== NOUVELLES ROUTES KAFKA ==========

// POST - Envoyer une demande d'analyse au laboratoire
app.post('/api/ehr/:patientId/lab-request', async (req, res) => {
    try {
        const patientId = parseInt(req.params.patientId);
        
        // Vérifier que le patient existe
        const patient = await EHR.findOne({ patientId: patientId });
        if (!patient) {
            return res.status(404).json({ error: 'Patient non trouvé' });
        }

        const labRequest = {
            orderId: `LAB-${Date.now()}-${patientId}`,
            patientId: patientId,
            patientName: req.body.patientName || `Patient ${patientId}`,
            doctorId: req.body.doctorId || 'DR-001',
            tests: req.body.tests || [
                { testCode: 'CBC', testName: 'Complete Blood Count' }
            ],
            priority: req.body.priority || 'NORMAL',
            notes: req.body.notes || 'Routine lab request'
        };

        // Envoyer à Kafka
        await ehrProducer.sendLabOrder(labRequest);

        res.status(202).json({
            success: true,
            message: 'Lab request sent to laboratory service',
            orderId: labRequest.orderId,
            data: labRequest
        });

    } catch (err) {
        console.error('Error sending lab request:', err);
        res.status(500).json({ error: err.message });
    }
});

// GET - Statut Kafka
app.get('/api/kafka/status', (req, res) => {
    res.json({
        service: SERVICE_NAME,
        kafka: {
            producer: ehrProducer.producer ? 'connected' : 'disconnected',
            consumer: ehrConsumer.consumer ? 'connected' : 'disconnected',
            brokers: process.env.KAFKA_BROKERS || 'kafka:29092'
        },
        timestamp: new Date().toISOString()
    });
});

// POST - Route de test Kafka (pour déboguer)
app.post('/api/test/kafka', async (req, res) => {
    try {
        const testMessage = {
            testId: `TEST-${Date.now()}`,
            message: req.body.message || 'Test message from EHR',
            timestamp: new Date().toISOString()
        };

        await ehrProducer.sendTestOrder(testMessage);

        res.json({
            success: true,
            message: 'Test message sent to Kafka',
            data: testMessage
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Health check (utilisé par Consul)
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        service: SERVICE_NAME,
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        kafka: ehrProducer.producer ? 'connected' : 'disconnected',
        consul: 'registered',
        timestamp: new Date()
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route non trouvée' });
});

// Enregistrement dans Consul au démarrage
consulRegistry.register().then(() => {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`✅ ${SERVICE_NAME} running on port ${PORT}`);
        console.log(`   Health: http://localhost:${PORT}/health`);
        console.log(`   API: http://localhost:${PORT}/api/ehr`);
        console.log(`   Kafka Status: http://localhost:${PORT}/api/kafka/status`);
        console.log(`   Consul: http://consul:8500`);
        console.log(`   Routes disponibles:`);
        console.log(`   - GET    /api/ehr`);
        console.log(`   - GET    /api/ehr/:id`);
        console.log(`   - GET    /api/ehr/patient/:patientId`);
        console.log(`   - POST   /api/ehr`);
        console.log(`   - PUT    /api/ehr/:id`);
        console.log(`   - PATCH  /api/ehr/:id`);
        console.log(`   - DELETE /api/ehr/:id`);
        console.log(`   - POST   /api/ehr/:patientId/lab-request (Kafka)`);
        console.log(`   - GET    /api/kafka/status`);
        console.log(`   - POST   /api/test/kafka`);
    });
});

// Désenregistrement à l'arrêt
process.on('SIGINT', async () => {
    console.log('🛑 Arrêt du service...');
    await ehrProducer.disconnect();
    await ehrConsumer.disconnect();
    await consulRegistry.deregister();
    process.exit();
});

process.on('SIGTERM', async () => {
    console.log('🛑 Arrêt du service...');
    await ehrProducer.disconnect();
    await ehrConsumer.disconnect();
    await consulRegistry.deregister();
    process.exit();
});