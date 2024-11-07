export class PortManager {
  constructor() {
    this.startPort = 10000;
    this.endPort = 20000;
    this.usedPorts = new Set();
  }

  async getNextAvailablePort() {
    for (let port = this.startPort; port <= this.endPort; port++) {
      if (!this.usedPorts.has(port)) {
        this.usedPorts.add(port);
        return port;
      }
    }
    throw new Error('No available ports');
  }

  releasePort(port) {
    this.usedPorts.delete(port);
  }
}