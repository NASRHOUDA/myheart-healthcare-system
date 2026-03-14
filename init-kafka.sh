#!/bin/bash

echo "🚀 Attente du démarrage de Kafka..."
sleep 20

echo "📝 Création des topics Kafka pour ehr-service et lab-service..."

# Création des topics
docker exec kafka kafka-topics --bootstrap-server localhost:9092 \
  --create --if-not-exists \
  --topic lab-orders \
  --partitions 3 \
  --replication-factor 1

docker exec kafka kafka-topics --bootstrap-server localhost:9092 \
  --create --if-not-exists \
  --topic lab-results \
  --partitions 3 \
  --replication-factor 1

docker exec kafka kafka-topics --bootstrap-server localhost:9092 \
  --create --if-not-exists \
  --topic ehr-notifications \
  --partitions 3 \
  --replication-factor 1

echo "✅ Topics créés avec succès!"
echo ""
echo "📋 Liste des topics:"
docker exec kafka kafka-topics --bootstrap-server localhost:9092 --list

echo ""
echo "🌐 Kafka UI disponible sur: http://localhost:8087 (optionnel)"