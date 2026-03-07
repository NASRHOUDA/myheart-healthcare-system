const express = require('express');
const proxy = require('express-http-proxy');
const cors = require('cors');
const morgan = require('morgan');
const CircuitBreaker = require('opossum');

const app = express();
const PORT = 8080;

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(morgan('combined'));
app.use(express.json());

const SERVICES = {
  patient: 'http://patient-service:8081',
  appointment: 'http://appointment-service:8081',
  billing: 'http://billing-service:8081',
  pharmacy: 'http://pharmacy-service:8087',
  ehr: 'http://ehr-service:8084',
  lab: 'http://lab-service:8085'
};

console.log('📡 Configuration des services:');
Object.entries(SERVICES).forEach(([name, url]) => {
  console.log(`   - ${name}: ${url}`);
});

const breakerOptions = {
  timeout: 5000,
  errorThresholdPercentage: 80,
  resetTimeout: 30000,
  rollingCountTimeout: 10000,
  rollingCountBuckets: 10
};

const createBreaker = (serviceName, serviceUrl) => {
  // Fonction à protéger
  const asyncFunction = async (req, res) => {
    return new Promise((resolve, reject) => {
      // Créer un proxy avec gestion d'erreur
      const proxyMiddleware = proxy(serviceUrl, {
        proxyReqPathResolver: (req) => req.originalUrl,
        proxyErrorHandler: (err, res, next) => {
          reject(err);
        }
      });

      // Appeler le proxy
      proxyMiddleware(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  };

  // Créer le circuit breaker
  const breaker = new CircuitBreaker(asyncFunction, {
    ...breakerOptions,
    name: `${serviceName}-breaker`
  });

  // Événements
  breaker.on('open', () => console.log(`🔴 Circuit breaker OPEN pour ${serviceName}`));
  breaker.on('halfOpen', () => console.log(`🟡 Circuit breaker HALF-OPEN pour ${serviceName}`));
  breaker.on('close', () => console.log(`🟢 Circuit breaker CLOSED pour ${serviceName}`));
  
  // Fallback
  breaker.fallback((req, res) => {
    console.log(`📞 Fallback exécuté pour ${serviceName}`);
    if (!res.headersSent) {
      res.status(503).json({
        error: `Service ${serviceName} temporairement indisponible`,
        fallback: true,
        timestamp: new Date()
      });
    }
  });

  // Middleware
  return (req, res) => {
    breaker.fire(req, res).catch(err => {
      console.error(`❌ Erreur ${serviceName}:`, err.message);
      if (!res.headersSent) {
        res.status(500).json({ error: `Erreur interne pour ${serviceName}` });
      }
    });
  };
};

// Appliquer les circuit breakers
app.use('/api/auth', createBreaker('auth', SERVICES.patient));
app.use('/api/users', createBreaker('users', SERVICES.patient));
app.use('/api/patients', createBreaker('patients', SERVICES.patient));
app.use('/api/appointments', createBreaker('appointments', SERVICES.appointment));
app.use('/api/bills', createBreaker('bills', SERVICES.billing));
app.use('/api/medications', createBreaker('medications', SERVICES.pharmacy));
app.use('/api/ehr', createBreaker('ehr', SERVICES.ehr));
app.use('/api/lab', createBreaker('lab', SERVICES.lab));

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'api-gateway',
    timestamp: new Date() 
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`=================================`);
  console.log(`🚀 API Gateway avec Circuit Breakers`);
  console.log(`=================================`);
});
