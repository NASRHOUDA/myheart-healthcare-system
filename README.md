<div align="center">

<img src="https://img.shields.io/badge/version-3.0.0-blue.svg" alt="Version 3.0.0">
<img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License MIT">
<img src="https://img.shields.io/badge/Spring%20Boot-3.0-brightgreen" alt="Spring Boot">
<img src="https://img.shields.io/badge/React-18-blue" alt="React">
<img src="https://img.shields.io/badge/Node.js-18-green" alt="Node.js">
<img src="https://img.shields.io/badge/Docker-24.0-cyan" alt="Docker">
<img src="https://img.shields.io/badge/Kafka-Redpanda-orange" alt="Kafka Redpanda">
<img src="https://img.shields.io/badge/PostgreSQL-15-blue" alt="PostgreSQL">
<img src="https://img.shields.io/badge/MongoDB-6-green" alt="MongoDB">
<img src="https://img.shields.io/badge/Consul-1.17-pink" alt="Consul">
<img src="https://img.shields.io/badge/pattern-SAGA-purple" alt="SAGA">

# 🏥 MyHeart Healthcare System

**Plateforme intégrée de gestion de santé**
Architecture Microservices · API Gateway · Circuit Breakers · Consul · Kafka/Redpanda · Pattern SAGA · Chatbot Multilingue

*Mini-Projet SOA — Institut National des Postes et Télécommunications (INPT) — Filière SUD — 2025/2026*

