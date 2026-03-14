<div align="center">

# 🏥 MyHeart Healthcare System

<img src="https://img.shields.io/badge/version-3.0.0-blue.svg" alt="Version 3.0.0">
<img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License MIT">
<img src="https://img.shields.io/badge/Spring%20Boot-3.0-brightgreen" alt="Spring Boot">
<img src="https://img.shields.io/badge/React-18-blue" alt="React">
<img src="https://img.shields.io/badge/Node.js-18-green" alt="Node.js">
<img src="https://img.shields.io/badge/Docker-24.0-cyan" alt="Docker">
<img src="https://img.shields.io/badge/PostgreSQL-15-blue" alt="PostgreSQL">
<img src="https://img.shields.io/badge/MongoDB-6-green" alt="MongoDB">
<img src="https://img.shields.io/badge/Consul-1.17-pink" alt="Consul">
<img src="https://img.shields.io/badge/Redpanda-23.1-red" alt="Redpanda">
<img src="https://img.shields.io/badge/Kafka-Compatible-orange" alt="Kafka">

**Plateforme intégrée de gestion de santé — Architecture Microservices, Docker, API Gateway,
Circuit Breakers, Consul, Kafka/Redpanda & Chatbot Multilingue**

*Mini-Projet SOA — Institut National des Postes et Télécommunications (INPT) — Filière SUD*

