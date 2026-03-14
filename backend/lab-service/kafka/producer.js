const { Kafka } = require('kafkajs');

class LabProducer {
  constructor() {
    this.kafka = new Kafka({
      clientId: process.env.KAFKA_CLIENT_ID || 'lab-service',
      brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(',')
    });
    this.producer = this.kafka.producer();
  }

  async connect() {
    try {
      await this.producer.connect();
      console.log('✅ Lab Producer connected to Kafka');
    } catch (error) {
      console.error('❌ Lab Producer connection error:', error.message);
    }
  }

  async sendLabResult(resultData) {
    try {
      await this.producer.send({
        topic: 'lab-results',
        messages: [
          { 
            key: resultData.orderId,
            value: JSON.stringify({
              ...resultData,
              source: 'lab-service',
              timestamp: new Date().toISOString()
            })
          }
        ]
      });
      console.log('📤 Lab result sent to Kafka:', resultData.orderId);
      return true;
    } catch (error) {
      console.error('❌ Error sending lab result:', error.message);
      throw error;
    }
  }

  async sendNotification(notification) {
    try {
      await this.producer.send({
        topic: 'ehr-notifications',
        messages: [
          { 
            key: `notif-${Date.now()}`,
            value: JSON.stringify({
              ...notification,
              timestamp: new Date().toISOString()
            })
          }
        ]
      });
      console.log('📤 Notification sent to Kafka:', notification.type);
      return true;
    } catch (error) {
      console.error('❌ Error sending notification:', error.message);
      throw error;
    }
  }

  async sendTestMessage(testData) {
    try {
      await this.producer.send({
        topic: 'lab-results',
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
      console.log('📤 Test message sent to Kafka');
      return true;
    } catch (error) {
      console.error('❌ Error sending test message:', error.message);
      throw error;
    }
  }

  async disconnect() {
    try {
      await this.producer.disconnect();
      console.log('📤 Lab Producer disconnected');
    } catch (error) {
      console.error('Error disconnecting producer:', error.message);
    }
  }
}

module.exports = new LabProducer();