import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUser } from './UserContext.js';
import './styles.css';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();

  const { setUserId } = useUser();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/users').then((response) => {
      setUsers(response.data.data);
    });
  });

  const goToDashboard = () => {
    const user = users.find((user) => user.username === username);
    if (user.password === password) {
      console.log('User found: ', user.userid);
      setUserId(user.userid);
      navigate('/dashboard');
    }
  };

  const goToSignUp = () => {
    navigate('/signup');
  };

  return (
    <div id="login-page">
      <h1 className="login-title">Sign In</h1>
      <form id="login-form" onSubmit={goToDashboard}>
        <input
          className="input-field"
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          className="input-field"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button id="login-button" type="submit">
          Sign In
        </button>
      </form>
      <button id="signup-button" onClick={goToSignUp}>
        Sign Up
      </button>
    </div>
  );
};

export default LoginPage;
