import React, { useEffect,useState } from 'react';
import axios from 'axios';
import {useNavigate} from 'react-router-dom';
import { useCharacter } from './CharacterContext';

const ViewCharacter = () => {

    const id = useCharacter();

    const [char, setCharacter] = useState([]);
    const [spells, setSpells] = useState([]);
    const [skills, setSkills] = useState([]);
    const [profs, setProficiencies] = useState([]);
    const [features, setFeatures] = useState([]);
    const [languages, setLanguages] = useState([]);

    useEffect(() => {
        const charId = id.characterId;
        axios.get('http://localhost:5000/api/characters', {
            params: {
                charId
            }
        })
            .then(response => {
                console.log(charId);
                console.log(response.data.data);
                setCharacter(response.data.data[0]);
            })
            .catch(error => {
                console.error('Error fetching characters:', error);
            });
        axios.get('http://localhost:5000/api/spells', {
            params: {
                charId
            }
        })
            .then(response => {
                setSpells(response.data.data);
            })
            .catch(error => {
                console.error('Error fetching spells:', error);
            });
        axios.get('http://localhost:5000/api/skills', {
            params: {
                id: charId
            }
        })
            .then(response => {
                setSkills(response.data.data);
            })
            .catch(error => {
                console.error('Error fetching skills:', error);
            });
        axios.get('http://localhost:5000/api/proficiencies', {
            params: {
                id: charId
            }
        })
            .then(response => {
                setProficiencies(response.data.data);
            })
            .catch(error => {
                console.error('Error fetching proficiencies:', error);
            });
        axios.get('http://localhost:5000/api/features', {
            params: {
                id: charId
            }
        })
            .then(response => {
                setFeatures(response.data.data);
            })
            .catch(error => {
                console.error('Error fetching features:', error);
            });
        axios.get('http://localhost:5000/api/languages', {
            params: {
                id: charId
            }
        })
            .then(response => {
                setLanguages(response.data.data);
            })
            .catch(error => {
                console.error('Error fetching languages:', error);
            });
    }, [id]);

    // navigation to pages for viewing information
    const navigate = useNavigate(); // set up urls
    const goToViewSpell = (spellid) => {
        // pass spell index down
        navigate('/viewspell');
    }
    const goToViewFeature = (featureid) => {
        // pass feature index down
        navigate('/viewfeature');
    }

    const getModifier = (score) => Math.floor((score-10)/2);
    // function to fetch and store feature names
    const [featureNames, setFeatureNames] = useState([]);
    const fetchFeatureName = async (query, featureId) => {
        try {
            const response = await axios.get(query);
            setFeatureNames(prev => ({
                ...prev,
                [featureId]: response.data.name,
            }));
        } catch (error) {
            console.error(`Error fetching feature with ID ${featureId}:`, error);
            setFeatureNames(prev => ({
                ...prev,
                [featureId]: 'Error loading feature',
            }));
        }
    };
    useEffect(() => {
        features.forEach(feat => {
            const query = `https://www.dnd5eapi.co/api/features/${feat.feature}`;
            if (!featureNames[feat.featureid]) {
                fetchFeatureName(query, feat.featureid);
            }
        });
    }, [features]);
    // function to fetch and store spell names
    const [spellNames, setSpellNames] = useState([]);
    const [spellLevels, setSpellLevels] = useState([]);
    const fetchSpellInfo = async (query, spellId) => {
        try {
            const response = await axios.get(query);
            setSpellNames(prev => ({
                ...prev,
                [spellId]: response.data.name,
            }));
            setSpellLevels(prev => ({
                ...prev,
                [spellId]: response.data.level,
            }))
        } catch (error) {
            console.error(`Error fetching spell with ID ${spellId}:`, error);
            setSpellNames(prev => ({
                ...prev,
                [spellId]: 'Error loading spell',
            }));
        }
    };
    useEffect(() => {
        spells.forEach(spell => {
            const query = `https://www.dnd5eapi.co/api/spells/${spell.spellname}`;
            if (!spellNames[spell.spellid] || !spellLevels[spell.spellid]) {
                fetchSpellInfo(query, spell.spellid);
            }
        });
    }, [spells]);
    const groupedSpells = spells.reduce((acc, spell) => {
        const level = spellLevels[spell.spellid] || 'Unknown';
        if (!acc[level]) {
            acc[level] = [];
        }
        acc[level].push({
            id: spell.spellid,
            name: spellNames[spell.spellid] || 'Loading...',
        });
        return acc;
    }, {});
    // stuff for skills
    const skillMapping = {
        Acrobatics: "dexterity",
        Arcana: "intelligence",
        Athletics: "strength",
        Deception: "charisma",
        History: "intelligence",
        Insight: "wisdom",
        Intimidation: "charisma",
        Investigation: "intelligence",
        Medicine: "wisdom",
        Nature: "intelligence",
        Perception: "wisdom",
        Performance: "charisma",
        Persuasion: "charisma",
        Religion: "intelligence",
        Sleight_of_Hand: "dexterity",
        Stealth: "dexterity",
        Survival: "wisdom"
      };

    // class specific information
    const [classInfo, setClassInfo] = useState([])
    useEffect(() => {
        const fetchClassInfo = async (query) => {
            try {
                const response = await fetch(query);
                if (!response.ok) {
                    throw new Error("Failed to fetch class info");
                }
                const data = await response.json();
                setClassInfo(data)

            } catch (error) {
                console.error("Error fetching class info:", error);
            }
        };

        const query = `https://www.dnd5eapi.co/api/classes/${char.class}`;
        fetchClassInfo(query);
    }, [char]);

    return (
        <div>
            <div>
                <h1>{char.name}</h1>
                <h2>Level {char.level} {char.race} {char.class}</h2>
                <h3>AC = {char.ac}</h3>
                <h3>HP = {char.hp}</h3>
                <h4>Alignment: {char.alignment}</h4>
                <h4>Speed: {char.speed}</h4>
                <ul>
                    <li>Strength: {char.strength} (+{getModifier(char.strength)})</li>
                    <li>Dexterity: {char.dexterity} (+{getModifier(char.dexterity)})</li>
                    <li>Constitution: {char.constitution} (+{getModifier(char.constitution)})</li>
                    <li>Intelligence: {char.intelligence} (+{getModifier(char.intelligence)})</li>
                    <li>Wisdom: {char.wisdom} (+{getModifier(char.wisdom)})</li>
                    <li>Charisma: {char.charisma} (+{getModifier(char.charisma)})</li>
                </ul>
            </div>
            <div>
                <h3>Skills</h3>
                <ul>
                {Object.entries(skillMapping).map(([skill, stat]) => {
                    const charStat = char[stat.toLowerCase()]; 
                    const skillBonus = skills[skill] || 0;
                    const modifier = Math.floor((charStat - 10) / 2) + skillBonus * (char.bonus || 0);
                        return (
                        <li
                            key={skill}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                padding: '10px',
                                marginBottom: '10px',
                            }}
                        >
                            <span>{skill} ({stat})</span>
                            <span>
                                Modifier: {modifier >= 0 ? '+' : ''}{modifier}
                            </span>
                        </li>
                    );
                })}
                </ul>
            </div>
            <div>
                <h3>Features</h3>
                <ul>
                    {features.map(feat => (
                        <li key={feat.featureid} onClick = {goToViewFeature(feat.featureid)}>  
                            {featureNames[feat.featureid] || 'Loading...'}
                        </li>
                    ))}
                </ul>
            </div>
            {/* class specific information */}
            {char.class === 'barbarian' && classInfo && (
                <div>
                    <h3>Barbarian Information</h3>
                    {classInfo.class_specific.rage_count !== undefined && (
                        <h4>Number of Rages: {classInfo.class_specific.rage_count}</h4>
                    )}
                    {classInfo.class_specific.rage_damage_bonus !== undefined && (
                        <h4>Rage Bonus Damage: {classInfo.class_specific.rage_damage_bonus}</h4>
                    )}
                    {classInfo.class_specific.brutal_critical_die !== undefined && classInfo.class_specific.brutal_critical_die !== 0 && (
                        <h4>Number of Brutal Critical Die: {classInfo.class_specific.brutal_critical_die}</h4>
                    )}
                </div>
            )}
            {char.class === 'bard' && classInfo && (
                <div>
                    <h3>Bard Information</h3>
                    {classInfo.class_specific.bardic_inspiration_die !== undefined && (
                        <h4>Bardic Inspiration: 1d{classInfo.class_specific.bardic_inspiration_die}</h4>
                    )}
                    {classInfo.class_specific.song_of_rest_die !== undefined && classInfo.class_specific.song_of_rest_die !== 0 && (
                        <h4>Song of Rest: 1d{classInfo.class_specific.song_of_rest_die}</h4>
                    )}
                </div>
            )}
            {char.class === 'cleric' && classInfo && char.level > 1 && (
                <div>
                    <h3>Cleric Information</h3>
                    {classInfo.class_specific.channel_divinity_charges !== undefined && classInfo.class_specific.channel_divinity_charges !== 0 && (
                        <h4>Channel Divinity Charges: {classInfo.class_specific.channel_divinity_charges}</h4>
                    )}
                    {classInfo.class_specific.destroy_undead_cr !== undefined && classInfo.class_specific.destroy_undead_cr !== 0 && (
                        <h4>Destroy Undead Challenge Rating: {classInfo.class_specific.destroy_undead_cr}</h4>
                    )}
                </div>
            )}
            {char.class === 'druid' && classInfo && char.level > 1 && classInfo.class_specific.wild_shape_max_cr !== 'undefined' && classInfo.class_specific.wild_shape_max_cr !== 0 && (
                <div>
                    <h3>Druid Information</h3>
                    <h4>Max Wild Shape Challenge Rating: {classInfo.class_specific.wild_shape_max_cr}</h4>
                    {classInfo?.class_specific?.wild_shape_swim !== undefined && (
                        <h4>
                            {classInfo.class_specific.wild_shape_swim
                                ? "You can swim in wild shape"
                                : "You can't swim in wild shape"}
                        </h4>
                    )}
                    {classInfo?.class_specific?.wild_shape_fly !== undefined && (
                        <h4>
                            {classInfo.class_specific.wild_shape_fly
                                ? "You can fly in wild shape"
                                : "You can't fly in wild shape"}
                        </h4>
                    )}
                </div>
            )}
            {char.class = 'fighter' && classInfo && char.level > 1 && (
                <div>
                    <h3>Fighter Information</h3>
                    {classInfo.class_specific.action_surges !== undefined && classInfo.class_specific.action_surges !== 0 && (
                        <h4>Action Surges: {classInfo.class_specific.action_surges}</h4>
                    )}
                    {classInfo.class_specific.indomitable_uses !== undefined && classInfo.class_specific.indomitable_uses !== 0 && (
                        <h4>Indomitable Uses: {classInfo.class_specific.indomitable_uses}</h4>
                    )}
                    {classInfo.class_specific.extra_attacks !== undefined && classInfo.class_specific.extra_attacks !== 0 && (
                        <h4>Extra Attacks: {classInfo.class_specific.extra_attacks}</h4>
                    )}
                </div>
            )}
            {char.class === 'monk' && classInfo && (
                <div>
                    <h3>Monk Information</h3>
                    {classInfo.class_specific.ki_points !== undefined && classInfo.class_specific.ki_points !== 0 && (
                        <h4>Ki Points: {classInfo.class_specific.ki_points}</h4>
                    )}
                    {classInfo.class_specific.unarmored_movement !== undefined && classInfo.class_specific.unarmored_movement !== 0 && (
                        <h4>Unarmored Movement: {classInfo.class_specific.unarmored_movement}</h4>
                    )}
                    {classInfo.class_specific.martial_arts.dice_value !== undefined && (
                        <h4>Martial Arts: 1d{classInfo.class_specific.martial_arts.dice_value}</h4>
                    )}
                </div>
            )}
            {char.class === 'paladin' && classInfo && char.level > 5 && (
                <div>
                    <h3>Paladin Information</h3>
                    {classInfo.class_specific.aura_range !== undefined && (
                        <h4>Aura Range: {classInfo.class_specific.aura_range}</h4>
                    )}
                </div>
            )}
            {/* ranger information, favored enemies and terrain display */ }
            {char.class === 'rogue' && classInfo && (
                <div>
                    <h3>Rogue Information</h3>
                    {classInfo.class_specific.sneak_attack.dice_count !== undefined && (
                        <h4>Sneak Attack: {classInfo.class_specific.sneak_attack.dice_count}d6</h4>
                    )}
                </div>
            )}
            {char.class === 'sorcerer' && classInfo && char.level > 1 && (
                <div>
                    <h3>Sorcerer Information</h3>
                    {classInfo.class_specific.sorcery_points !== undefined && (
                        <h4>Sorcery Points: {classInfo.class_specific.sorcery_points}</h4>
                    )}
                    {/* add metamagic choices here */}
                </div>
            )}
            {char.class === 'warlock' && classInfo && char.level > 1 && (
                <div>
                    <h3>Warlock Information</h3>
                    {classInfo.class_specific.invocations_known !== undefined && (
                        <h4>Invocations: {classInfo.class_specific.invocations_known}</h4>
                    )}
                    {/* add mystic arcanum choices here maybe */}
                </div>
            )}
            {char.class === 'wizard' && classInfo && (
                <div>
                    <h3>Wizard Information</h3>
                    {classInfo.class_specific.arcane_recovery_levels !== undefined && (
                        <h4>Arcane Recovery Levels: {classInfo.class_specific.arcane_recovery_levels}</h4>
                    )}
                </div>
            )}
            <div>
                <h3>Proficiences</h3>
                <ul>
                    {profs.map(prof => (
                        <li key={prof.proficiencyid}>
                            {prof.proficiency}
                        </li>
                    ))}
                </ul>
            </div>
            <div>
                <h3>Languages</h3>
                <ul>
                    {languages.map(lang => (
                        <li key={lang.languageid}>
                            {lang.language}
                        </li>
                    ))}
                </ul>
            </div>
            {spells.length>0 && (
                <div>
                    <h3>Spells</h3>
                    {classInfo?.spellcasting && (
                        <div>
                            <h3>Spellcasting Information</h3>
                            {classInfo.spellcasting.cantrips_known !== undefined && (
                                <h4>Cantrips Known: {classInfo.spellcasting.cantrips_known}</h4>
                            )}
                            {classInfo.spellcasting.spells_known !== undefined && (
                                <h4>Spells Known: {classInfo.spellcasting.spells_known}</h4>
                            )}
                            {Object.entries(classInfo.spellcasting)
                                .filter(
                                    ([key, value]) => key.startsWith("spell_slots_level_") && value > 0
                                )
                                .map(([key, value]) => (
                                    <h4 key={key}>
                                        {key.replace("spell_slots_level_", "Spell Slots Level ")}: {value}
                                    </h4>
                                ))}
                        </div>
                    )}
                    <div>
                        {Object.keys(groupedSpells).sort().map(level => (
                            <div key={level}>
                                <h2>{level === '0' ? 'Cantrips' : `Level ${level}`}</h2>
                                <ul>
                                    {groupedSpells[level].map(spell => (
                                        <li 
                                            key={spell.id} 
                                            onClick={() => goToViewSpell(spell.id)} 
                                            style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}
                                        >
                                            {spell.name}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );


};
export default ViewCharacter;