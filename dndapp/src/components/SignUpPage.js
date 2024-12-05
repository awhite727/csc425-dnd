import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SignUpPage = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [users, setUsers] = useState([]);
    
    const navigate = useNavigate();

    useEffect(() => {
        axios.get('http://localhost:5000/api/users')
            .then(response => {
                setUsers(response.data.data);
            })
            .catch(error => {
                console.error('Error fetching users:', error);
            });
    }, []);

    const handleSignUp = async (event) => {
        event.preventDefault();
        const existingUser = users.find(user => user.username === username);

        if (!existingUser) {
            try {
                // Create a new user if not existing
                await axios.post('http://localhost:5000/api/signup', {
                    username,
                    password,
                });
                navigate('/login');  // Navigate to login after signup
            } catch (error) {
                console.error('Error signing up:', error);
            }
        } else {
            console.log('User already exists');
        }
    };

    return (
        <div id="login-page">
            <h1 className="login-title">Sign In</h1>
            <form id="login-form" onSubmit={handleSignUp}>
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
                <button id="signup-button" type="submit">Sign Up</button>
            </form>
        </div>
    );
};

export default SignUpPage;
