const { Kafka } = require('kafkajs');

class EHRConsumer {
  constructor() {
    this.kafka = new Kafka({
      clientId: process.env.KAFKA_CLIENT_ID || 'ehr-service',
      brokers: (process.env.KAFKA_BROKERS || 'redpanda:9092').split(',')
    });
    this.consumer = this.kafka.consumer({ 
      groupId: process.env.KAFKA_GROUP_ID || 'ehr-group' 
    });
  }

  async connect() {
    try {
      await this.consumer.connect();
      console.log('✅ EHR Consumer connected to Kafka');
    } catch (error) {
      console.error('❌ EHR Consumer connection error:', error.message);
    }
  }

  async subscribe() {
    try {
      await this.consumer.subscribe({ 
        topic: 'lab-results', 
        fromBeginning: false 
      });
      await this.consumer.subscribe({ 
        topic: 'ehr-notifications', 
        fromBeginning: false 
      });

      console.log('📥 EHR Consumer subscribed to topics: lab-results, ehr-notifications');

      await this.consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          console.log('\n📥 Received message from Kafka:');
          console.log('   Topic:', topic);
          console.log('   Partition:', partition);
          console.log('   Offset:', message.offset);
          console.log('   Key:', message.key?.toString());
          
          try {
            const data = JSON.parse(message.value.toString());
            console.log('   Value:', JSON.stringify(data, null, 2));

            switch(topic) {
              case 'lab-results':
                await this.handleLabResults(data);
                break;
              case 'ehr-notifications':
                await this.handleNotification(data);
                break;
              default:
                console.log('   Unknown topic:', topic);
            }
          } catch (error) {
            console.error('   Error parsing message:', error.message);
          }
        },
      });
    } catch (error) {
      console.error('❌ Error in EHR Consumer subscription:', error.message);
    }
  }

  async handleLabResults(results) {
    console.log('🔬 Processing lab results for order:', results.orderId);
    
    if (results.tests) {
      const abnormalTests = results.tests.filter(test => {
        const value = parseFloat(test.result);
        if (test.testCode === 'GLU' && (value < 70 || value > 110)) {
          return true;
        }
        return false;
      });

      if (abnormalTests.length > 0) {
        console.log('⚠️ Abnormal results detected:', abnormalTests.map(t => t.testName));
      }
    }
  }

  async handleNotification(notification) {
    console.log('🔔 Processing notification:', notification.type);
    
    switch(notification.type) {
      case 'LAB_RESULTS_READY':
        console.log(`   Results ready for order ${notification.orderId}`);
        break;
      case 'URGENT_RESULT':
        console.log(`   🚨 URGENT: ${notification.message}`);
        break;
      default:
        console.log('   Notification type:', notification.type);
    }
  }

  async disconnect() {
    try {
      await this.consumer.disconnect();
      console.log('📥 EHR Consumer disconnected');
    } catch (error) {
      console.error('Error disconnecting consumer:', error.message);
    }
  }
}

module.exports = new EHRConsumer();