import { API_BASE_URL, endpoints } from './config';

export interface Container {
  Id: string;
  Names: string[];
  Image: string;
  State: string;
  Status: string;
}

export interface Image {
  Id: string;
  RepoTags: string[];
  Size: number;
}

class DockerApi {
  private async fetchApi(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    return response.json();
  }

  // Containers
  async getContainers(): Promise<Container[]> {
    return this.fetchApi(endpoints.containers.list);
  }

  async startContainer(id: string): Promise<void> {
    return this.fetchApi(endpoints.containers.start(id), { method: 'POST' });
  }

  async stopContainer(id: string): Promise<void> {
    return this.fetchApi(endpoints.containers.stop(id), { method: 'POST' });
  }

  async removeContainer(id: string): Promise<void> {
    return this.fetchApi(endpoints.containers.remove(id), { method: 'DELETE' });
  }

  // Images
  async getImages(): Promise<Image[]> {
    return this.fetchApi(endpoints.images.list);
  }

  async pullImage(imageName: string): Promise<void> {
    return this.fetchApi(endpoints.images.pull, {
      method: 'POST',
      body: JSON.stringify({ imageName }),
    });
  }

  async removeImage(id: string): Promise<void> {
    return this.fetchApi(endpoints.images.remove(id), { method: 'DELETE' });
  }
}

export const dockerApi = new DockerApi();