import React, { useState } from 'react';
import '../styles/Login.css';

interface LoginProps {
  onLogin: (username: string, password: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() === '') {
      setError('El nombre de usuario no puede estar vacío');
      return;
    }
    if (username.length < 3) {
        setError('El nombre de usuario debe tener al menos 3 caracteres');
        return;
    }
    setError('');
    onLogin(username, password);
  };

  return (
    <div className="login-page">
      <div className="background-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>
      <div className="login-container">
        <h1>Bienvenido al Chat</h1>
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <input
              type="text"
              placeholder="Ingresa tu nombre de usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
            />
            <input
              type="password"
              placeholder="Ingresa tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit" disabled={!username.trim()}>
            Entrar al Chat
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;