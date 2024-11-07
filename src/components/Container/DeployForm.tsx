import React, { useState } from 'react';
import { Upload } from 'lucide-react';

interface DeployFormProps {
  onDeploy: (imageUrl: string, subdomain: string) => Promise<void>;
}

export const DeployForm: React.FC<DeployFormProps> = ({ onDeploy }) => {
  const [imageUrl, setImageUrl] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await onDeploy(imageUrl, subdomain);
      setImageUrl('');
      setSubdomain('');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Deploy New Container
        </h3>
        <div className="mt-2 max-w-xl text-sm text-gray-500">
          <p>Enter the Docker image URL and choose a subdomain for your container.</p>
        </div>
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}
          <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">
              Docker Image URL
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="imageUrl"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="nginx:latest"
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="subdomain" className="block text-sm font-medium text-gray-700">
              Subdomain
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="subdomain"
                value={subdomain}
                onChange={(e) => setSubdomain(e.target.value.toLowerCase())}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="myapp"
                pattern="[a-z0-9-]+"
                required
              />
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Your container will be available at: {subdomain}.dockersphere.ovh
            </p>
          </div>
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Upload className="h-5 w-5 mr-2" />
              {isLoading ? 'Deploying...' : 'Deploy Container'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};