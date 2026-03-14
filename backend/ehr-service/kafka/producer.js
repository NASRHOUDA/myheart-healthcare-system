const { Kafka } = require('kafkajs');

class EHRProducer {
  constructor() {
    this.kafka = new Kafka({
      clientId: process.env.KAFKA_CLIENT_ID || 'ehr-service',
      brokers: (process.env.KAFKA_BROKERS || 'redpanda:9092').split(',') // ← Changé ici
    });
    this.producer = this.kafka.producer();
  }

  async connect() {
    try {
      await this.producer.connect();
      console.log('✅ EHR Producer connected to Kafka');
    } catch (error) {
      console.error('❌ EHR Producer connection error:', error.message);
    }
  }

  async sendLabOrder(orderData) {
    try {
      await this.producer.send({
        topic: 'lab-orders',
        messages: [
          { 
            key: orderData.orderId || `order-${Date.now()}`,
            value: JSON.stringify({
              ...orderData,
              source: 'ehr-service',
              timestamp: new Date().toISOString()
            })
          }
        ]
      });
      console.log('📤 Lab order sent to Kafka:', orderData.orderId);
      return true;
    } catch (error) {
      console.error('❌ Error sending lab order to Kafka:', error.message);
      throw error;
    }
  }

  async sendTestOrder(testData) {
    try {
      await this.producer.send({
        topic: 'lab-orders',
        messages: [
          { 
            key: `test-${Date.now()}`,
            value: JSON.stringify({
              ...testData,
              test: true,
              timestamp: new Date().toISOString()
            })
          }
        ]
      });
      console.log('📤 Test order sent to Kafka');
      return true;
    } catch (error) {
      console.error('❌ Error sending test order:', error.message);
      throw error;
    }
  }

  async disconnect() {
    try {
      await this.producer.disconnect();
      console.log('📤 EHR Producer disconnected');
    } catch (error) {
      console.error('Error disconnecting producer:', error.message);
    }
  }
}

module.exports = new EHRProducer();