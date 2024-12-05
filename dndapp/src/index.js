import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// context, to move ids between components
import {UserProvider}  from './components/UserContext.js';
import {CharacterProvider} from './components/CharacterContext.js';
// components
import LoginPage from './components/LoginPage.js';
import SignUpPage from './components/SignUpPage.js';
import Dashboard from './components/Dashboard.js';
import NewCharacter from './components/NewCharacter.js';
import LevelCharacter from './components/LevelCharacter.js';
import ViewCharacter from './components/ViewCharacter.js';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <UserProvider>
      <CharacterProvider>
        <Router>
          <Routes>
            <Route path="/" element={<App />} />  {/* Home page */}
            <Route path="/login" element={<LoginPage />} /> {/* Login page */}
            <Route path="/signup" element={<SignUpPage />} /> {/* Sign up page */}
            <Route path="/dashboard" element={<Dashboard />} /> {/* Dashboard page */}
            <Route path="/new" element={<NewCharacter/>}/> {/* New Character Page */}
            <Route path="/levelup" element={<LevelCharacter/>}/> {/* Level up Character */}
            <Route path="/viewcharacter" element= {<ViewCharacter/>}/> {/* View Character */}
          </Routes>
        </Router>
      </CharacterProvider>
    </UserProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
