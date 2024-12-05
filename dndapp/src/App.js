import './App.css';
import React from 'react';
import { useNavigate } from 'react-router-dom';

function App() {
    const navigate = useNavigate();
    const goToSignUp = () => {
        navigate('/signup');
      };
    const goToLoginPage = () => {
        navigate('/login');
    };
    return (
        <div id = "login-page">
            <h1>HowToDND</h1>
            <h2>Learn How to Make a DND Character</h2>
            <div className = "button-group">
            <button id="login-button" onClick = {goToLoginPage}>Login</button>
            <button id="signup-button" onClick={goToSignUp}>Sign Up</button>
            </div>
        </div>
    );
};

export default App;
