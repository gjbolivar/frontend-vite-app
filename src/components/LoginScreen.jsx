import React, { useState } from 'react';
import { getStorage } from '../utils/storage';

const LoginScreen = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    const storedUsers = getStorage('users');
    const user = storedUsers.find(u => u.username === username && u.password === password);

    if (user) {
      onLogin(user);
    } else {
      setError('Usuario o contraseña incorrectos.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-primary to-accent">
      <div className="bg-white/20 backdrop-blur-md border border-white/30 p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <h2 className="text-3xl font-extrabold text-center text-white mb-6">Bienvenido</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-white">Usuario</label>
            <input
              type="text"
              id="username"
              className="input-style"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-white">Contraseña</label>
            <input
              type="password"
              id="password"
              className="input-style"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-red-200 text-sm text-center">{error}</p>}
          <button
            type="submit"
            className="btn-blue w-full transition transform hover:scale-105"
          >
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginScreen;
