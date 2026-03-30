<div align="center">

<img src="heartapp.PNG" alt="MyHeart Logo" width="120"/>

# MyHeart Healthcare System

### Plateforme intégrée de gestion de santé

*Architecture Microservices · API Gateway · Circuit Breakers · Consul · Kafka/Redpanda · Pattern SAGA · Chatbot Multilingue*

[![Version](https://img.shields.io/badge/version-3.0.0-3B6D11?style=flat-square)](https://github.com/NASRHOUDA/myheart-healthcare-system)
[![License](https://img.shields.io/badge/license-MIT-639922?style=flat-square)](LICENSE)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.0-6DB33F?style=flat-square&logo=springboot&logoColor=white)](https://spring.io)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-18-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![Docker](https://img.shields.io/badge/Docker-24.0-2496ED?style=flat-square&logo=docker&logoColor=white)](https://docker.com)
[![Kafka](https://img.shields.io/badge/Kafka-Redpanda-FF4500?style=flat-square&logo=apachekafka&logoColor=white)](https://redpanda.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://postgresql.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-6-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://mongodb.com)
[![Consul](https://img.shields.io/badge/Consul-1.17-F24C53?style=flat-square&logo=consul&logoColor=white)](https://consul.io)
[![SAGA](https://img.shields.io/badge/pattern-SAGA-7F77DD?style=flat-square)](https://microservices.io/patterns/data/saga.html)

<br/>

*Mini-Projet SOA — Institut National des Postes et Télécommunications (INPT) — Filière SUD — 2025/2026*

<br/>

[Architecture](#-architecture) · [Kafka & SAGA](#-communication-asynchrone--kafka--pattern-saga) · [Démarrage](#-installation-et-démarrage) · [Services](#-structure-des-services) · [Chatbot](#-chatbot-multilingue) · [API](#-api-documentation) · [Dépannage](#-dépannage)

</div>

---

## 📋 Description

**MyHeart Healthcare System** est une plateforme complète de gestion des soins de santé construite sur une architecture **microservices event-driven**. Elle permet la gestion centralisée des patients, rendez-vous, dossiers médicaux, prescriptions, analyses de laboratoire et facturation — le tout via une interface React moderne, une API Gateway sécurisée et un bus d'événements Kafka.

| Couche | Technologies |
|---|---|
| **Frontend** | React 18, Context API |
| **Backend Java** | Spring Boot 3.0 (Patient, Appointment, Billing, Pharmacy) |
| **Backend Node.js** | Express (EHR, Lab) |
| **Bases de données** | PostgreSQL 15, MongoDB 6 |
| **Infrastructure** | Docker 24, Docker Compose |
| **Gateway & Résilience** | Node.js API Gateway, Opossum Circuit Breaker |
| **Service Discovery** | Consul 1.17 |
| **Messaging asynchrone** | Apache Kafka / Redpanda v23.1.7 |
| **Transactions distribuées** | Pattern SAGA |
| **Assistant virtuel** | Chatbot local FR / EN / AR |

---

## 🆕 Nouveautés

<details>
<summary><strong>v3.0.0 — 14 Mars 2026</strong> (version actuelle)</summary>

### 🔀 Bus d'événements Kafka / Redpanda

Remplacement des appels REST synchrones entre EHR et Lab par un bus de messages Kafka-compatible (Redpanda). Les services sont désormais totalement découplés.

```
EHR Service  ──[lab-orders]──▶  Redpanda  ──[lab-orders]──▶  Lab Service
EHR Service  ◀──[lab-results]──  Redpanda  ◀──[lab-results]──  Lab Service
EHR Service  ◀──[ehr-notifications]──  Redpanda  ◀──  Lab Service
```

| Topic | Direction | Partitions | Rôle |
|---|---|---|---|
| `lab-orders` | EHR → Lab | 3 | Demandes d'analyses médicales |
| `lab-results` | Lab → EHR | 3 | Résultats d'analyses |
| `ehr-notifications` | Lab → EHR | 3 | Notifications de statut |

### 🔄 Pattern SAGA — Transactions distribuées

```
LAB_ORDER_CREATED  →  [lab-orders]  →  LAB_RESULTS_PRODUCED  →  [lab-results]  →  NOTIFICATION_SENT
```

### 🚨 Détection automatique d'anomalies biologiques

| Analyse | Code | Norme |
|---|---|---|
| Glycémie | `GLU` | 70 – 110 mg/dL |
| Cholestérol | `CHOL` | 0 – 200 mg/dL |
| Hémoglobine | `HB` | 120 – 170 g/L |

### 🔧 Correction ECONNREFUSED 0.0.0.0:9092
Résolution via le flag `--advertise-kafka-addr redpanda:9092` et remplacement des IPs hardcodées par la variable `KAFKA_BROKERS`.

</details>

<details>
<summary><strong>v2.0.0 — 7 Mars 2026</strong></summary>

### ⚡ API Gateway centralisée
Point d'entrée unique (port **8080**) avec gestion unifiée du CORS, de la sécurité et des logs.

```
React :3000  →  API Gateway :8080  →  Microservices :8081–8087
```

### 🔒 Circuit Breakers (Opossum)

| Paramètre | Valeur |
|---|---|
| Timeout | 5 secondes |
| Seuil d'ouverture | 80 % d'échecs |
| Délai de reprise | 30 secondes |

### 🗺️ Service Discovery — Consul
Enregistrement automatique + health checks toutes les **10 secondes**. Interface : `http://localhost:8500`.

### 🤖 Chatbot multilingue
250+ réponses locales en français, anglais et arabe. Bouton flottant sur toutes les pages.

</details>

<details>
<summary><strong>v1.0.0 — 1 Mars 2026</strong></summary>
Version initiale microservices.
</details>

---

## 📐 Architecture

### Vue d'ensemble v3.0

```
┌─────────────────────────────────────────────────────────────┐
│                    React Frontend :3000                     │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP
┌──────────────────────────▼──────────────────────────────────┐
│           API Gateway :8080  +  Circuit Breakers            │
└──┬────────┬────────┬────────┬────────┬──────────────────────┘
   │        │        │        │        │
:8081    :8082    :8083    :8084    :8085    :8087
Patient  Appoint  Billing   EHR ──┐  Lab ──┐  Pharmacy
Service  Service  Service  Svc   │  Svc   │  Service
   │        │        │      ▲    │    ▲   │     │
 PG:5432 PG:5433 PG:5434 Mongo  │  Kafka │  Mongo  PG:5435
                         :27017  │  :9092 │  :27018
                                 └──▶RP◀──┘
                               Redpanda :9092/:9644
                                (Consul :8500)
```

### Structure du projet

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
│   │       ├── producer.js       # Publie sur lab-results, ehr-notifications
│   │       └── consumer.js       # Consomme lab-orders
│   ├── pharmacy-service/         # Spring Boot — PostgreSQL :8087
│   └── docker-compose.yml        # Inclut Redpanda + healthchecks
│
└── frontend/
    └── src/
        ├── components/           # auth, patient, doctor, pharmacy, lab…
        ├── context/
        │   └── AuthContext.js
        └── App.js
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
7. Détection automatique des anomalies → mise à jour MongoDB
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
KAFKA_BROKERS:   redpanda:9092
KAFKA_CLIENT_ID: ehr-service     # ou lab-service
KAFKA_GROUP_ID:  ehr-group       # ou lab-group
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

### 1 — Cloner le projet

```bash
git clone https://github.com/NASRHOUDA/myheart-healthcare-system.git
cd myheart-healthcare-system
```

### 2 — Lancer tous les services backend

```bash
cd backend
docker-compose up -d
```

> ⏳ Attendre ~15 secondes que Redpanda passe son healthcheck avant que EHR et Lab se connectent.

### 3 — Vérifier les conteneurs

```bash
docker ps
# Attendu : redpanda, ehr-service, lab-service, patient-service,
#           appointment-service, billing-service, pharmacy-service,
#           ehr-db, lab-db, consul + bases PostgreSQL
```

### 4 — Lancer l'API Gateway

```bash
cd backend/api-gateway
npm install
node index.js
# Gateway disponible sur http://localhost:8080
```

### 5 — Lancer le frontend

```bash
cd frontend
npm install
npm start
# Application disponible sur http://localhost:3000
```

### 6 — Interfaces de monitoring *(optionnel)*

| Interface | URL |
|---|---|
| Consul UI | http://localhost:8500 |
| Redpanda Admin API | http://localhost:9644 |
| EHR Kafka Status | http://localhost:8084/api/kafka/status |
| Lab Kafka Status | http://localhost:8085/api/kafka/status |

---

## 📡 Structure des services

### Microservices Backend

| Service | Port | Base de données | Technologie | Rôle Kafka |
|---|---|---|---|---|
| `api-gateway` | **8080** | — | Node.js | — |
| `patient-service` | 8081 | PostgreSQL :5432 | Spring Boot | — |
| `appointment-service` | 8082 | PostgreSQL :5433 | Spring Boot | — |
| `billing-service` | 8083 | PostgreSQL :5434 | Spring Boot | — |
| `ehr-service` | 8084 | MongoDB :27017 | Node.js | **Producer + Consumer** |
| `lab-service` | 8085 | MongoDB :27018 | Node.js | **Producer + Consumer** |
| `pharmacy-service` | 8087 | PostgreSQL :5435 | Spring Boot | — |
| `redpanda` | **9092 / 9644** | — | Redpanda | **Message Broker** |

### Espaces utilisateurs Frontend

| Espace | URL | Profil |
|---|---|---|
| Connexion | `http://localhost:3000` | — |
| Patient | `/patient/dashboard` | 👤 Patient |
| Médecin | `/doctor/dashboard` | 👨‍⚕️ Médecin |
| Pharmacie | `/pharmacy/dashboard` | 💊 Pharmacien |
| Laboratoire | `/lab/dashboard` | 🔬 Biologiste |
| Réception | `/reception/dashboard` | 🏥 Agent d'accueil |
| Caisse | `/billing/dashboard` | 💰 Caissier |

### Ports complets

| Composant | Port |
|---|---|
| Frontend React | 3000 |
| API Gateway | **8080** |
| Patient Service | 8081 |
| Appointment Service | 8082 |
| Billing Service | 8083 |
| EHR Service | 8084 |
| Lab Service | 8085 |
| Pharmacy Service | 8087 |
| Consul UI | **8500** |
| Redpanda — Kafka API 🆕 | **9092** |
| Redpanda — Admin API 🆕 | **9644** |
| patient-db (PostgreSQL) | 5432 |
| appointment-db (PostgreSQL) | 5433 |
| billing-db (PostgreSQL) | 5434 |
| pharmacy-db (PostgreSQL) | 5435 |
| ehr-db (MongoDB) | 27017 |
| lab-db (MongoDB) | 27018 |

---

## 🤖 Chatbot Multilingue

Assistant virtuel **100 % hors ligne**, intégré sur toutes les pages via un bouton flottant.

| Caractéristique | Valeur |
|---|---|
| Base de réponses | 250+ entrées |
| Langues | 🇫🇷 Français · 🇬🇧 Anglais · 🇲🇦 Arabe |
| Temps de réponse | < 100 ms |

### Réponses par catégorie

| Catégorie | Réponses | Exemples |
|---|---|---|
| Laboratoire | 80+ | Glycémie, cholestérol, CRP, TSH |
| Médicaments | 30+ | Paracétamol, ibuprofène, antibiotiques |
| Pathologies | 40+ | Grippe, diabète, hypertension |
| Rendez-vous | 15+ | Prise, annulation, modification |
| Réception | 80+ | Inscription, accueil, planning |
| Anglais | 30+ | Questions courantes traduites |
| Arabe | 20+ | Support arabophones |

### Adaptation par profil

| Profil | Assistance |
|---|---|
| 👤 Patient | Rendez-vous, médicaments, factures |
| 👨‍⚕️ Médecin | Prescriptions, dossiers patients |
| 🔬 Laboratoire | Analyses, normes, résultats |
| 💊 Pharmacie | Stocks, délivrances, génériques |
| 🏥 Réception | Accueil, inscriptions, planning |

---

## 👥 Utilisateurs de démonstration

| Rôle | Email | Mot de passe |
|---|---|---|
| 👨‍⚕️ Médecin | youssef.benjelloun@gmail.com | youssef123 |
| 👤 Patient | ahmed.allami@gmail.com | ahmed123 |
| 💊 Pharmacien | nadiafassi67@gmail.com | nadia123 |

---

## 🛠️ Commandes utiles

### Docker

```bash
docker ps                          # Voir tous les conteneurs actifs
docker logs ehr-service            # Logs EHR
docker logs lab-service            # Logs Lab
docker restart lab-service         # Redémarrer un service
docker-compose down                # Arrêter tout
docker-compose up -d               # Relancer tout
docker-compose up -d --build       # Reconstruire après modification
```

### Kafka / Redpanda

```bash
# Statut Kafka des services
curl -s http://localhost:8084/api/kafka/status
curl -s http://localhost:8085/api/kafka/status

# Logs Redpanda
docker logs redpanda --tail 30

# Topics disponibles via Admin API
curl http://localhost:9644/v1/topics

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

## 🧪 Tests API

### Via API Gateway

```bash
curl http://localhost:8080/api/patients
curl http://localhost:8080/api/appointments/patient/1
curl http://localhost:8080/api/medications
curl http://localhost:8080/api/ehr/patient/1
curl http://localhost:8080/api/lab/patient/1
```

### Endpoints Kafka — v3.0 🆕

```bash
# Statut Kafka
curl -s http://localhost:8084/api/kafka/status | jq .
curl -s http://localhost:8085/api/kafka/status | jq .

# Envoyer une demande d'analyse (déclenche le flux Kafka complet)
curl -X POST http://localhost:8084/api/ehr/12345/lab-request \
  -H "Content-Type: application/json" \
  -d '{
    "patientName": "Jean Dupont",
    "doctorId":    "DR001",
    "tests": [
      { "testCode": "CBC",  "testName": "Numération formule sanguine" },
      { "testCode": "GLU",  "testName": "Glycémie" },
      { "testCode": "CHOL", "testName": "Cholestérol total" }
    ],
    "priority": "URGENT"
  }'
```

> 💡 Après le POST, surveiller les logs en temps réel :
> ```bash
> docker logs lab-service --follow   # Réception et traitement
> docker logs ehr-service --follow   # Résultats + alertes
> ```

---

## 📚 API Documentation

### Patient Service — `/api/patients` & `/api/auth`

| Méthode | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login` | Connexion |
| GET | `/api/patients` | Liste tous les patients |
| GET | `/api/patients/{id}` | Détail d'un patient |
| POST | `/api/patients` | Créer un patient |

### Appointment Service — `/api/appointments`

| Méthode | Endpoint | Description |
|---|---|---|
| GET | `/` | Liste tous les rendez-vous |
| GET | `/doctor/{doctorId}` | Rendez-vous d'un médecin |
| GET | `/patient/{patientId}` | Rendez-vous d'un patient |
| POST | `/` | Créer un rendez-vous |

### Billing Service — `/api/bills`

| Méthode | Endpoint | Description |
|---|---|---|
| GET | `/` | Liste toutes les factures |
| GET | `/{id}` | Détail d'une facture |
| GET | `/patient/{patientId}` | Factures d'un patient |
| POST | `/` | Créer une facture |
| PUT | `/{id}/pay` | Marquer comme payée |

### EHR Service — `/api/ehr` 🆕 Kafka

| Méthode | Endpoint | Description |
|---|---|---|
| GET | `/` | Liste tous les dossiers |
| GET | `/patient/{patientId}` | Dossiers d'un patient |
| POST | `/` | Créer un dossier |
| **POST** | **`/ehr/:patientId/lab-request`** | 🆕 Demande d'analyse via Kafka |
| **GET** | **`/kafka/status`** | 🆕 Statut Producer/Consumer |
| GET | `/health` | Health check Consul |

### Lab Service — `/api/lab` 🆕 Kafka

| Méthode | Endpoint | Description |
|---|---|---|
| GET | `/` | Liste toutes les analyses |
| GET | `/patient/{patientId}` | Analyses d'un patient |
| POST | `/` | Créer une analyse |
| PATCH | `/{id}` | Mettre à jour une analyse |
| **GET** | **`/kafka/status`** | 🆕 Statut Producer/Consumer |
| **POST** | **`/kafka/send-test-result`** | 🆕 Tester la publication Kafka |
| GET | `/health` | Health check Consul |

### Pharmacy Service — `/api/medications` & `/api/prescriptions`

| Méthode | Endpoint | Description |
|---|---|---|
| GET | `/medications` | Liste tous les médicaments |
| POST | `/medications` | Ajouter un médicament |
| GET | `/prescriptions` | Liste toutes les prescriptions |
| GET | `/prescriptions/patient/{patientId}` | Prescriptions d'un patient |
| POST | `/prescriptions` | Créer une prescription |
| PUT | `/prescriptions/{id}/cancel` | Annuler une prescription |

---

## ❓ Dépannage

### Problèmes généraux

| Problème | Solution |
|---|---|
| `Empty reply from server` | `docker logs <service>` pour identifier l'erreur |
| Port déjà utilisé | `lsof -i :<port>` (Linux/Mac) ou `netstat -ano \| findstr :<port>` (Windows) |
| Services Consul non enregistrés | Vérifier les logs EHR/Lab puis `http://localhost:8500` |
| Frontend ne se connecte pas | Vérifier que l'API Gateway tourne sur le port 8080 |

### Problèmes Kafka / Redpanda — v3.0

**`ECONNREFUSED 0.0.0.0:9092`**
```bash
# Vérifier le flag --advertise-kafka-addr dans docker-compose.yml puis :
docker-compose up -d --build
```

**Consumer Group non enregistré**
```bash
# Attendre ~15 secondes après démarrage, puis vérifier :
docker logs redpanda --tail 20
curl http://localhost:9644/v1/status/ready
```

**Messages non reçus entre EHR et Lab**
```bash
curl http://localhost:9644/v1/topics     # Vérifier que les topics existent
docker logs ehr-service --follow
docker logs lab-service --follow
```

**Modifications non prises en compte après restart**
```bash
# Toujours utiliser --build :
docker-compose up -d --build
```

---

## 👩‍💻 Auteure

**Houda Nasr** — DevOps Engineer & Full Stack Developer

[![Portfolio](https://img.shields.io/badge/Portfolio-mon--portfolio--dzf4.vercel.app-3B6D11?style=flat-square&logo=safari&logoColor=white)](https://mon-portfolio-dzf4.vercel.app)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Houda%20Nasr-0A66C2?style=flat-square&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/houda-nasr-16b9a032a/)
[![Email](https://img.shields.io/badge/Email-houdanasr520%40gmail.com-EA4335?style=flat-square&logo=gmail&logoColor=white)](mailto:houdanasr520@gmail.com)
[![GitHub](https://img.shields.io/badge/GitHub-NASRHOUDA-181717?style=flat-square&logo=github&logoColor=white)](https://github.com/NASRHOUDA)

---

## 📄 Licence

Ce projet est distribué sous licence **MIT**. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

<div align="center">

<img src="heartapp.PNG" alt="MyHeart" width="60"/>

| Version | Date | Changements |
|---|---|---|
| v3.0.0 | 14 Mars 2026 | Kafka/Redpanda · Pattern SAGA · Détection anomalies |
| v2.0.0 | 7 Mars 2026 | API Gateway · Circuit Breakers · Consul · Chatbot |
| v1.0.0 | 1 Mars 2026 | Version initiale microservices |

<br/>

** MyHeart Healthcare System v3.0 — Mini-Projet SOA — INPT Filière SUD — 2025/2026**

</div>