[🚀 Démarrage rapide](#-installation-et-démarrage) · [📐 Architecture](#-architecture) · [🔀 Kafka & SAGA](#-communication-asynchrone--kafka--pattern-saga) · [📡 API](#-api-documentation) · [🤖 Chatbot](#-chatbot-multilingue) · [👥 Auteurs](#-auteurs)

</div>

---

## 📋 Table des matières

- [Aperçu du projet](#-aperçu-du-projet)
- [Nouveautés v3.0](#-nouveautés-v30)
- [Nouveautés v2.0](#-nouveautés-v20-rappel)
- [Architecture](#-architecture)
- [Communication Asynchrone — Kafka & Pattern SAGA](#-communication-asynchrone--kafka--pattern-saga)
- [Prérequis](#-prérequis)
- [Installation et démarrage](#-installation-et-démarrage)
- [Structure des services](#-structure-des-services)
- [Ports et accès](#-ports-et-accès)
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

**MyHeart Healthcare System** est une plateforme complète de gestion des soins de santé construite sur une architecture **microservices event-driven**. Elle permet la gestion centralisée des patients, rendez-vous, dossiers médicaux, prescriptions, analyses de laboratoire et facturation — le tout via une interface React moderne, une API Gateway sécurisée et un bus d'événements Kafka.

| Couche | Technologies |
|--------|-------------|
| Frontend | React 18, Context API |
| Backend Java | Spring Boot 3.0 (Patient, Appointment, Billing, Pharmacy) |
| Backend Node.js | Express (EHR, Lab) |
| Bases de données | PostgreSQL 15, MongoDB 6 |
| Infra | Docker 24, Docker Compose |
| Gateway & Résilience | Node.js API Gateway, Opossum Circuit Breaker |
| Service Discovery | Consul 1.17 |
| Messaging asynchrone | **Apache Kafka / Redpanda v23.1.7** |
| Transactions distribuées | **Pattern SAGA** |
| Assistant virtuel | Chatbot local FR/EN/AR |

---

## 🆕 Nouveautés v3.0

> Version majeure introduisant la **communication asynchrone event-driven** entre les microservices EHR et Laboratoire.

### 🔀 Bus d'événements Kafka / Redpanda

Remplacement des appels REST synchrones entre EHR et Lab par un bus de messages **Kafka-compatible** (Redpanda). Les services sont désormais totalement découplés.
```
EHR Service  ──[lab-orders]──▶  Redpanda  ──[lab-orders]──▶  Lab Service
EHR Service  ◀──[lab-results]──  Redpanda  ◀──[lab-results]──  Lab Service
EHR Service  ◀──[ehr-notifications]──  Redpanda  ◀──  Lab Service
```

| Topic | Direction | Partitions | Rôle |
|-------|-----------|-----------|------|
| `lab-orders` | EHR → Lab | 3 | Demandes d'analyses médicales |
| `lab-results` | Lab → EHR | 3 | Résultats d'analyses |
| `ehr-notifications` | Lab → EHR | 3 | Notifications de statut (résultats prêts, urgences) |

### 🔄 Pattern SAGA — Transactions distribuées

Chaque demande d'analyse suit une chaîne d'événements traçable via le champ `sagaStep` :
```
LAB_ORDER_CREATED  →  [lab-orders]  →  LAB_RESULTS_PRODUCED  →  [lab-results]  →  NOTIFICATION_SENT
```

### 🚨 Détection automatique d'anomalies biologiques

Le EHR Consumer analyse en temps réel les résultats reçus et déclenche une alerte si une valeur sort des normes :

| Analyse | Code | Norme |
|---------|------|-------|
| Glycémie | `GLU` | 70 – 110 mg/dL |
| Cholestérol | `CHOL` | 0 – 200 mg/dL |
| Hémoglobine | `HB` | 120 – 170 g/L |

### 🔧 Correction ECONNREFUSED 0.0.0.0:9092

Résolution du problème de connectivité Kafka dans Docker via le flag `--advertise-kafka-addr redpanda:9092` et le remplacement des IPs hardcodées par la variable d'environnement `KAFKA_BROKERS`.

---

## 🆕 Nouveautés v2.0 (rappel)

### ⚡ API Gateway centralisée
Point d'entrée unique (port **8080**) avec gestion unifiée du CORS, de la sécurité et des logs.
```
React :3000  →  API Gateway :8080  →  Microservices :8081–8087
```

### 🔒 Circuit Breakers (Opossum)

| Paramètre | Valeur |
|-----------|--------|
| Timeout | 5 secondes |
| Seuil d'ouverture | 80 % d'échecs |
| Délai de reprise | 30 secondes |

### 🗺️ Service Discovery — Consul
Enregistrement automatique + health checks toutes les **10 secondes**. Interface : `http://localhost:8500`.

### 🤖 Chatbot multilingue
250+ réponses locales en français, anglais et arabe. Bouton flottant sur toutes les pages.

---

## 📐 Architecture
```
myheart-healthcare-system/
├── backend/
│   ├── api-gateway/              # API Gateway Node.js (port 8080)
│   │   ├── index.js              # Circuit Breakers Opossum
│   │   └── package.json
│   ├── patient-service/          # Spring Boot — PostgreSQL :8081
│   ├── appointment-service/      # Spring Boot — PostgreSQL :8082
│   ├── billing-service/          # Spring Boot — PostgreSQL :8083
│   ├── ehr-service/              # Node.js — MongoDB :8084
│   │   ├── kafka/
│   │   │   ├── producer.js       # Publie sur lab-orders
│   │   │   └── consumer.js       # Consomme lab-results, ehr-notifications
│   │   └── ...
│   ├── lab-service/              # Node.js — MongoDB :8085
│   │   ├── kafka/
│   │   │   ├── producer.js       # Publie sur lab-results, ehr-notifications
│   │   │   └── consumer.js       # Consomme lab-orders
│   │   └── ...
│   ├── pharmacy-service/         # Spring Boot — PostgreSQL :8087
│   └── docker-compose.yml        # Inclut Redpanda + healthchecks
│
└── frontend/
    └── src/
        ├── components/
        │   ├── auth/
        │   ├── patient/
        │   ├── doctor/
        │   ├── pharmacy/
        │   ├── lab/
        │   ├── reception/
        │   ├── billing/
        │   └── chatbot/          # Assistant FR/EN/AR
        ├── context/
        │   └── AuthContext.js
        └── App.js
```

### Vue d'ensemble de l'architecture v3.0
```
┌─────────────────────────────────────────────────────────────────────┐
│                         React Frontend :3000                        │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ HTTP
┌──────────────────────────────▼──────────────────────────────────────┐
│               API Gateway :8080 + Circuit Breakers                  │
└──┬──────────┬──────────┬──────────┬──────────┬──────────────────────┘
   │          │          │          │          │
:8081      :8082      :8083      :8084      :8085      :8087
Patient  Appointment Billing    EHR ──┐   Lab ──┐   Pharmacy
Service   Service    Service  Service │ Service │  Service
   │          │          │       ▲   │    ▲    │      │
 PG:5432  PG:5433   PG:5434  Mongo │  Kafka  │  Mongo  PG:5435
                            :27017 │  :9092  │ :27018
                                   └──▶RP ◀──┘
                                     Redpanda
                                   (Consul :8500)
```

---

## 🔀 Communication Asynchrone — Kafka & Pattern SAGA

### Flux complet d'une demande d'analyse
```
1. POST /api/ehr/:patientId/lab-request
        │
        ▼
2. EHR Producer ──[lab-orders]──▶ Redpanda
        │
        ▼
3. Lab Consumer reçoit la demande
        │
        ▼
4. Lab Service traite les analyses (CBC, GLU, CHOL…)
        │
        ▼
5. Lab Producer ──[lab-results]──▶ Redpanda
   Lab Producer ──[ehr-notifications]──▶ Redpanda
        │
        ▼
6. EHR Consumer reçoit les résultats
        │
        ▼
7. Détection automatique des anomalies biologiques
   Mise à jour du dossier patient dans MongoDB
```

### Configuration Redpanda (clé)
```yaml
redpanda:
  image: docker.redpanda.com/redpandadata/redpanda:v23.1.7
  command:
    - redpanda start
    - --kafka-addr 0.0.0.0:9092
    - --advertise-kafka-addr redpanda:9092   # ← CRITIQUE : évite ECONNREFUSED
  ports:
    - "9092:9092"    # Kafka API
    - "9644:9644"    # Admin API
  healthcheck:
    test: ["CMD", "curl", "-f", "http://localhost:9644/v1/status/ready"]
    interval: 10s
    retries: 5
    start_period: 15s
```

### Variables d'environnement Kafka
```yaml
# EHR Service & Lab Service
KAFKA_BROKERS:   redpanda:9092
KAFKA_CLIENT_ID: ehr-service        # ou lab-service
KAFKA_GROUP_ID:  ehr-group          # ou lab-group
```

### Vérification du statut Kafka
```bash
curl -s http://localhost:8084/api/kafka/status | jq .
```
```json
{
  "service": "ehr-service",
  "kafka": {
    "producer": "connected",
    "consumer": "connected",
    "brokers":  "redpanda:9092",
    "groupId":  "ehr-group",
    "topics":   ["lab-results", "ehr-notifications"]
  },
  "timestamp": "2026-03-14T16:35:48.700Z"
}
```

---

## 🔧 Prérequis

- **Docker** 24.0+ et **Docker Compose**
- **Node.js** v18+ (frontend, API Gateway, EHR, Lab)
- **Java** 17+ (services Spring Boot)
- **Git** 2.40+

> ⚠️ **Note v3.0** — Redpanda démarre via Docker Compose. Aucune installation Kafka locale n'est nécessaire.

---

## 🚀 Installation et démarrage

### 1. Cloner le projet
```bash
git clone https://github.com/NASRHOUDA/myheart-healthcare-system.git
cd myheart-healthcare-system
```

### 2. Lancer tous les services backend (incluant Redpanda)
```bash
cd backend
docker-compose up -d
```

> ⏳ Attendre ~15 secondes que Redpanda passe son healthcheck avant que EHR et Lab se connectent.

### 3. Vérifier que tous les conteneurs sont lancés
```bash
docker ps
# Attendu : redpanda, ehr-service, lab-service, patient-service,
#           appointment-service, billing-service, pharmacy-service,
#           ehr-db, lab-db, consul + bases PostgreSQL
```

### 4. Lancer l'API Gateway
```bash
cd backend/api-gateway
npm install
node index.js
# Gateway disponible sur http://localhost:8080
```

### 5. Lancer le frontend
```bash
cd frontend
npm install
npm start
# Application disponible sur http://localhost:3000
```

### 6. Vérifier les interfaces de monitoring *(optionnel)*

| Interface | URL |
|-----------|-----|
| Consul UI | http://localhost:8500 |
| Redpanda Admin API | http://localhost:9644 |
| EHR Kafka Status | http://localhost:8084/api/kafka/status |
| Lab Kafka Status | http://localhost:8085/api/kafka/status |

---

## 📡 Structure des services

### Backend — Microservices

| Service | Port | Base de données | Technologie | Rôle Kafka |
|---------|------|----------------|-------------|-----------|
| api-gateway | **8080** | — | Node.js | — |
| patient-service | 8081 | PostgreSQL :5432 | Spring Boot | — |
| appointment-service | 8082 | PostgreSQL :5433 | Spring Boot | — |
| billing-service | 8083 | PostgreSQL :5434 | Spring Boot | — |
| ehr-service | 8084 | MongoDB :27017 | Node.js | **Producer + Consumer** |
| lab-service | 8085 | MongoDB :27018 | Node.js | **Producer + Consumer** |
| pharmacy-service | 8087 | PostgreSQL :5435 | Spring Boot | — |
| **redpanda** | **9092 / 9644** | — | Redpanda | **Message Broker** |

### Frontend — Espaces utilisateurs

| Espace | URL | Rôle |
|--------|-----|------|
| Connexion | `http://localhost:3000` | — |
| Patient | `/patient/dashboard` | 👤 Patient |
| Médecin | `/doctor/dashboard` | 👨‍⚕️ Médecin |
| Pharmacie | `/pharmacy/dashboard` | 💊 Pharmacien |
| Laboratoire | `/lab/dashboard` | 🔬 Biologiste |
| Réception | `/reception/dashboard` | 🏥 Agent d'accueil |
| Caisse | `/billing/dashboard` | 💰 Caissier |

---

## 🔌 Ports et accès

| Composant | Port | Nouveauté |
|-----------|------|-----------|
| Frontend React | 3000 | |
| API Gateway | **8080** | |
| Patient Service | 8081 | |
| Appointment Service | 8082 | |
| Billing Service | 8083 | |
| EHR Service | 8084 | |
| Lab Service | 8085 | |
| Pharmacy Service | 8087 | |
| Consul UI | **8500** | |
| **Redpanda — Kafka API** | **9092** | 🆕 v3.0 |
| **Redpanda — Admin API** | **9644** | 🆕 v3.0 |
| patient-db (PostgreSQL) | 5432 | |
| appointment-db (PostgreSQL) | 5433 | |
| billing-db (PostgreSQL) | 5434 | |
| pharmacy-db (PostgreSQL) | 5435 | |
| ehr-db (MongoDB) | 27017 | |
| lab-db (MongoDB) | 27018 | |

---

## 🤖 Chatbot Multilingue

Assistant virtuel **100 % hors ligne**, intégré sur toutes les pages via un bouton flottant.

| Caractéristique | Valeur |
|----------------|--------|
| Base de réponses | 250+ entrées |
| Langues | 🇫🇷 Français · 🇬🇧 Anglais · 🇲🇦 Arabe |
| Temps de réponse | < 100 ms |

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

### 👨‍⚕️ Médecin
```
Email        : youssef.benjelloun@gmail.com
Mot de passe : youssef123
```

### 👤 Patient
```
Email        : ahmed.allami@gmail.com
Mot de passe : ahmed123
```

### 💊 Pharmacien
```
Email        : nadiafassi67@gmail.com
Mot de passe : nadia123
```

---

## 🛠 Commandes utiles

### Docker — Services généraux
```bash
docker ps                            # Voir tous les conteneurs actifs
docker logs ehr-service              # Logs EHR
docker logs lab-service              # Logs Lab
docker restart lab-service           # Redémarrer un service
docker-compose down                  # Arrêter tout
docker-compose up -d                 # Relancer tout
docker-compose up -d --build         # Reconstruire après modification
```

### Kafka / Redpanda — Débogage v3.0
```bash
# Statut Kafka des services
curl -s http://localhost:8084/api/kafka/status
curl -s http://localhost:8085/api/kafka/status

# Logs Redpanda
docker logs redpanda --tail 30

# Topics disponibles via Admin API
curl http://localhost:9644/v1/topics

# Logs en direct — voir les messages consommés
docker logs ehr-service --follow
docker logs lab-service --follow
```

### Frontend
```bash
npm start          # Démarrer en développement
npm run build      # Build production
npm test           # Lancer les tests
```

---

## 🧪 Tests API avec curl

### Services existants (via API Gateway)
```bash
# Patients
curl http://localhost:8080/api/patients

# Rendez-vous d'un patient
curl http://localhost:8080/api/appointments/patient/1

# Médicaments
curl http://localhost:8080/api/medications

# Dossier médical
curl http://localhost:8080/api/ehr/patient/1

# Analyses laboratoire
curl http://localhost:8080/api/lab/patient/1
```

### Nouveaux endpoints Kafka — v3.0
```bash
# Statut Kafka EHR
curl -s http://localhost:8084/api/kafka/status | jq .

# Statut Kafka Lab
curl -s http://localhost:8085/api/kafka/status | jq .

# Envoyer une demande d'analyse (déclenche le flux Kafka complet)
curl -X POST http://localhost:8084/api/ehr/12345/lab-request \
  -H "Content-Type: application/json" \
  -d '{
    "patientName": "Jean Dupont",
    "doctorId":    "DR001",
    "tests": [
      { "testCode": "CBC",  "testName": "Numération formule sanguine" },
      { "testCode": "GLU",  "testName": "Glycémie"                   },
      { "testCode": "CHOL", "testName": "Cholestérol total"          }
    ],
    "priority": "URGENT"
  }'

# Santé des services (Consul)
curl http://localhost:8084/health
curl http://localhost:8085/health
```

> 💡 Après le POST `/lab-request`, surveiller les logs en temps réel :
> ```bash
> docker logs lab-service --follow   # Réception et traitement
> docker logs ehr-service --follow   # Réception des résultats + alertes
> ```

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

### EHR Service — `/api/ehr` 🆕 Kafka

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/` | Liste tous les dossiers |
| GET | `/patient/{patientId}` | Dossiers d'un patient |
| POST | `/` | Créer un dossier |
| **POST** | **`/ehr/:patientId/lab-request`** | **🆕 Envoyer une demande d'analyse via Kafka** |
| **GET** | **`/kafka/status`** | **🆕 Statut Producer/Consumer Kafka** |
| GET | `/health` | Health check Consul |

### Lab Service — `/api/lab` 🆕 Kafka

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/` | Liste toutes les analyses |
| GET | `/patient/{patientId}` | Analyses d'un patient |
| POST | `/` | Créer une analyse |
| PATCH | `/{id}` | Mettre à jour une analyse |
| **GET** | **`/kafka/status`** | **🆕 Statut Producer/Consumer Kafka** |
| **POST** | **`/kafka/send-test-result`** | **🆕 Tester la publication Kafka** |
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

### Problèmes généraux

**"Empty reply from server"**
```bash
docker logs lab-service    # Vérifier les logs du service concerné
```

**Port déjà utilisé**
```bash
# Linux / Mac
lsof -i :8087
# Windows
netstat -ano | findstr :8087
```

**Services Consul non enregistrés**
```bash
docker logs ehr-service
docker logs lab-service
open http://localhost:8500
```

**Le frontend ne se connecte pas à l'API**
> Vérifier que l'API Gateway tourne sur le port 8080 et que le `.env` du frontend pointe vers `http://localhost:8080`.

### Problèmes Kafka / Redpanda — v3.0

**`ECONNREFUSED 0.0.0.0:9092` dans les logs**
> Vérifier que le flag `--advertise-kafka-addr redpanda:9092` est bien présent dans `docker-compose.yml`, puis relancer :
> ```bash
> docker-compose up -d --build
> ```

**Consumer Group non enregistré**
> Attendre ~15 secondes après le démarrage de Redpanda. Vérifier le healthcheck :
> ```bash
> docker logs redpanda --tail 20
> curl http://localhost:9644/v1/status/ready
> ```

**Messages non reçus entre EHR et Lab**
> ```bash
> # Vérifier que les topics existent
> curl http://localhost:9644/v1/topics
> # Suivre les logs en direct
> docker logs ehr-service --follow
> docker logs lab-service --follow
> ```

**`docker-compose restart` n'applique pas les modifications**
> Utiliser systématiquement :
> ```bash
> docker-compose up -d --build
> ```

---

## 👨‍💻 Auteurs

**NASRHOUDA** — *Data DevOps Cloud Engineer*
[![GitHub](https://img.shields.io/badge/GitHub-NASRHOUDA-black?logo=github)](https://github.com/NASRHOUDA)

---

## 📄 Licence

Ce projet est sous licence **MIT**. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

<div align="center">

| Version | Date | Changements |
|---------|------|-------------|
| v3.0.0 | Mars 2026 | Kafka/Redpanda · Pattern SAGA · Détection anomalies |
| v2.0.0 | 2025 | API Gateway · Circuit Breakers · Consul · Chatbot |
| v1.0.0 | 2025 | Version initiale microservices |

<sub>🏥 MyHeart Healthcare System v3.0 — Mini-Projet SOA — INPT Filière SUD — 2025/2026</sub>

</div>
Les principales améliorations apportées sont :
Contenu mis à jour

Badge et version passés à v3.0.0 avec badges Kafka/Redpanda et SAGA
Nouvelle section complète Nouveautés v3.0 (Kafka, SAGA, détection anomalies, correction ECONNREFUSED)
L'ancienne section v2.0 devient un rappel condensé
Tableau changelog en pied de page

Architecture

Diagramme ASCII global refondu intégrant Redpanda
Nouvelle section dédiée Communication Asynchrone avec flux SAGA complet et config Redpanda
Colonne Rôle Kafka dans le tableau des services

Commandes et tests

Section Kafka/Redpanda — Débogage avec commandes Admin API
Nouveaux endpoints curl pour tester le flux Kafka complet, avec tip --follow

API Documentation

Endpoints Kafka mis en gras + 🆕 dans les tableaux EHR et Lab

Dépannage

Section Kafka séparée couvrant les 4 problèmes rencontrés (ECONNREFUSED, Consumer Group, topics, rebuild)
<div align="center">

# 🏥 MyHeart Healthcare System

<img src="https://img.shields.io/badge/version-3.0.0-blue.svg" alt="Version 3.0.0">
<img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License MIT">
<img src="https://img.shields.io/badge/Spring%20Boot-3.0-brightgreen" alt="Springpastedil faut que tu donnes tous dans une sule markdwon juste seule et que <div align="center">
  <sub>🏥 MyHeart Healthcare System v3.0 — Mini-Projet SOA — INPT Filière SUD — 2025/2026</sub>
</div> reste affiche comme ca apparit <div align="center">17:52markdown<div align="center">

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
<img src="https://img.shields.io/badge/pattern-SAGA-purple" alt="SAGA">

**Plateforme intégrée de gestion de santé — Architecture Microservices, Docker, API Gateway, Circuit Breakers, Consul, Kafka/Redpanda, Pattern SAGA & Chatbot Multilingue**

*Mini-Projet SOA — Institut National des Postes et Télécommunications (INPT) — Filière SUD — 2025/2026*

[🚀 Démarrage rapide](#-installation-et-démarrage) · [📐 Architecture](#-architecture) · [⚡ Kafka & SAGA](#-communication-asynchrone-kafkaredpanda) · [📡 API](#-api-documentation) · [🤖 Chatbot](#-chatbot-multilingue) · [👥 Auteurs](#-auteurs)

</div>

---

## 📋 Table des matières

- [Aperçu du projet](#-aperçu-du-projet)
- [Nouveautés v3.0](#-nouveautés-v30--kafkaredpanda--pattern-saga)
- [Nouveautés v2.0](#-nouveautés-v20-rappel)
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

**MyHeart Healthcare System** est une plateforme complète de gestion des soins de santé construite sur une architecture **microservices event-driven**. Elle permet la gestion centralisée des patients, rendez-vous, dossiers médicaux, prescriptions, analyses de laboratoire et facturation — le tout via une interface React moderne, une API Gateway sécurisée et un bus d'événements Kafka.

| Couche | Technologies |
|--------|-------------|
| Frontend | React 18, Context API |
| Backend Java | Spring Boot 3.0 (Patient, Appointment, Billing, Pharmacy) |
| Backend Node.js | Express (EHR, Lab) |
| Bases de données | PostgreSQL 15, MongoDB 6 |
| Infra | Docker 24, Docker Compose |
| Gateway & Résilience | Node.js API Gateway, Opossum Circuit Breaker |
| Service Discovery | Consul 1.17 |
| Messagerie asynchrone | **Redpanda v23.1 (Kafka-compatible)** |
| Transactions distribuées | **Pattern SAGA** |
| Assistant virtuel | Chatbot local FR/EN/AR |

---

## 🆕 Nouveautés v3.0 — Kafka/Redpanda & Pattern SAGA

> Version majeure introduisant la **communication asynchrone event-driven** entre les microservices EHR et Laboratoire.

### ⚡ Bus d'événements Kafka / Redpanda

Remplacement des appels REST synchrones EHR ↔ Lab par un broker de messages **Redpanda** Kafka-compatible. Les services sont désormais totalement découplés.
```
EHR Service ──[lab-orders]──────────────▶ Redpanda ──[lab-orders]──────────────▶ Lab Service
EHR Service ◀──[lab-results]────────────── Redpanda ◀──[lab-results]────────────── Lab Service
EHR Service ◀──[ehr-notifications]──────── Redpanda ◀──[ehr-notifications]──────── Lab Service
```

### 📨 Topics Kafka créés

| Topic | Direction | Partitions | Rôle |
|-------|-----------|-----------|------|
| `lab-orders` | EHR → Lab | 3 | Demandes d'analyses médicales |
| `lab-results` | Lab → EHR | 3 | Résultats des analyses traitées |
| `ehr-notifications` | Lab → EHR | 3 | Notifications de statut (résultats prêts, urgences) |

### 🔄 Pattern SAGA — Transactions distribuées

Chaque demande d'analyse suit une chaîne d'événements traçable via le champ `sagaStep` :
```
LAB_ORDER_CREATED ──▶ [lab-orders] ──▶ LAB_RESULTS_PRODUCED ──▶ [lab-results] ──▶ NOTIFICATION_SENT
```

### 🚨 Détection automatique d'anomalies biologiques

Le EHR Consumer analyse en temps réel les résultats reçus et déclenche une alerte automatique si une valeur sort des normes :

| Analyse | Code | Norme |
|---------|------|-------|
| Glycémie | `GLU` | 70 – 110 mg/dL |
| Cholestérol | `CHOL` | 0 – 200 mg/dL |
| Hémoglobine | `HB` | 120 – 170 g/L |

### 🔧 Correction clé — `--advertise-kafka-addr`

Sans ce flag, Redpanda annonce `0.0.0.0:9092` dans ses métadonnées broker, rendant la connexion impossible depuis les autres conteneurs Docker.
```yaml
# docker-compose.yml — configuration Redpanda corrigée
redpanda:
  command:
    - redpanda
    - start
    - --kafka-addr 0.0.0.0:9092
    - --advertise-kafka-addr redpanda:9092   # ← CORRECTION CLÉ
```

### ✅ Fonctionnalités implémentées

| Fonctionnalité | Statut |
|---------------|--------|
| Envoi asynchrone des demandes d'analyses | ✅ Implémenté |
| Traitement automatique par Lab Service | ✅ Implémenté |
| Génération et renvoi des résultats | ✅ Implémenté |
| Détection automatique des anomalies biologiques | ✅ Implémenté |
| Notifications en temps réel (`LAB_RESULTS_READY`) | ✅ Implémenté |
| Monitoring de l'état Kafka via API | ✅ Implémenté |
| Reconnexion stable du Consumer Group | ✅ Implémenté |

---

## 🆕 Nouveautés v2.0 (rappel)

### ⚡ API Gateway centralisée

Point d'entrée unique (port **8080**) avec gestion unifiée du CORS, de la sécurité et des logs.
```
React :3000  →  API Gateway :8080  →  Microservices :8081–8087
```

### 🔒 Circuit Breakers (Opossum)

Protection contre les pannes en cascade. Trois états : **Fermé** → **Mi-ouvert** → **Ouvert**.

| Paramètre | Valeur |
|-----------|--------|
| Timeout | 5 secondes |
| Seuil d'ouverture | 80 % d'échecs |
| Délai de reprise | 30 secondes |
| Fenêtre d'analyse | 10 secondes |

### 🗺️ Service Discovery — Consul

Enregistrement automatique des services Node.js au démarrage. Health checks toutes les **10 secondes** sur `/health`. Interface web : `http://localhost:8500`.

| Service enregistré | Port | Health Check |
|-------------------|------|-------------|
| ehr-service | 8084 | `/health` — 10s |
| lab-service | 8085 | `/health` — 10s |

### 🤖 Chatbot multilingue

Assistant virtuel intégré sur toutes les pages (bouton flottant). Base locale de **250+ réponses** en français, anglais et arabe. Adapté à chaque profil utilisateur.

---

## 📐 Architecture
```
myheart-healthcare-system/
├── backend/
│   ├── api-gateway/              # API Gateway Node.js (port 8080)
│   │   ├── index.js              # Circuit Breakers Opossum
│   │   └── package.json
│   ├── patient-service/          # Spring Boot — PostgreSQL :8081
│   ├── appointment-service/      # Spring Boot — PostgreSQL :8082
│   ├── billing-service/          # Spring Boot — PostgreSQL :8083
│   ├── ehr-service/              # Node.js — MongoDB :8084
│   │   └── kafka/
│   │       ├── producer.js       # Publie sur lab-orders
│   │       └── consumer.js       # Consomme lab-results, ehr-notifications
│   ├── lab-service/              # Node.js — MongoDB :8085
│   │   └── kafka/
│   │       ├── consumer.js       # Consomme lab-orders
│   │       └── producer.js       # Publie sur lab-results, ehr-notifications
│   ├── pharmacy-service/         # Spring Boot — PostgreSQL :8087
│   └── docker-compose.yml        # Inclut Redpanda v23.1.7 + healthchecks
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
```

### Vue d'ensemble — Architecture v3.0
```
┌──────────────────────────────────────────────────────────────────┐
│                      React Frontend :3000                        │
└─────────────────────────────┬────────────────────────────────────┘
                              │ HTTP
┌─────────────────────────────▼────────────────────────────────────┐
│             API Gateway :8080  +  Circuit Breakers               │
└──┬──────────┬──────────┬──────────┬──────────┬───────────────────┘
   │          │          │          │          │
:8081      :8082      :8083      :8084      :8085      :8087
Patient  Appoint.  Billing    EHR ──┐    Lab ──┐  Pharmacy
Service  Service   Service  Service │  Service │   Service
   │        │         │        │   │   Kafka  │      │
PG:5432  PG:5433  PG:5434  Mongo  └──▶:9092◀──┘  PG:5435
                           :27017   Redpanda    Mongo:27018
                                  (Consul:8500)
```

---

## 🔧 Prérequis

- **Docker** 24.0+ et **Docker Compose**
- **Node.js** v18+ (frontend, API Gateway, EHR, Lab)
- **Java** 17+ (services Spring Boot)
- **Git** 2.40+

> ⚠️ **Note v3.0** — Redpanda démarre via Docker Compose. Aucune installation Kafka locale n'est nécessaire.

---

## 🚀 Installation et démarrage

### 1. Cloner le projet
```bash
git clone https://github.com/NASRHOUDA/myheart-healthcare-system.git
cd myheart-healthcare-system
```

### 2. Lancer tous les services backend (incluant Redpanda)
```bash
cd backend
docker-compose up -d --build
```

> ⏳ Redpanda démarre avant EHR et Lab grâce aux `depends_on` avec `condition: service_healthy`. Attendre ~15 secondes.

### 3. Vérifier que tous les conteneurs sont lancés
```bash
docker ps
# Attendu : redpanda, ehr-service, lab-service, patient-service,
#           appointment-service, billing-service, pharmacy-service,
#           ehr-db, lab-db, consul + bases PostgreSQL (16 conteneurs)
```

### 4. Lancer le frontend
```bash
cd frontend
npm install
npm start
# Application disponible sur http://localhost:3000
```

### 5. Vérifier les connexions Kafka
```bash
# Statut Kafka EHR Service
curl http://localhost:8084/api/kafka/status

# Statut Kafka Lab Service
curl http://localhost:8085/api/kafka/status
```

Réponse attendue :
```json
{
  "service": "ehr-service",
  "kafka": {
    "producer": "connected",
    "consumer": "connected",
    "brokers":  "redpanda:9092",
    "groupId":  "ehr-group",
    "topics":   ["lab-results", "ehr-notifications"]
  },
  "timestamp": "2026-03-14T16:35:48.700Z"
}
```

### 6. Vérifier les interfaces de monitoring *(optionnel)*

| Interface | URL |
|-----------|-----|
| Consul UI | http://localhost:8500 |
| Redpanda Admin API | http://localhost:9644/v1/status/ready |
| EHR Kafka Status | http://localhost:8084/api/kafka/status |
| Lab Kafka Status | http://localhost:8085/api/kafka/status |

---

## 📡 Structure des services

### Backend — Microservices

| Service | Port | Base de données | Technologie | Rôle Kafka |
|---------|------|----------------|-------------|-----------|
| api-gateway | **8080** | — | Node.js | — |
| patient-service | 8081 | PostgreSQL :5432 | Spring Boot | — |
| appointment-service | 8082 | PostgreSQL :5433 | Spring Boot | — |
| billing-service | 8083 | PostgreSQL :5434 | Spring Boot | — |
| ehr-service | 8084 | MongoDB :27017 | Node.js | **Producer + Consumer** |
| lab-service | 8085 | MongoDB :27018 | Node.js | **Producer + Consumer** |
| pharmacy-service | 8087 | PostgreSQL :5435 | Spring Boot | — |
| **redpanda** | **9092 / 9644** | — | Redpanda | **Message Broker** |

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

| Composant | Port | Version |
|-----------|------|---------|
| Frontend React | 3000 | |
| API Gateway | **8080** | |
| Patient Service | 8081 | |
| Appointment Service | 8082 | |
| Billing Service | 8083 | |
| EHR Service | 8084 | |
| Lab Service | 8085 | |
| Pharmacy Service | 8087 | |
| Consul UI | **8500** | |
| **Redpanda — Kafka API** | **9092** | 🆕 v3.0 |
| **Redpanda — Admin API** | **9644** | 🆕 v3.0 |
| patient-db (PostgreSQL) | 5432 | |
| appointment-db (PostgreSQL) | 5433 | |
| billing-db (PostgreSQL) | 5434 | |
| pharmacy-db (PostgreSQL) | 5435 | |
| ehr-db (MongoDB) | 27017 | |
| lab-db (MongoDB) | 27018 | |

---

## ⚡ Communication asynchrone Kafka/Redpanda

### Flux complet — Pattern SAGA
```
1. Médecin crée une demande via POST /api/ehr/:patientId/lab-request
          │
          ▼
2. EHR Producer publie sur [lab-orders]  ──▶  Redpanda
          │
          ▼
3. Lab Consumer reçoit la demande  (sagaStep: LAB_ORDER_CREATED)
          │
          ▼
4. Lab Service traite les analyses (CBC, GLU, CHOL…)
          │
          ▼
5. Lab Producer publie sur [lab-results] + [ehr-notifications]  (sagaStep: LAB_RESULTS_PRODUCED)
          │
          ▼
6. EHR Consumer reçoit les résultats
          │
          ▼
7. Détection automatique des anomalies biologiques
   Mise à jour du dossier patient dans MongoDB  (sagaStep: NOTIFICATION_SENT)
```

### Variables d'environnement Kafka

| Variable | Valeur | Description |
|----------|--------|-------------|
| `KAFKA_BROKERS` | `redpanda:9092` | Adresse du broker |
| `KAFKA_CLIENT_ID` | `ehr-service` / `lab-service` | Identifiant client KafkaJS |
| `KAFKA_GROUP_ID` | `ehr-group` / `lab-group` | Groupe de consommateurs |

### Tester le pipeline Kafka complet
```bash
# 1. Vérifier le statut Kafka
curl http://localhost:8084/api/kafka/status

# 2. Envoyer une demande d'analyse (déclenche tout le flux SAGA)
curl -X POST http://localhost:8084/api/ehr/12345/lab-request \
  -H "Content-Type: application/json" \
  -d '{
    "patientName": "Jean Dupont",
    "doctorId":    "DR001",
    "tests": [
      { "testCode": "CBC",  "testName": "Numération formule sanguine" },
      { "testCode": "GLU",  "testName": "Glycémie"                   },
      { "testCode": "CHOL", "testName": "Cholestérol total"          }
    ],
    "priority": "URGENT"
  }'

# 3. Suivre les logs en temps réel
docker logs lab-service --follow    # Réception + traitement
docker logs ehr-service --follow    # Résultats + détection anomalies
```

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

### 👨‍⚕️ Médecin
```
Email        : youssef.benjelloun@gmail.com
Mot de passe : youssef123
```

### 👤 Patient
```
Email        : ahmed.allami@gmail.com
Mot de passe : ahmed123
```

### 💊 Pharmacien
```
Email        : nadiafassi67@gmail.com
Mot de passe : nadia123
```

---

## 🛠 Commandes utiles

### Docker — Services généraux
```bash
docker ps                          # Voir tous les conteneurs actifs
docker logs ehr-service            # Logs EHR
docker logs lab-service            # Logs Lab
docker logs redpanda               # Logs Redpanda
docker restart ehr-service         # Redémarrer un service
docker-compose down                # Arrêter tout
docker-compose up -d               # Relancer tout
docker-compose up -d --build       # Reconstruire après modification
```

### Kafka / Redpanda — Débogage v3.0
```bash
# Statut Kafka des services
curl http://localhost:8084/api/kafka/status
curl http://localhost:8085/api/kafka/status

# Santé Redpanda
curl http://localhost:9644/v1/status/ready

# Topics disponibles
curl http://localhost:9644/v1/topics

# Test envoi message Kafka
curl -X POST http://localhost:8084/api/test/kafka \
  -H "Content-Type: application/json" \
  -d '{"message": "test"}'

# Logs en direct
docker logs ehr-service --follow
docker logs lab-service --follow
```

### Frontend
```bash
npm start          # Démarrer en développement
npm run build      # Build production
npm test           # Lancer les tests
```

---

## 🧪 Tests API avec curl

### Services existants (via API Gateway)
```bash
# Patients
curl http://localhost:8080/api/patients

# Rendez-vous d'un patient
curl http://localhost:8080/api/appointments/patient/1

# Médicaments
curl http://localhost:8080/api/medications

# Dossier médical
curl http://localhost:8080/api/ehr/patient/1

# Analyses laboratoire
curl http://localhost:8080/api/lab/patient/1

# Santé des services (Consul)
curl http://localhost:8084/health
curl http://localhost:8085/health
```

### Nouveaux endpoints Kafka — v3.0
```bash
# Statut Kafka EHR
curl http://localhost:8084/api/kafka/status

# Statut Kafka Lab
curl http://localhost:8085/api/kafka/status

# Envoyer une demande d'analyse (déclenche le flux Kafka complet)
curl -X POST http://localhost:8084/api/ehr/1/lab-request \
  -H "Content-Type: application/json" \
  -d '{
    "tests": [{"testCode": "GLU", "testName": "Glycémie"}],
    "priority": "NORMAL"
  }'
```

> 💡 Les requêtes métier passent par l'API Gateway sur le port **8080**.
> Les endpoints Kafka sont accessibles directement sur les ports des services.

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
| **POST** | **`/api/ehr/:patientId/lab-request`** | **🆕 Envoyer demande analyse via Kafka** |
| **GET** | **`/api/kafka/status`** | **🆕 Statut Producer/Consumer Kafka** |
| **POST** | **`/api/test/kafka`** | **🆕 Test envoi message Kafka** |
| GET | `/health` | Health check Consul |

### Lab Service — `/api/lab` *(+ Kafka v3.0)*

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/lab` | Liste toutes les analyses |
| GET | `/api/lab/patient/{patientId}` | Analyses d'un patient |
| POST | `/api/lab` | Créer une analyse |
| PATCH | `/api/lab/{id}` | Mettre à jour une analyse |
| **GET** | **`/api/kafka/status`** | **🆕 Statut Producer/Consumer Kafka** |
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

### Problèmes Kafka / Redpanda

**`ECONNREFUSED 0.0.0.0:9092` — Kafka ne se connecte pas**
```bash
# Vérifier que Redpanda est healthy
docker ps | grep redpanda
docker logs redpanda --tail 20
# Vérifier que --advertise-kafka-addr est présent dans docker-compose.yml
# puis reconstruire
docker-compose down && docker-compose up -d --build
```

**Consumer Kafka crashe en boucle**
```bash
docker-compose down
docker-compose up -d --build
docker logs ehr-service --follow
```

**Messages non reçus entre EHR et Lab**
```bash
# Vérifier que les topics existent
curl http://localhost:9644/v1/topics
# Suivre les logs en direct
docker logs ehr-service --follow
docker logs lab-service --follow
```

### Problèmes généraux

**"Empty reply from server"**
```bash
docker logs lab-service    # Vérifier les logs du service concerné
```

**Port déjà utilisé**
```bash
# Linux / Mac
lsof -i :9092
# Windows
netstat -ano | findstr :9092
```

**Services Consul non enregistrés**
```bash
docker logs ehr-service
docker logs lab-service
# Ouvrir l'interface Consul
open http://localhost:8500
```

**Le frontend ne se connecte pas à l'API**
> Vérifier que l'API Gateway tourne sur le port **8080** et que le `.env` du frontend pointe vers `http://localhost:8080`.

**Les modifications frontend ne s'affichent pas**
> Vider le cache navigateur `Ctrl + F5` ou redémarrer le serveur de développement.

**`docker-compose restart` n'applique pas les modifications**
> Utiliser systématiquement `docker-compose up -d --build`.

---

## 👨‍💻 Auteurs

**NASRHOUDA** — *Data DevOps Cloud Engineer*

[![GitHub](https://img.shields.io/badge/GitHub-NASRHOUDA-black?logo=github)](https://github.com/NASRHOUDA)

---

## 📄 Licence

Ce projet est sous licence **MIT**. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

| Version | Date | Changements majeurs |
|---------|------|-------------------|
| v3.0.0 | Mars 2026 | Kafka/Redpanda · Pattern SAGA · Détection anomalies biologiques |
| v2.0.0 | 2025 | API Gateway · Circuit Breakers · Consul · Chatbot FR/EN/AR |
| v1.0.0 | 2025 | Version initiale microservices |

<div align="center">
  <sub>🏥 MyHeart Healthcare System v3.0 — Mini-Projet SOA — INPT Filière SUD — 2025/2026</sub>
</div>