[🚀 Démarrage rapide](#-installation-et-démarrage) · [📐 Architecture](#-architecture) · [📡 API](#-api-documentation) · [⚡ Kafka](#-communication-asynchrone-kafkaredpanda) · [🤖 Chatbot](#-chatbot-multilingue) · [👥 Auteurs](#-auteurs)

</div>

---

## 📋 Table des matières

- [Aperçu du projet](#-aperçu-du-projet)
- [Nouveautés v3.0](#-nouveautés-v30--kafkaredpanda)
- [Nouveautés v2.0](#-nouveautés-v20)
- [Architecture](#-architecture)
- [Prérequis](#-prérequis)
- [Installation et démarrage](#-installation-et-démarrage)
- [Structure des services](#-structure-des-services)
- [Ports et accès](#-ports-et-accès)
- [Communication asynchrone Kafka/Redpanda](#-communication-asynchrone-kafkaredpanda)
- [Chatbot multilingue](#-chatbot-multilingue)
- [Utilisateurs de démonstration](#-utilisateurs-de-démonstration)
- [Commandes utiles](#-commandes-utiles)
- [Tests API](#-tests-api-avec-curl)
- [API Documentation](#-api-documentation)
- [Dépannage](#-dépannage)
- [Auteurs](#-auteurs)
- [Licence](#-licence)

---

## 🌟 Aperçu du projet

**MyHeart Healthcare System** est une plateforme complète de gestion des soins de santé
construite sur une architecture microservices. Elle permet la gestion centralisée des patients,
rendez-vous, dossiers médicaux, prescriptions, analyses de laboratoire et facturation —
le tout via une interface React moderne et une API sécurisée.

| Couche | Technologies |
|--------|-------------|
| Frontend | React 18, Context API |
| Backend Java | Spring Boot 3.0 (Patient, Appointment, Billing, Pharmacy) |
| Backend Node.js | Express (EHR, Lab) |
| Bases de données | PostgreSQL 15, MongoDB 6 |
| Infra | Docker 24, Docker Compose |
| Gateway & Résilience | Node.js API Gateway, Opossum Circuit Breaker |
| Service Discovery | Consul 1.17 |
| Messagerie asynchrone | Redpanda v23.1 (Kafka-compatible) |
| Assistant virtuel | Chatbot local FR/EN/AR |

---

## 🆕 Nouveautés v3.0 — Kafka/Redpanda

### ⚡ Communication asynchrone EHR ↔ Laboratoire

Intégration d'un broker de messages **Redpanda** (Kafka-compatible) permettant une
communication asynchrone et découplée entre le service EHR et le service Laboratoire,
implémentant le **pattern SAGA** pour les transactions distribuées.EHR Service ──[lab-orders]──▶ Redpanda ──[lab-orders]──▶ Lab Service
EHR Service ◀──[lab-results, ehr-notifications]── Redpanda ◀── Lab Service

### 📨 Topics Kafka créés

| Topic | Direction | Rôle |
|-------|-----------|------|
| `lab-orders` | EHR → Lab | Demandes d'analyses médicales |
| `lab-results` | Lab → EHR | Résultats des analyses traitées |
| `ehr-notifications` | Lab → EHR | Notifications de statut (résultats prêts, urgences) |

### 🔧 Correction clé — `--advertise-kafka-addr`

Sans ce flag, Redpanda annonce `0.0.0.0:9092` dans ses métadonnées broker,
rendant la connexion impossible depuis les autres conteneurs Docker.
```yamldocker-compose.yml — configuration Redpanda corrigée
redpanda:
command:
- redpanda
- start
- --kafka-addr 0.0.0.0:9092
- --advertise-kafka-addr redpanda:9092   # ← Correction clé

### ✅ Fonctionnalités implémentées

| Fonctionnalité | Statut |
|---------------|--------|
| Envoi asynchrone des demandes d'analyses | ✅ Implémenté |
| Traitement automatique par Lab Service | ✅ Implémenté |
| Génération et renvoi des résultats | ✅ Implémenté |
| Détection automatique des anomalies biologiques | ✅ Implémenté |
| Notifications en temps réel | ✅ Implémenté |
| Monitoring de l'état Kafka via API | ✅ Implémenté |

---

## 🆕 Nouveautés v2.0

### ⚡ API Gateway centralisée
Un point d'entrée unique (port **8080**) achemine toutes les requêtes du frontend React
vers les 6 microservices. Gestion unifiée du CORS, de la sécurité et des logs.React :3000  →  API Gateway :8080  →  Microservices :8081–8087

### 🔒 Circuit Breakers (Opossum)
Protection contre les pannes en cascade sur l'API Gateway.
Trois états : **Fermé** → **Mi-ouvert** → **Ouvert**.
Fallback automatique avec message d'erreur propre, reprise après 30 secondes.

| Paramètre | Valeur |
|-----------|--------|
| Timeout | 5 secondes |
| Seuil d'ouverture | 80 % d'échecs |
| Délai de reprise | 30 secondes |
| Fenêtre d'analyse | 10 secondes |

### 🗺️ Service Discovery — Consul
Enregistrement automatique des services Node.js au démarrage.
Health checks toutes les **10 secondes** sur `/health`.
Interface web disponible sur `http://localhost:8500`.

| Service enregistré | Port | Health Check |
|-------------------|------|-------------|
| ehr-service | 8084 | `/health` — 10s |
| lab-service | 8085 | `/health` — 10s |

### 🤖 Chatbot multilingue
Assistant virtuel intégré sur toutes les pages (bouton flottant).
Base locale de **250+ réponses** en français, anglais et arabe.
Adapté à chaque profil utilisateur.

---

## 📐 Architecturemyheart-healthcare-system/
├── backend/
│   ├── api-gateway/              # API Gateway Node.js (port 8080)
│   │   ├── index.js
│   │   └── package.json
│   ├── patient-service/          # Spring Boot — PostgreSQL :8081
│   ├── appointment-service/      # Spring Boot — PostgreSQL :8082
│   ├── billing-service/          # Spring Boot — PostgreSQL :8083
│   ├── ehr-service/              # Node.js — MongoDB :8084
│   │   └── kafka/
│   │       ├── producer.js       # Envoi lab-orders sur Kafka
│   │       └── consumer.js       # Réception lab-results, ehr-notifications
│   ├── lab-service/              # Node.js — MongoDB :8085
│   │   └── kafka/
│   │       ├── consumer.js       # Réception lab-orders
│   │       └── producer.js       # Envoi lab-results, ehr-notifications
│   ├── pharmacy-service/         # Spring Boot — PostgreSQL :8087
│   └── docker-compose.yml        # Inclut Redpanda v23.1.7
│
└── frontend/
└── src/
├── components/
│   ├── auth/             # Authentification
│   ├── patient/          # Espace patient
│   ├── doctor/           # Espace médecin
│   ├── pharmacy/         # Espace pharmacie
│   ├── lab/              # Espace laboratoire
│   ├── reception/        # Espace réception
│   ├── billing/          # Espace caisse
│   └── chatbot/          # Assistant virtuel FR/EN/AR
├── context/
│   └── AuthContext.js
└── App.js

---

## 🔧 Prérequis

- **Docker** 24.0+ et **Docker Compose**
- **Node.js** v18+ (frontend + API Gateway + services EHR/Lab)
- **Java** 17+ (services Spring Boot)
- **Git** 2.40+

---

## 🚀 Installation et démarrage

### 1. Cloner le projet
```bashgit clone https://github.com/NASRHOUDA/myheart-healthcare-system.git
cd myheart-healthcare-system

### 2. Lancer tous les services avec Docker
```bashcd backend
docker-compose up -d --build

> ⚠️ Redpanda démarre avant les services Node.js grâce aux `depends_on` avec `condition: service_healthy`.

### 3. Vérifier que tous les conteneurs sont lancés
```bashdocker ps

Vous devez voir **16 conteneurs** actifs, dont `redpanda`, `ehr-service` et `lab-service`.

### 4. Lancer le frontend
```bashcd frontend
npm install
npm start
Application disponible sur http://localhost:3000

### 5. Vérifier les connexions Kafka
```bashStatut Kafka EHR Service
curl http://localhost:8084/api/kafka/statusStatut Kafka Lab Service
curl http://localhost:8085/api/kafka/status

Réponse attendue :
```json{
"service": "ehr-service",
"kafka": {
"producer": "connected",
"consumer": "connected",
"brokers": "redpanda:9092"
}
}

### 6. Vérifier Consul *(optionnel)*

Ouvrir `http://localhost:8500` pour voir les services enregistrés.

---

## 📡 Structure des services

### Backend — Microservices

| Service | Port | Base de données | Technologie | Description |
|---------|------|----------------|-------------|-------------|
| api-gateway | **8080** | — | Node.js | Point d'entrée unique + Circuit Breakers |
| patient-service | 8081 | PostgreSQL :5432 | Spring Boot | Gestion des patients & auth |
| appointment-service | 8082 | PostgreSQL :5433 | Spring Boot | Rendez-vous |
| billing-service | 8083 | PostgreSQL :5434 | Spring Boot | Facturation |
| ehr-service | 8084 | MongoDB :27017 | Node.js | Dossiers médicaux + **Kafka Producer/Consumer** |
| lab-service | 8085 | MongoDB :27018 | Node.js | Laboratoire + **Kafka Producer/Consumer** |
| pharmacy-service | 8087 | PostgreSQL :5435 | Spring Boot | Pharmacie |
| **redpanda** | **9092** | — | Redpanda | **Broker Kafka-compatible** |

### Frontend — Espaces utilisateurs

| Espace | URL | Rôle |
|--------|-----|------|
| Connexion | `http://localhost:3000` | — |
| Patient | `http://localhost:3000/patient/dashboard` | 👤 Patient |
| Médecin | `http://localhost:3000/doctor/dashboard` | 👨‍⚕️ Médecin |
| Pharmacie | `http://localhost:3000/pharmacy/dashboard` | 💊 Pharmacien |
| Laboratoire | `http://localhost:3000/lab/dashboard` | 🔬 Biologiste |
| Réception | `http://localhost:3000/reception/dashboard` | 🏥 Agent d'accueil |
| Caisse | `http://localhost:3000/billing/dashboard` | 💰 Caissier |

---

## 🔌 Ports et accès

| Composant | Port |
|-----------|------|
| Frontend React | 3000 |
| API Gateway | **8080** |
| Patient Service | 8081 |
| Appointment Service | 8082 |
| Billing Service | 8083 |
| EHR Service | 8084 |
| Lab Service | 8085 |
| Pharmacy Service | 8087 |
| **Redpanda (Kafka)** | **9092** |
| **Redpanda Admin** | **9644** |
| Consul UI | **8500** |
| patient-db (PostgreSQL) | 5432 |
| appointment-db (PostgreSQL) | 5433 |
| billing-db (PostgreSQL) | 5434 |
| pharmacy-db (PostgreSQL) | 5435 |
| ehr-db (MongoDB) | 27017 |
| lab-db (MongoDB) | 27018 |

---

## ⚡ Communication asynchrone Kafka/Redpanda

### Flux complet de bout en bout
Médecin crée une demande d'analyse
↓
EHR Service publie sur [lab-orders]
↓
Redpanda route le message
↓
Lab Service consomme [lab-orders]
↓
Lab Service traite les tests et génère les résultats
↓
Lab Service publie sur [lab-results] + [ehr-notifications]
↓
EHR Service consomme [lab-results]
↓
Détection automatique des anomalies (ex: glycémie hors normes)
↓
EHR Service consomme [ehr-notifications] → LAB_RESULTS_READY


### Tester le pipeline Kafka
```bash1. Vérifier le statut Kafka
curl http://localhost:8084/api/kafka/status2. Envoyer une demande d'analyse
curl -X POST http://localhost:8084/api/ehr/12345/lab-request 
-H "Content-Type: application/json" 
-d '{
"patientName": "Jean Dupont",
"doctorId": "DR001",
"tests": [
{"testCode": "CBC",  "testName": "Numération formule sanguine"},
{"testCode": "GLU",  "testName": "Glycémie"},
{"testCode": "CHOL", "testName": "Cholestérol total"}
],
"priority": "URGENT"
}'3. Vérifier les logs Lab Service (traitement)
docker logs lab-service --tail 204. Vérifier les logs EHR Service (réception résultats)
docker logs ehr-service --tail 20

### Variables d'environnement Kafka

| Variable | Valeur | Description |
|----------|--------|-------------|
| `KAFKA_BROKERS` | `redpanda:9092` | Adresse du broker |
| `KAFKA_CLIENT_ID` | `ehr-service` / `lab-service` | Identifiant client |
| `KAFKA_GROUP_ID` | `ehr-group` / `lab-group` | Groupe de consommateurs |

---

## 🤖 Chatbot Multilingue

Le chatbot intégré fonctionne **100 % hors ligne** avec une base de connaissances locale.

| Caractéristique | Valeur |
|----------------|--------|
| Base de réponses | 250+ entrées |
| Langues | 🇫🇷 Français · 🇬🇧 Anglais · 🇲🇦 Arabe |
| Temps de réponse | < 100 ms |
| Accès | Bouton flottant sur toutes les pages |

### Réponses par catégorie

| Catégorie | Réponses | Exemples |
|-----------|----------|---------|
| Laboratoire | 80+ | Glycémie, cholestérol, CRP, TSH |
| Médicaments | 30+ | Paracétamol, ibuprofène, antibiotiques |
| Pathologies | 40+ | Grippe, diabète, hypertension |
| Rendez-vous | 15+ | Prise, annulation, modification |
| Réception | 80+ | Inscription, accueil, planning |
| Anglais | 30+ | Questions courantes traduites |
| Arabe | 20+ | Support arabophones |

### Adaptation par profil

| Profil | Assistance |
|--------|-----------|
| 👤 Patient | Rendez-vous, médicaments, factures |
| 👨‍⚕️ Médecin | Prescriptions, dossiers patients |
| 🔬 Laboratoire | Analyses, normes, résultats |
| 💊 Pharmacie | Stocks, délivrances, génériques |
| 🏥 Réception | Accueil, inscriptions, planning |

---

## 👥 Utilisateurs de démonstration

### 👨‍⚕️ MédecinEmail        : youssef.benjelloun@gmail.com
Mot de passe : youssef123

### 👤 PatientEmail        : ahmed.allami@gmail.com
Mot de passe : ahmed123

### 💊 PharmacienEmail        : nadiafassi67@gmail.com
Mot de passe : nadia123

---

## 🛠 Commandes utiles

### Docker
```bashVoir tous les conteneurs actifs
docker psLogs d'un service
docker logs ehr-service
docker logs lab-service
docker logs redpandaRedémarrer un service
docker restart ehr-serviceArrêter tout
docker-compose downRelancer tout avec rebuild
docker-compose up -d --build

### Kafka / Redpanda
```bashStatut Kafka EHR
curl http://localhost:8084/api/kafka/statusStatut Kafka Lab
curl http://localhost:8085/api/kafka/statusTest envoi message Kafka
curl -X POST http://localhost:8084/api/test/kafka 
-H "Content-Type: application/json" 
-d '{"message": "test"}'Santé Redpanda
curl http://localhost:9644/v1/status/ready

### Frontend
```bashnpm start          # Démarrer en développement
npm run build      # Build production
npm test           # Lancer les tests

---

## 🧪 Tests API avec curl
```bashPatients
curl http://localhost:8080/api/patientsRendez-vous d'un patient
curl http://localhost:8080/api/appointments/patient/1Médicaments
curl http://localhost:8080/api/medicationsDossier médical
curl http://localhost:8080/api/ehr/patient/1Analyses laboratoire
curl http://localhost:8080/api/lab/patient/1── Kafka (v3.0) ──────────────────────────────────────
Statut Kafka
curl http://localhost:8084/api/kafka/statusEnvoyer une demande d'analyse via Kafka
curl -X POST http://localhost:8084/api/ehr/1/lab-request 
-H "Content-Type: application/json" 
-d '{"tests": [{"testCode": "GLU", "testName": "Glycémie"}], "priority": "NORMAL"}'Santé des services Node.js (Consul)
curl http://localhost:8084/health
curl http://localhost:8085/health

> 💡 Toutes les requêtes passent par l'API Gateway sur le port **8080**.
> Les endpoints Kafka sont directement sur les ports des services.

---

## 📚 API Documentation

### Patient Service — `/api/patients` & `/api/auth`

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/auth/login` | Connexion |
| GET | `/api/patients` | Liste tous les patients |
| GET | `/api/patients/{id}` | Détail d'un patient |
| POST | `/api/patients` | Créer un patient |

### Appointment Service — `/api/appointments`

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/` | Liste tous les rendez-vous |
| GET | `/doctor/{doctorId}` | Rendez-vous d'un médecin |
| GET | `/patient/{patientId}` | Rendez-vous d'un patient |
| POST | `/` | Créer un rendez-vous |

### Billing Service — `/api/bills`

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/` | Liste toutes les factures |
| GET | `/{id}` | Détail d'une facture |
| GET | `/patient/{patientId}` | Factures d'un patient |
| POST | `/` | Créer une facture |
| PUT | `/{id}/pay` | Marquer comme payée |

### EHR Service — `/api/ehr` *(+ Kafka v3.0)*

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/ehr` | Liste tous les dossiers médicaux |
| GET | `/api/ehr/patient/{patientId}` | Dossiers d'un patient |
| POST | `/api/ehr` | Créer un dossier médical |
| POST | `/api/ehr/:patientId/lab-request` | **Envoyer demande analyse via Kafka** |
| GET | `/api/kafka/status` | **Statut Producer/Consumer Kafka** |
| POST | `/api/test/kafka` | **Test envoi message Kafka** |
| GET | `/health` | Health check Consul |

### Lab Service — `/api/lab` *(+ Kafka v3.0)*

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/lab` | Liste toutes les analyses |
| GET | `/api/lab/patient/{patientId}` | Analyses d'un patient |
| POST | `/api/lab` | Créer une analyse |
| PATCH | `/api/lab/{id}` | Mettre à jour une analyse |
| GET | `/api/kafka/status` | **Statut Producer/Consumer Kafka** |
| GET | `/health` | Health check Consul |

### Pharmacy Service — `/api/medications` & `/api/prescriptions`

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/medications` | Liste tous les médicaments |
| POST | `/medications` | Ajouter un médicament |
| GET | `/prescriptions` | Liste toutes les prescriptions |
| GET | `/prescriptions/patient/{patientId}` | Prescriptions d'un patient |
| POST | `/prescriptions` | Créer une prescription |
| PUT | `/prescriptions/{id}/cancel` | Annuler une prescription |

---

## ❓ Dépannage

**`ECONNREFUSED 0.0.0.0:9092` — Kafka ne se connecte pas**
```bashVérifier que Redpanda tourne et est healthy
docker ps | grep redpanda
docker logs redpandaVérifier que --advertise-kafka-addr est bien présent dans docker-compose.yml
La commande doit contenir : --advertise-kafka-addr redpanda:9092

**Consumer Kafka crashe en boucle**
```bashRedémarrer après correction docker-compose.yml
docker-compose down
docker-compose up -d --build
docker logs -f ehr-service

**"Empty reply from server"**
```bashdocker logs lab-service   # Vérifier les logs du service concerné

**Port déjà utilisé**
```bashWindows
netstat -ano | findstr :9092
Linux / Mac
lsof -i :9092

**Services Consul non enregistrés**
```bashdocker logs ehr-service
docker logs lab-service
open http://localhost:8500

**Le frontend ne se connecte pas à l'API**
> Vérifier que l'API Gateway tourne sur le port **8080** et que le `.env` du frontend
> pointe bien vers `http://localhost:8080`.

**Les modifications frontend ne s'affichent pas**
> Vider le cache navigateur `Ctrl + F5` ou redémarrer le serveur de développement.

---

## 👨‍💻 Auteurs

**NASRHOUDA** — *Data DevOps Cloud Engineer*
[![GitHub](https://img.shields.io/badge/GitHub-NASRHOUDA-black?logo=github)](https://github.com/NASRHOUDA)

---

## 📄 Licence

Ce projet est sous licence **MIT**. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

<div align="center">
  <sub>🏥 MyHeart Healthcare System v3.0 — Mini-Projet SOA — INPT Filière SUD — 2025/2026</sub>
</div>
