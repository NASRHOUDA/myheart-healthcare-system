# 🏥 MyHeart Healthcare System

Plateforme intégrée de gestion de santé avec microservices, conteneurs Docker et architecture modulaire.

## 📋 Table des matières
- [Architecture du projet](#architecture-du-projet)
- [Prérequis](#prérequis)
- [Installation et démarrage](#installation-et-démarrage)
- [Structure des services](#structure-des-services)
- [Ports et accès](#ports-et-accès)
- [Utilisation](#utilisation)
- [Dépannage](#dépannage)
- [API Documentation](#api-documentation)

## 🏗 Architecture du projet
myheart-healthcare-system/
├── backend/
│ ├── patient-service/ # Gestion des patients (Spring Boot)
│ ├── appointment-service/ # Gestion des rendez-vous (Spring Boot)
│ ├── billing-service/ # Facturation (Spring Boot)
│ ├── pharmacy-service/ # Pharmacie (Spring Boot)
│ ├── ehr-service/ # Dossiers médicaux (Node.js)
│ ├── lab-service/ # Laboratoire (Node.js)
│ └── docker-compose.yml # Orchestration des conteneurs
│
└── frontend/
├── src/
│ ├── components/
│ │ ├── auth/ # Authentification
│ │ ├── patient/ # Espace patient
│ │ ├── doctor/ # Espace médecin
│ │ ├── pharmacy/ # Espace pharmacie
│ │ ├── lab/ # Espace laboratoire
│ │ ├── reception/ # Espace réception
│ │ └── billing/ # Espace caisse
│ │ └── Layout/
│ │ └── ProtectedRoute.js
│ │ └── Unauthorized.js/
│ ├── context/ # Contexte d'authentification
│ └── App.js # Point d'entrée
└── package.json

text

## 🔧 Prérequis

- **Docker** et **Docker Compose** (pour les conteneurs)
- **Node.js** v18+ (pour le développement frontend)
- **Java** 17+ (pour les services Spring Boot)
- **Git** (pour le versionnement)

## 🚀 Installation et démarrage

### 1. Cloner le projet
```bash
git clone <votre-repo>
cd myheart-healthcare-system
2. Lancer tous les services avec Docker
bash
cd backend
docker-compose up -d
3. Vérifier que tous les conteneurs sont lancés
bash
docker ps
4. Lancer le frontend (en développement)
bash
cd frontend
npm install
npm start
📡 Structure des services
Backend - Microservices
Service	Port	Base de données	Description
patient-service	8081	PostgreSQL	Gestion des patients
appointment-service	8082	PostgreSQL	Gestion des rendez-vous
billing-service	8083	PostgreSQL	Facturation
ehr-service	8084	MongoDB	Dossiers médicaux
lab-service	8085	MongoDB	Laboratoire
pharmacy-service	8087	PostgreSQL	Pharmacie
Frontend - Espaces utilisateurs
Espace	URL	Rôle
Accueil / Connexion	http://localhost:3000	-
Patient	http://localhost:3000/patient/dashboard	👤 Patient
Médecin	http://localhost:3000/doctor/dashboard	👨‍⚕️ Médecin
Pharmacie	http://localhost:3000/pharmacy/dashboard	💊 Pharmacien
Laboratoire	http://localhost:3000/lab/dashboard	🔬 Biologiste
Réception	http://localhost:3000/reception/dashboard	🏥 Agent d'accueil
Caisse	http://localhost:3000/billing/dashboard	💰 Caissier
🔌 Ports et accès
Bases de données
PostgreSQL patient-db: 5432

PostgreSQL appointment-db: 5433

PostgreSQL billing-db: 5434

PostgreSQL pharmacy-db: 5435

MongoDB ehr-db: 27017

MongoDB lab-db: 27018

APIs
text
patient-service     → http://localhost:8081/api/patients
appointment-service → http://localhost:8082/api/appointments
billing-service     → http://localhost:8083/api/bills
ehr-service         → http://localhost:8084/api/ehr
lab-service         → http://localhost:8085/api/lab
pharmacy-service    → http://localhost:8087/api/medications
👥 Utilisateurs de démonstration
Médecin
text
Email: youssef.benjelloun@gmail.com
Mot de passe: 123456
Patient (ahmed allami)
text
Email: ahmed.allami@gmail.com
Mot de passe: 123456
ID: 1
Pharmacie
text
Email: marie.dupont@pharmacie.fr
Mot de passe: pharmacie123
🛠 Commandes utiles
Docker
bash
# Voir tous les conteneurs
docker ps

# Voir les logs d'un service
docker logs pharmacy-service

# Redémarrer un service
docker restart lab-service

# Arrêter tous les services
docker-compose down

# Relancer tous les services
docker-compose up -d
Frontend
bash
# Démarrer en développement
npm start

# Build pour production
npm run build

# Tester
npm test
Tests API avec curl
bash
# Tester le service patient
curl http://localhost:8081/api/patients

# Voir les rendez-vous d'un patient
curl http://localhost:8082/api/appointments/patient/1

# Lister les médicaments
curl http://localhost:8087/api/medications
❓ Dépannage
Problème : "Empty reply from server"
Solution : Vérifier que le service écoute sur la bonne interface

bash
docker logs lab-service
Problème : Port déjà utilisé
Solution : Changer le port ou arrêter le processus

bash
netstat -ano | findstr :8087
Problème : Les modifications frontend ne s'affichent pas
Solution : Vider le cache navigateur (Ctrl + F5) ou redémarrer le serveur

📚 API Documentation
Patient Service (/api/patients)
GET / - Liste tous les patients

GET /{id} - Détail d'un patient

POST / - Créer un patient

Appointment Service (/api/appointments)
GET / - Liste tous les rendez-vous

GET /doctor/{doctorId} - Rendez-vous d'un médecin

GET /patient/{patientId} - Rendez-vous d'un patient

POST / - Créer un rendez-vous

Billing Service (/api/bills)
GET / - Liste toutes les factures

GET /{id} - Détail d'une facture

GET /patient/{patientId} - Factures d'un patient

POST / - Créer une facture

PUT /{id}/pay - Marquer comme payée

EHR Service (/api/ehr)
GET / - Liste tous les dossiers médicaux

GET /patient/{patientId} - Dossiers d'un patient

POST / - Créer un dossier médical

Lab Service (/api/lab)
GET / - Liste toutes les analyses

GET /patient/{patientId} - Analyses d'un patient

POST / - Créer une analyse

PATCH /{id} - Mettre à jour une analyse

Pharmacy Service (/api/medications et /api/prescriptions)
GET /medications - Liste tous les médicaments

POST /medications - Ajouter un médicament

GET /prescriptions - Liste toutes les prescriptions

GET /prescriptions/patient/{patientId} - Prescriptions d'un patient

POST /prescriptions - Créer une prescription