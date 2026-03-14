const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const ConsulRegistry = require('./consul-register');
const labProducer = require('./kafka/producer');
const labConsumer = require('./kafka/consumer');

const app = express();
const PORT = process.env.SERVICE_PORT || 8085;
const SERVICE_NAME = process.env.SERVICE_NAME || 'lab-service';

console.log('🚀 Starting Lab service...');
console.log('📡 Attempting to connect to MongoDB...');
console.log('📡 Attempting to connect to Kafka...');

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

// Connexion Kafka
async function setupKafka() {
  try {
    await labProducer.connect();
    await labConsumer.connect();
    await labConsumer.subscribe();
    console.log('✅ Kafka setup completed');
  } catch (error) {
    console.error('❌ Kafka connection error:', error.message);
  }
}
setupKafka();

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
  notes: String,
  // Nouveau champ pour lier avec Kafka
  orderId: String,
  kafkaMessage: mongoose.Schema.Types.Mixed
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

// ========== ROUTES CRUD EXISTANTES ==========

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
      status: 'PENDING',
      orderId: req.body.orderId || `MANUAL-${Date.now()}`
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

// ========== ROUTES KAFKA CORRIGÉES ==========

// GET - Voir les messages Kafka reçus (temporaire)
app.get('/api/kafka/messages', (req, res) => {
  res.json({
    message: 'Les messages Kafka sont traités en temps réel. Vérifiez les logs du service pour voir les messages reçus.',
    note: 'Utilisez "docker logs -f lab-service" pour voir les messages en direct'
  });
});

// GET - Statistiques Kafka (CORRIGÉ avec redpanda)
app.get('/api/kafka/status', (req, res) => {
  res.json({
    service: SERVICE_NAME,
    kafka: {
      producer: labProducer.producer ? 'connected' : 'disconnected',
      consumer: labConsumer.consumer ? 'connected' : 'disconnected',
      brokers: process.env.KAFKA_BROKERS || 'redpanda:9092'  // ← CORRIGÉ
    },
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// POST - Simuler l'envoi de résultats (test)
app.post('/api/kafka/send-test-result', checkDbConnection, async (req, res) => {
  try {
    const testResult = {
      orderId: req.body.orderId || `TEST-${Date.now()}`,
      patientId: req.body.patientId || 99999,
      tests: req.body.tests || [
        {
          testCode: 'CBC',
          testName: 'Complete Blood Count',
          result: '5.2',
          unit: '10^6/μL',
          normalRange: '4.5-5.5'
        }
      ],
      status: 'completed',
      completedBy: 'lab-technician',
      notes: 'Test results from manual trigger'
    };

    await labProducer.sendLabResult(testResult);
    await labProducer.sendNotification({
      type: 'LAB_RESULTS_READY',
      orderId: testResult.orderId,
      patientId: testResult.patientId,
      message: 'Test results ready'
    });

    res.json({
      success: true,
      message: 'Test results sent to Kafka',
      data: testResult
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST - Route pour traiter une commande de laboratoire (utile pour tester)
app.post('/api/lab/process-order', checkDbConnection, async (req, res) => {
  try {
    const orderData = {
      orderId: req.body.orderId || `ORDER-${Date.now()}`,
      patientId: req.body.patientId || 12345,
      patientName: req.body.patientName || 'Test Patient',
      tests: req.body.tests || [
        { testCode: 'CBC', testName: 'Complete Blood Count' }
      ],
      priority: req.body.priority || 'NORMAL'
    };

    // Simuler le traitement
    const results = {
      orderId: orderData.orderId,
      patientId: orderData.patientId,
      tests: orderData.tests.map(test => ({
        testCode: test.testCode,
        testName: test.testName,
        result: (Math.random() * 100).toFixed(2),
        unit: 'mg/dL',
        normalRange: '70-110',
        completedAt: new Date().toISOString()
      })),
      status: 'completed',
      completedBy: 'lab-technician',
      completedAt: new Date().toISOString()
    };

    // Envoyer les résultats via Kafka
    await labProducer.sendLabResult(results);
    
    // Envoyer une notification
    await labProducer.sendNotification({
      type: 'LAB_RESULTS_READY',
      orderId: orderData.orderId,
      patientId: orderData.patientId,
      message: `Lab results ready for order ${orderData.orderId}`
    });

    res.json({
      success: true,
      message: 'Order processed and results sent',
      data: results
    });
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
    kafka: labProducer.producer ? 'connected' : 'disconnected',
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
    console.log(`   Kafka Status: http://localhost:${PORT}/api/kafka/status`);
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
    console.log(`   GET    /api/kafka/status`); // ← Maintenant fonctionnelle
    console.log(`   GET    /api/kafka/messages`);
    console.log(`   POST   /api/kafka/send-test-result`);
    console.log(`   POST   /api/lab/process-order`); // ← Nouvelle route
  });
});

// Désenregistrement à l'arrêt
process.on('SIGINT', async () => {
  console.log('🛑 Arrêt du service...');
  await labProducer.disconnect();
  await labConsumer.disconnect();
  await consulRegistry.deregister();
  process.exit();
});

process.on('SIGTERM', async () => {
  console.log('🛑 Arrêt du service...');
  await labProducer.disconnect();
  await labConsumer.disconnect();
  await consulRegistry.deregister();
  process.exit();
});