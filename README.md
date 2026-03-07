<div align="center">

# 🏥 MyHeart Healthcare System

<img src="https://img.shields.io/badge/version-2.0.0-blue.svg" alt="Version 2.0.0">
<img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License MIT">
<img src="https://img.shields.io/badge/Spring%20Boot-3.0-brightgreen" alt="Spring Boot">
<img src="https://img.shields.io/badge/React-18-blue" alt="React">
<img src="https://img.shields.io/badge/Node.js-18-green" alt="Node.js">
<img src="https://img.shields.io/badge/Docker-24.0-cyan" alt="Docker">
<img src="https://img.shields.io/badge/PostgreSQL-15-blue" alt="PostgreSQL">
<img src="https://img.shields.io/badge/MongoDB-6-green" alt="MongoDB">
<img src="https://img.shields.io/badge/Consul-1.17-pink" alt="Consul">

**Plateforme intégrée de gestion de santé — Architecture Microservices, Docker, API Gateway, Circuit Breakers, Consul & Chatbot Multilingue**

*Mini-Projet SOA — Institut National des Postes et Télécommunications (INPT) — Filière SUD*

[🚀 Démarrage rapide](#-installation-et-démarrage) · [📐 Architecture](#-architecture) · [📡 API](#-api-documentation) · [🤖 Chatbot](#-chatbot-multilingue) · [👥 Auteurs](#-auteurs)

</div>

---

## 📋 Table des matières

- [Aperçu du projet](#-aperçu-du-projet)
- [Nouveautés v2.0](#-nouveautés-v20)
- [Architecture](#-architecture)
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

**MyHeart Healthcare System** est une plateforme complète de gestion des soins de santé construite sur une architecture microservices. Elle permet la gestion centralisée des patients, rendez-vous, dossiers médicaux, prescriptions, analyses de laboratoire et facturation — le tout via une interface React moderne et une API sécurisée.

| Couche | Technologies |
|--------|-------------|
| Frontend | React 18, Context API |
| Backend Java | Spring Boot 3.0 (Patient, Appointment, Billing, Pharmacy) |
| Backend Node.js | Express (EHR, Lab) |
| Bases de données | PostgreSQL 15, MongoDB 6 |
| Infra | Docker 24, Docker Compose |
| Gateway & Résilience | Node.js API Gateway, Opossum Circuit Breaker |
| Service Discovery | Consul 1.17 |
| Assistant virtuel | Chatbot local FR/EN/AR |

---

## 🆕 Nouveautés v2.0

### ⚡ API Gateway centralisée
Un point d'entrée unique (port **8080**) achemine toutes les requêtes du frontend React vers les 6 microservices. Gestion unifiée du CORS, de la sécurité et des logs.

```
React :3000  →  API Gateway :8080  →  Microservices :8081–8087
```

### 🔒 Circuit Breakers (Opossum)
Protection contre les pannes en cascade sur l'API Gateway. Trois états : **Fermé** → **Mi-ouvert** → **Ouvert**. Fallback automatique avec message d'erreur propre, reprise après 30 secondes.

| Paramètre | Valeur |
|-----------|--------|
| Timeout | 5 secondes |
| Seuil d'ouverture | 80 % d'échecs |
| Délai de reprise | 30 secondes |
| Fenêtre d'analyse | 10 secondes |

### 🗺️ Service Discovery — Consul
Enregistrement automatique des services Node.js au démarrage. Health checks toutes les **10 secondes** sur `/health`. Interface web disponible sur `http://localhost:8500`.

| Service enregistré | Port | Health Check |
|-------------------|------|-------------|
| ehr-service | 8084 | `/health` — 10s |
| lab-service | 8085 | `/health` — 10s |

### 🤖 Chatbot multilingue
Assistant virtuel intégré sur toutes les pages (bouton flottant). Base locale de **250+ réponses** en français, anglais et arabe. Adapté à chaque profil utilisateur (Patient, Médecin, Labo, Pharmacie, Réception).

---

## 📐 Architecture

```
myheart-healthcare-system/
├── backend/
│   ├── api-gateway/              # API Gateway Node.js (port 8080)
│   │   ├── index.js
│   │   └── package.json
│   ├── patient-service/          # Spring Boot — PostgreSQL :8081
│   ├── appointment-service/      # Spring Boot — PostgreSQL :8082
│   ├── billing-service/          # Spring Boot — PostgreSQL :8083
│   ├── ehr-service/              # Node.js — MongoDB :8084
│   ├── lab-service/              # Node.js — MongoDB :8085
│   ├── pharmacy-service/         # Spring Boot — PostgreSQL :8087
│   └── docker-compose.yml
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

---

## 🔧 Prérequis

- **Docker** 24.0+ et **Docker Compose**
- **Node.js** v18+ (frontend + API Gateway + services EHR/Lab)
- **Java** 17+ (services Spring Boot)
- **Git** 2.40+

---

## 🚀 Installation et démarrage

### 1. Cloner le projet

```bash
git clone https://github.com/NASRHOUDA/myheart-healthcare-system.git
cd myheart-healthcare-system
```

### 2. Lancer tous les services backend avec Docker

```bash
cd backend
docker-compose up -d
```

### 3. Lancer l'API Gateway

```bash
cd backend/api-gateway
npm install
node index.js
# Gateway disponible sur http://localhost:8080
```

### 4. Vérifier que tous les conteneurs sont lancés

```bash
docker ps
```

### 5. Lancer le frontend

```bash
cd frontend
npm install
npm start
# Application disponible sur http://localhost:3000
```

### 6. Vérifier Consul *(optionnel)*

Ouvrir `http://localhost:8500` dans le navigateur pour voir les services enregistrés.

---

## 📡 Structure des services

### Backend — Microservices

| Service | Port | Base de données | Technologie | Description |
|---------|------|----------------|-------------|-------------|
| api-gateway | **8080** | — | Node.js | Point d'entrée unique + Circuit Breakers |
| patient-service | 8081 | PostgreSQL :5432 | Spring Boot | Gestion des patients & auth |
| appointment-service | 8082 | PostgreSQL :5433 | Spring Boot | Rendez-vous |
| billing-service | 8083 | PostgreSQL :5434 | Spring Boot | Facturation |
| ehr-service | 8084 | MongoDB :27017 | Node.js | Dossiers médicaux |
| lab-service | 8085 | MongoDB :27018 | Node.js | Laboratoire |
| pharmacy-service | 8087 | PostgreSQL :5435 | Spring Boot | Pharmacie |

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
| Consul UI | **8500** |
| patient-db (PostgreSQL) | 5432 |
| appointment-db (PostgreSQL) | 5433 |
| billing-db (PostgreSQL) | 5434 |
| pharmacy-db (PostgreSQL) | 5435 |
| ehr-db (MongoDB) | 27017 |
| lab-db (MongoDB) | 27018 |

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
Email    : youssef.benjelloun@gmail.com
Mot de passe : youssef123
```

### 👤 Patient
```
Email    : ahmed.allami@gmail.com
Mot de passe : ahmed123
```

### 💊 Pharmacien
```
Email    : nadiafassi67@gmail.com
Mot de passe : nadia123
```

---

## 🛠 Commandes utiles

### Docker

```bash
# Voir tous les conteneurs actifs
docker ps

# Logs d'un service
docker logs ehr-service
docker logs lab-service

# Redémarrer un service
docker restart lab-service

# Arrêter tout
docker-compose down

# Relancer tout
docker-compose up -d

# Reconstruire après modification
docker-compose up -d --build
```

### Frontend

```bash
npm start          # Démarrer en développement
npm run build      # Build production
npm test           # Lancer les tests
```

---

## 🧪 Tests API avec curl

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

# Santé des services Node.js (Consul)
curl http://localhost:8084/health
curl http://localhost:8085/health
```

> 💡 Toutes les requêtes passent désormais par l'API Gateway sur le port **8080**.

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

### EHR Service — `/api/ehr`

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/` | Liste tous les dossiers médicaux |
| GET | `/patient/{patientId}` | Dossiers d'un patient |
| POST | `/` | Créer un dossier médical |
| GET | `/health` | Health check Consul |

### Lab Service — `/api/lab`

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/` | Liste toutes les analyses |
| GET | `/patient/{patientId}` | Analyses d'un patient |
| POST | `/` | Créer une analyse |
| PATCH | `/{id}` | Mettre à jour une analyse |
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

**"Empty reply from server"**
```bash
docker logs lab-service   # Vérifier les logs du service concerné
```

**Port déjà utilisé**
```bash
# Windows
netstat -ano | findstr :8087
# Linux / Mac
lsof -i :8087
```

**Services Consul non enregistrés**
```bash
# Vérifier que les services Node.js tournent
docker logs ehr-service
docker logs lab-service
# Ouvrir l'interface Consul
open http://localhost:8500
```

**Le frontend ne se connecte pas à l'API**
> Vérifier que l'API Gateway tourne sur le port 8080 et que le `.env` du frontend pointe bien vers `http://localhost:8080`.

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
  <sub>🏥 MyHeart Healthcare System v2.0 — Mini-Projet SOA — INPT Filière SUD — 2025/2026</sub>
</div>
