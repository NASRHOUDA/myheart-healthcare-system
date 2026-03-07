const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const ConsulRegistry = require('./consul-register');

const app = express();
const PORT = process.env.SERVICE_PORT || 8085;
const SERVICE_NAME = process.env.SERVICE_NAME || 'lab-service';

// Initialisation Consul
const consulRegistry = new ConsulRegistry(SERVICE_NAME, PORT);

// Configuration CORS
app.use(cors());

// Middleware pour parser JSON
app.use(express.json());

// Middleware pour forcer l'UTF-8
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

// Options de connexion MongoDB avec timeout augmenté
const mongooseOptions = {
  serverSelectionTimeoutMS: 30000,
  connectTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  family: 4
};

// Connexion MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://lab-db:27017/labdb';

console.log(`🔄 Tentative de connexion à MongoDB: ${MONGODB_URI}`);

// Fonction de connexion avec retry
async function connectWithRetry() {
  try {
    await mongoose.connect(MONGODB_URI, mongooseOptions);
    console.log('✅ Connecté à MongoDB');
  } catch (err) {
    console.error('❌ Erreur de connexion MongoDB:', err.message);
    console.log('🔄 Nouvelle tentative dans 5 secondes...');
    setTimeout(connectWithRetry, 5000);
  }
}

connectWithRetry();

// Schéma LabTest
const labTestSchema = new mongoose.Schema({
  patientId: { type: Number, required: true },
  testName: { type: String, required: true },
  result: String,
  referenceRange: String,
  status: { type: String, default: 'PENDING' },
  priority: { type: String, default: 'NORMAL' },
  technician: String,
  date: { type: Date, default: Date.now },
  completedDate: Date,
  notes: String
});

const LabTest = mongoose.model('LabTest', labTestSchema);

// Middleware pour vérifier la connexion DB
const checkDbConnection = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ 
      error: 'Base de données non disponible',
      state: mongoose.connection.readyState
    });
  }
  next();
};

// ========== ROUTES CRUD ==========

// GET toutes les analyses
app.get('/api/lab', checkDbConnection, async (req, res) => {
  try {
    const tests = await LabTest.find().sort({ date: -1 }).maxTimeMS(30000);
    res.json(tests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET une analyse par ID
app.get('/api/lab/:id', checkDbConnection, async (req, res) => {
  try {
    const test = await LabTest.findById(req.params.id).maxTimeMS(30000);
    if (!test) return res.status(404).json({ error: 'Analyse non trouvée' });
    res.json(test);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET analyses par patient
app.get('/api/lab/patient/:patientId', checkDbConnection, async (req, res) => {
  try {
    const tests = await LabTest.find({ 
      patientId: parseInt(req.params.patientId) 
    }).maxTimeMS(30000);
    res.json(tests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET analyses par statut
app.get('/api/lab/status/:status', checkDbConnection, async (req, res) => {
  try {
    const tests = await LabTest.find({ 
      status: req.params.status.toUpperCase() 
    }).maxTimeMS(30000);
    res.json(tests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST créer une nouvelle analyse
app.post('/api/lab', checkDbConnection, async (req, res) => {
  try {
    const newTest = new LabTest({
      patientId: req.body.patientId,
      testName: req.body.testName,
      priority: req.body.priority || 'NORMAL',
      notes: req.body.notes,
      status: 'PENDING'
    });
    
    const savedTest = await newTest.save();
    res.status(201).json(savedTest);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT mettre à jour une analyse
app.put('/api/lab/:id', checkDbConnection, async (req, res) => {
  try {
    const updatedTest = await LabTest.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedTest) {
      return res.status(404).json({ error: 'Analyse non trouvée' });
    }
    
    res.json(updatedTest);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH mise à jour partielle
app.patch('/api/lab/:id', checkDbConnection, async (req, res) => {
  try {
    const test = await LabTest.findById(req.params.id);
    
    if (!test) {
      return res.status(404).json({ error: 'Analyse non trouvée' });
    }

    const allowedUpdates = ['result', 'status', 'technician', 'completedDate', 'referenceRange', 'notes'];
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        test[field] = req.body[field];
      }
    });

    if (req.body.status === 'COMPLETED' && !test.completedDate) {
      test.completedDate = new Date();
    }

    const updatedTest = await test.save();
    res.json(updatedTest);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE une analyse
app.delete('/api/lab/:id', checkDbConnection, async (req, res) => {
  try {
    const deletedTest = await LabTest.findByIdAndDelete(req.params.id);
    
    if (!deletedTest) {
      return res.status(404).json({ error: 'Analyse non trouvée' });
    }
    
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route de santé (utilisée par Consul)
app.get('/health', (req, res) => {
  res.json({ 
    status: mongoose.connection.readyState === 1 ? 'OK' : 'DEGRADED',
    service: SERVICE_NAME,
    mongodb: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState],
    consul: 'registered',
    timestamp: new Date() 
  });
});

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

// Enregistrement dans Consul au démarrage
consulRegistry.register().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ ${SERVICE_NAME} démarré sur le port ${PORT}`);
    console.log(`   Health: http://localhost:${PORT}/health`);
    console.log(`   API: http://localhost:${PORT}/api/lab`);
    console.log(`   Consul: http://consul:8500`);
    console.log(`📋 Routes disponibles:`);
    console.log(`   GET    /api/lab`);
    console.log(`   GET    /api/lab/:id`);
    console.log(`   GET    /api/lab/patient/:patientId`);
    console.log(`   GET    /api/lab/status/:status`);
    console.log(`   POST   /api/lab`);
    console.log(`   PUT    /api/lab/:id`);
    console.log(`   PATCH  /api/lab/:id`);
    console.log(`   DELETE /api/lab/:id`);
  });
});

// Désenregistrement à l'arrêt
process.on('SIGINT', async () => {
  console.log('🛑 Arrêt du service...');
  await consulRegistry.deregister();
  process.exit();
});

process.on('SIGTERM', async () => {
  console.log('🛑 Arrêt du service...');
  await consulRegistry.deregister();
  process.exit();
});