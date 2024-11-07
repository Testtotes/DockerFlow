import React from 'react';
import { Play, Square, Trash2 } from 'lucide-react';

interface Container {
  _id: string;
  name: string;
  subdomain: string;
  status: string;
  imageUrl: string;
}

interface ContainerListProps {
  containers: Container[];
  onAction: (id: string, action: 'start' | 'stop' | 'remove') => void;
}

export const ContainerList: React.FC<ContainerListProps> = ({ containers, onAction }) => {
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {containers.map((container) => (
          <li key={container._id}>
            <div className="px-4 py-4 flex items-center justify-between sm:px-6">
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-indigo-600 truncate">
                    {container.name}
                  </p>
                  <div className="ml-2 flex-shrink-0 flex">
                    <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      container.status === 'running' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {container.status}
                    </p>
                  </div>
                </div>
                <div className="mt-2 flex justify-between">
                  <div>
                    <p className="text-sm text-gray-500">
                      Image: {container.imageUrl}
                    </p>
                    <p className="text-sm text-gray-500">
                      URL: <a href={`http://${container.subdomain}.dockersphere.ovh`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-500">
                        {container.subdomain}.dockersphere.ovh
                      </a>
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    {container.status !== 'running' ? (
                      <button
                        onClick={() => onAction(container._id, 'start')}
                        className="inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        <Play className="h-5 w-5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => onAction(container._id, 'stop')}
                        className="inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                      >
                        <Square className="h-5 w-5" />
                      </button>
                    )}
                    <button
                      onClick={() => onAction(container._id, 'remove')}
                      className="inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};