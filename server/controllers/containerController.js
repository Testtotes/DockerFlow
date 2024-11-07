import Docker from 'dockerode';
import Container from '../models/Container.js';
import { NginxService } from '../services/nginx.js';
import { DNSService } from '../services/dns.js';
import { PortManager } from '../services/portManager.js';

const docker = new Docker({ socketPath: '/var/run/docker.sock' });
const nginx = new NginxService();
const dns = new DNSService();
const portManager = new PortManager();

export const containerController = {
  async deploy(req, res) {
    try {
      const { imageUrl, subdomain } = req.body;
      const userId = req.user.id;

      // Validate subdomain
      if (!/^[a-z0-9-]+$/.test(subdomain)) {
        return res.status(400).json({ error: 'Invalid subdomain format' });
      }

      // Get available port
      const port = await portManager.getNextAvailablePort();

      // Pull image
      await docker.pull(imageUrl);

      // Create container
      const container = await docker.createContainer({
        Image: imageUrl,
        ExposedPorts: { '80/tcp': {} },
        HostConfig: {
          PortBindings: { '80/tcp': [{ HostPort: port.toString() }] }
        }
      });

      // Start container
      await container.start();

      // Create DNS record and Nginx config
      await dns.createRecord(subdomain);
      await nginx.createProxyConfig(subdomain, port);

      // Save container info
      const containerDoc = new Container({
        name: subdomain,
        subdomain,
        imageUrl,
        port,
        status: 'running',
        containerId: container.id,
        user: userId
      });
      await containerDoc.save();

      res.json({
        success: true,
        url: `http://${subdomain}.dockersphere.ovh`
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async list(req, res) {
    try {
      const containers = await Container.find(
        req.user.isAdmin ? {} : { user: req.user.id }
      ).populate('user', 'username');
      res.json(containers);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async control(req, res) {
    try {
      const { id, action } = req.params;
      const containerDoc = await Container.findById(id);

      if (!containerDoc) {
        return res.status(404).json({ error: 'Container not found' });
      }

      if (!req.user.isAdmin && containerDoc.user.toString() !== req.user.id) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const container = docker.getContainer(containerDoc.containerId);

      switch (action) {
        case 'start':
          await container.start();
          containerDoc.status = 'running';
          break;
        case 'stop':
          await container.stop();
          containerDoc.status = 'stopped';
          break;
        case 'remove':
          await container.remove({ force: true });
          await dns.removeRecord(containerDoc.subdomain);
          await nginx.removeProxyConfig(containerDoc.subdomain);
          portManager.releasePort(containerDoc.port);
          await containerDoc.remove();
          return res.json({ success: true });
        default:
          return res.status(400).json({ error: 'Invalid action' });
      }

      await containerDoc.save();
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};