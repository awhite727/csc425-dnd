import React, { useEffect,useState } from 'react';
import axios from 'axios';
import {useNavigate} from 'react-router-dom';

const ViewSpell = (spellid) => {

    const [spell,setSpell] = useState([]);
    const [spellinfo, setSpellinfo] = useState([]);

    useEffect(()=> {
        axios.get('http://localhost:5000/api/spellbyid', {
            params: {
                id: {spellid}
            }
        })
            .then(response => {
                setSpell(response.data.data);
            })
            .catch(error => {
                console.error('Error fetching spell:', error);
            });
    }, [spellid]);

    const fetchSpellinfo = async (query, spellId) => {
        try {
            const response = await axios.get(query);
            setSpellinfo(prev => ({
                ...prev,
                [spellId]: response.data.data,
            }));
        } catch (error) {
            console.error(`Error fetching spell with ID ${spellId}:`, error);
            setSpellinfo(prev => ({
                ...prev,
                [spellId]: 'Error loading spell',
            }));
        }
    };
    useEffect(() => {
        const query = `https://www.dnd5eapi.co/api/spells/${spell.spellname}`;
        fetchSpellinfo(query, spell.spellid);
        }, [spell]);

    return (
        <div>
            {/* add a back button */}
            <h1>{spellinfo.name}</h1>
            <p>{spellinfo.desc}</p>
            <ul>
                <li>School: {spellinfo.school.name}</li>
                <li>Range: {spellinfo.range}</li>
                <li>Attack Type: {spellinfo.attack_type} </li>
                <li>Level: {spellinfo.level}</li>
            </ul>
            <h2>Damage</h2> {/* display conditionally, if the spell has damage or not */}
            <ul>
                <li>Damage Type: {spellinfo.damage.damage_type}</li>
                {/* display damage per level*/}
                
            </ul>

            

            
        </div>
    );

};
export default ViewSpell;