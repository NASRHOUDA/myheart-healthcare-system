const { Kafka } = require('kafkajs');
const labProducer = require('./producer');

class LabConsumer {
  constructor() {
    this.kafka = new Kafka({
      clientId: process.env.KAFKA_CLIENT_ID || 'lab-service',
      brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(',')
    });
    this.consumer = this.kafka.consumer({ 
      groupId: process.env.KAFKA_GROUP_ID || 'lab-group' 
    });
  }

  async connect() {
    try {
      await this.consumer.connect();
      console.log('✅ Lab Consumer connected to Kafka');
    } catch (error) {
      console.error('❌ Lab Consumer connection error:', error.message);
    }
  }

  async subscribe() {
    try {
      // S'abonner aux ordres de laboratoire venant de ehr-service
      await this.consumer.subscribe({ 
        topic: 'lab-orders', 
        fromBeginning: false 
      });

      console.log('📥 Lab Consumer subscribed to topic: lab-orders');

      await this.consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          console.log('\n📥 Received lab order from Kafka:');
          console.log('   Topic:', topic);
          console.log('   Partition:', partition);
          console.log('   Offset:', message.offset);
          console.log('   Key:', message.key?.toString());
          
          try {
            const orderData = JSON.parse(message.value.toString());
            console.log('   Order Data:', JSON.stringify(orderData, null, 2));
            
            // Traiter l'ordre de laboratoire
            await this.processLabOrder(orderData);
          } catch (error) {
            console.error('   Error processing message:', error.message);
          }
        },
      });
    } catch (error) {
      console.error('❌ Error in Lab Consumer subscription:', error.message);
    }
  }

  async processLabOrder(orderData) {
    console.log('🔬 Processing lab order:', orderData.orderId);
    
    try {
      // Simuler le traitement en laboratoire (délai de 2 secondes)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Générer des résultats simulés
      const results = {
        orderId: orderData.orderId,
        patientId: orderData.patientId,
        patientName: orderData.patientName,
        tests: orderData.tests.map(test => ({
          testCode: test.testCode || test.testName,
          testName: test.testName || test.testCode,
          result: this.generateRandomResult(test.testCode),
          unit: this.getUnitForTest(test.testCode),
          normalRange: this.getNormalRange(test.testCode),
          status: 'completed',
          completedAt: new Date().toISOString()
        })),
        status: 'completed',
        completedBy: 'lab-technician',
        completedAt: new Date().toISOString(),
        notes: 'All tests completed successfully'
      };

      console.log('✅ Lab order processed:', orderData.orderId);
      console.log('   Results generated:', results.tests.length, 'tests');
      
      // Sauvegarder dans MongoDB (si vous voulez)
      // await this.saveResultsToDatabase(results);
      
      // Envoyer les résultats via Kafka
      await labProducer.sendLabResult(results);
      
      // Envoyer une notification
      await labProducer.sendNotification({
        type: 'LAB_RESULTS_READY',
        orderId: orderData.orderId,
        patientId: orderData.patientId,
        message: `Lab results ready for order ${orderData.orderId}`,
        testCount: results.tests.length
      });

      console.log('📤 Results and notifications sent to Kafka');
      
    } catch (error) {
      console.error('❌ Error processing lab order:', error.message);
      
      // Envoyer une notification d'erreur
      await labProducer.sendNotification({
        type: 'LAB_ERROR',
        orderId: orderData.orderId,
        patientId: orderData.patientId,
        message: `Error processing lab order: ${error.message}`,
        error: error.message
      });
    }
  }

  generateRandomResult(testCode) {
    // Simuler des résultats selon le type de test
    const results = {
      'CBC': (Math.random() * 5 + 4).toFixed(1), // 4-9
      'GLU': (Math.random() * 100 + 70).toFixed(0), // 70-170
      'CHOL': (Math.random() * 100 + 150).toFixed(0), // 150-250
      'HDL': (Math.random() * 30 + 30).toFixed(0), // 30-60
      'LDL': (Math.random() * 70 + 70).toFixed(0), // 70-140
      'TRIG': (Math.random() * 100 + 50).toFixed(0), // 50-150
      'HGB': (Math.random() * 5 + 12).toFixed(1), // 12-17
      'WBC': (Math.random() * 8 + 4).toFixed(1), // 4-12
      'PLT': (Math.random() * 200 + 150).toFixed(0), // 150-350
    };
    
    return results[testCode] || (Math.random() * 100).toFixed(2);
  }

  getUnitForTest(testCode) {
    const units = {
      'CBC': '10^6/μL',
      'GLU': 'mg/dL',
      'CHOL': 'mg/dL',
      'HDL': 'mg/dL',
      'LDL': 'mg/dL',
      'TRIG': 'mg/dL',
      'HGB': 'g/dL',
      'WBC': '10^3/μL',
      'PLT': '10^3/μL',
    };
    return units[testCode] || 'units';
  }

  getNormalRange(testCode) {
    const ranges = {
      'CBC': '4.5-5.5',
      'GLU': '70-110',
      'CHOL': '<200',
      'HDL': '>40',
      'LDL': '<100',
      'TRIG': '<150',
      'HGB': '12-17',
      'WBC': '4-12',
      'PLT': '150-350',
    };
    return ranges[testCode] || 'Normal range';
  }

  async saveResultsToDatabase(results) {
    // Optionnel: implémenter la sauvegarde dans MongoDB
    console.log('   Saving results to database...');
    // const LabResult = require('../models/LabResult');
    // await LabResult.create(results);
  }

  async disconnect() {
    try {
      await this.consumer.disconnect();
      console.log('📥 Lab Consumer disconnected');
    } catch (error) {
      console.error('Error disconnecting consumer:', error.message);
    }
  }
}

module.exports = new LabConsumer();