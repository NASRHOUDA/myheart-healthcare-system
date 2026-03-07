const Consul = require('consul');

class ConsulRegistry {
  constructor(serviceName, port) {
    this.serviceName = serviceName;
    this.port = port;
    this.consul = new Consul({ 
      host: process.env.CONSUL_HOST || 'consul',
      promisify: true 
    });
    this.serviceId = `${serviceName}-${port}-${Date.now()}`;
  }

  async register() {
    try {
      await this.consul.agent.service.register({
        id: this.serviceId,
        name: this.serviceName,
        address: this.serviceName,
        port: parseInt(this.port),
        check: {
          http: `http://${this.serviceName}:${this.port}/health`,
          interval: '10s',
          timeout: '5s',
          deregistercriticalserviceafter: '30s'
        }
      });
      console.log(`✅ ${this.serviceName} enregistré dans Consul avec ID: ${this.serviceId}`);
      return true;
    } catch (error) {
      console.error(`❌ Erreur enregistrement Consul pour ${this.serviceName}:`, error.message);
      return false;
    }
  }

  async deregister() {
    try {
      await this.consul.agent.service.deregister(this.serviceId);
      console.log(`✅ ${this.serviceName} désenregistré de Consul`);
    } catch (error) {
      console.error(`❌ Erreur désenregistrement Consul:`, error.message);
    }
  }
}

module.exports = ConsulRegistry;
