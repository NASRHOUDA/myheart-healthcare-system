const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Configuration CORS
app.use(cors());

// Middleware pour parser JSON
app.use(express.json());

// ✅ AJOUTER CE MIDDLEWARE POUR FORCER L'UTF-8
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

// Connexion MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/labdb';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connecté à MongoDB');
  })
  .catch(err => {
    console.error('❌ Erreur MongoDB:', err);
  });

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

// ========== ROUTES CRUD COMPLÈTES ==========

// GET toutes les analyses
app.get('/api/lab', async (req, res) => {
  try {
    const tests = await LabTest.find().sort({ date: -1 });
    res.json(tests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET une analyse par ID
app.get('/api/lab/:id', async (req, res) => {
  try {
    const test = await LabTest.findById(req.params.id);
    if (!test) return res.status(404).json({ error: 'Analyse non trouvée' });
    res.json(test);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET analyses par patient
app.get('/api/lab/patient/:patientId', async (req, res) => {
  try {
    const tests = await LabTest.find({ patientId: parseInt(req.params.patientId) });
    res.json(tests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET analyses par statut
app.get('/api/lab/status/:status', async (req, res) => {
  try {
    const tests = await LabTest.find({ status: req.params.status.toUpperCase() });
    res.json(tests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST créer une nouvelle analyse
app.post('/api/lab', async (req, res) => {
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

// PUT remplacer TOUTE la collection (attention: utilisez avec précaution)
app.put('/api/lab', async (req, res) => {
  try {
    await LabTest.deleteMany({});
    const tests = await LabTest.insertMany(req.body);
    res.json(tests);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT mettre à jour une analyse complète
app.put('/api/lab/:id', async (req, res) => {
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

// PATCH mise à jour partielle (parfait pour "Terminer")
app.patch('/api/lab/:id', async (req, res) => {
  try {
    const test = await LabTest.findById(req.params.id);
    
    if (!test) {
      return res.status(404).json({ error: 'Analyse non trouvée' });
    }

    // Mettre à jour seulement les champs fournis
    const allowedUpdates = ['result', 'status', 'technician', 'completedDate', 'referenceRange', 'notes'];
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        test[field] = req.body[field];
      }
    });

    // Si on marque comme terminé sans date, ajouter la date automatiquement
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
app.delete('/api/lab/:id', async (req, res) => {
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

// DELETE toutes les analyses (prudent - peut-être à désactiver en production)
app.delete('/api/lab', async (req, res) => {
  try {
    await LabTest.deleteMany({});
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route de santé
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'Laboratoire', timestamp: new Date() });
});

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

// Démarrage du serveur
const PORT = process.env.PORT || 8085;
app.listen(PORT, () => {
  console.log(`✅ Service laboratoire démarré sur le port ${PORT}`);
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