import React, { useEffect,useState } from 'react';
import axios from 'axios';
import {useNavigate} from 'react-router-dom';
import { useUser } from './UserContext.js';
import { useCharacter } from './CharacterContext.js';

const Dashboard = () => {

    const [chars, setCharacters] = useState([]);

    /*
    useEffect(() => {
        axios.get('http://localhost:5000/api/usercharacters')
        .then(response => {
        console.log(response);
        setCharacters(response.data.data);
        })
    }, [id.userId]); 

    const deleteCharacter = (charId) => {
        axios.delete('http://localhost:5000/api/characters', {
            data: { charId }
        })
            .then(response => {
                setCharacters(chars.filter((char) => char.characterid !== charId)); // Remove character from state
            })
            .catch(error => {
                console.error('Error deleting character: ' + (error.response ? error.response.data.error : error.message));
            });
    }; */

    const navigate = useNavigate();

    const goToNewCharacter = () => {
        navigate('/new');
    };
    const goToLevelCharacter = () => {
        navigate('/levelup');
    }
    const goToLoginPage = () => {
        navigate('/login');
    }
    /*
    const goToViewCharacter = (charId) => {
        setCharacterId(charId);
        navigate('/viewcharacter');
    }; */


    return (
        <div>
            <header class="app-header">
                <div class="app-title">How to DND</div>
                <div class="page-description">Dashboard</div>
                <button onClick = {goToLoginPage} className = "button button-next">Logout</button>
            </header>
            <div className='section-container'>
                <div className = "border-section">
                <h1>Get Started</h1>
                <h5>HowToDND teaches you all the steps in making and leveling up a character</h5>
                <h5>from picking stats and spells to getting the unique features of all 12 classes.</h5>
                <div className = 'button-group'>
                    <button className = 'button button-next' onClick={goToNewCharacter}>New Character</button>
                    <button className = 'button button-previous' onClick ={goToLevelCharacter}>Level Up Character</button>
                </div>
                <ul className = "list">
                    <li>Learn how to make a new character from scratch</li>
                    <li>Go through all 20 levels of any of the 12 classes</li>
                </ul>
                </div>
            </div>
        </div>
    );
};
export default Dashboard;