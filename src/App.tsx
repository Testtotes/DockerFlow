import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LoginForm } from './components/Auth/LoginForm';
import { RegisterForm } from './components/Auth/RegisterForm';
import { ContainerList } from './components/Container/ContainerList';
import { DeployForm } from './components/Container/DeployForm';
import { Boxes } from 'lucide-react';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [containers, setContainers] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (token) {
      fetchContainers();
    }
  }, [token]);

  const fetchContainers = async () => {
    try {
      const response = await fetch('/api/containers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch containers');
      const data = await response.json();
      setContainers(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogin = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  const handleDeploy = async (imageUrl, subdomain) => {
    try {
      const response = await fetch('/api/containers/deploy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ imageUrl, subdomain })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
      
      fetchContainers();
    } catch (err) {
      throw err;
    }
  };

  const handleContainerAction = async (id, action) => {
    try {
      const response = await fetch(`/api/containers/${id}/${action}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error(`Failed to ${action} container`);
      fetchContainers();
    } catch (err) {
      setError(err.message);
    }
  };

  if (!token) {
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<LoginForm onLogin={handleLogin} />} />
          <Route path="/register" element={<RegisterForm onRegister={handleLogin} />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Boxes className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">DockerSphere</span>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="ml-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        <div className="space-y-6">
          <DeployForm onDeploy={handleDeploy} />
          <ContainerList containers={containers} onAction={handleContainerAction} />
        </div>
      </main>
    </div>
  );
}

export default App;