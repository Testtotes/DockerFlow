import { promises as fs } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

export class NginxService {
  constructor() {
    this.configDir = '/etc/nginx/conf.d';
    this.domain = 'dockersphere.ovh';
  }

  async createProxyConfig(subdomain, port) {
    const config = `
server {
    listen 80;
    server_name ${subdomain}.${this.domain};

    location / {
        proxy_pass http://localhost:${port};
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}`;

    const filename = path.join(this.configDir, `${subdomain}.conf`);
    await fs.writeFile(filename, config);
    await this.reloadNginx();
  }

  async removeProxyConfig(subdomain) {
    const filename = path.join(this.configDir, `${subdomain}.conf`);
    try {
      await fs.unlink(filename);
      await this.reloadNginx();
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }

  async reloadNginx() {
    await execAsync('nginx -t');
    await execAsync('systemctl reload nginx');
  }
}