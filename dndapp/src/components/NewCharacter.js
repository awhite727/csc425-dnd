import React, { useEffect,useState } from 'react';
import axios from 'axios';
import {useNavigate} from 'react-router-dom';
import { useCharacter } from './CharacterContext';
import { useUser } from './UserContext';

const NewCharacter = () => {
    // makes the form visible only if it is currently active
    const userId = useUser();
    const {setCharacterId} = useCharacter();
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const handleNext = () => {
        setCurrentStep((prevStep) => prevStep + 1);
    };
    const handlePrevious = () => {
        setCurrentStep((prevStep) => prevStep - 1);
    };

    const [name, setName] = useState(''); 
    const handleSubmitName = (e) => {
        e.preventDefault();
        console.log('Selected: ', name);
        handleNext(); 
    };
    // step 2
    const [race, setRace] = useState('');
    const handleSubmitRace = (e) => {
        e.preventDefault();
        console.log('Selected: ', race);
        handleNext();
    };
    const [traitUrls, setTraits] = useState([]);
    const [traitNames, setTraitNames] = useState([]);
    const [traitDesc, setTraitDesc] = useState([]);
    const [traitInfo, setTraitInfo] = useState([]);

    const [speed, setSpeed] = useState(0);
    const [abilityBonuses, setAbilityBonuses] = useState({
        str: null,
        dex: null,
        con: null,
        int: null,
        wis: null,
        cha: null
    });
    const abilityAbbreviation = {
        strength: "str",
        dexterity: "dex",
        constitution: "con",
        intelligence: "int",
        wisdom: "wis",
        charisma: "cha",
    };

    useEffect(() => {
        const fetchRaceInfo = async (query) => {
            try {
                const response = await fetch(query);
                if (!response.ok) {
                    throw new Error("Failed to fetch race info");
                }
                const data = await response.json();
                
                const bonuses = data.ability_bonuses.reduce((acc, { ability_score, bonus }) => {
                    const abbreviation = ability_score.index;  // e.g., "int", "str", etc.
                    acc[abbreviation] = bonus;
                    return acc;
                }, {});
                const languages = data.languages.map((lang) => lang.name);

                const urls = data.traits.map((trait) => trait.url);
                const trNames = data.traits.map((trait) => trait.name);
                setLanguages(languages);
                setAbilityBonuses(bonuses);
                setSpeed(data.speed);
                setTraits(urls);
                setTraitNames(trNames);
                
            } catch (error) {
                console.error("Error fetching race info:", error);
            }
        };

        console.log('Race: ', race);
        const query = `https://www.dnd5eapi.co/api/races/${race}`;
        fetchRaceInfo(query);
    }, [race]);
    useEffect(()=> {
        console.log('Bonus: ', abilityBonuses);
    },[abilityBonuses]);
    useEffect(() => {
        const fetchTraitDescriptions = async () => {
            try {
                const descriptions = await Promise.all(
                    traitUrls.map(async (url) => {
                        const query = `https://www.dnd5eapi.co${url}`;
                        const response = await fetch(query);
                        if (!response.ok) {
                            throw new Error("Failed to fetch Trait Desc");
                        }
                        const data = await response.json();
                        return data.desc; 
                    })
                );
                setTraitDesc(descriptions);
            } catch (error) {
                console.error(error.message);
            }
        };
    
        if (traitUrls.length > 0) {
            fetchTraitDescriptions();
        }
    }, [traitUrls]);

    useEffect(() => {
        if (traitDesc.length > 0 && traitNames.length > 0) {
            const infos = traitNames.map((name, index) => ({
                name: name,
                description: traitDesc[index] || 'Description not available', // Default if missing
            }));
            setTraitInfo(infos);
        }
    }, [traitDesc, traitNames]);
    

    const [languages, setLanguages] = useState([]);
    const [humanLang, setHumanLanguage] = useState('');
    const handleSubmitHumanLanguage = (e) => {
        e.preventDefault();
        setLanguages((prev) => [...prev, humanLang]);
        handleNext(); 
    };
    useEffect(() => {
        console.log('Languages: ', languages);
    }, [languages]);
    

    const [charClass, setCharClass] = useState('');
    const handleSubmitClass = (e) => {
        e.preventDefault();
        console.log('Selected: ', charClass);
        handleNext();
    };

    // step 5
    const [stats, setStats] = useState([]);
    const rollStats = () => {
        const newStats = Array.from({ length: 6 }, () => rollSingleStat());
        setStats(newStats);
    };
    // roll four six-sided dice, drop the lowest, and sum the remaining
    const rollSingleStat = () => {
        const rolls = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1);
        rolls.sort((a, b) => a - b);
        const dropped = rolls.shift();
        const total = rolls.reduce((sum, roll) => sum + roll, 0);
        return { rolls, dropped, total };
    };

    // step 6
    const [assignedStats, setAssignedStats] = useState({
        strength: null,
        dexterity: null,
        constitution: null,
        intelligence: null,
        wisdom: null,
        charisma: null,
      });
    const handleDragStart = (e, index) => {
        e.dataTransfer.setData("statIndex", index);
    };
    
    const handleDrop = (e, ability) => {
        const statIndex = e.dataTransfer.getData("statIndex");
        const statToAssign = stats[statIndex];

        const previousAbility = Object.keys(assignedStats).find(
            (key) => assignedStats[key]?.index === statIndex
        );
    
        if (previousAbility) {
            // Remove the stat from the previous ability
            setAssignedStats((prev) => ({
                ...prev,
                [previousAbility]: null,
            }));
        }

        // Assign stat to ability
        setAssignedStats({
            ...assignedStats,
            [ability]: statToAssign,
        });
    };
    const handleDragOver = (e) => {
        e.preventDefault();
    };
    const handleSubmitStats = () => {
        const newAbilityScores = { ...abilityScores };
        Object.keys(assignedStats).forEach((ability) => {
            const stat = assignedStats[ability];
            if (stat !== null) {
                newAbilityScores[ability] = stat.total;
            }
        });
        Object.keys(abilityBonuses).forEach((ability) => {
            const abbreviation = abilityAbbreviation[ability]; 
            const bonus = abilityBonuses[abbreviation]; 
            
            if (bonus !== null && newAbilityScores[ability] !== undefined) {
                newAbilityScores[ability] += bonus; 
            }
        });
        setAbilityScores(newAbilityScores); 
        handleNext();
    }
    const [abilityScores, setAbilityScores] = useState({
        strength: null,
        dexterity: null,
        constitution: null,
        intelligence: null,
        wisdom: null,
        charisma: null,
    });
    const allAssigned = Object.values(assignedStats).every(value => value !== null);

    // step 7
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
    const calculateModifier = (stat) => Math.floor((abilityScores[stat] - 10) / 2);
    const [taggedSkills, setTaggedSkills] = useState(new Set());
    const [taggableSkills, setTaggableSkills] = useState([]); 
    const [maxTags, setMaxTags] = useState(0);
    const skillBonus = 2; 
    const toggleSkillTag = (skill) => {
        setTaggedSkills((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(skill)) {
                newSet.delete(skill);
            } else if (newSet.size < maxTags) {
                newSet.add(skill); 
            }
            return newSet;
        });
    };
    // method to get info from the class, used in step 7, 8
    useEffect(() => {
        const fetchClassInfo = async (query) => {
            try {
                const response = await fetch(query);
                if (!response.ok) {
                    throw new Error("Failed to fetch class info");
                }
                const data = await response.json();
                // step 7
                const proficiencyChoices = data.proficiency_choices.find(
                    (choice) => choice.type === "proficiencies"
                );
                if (proficiencyChoices) {
                    setMaxTags(proficiencyChoices.choose);
                    const skills = proficiencyChoices.from.options.map(
                        (option) => option.item.name.replace("Skill: ", "") // extract skill names
                    );
                    setTaggableSkills(skills);
                }
                // step 8
                const filteredProficiencies = data.proficiencies
                    .filter((proficiency) => !proficiency.name.includes("Saving Throw"))
                    .map((proficiency) => proficiency.name);
                setProficiencies(filteredProficiencies);

            } catch (error) {
                console.error("Error fetching class info:", error);
            }
        };

        const query = `https://www.dnd5eapi.co/api/classes/${charClass}`;
        fetchClassInfo(query);
    }, [charClass]);
    // step 8
    const [proficiencies, setProficiencies] = useState([]);
    // step 9
    const [alignment, setAlignment] = useState('');
    const alignments = ["Lawful Good", "Neutral Good", "Chaotic Good", "Lawful Neutral", "True Neutral", 
        "Chaotic Neutral", "Lawful Evil", "Neutral Evil", "Chaotic Evil"];
    // saving character to move on to leveling
    const goToDashboard = () => {
        navigate('/dashboard');
    }
    const saveCharacter = async () => {
        const ac = 10 + calculateModifier("dexterity");
        const str = abilityScores['strength'];
        const dex = abilityScores['dexterity'];
        const con = abilityScores['constitution'];
        const int = abilityScores['intelligence'];
        const wis = abilityScores['wisdom'];
        const cha = abilityScores['charisma'];
        const skillPayload = Object.keys(skillMapping).map((skill) => ({
            skill_name: skill,
            is_tagged: taggedSkills.has(skill) ? 1 : 0,
        }))
        try {
            const characterResponse = await axios.post('http://localhost:5000/api/newcharacter', {
                userId,
                str,
                dex,
                con,
                int,
                wis,
                cha,
                race,
                charClass,
                ac,
                speed,
                alignment
            });
            const charId = characterResponse.data.charId;
            setCharacterId(charId);
            
            // Log success
            console.log("Character created successfully, ID:", charId);
        
            const skillResponse = await axios.post('http://localhost:5000/api/newskills', {
                id: charId,
                skills: skillPayload
            });
            console.log("Skills response:", skillResponse.data);

            console.log("Sending urls: ", traitUrls);
            /*
            const traitResponse = await axios.post('http://localhost:5000/api/newtraits', {
                id: charId,
                traits: traitUrls
            });
            console.log("Traits response:", traitResponse.data);
            */
        
            navigate('/levelup');
        } catch (error) {
            console.error('Error posting new character or navigating:', error.response ? error.response.data : error);
        }
        
    };

    return (
        <div>
            <header class="app-header">
                <div class="app-title">How to DND</div>
                <div class="page-description">New Character</div>
            </header>
        <div className = "section-container">

            {currentStep === 1 && (
                <div className = "login-page">
                    <h2>What is your character's name?</h2>
                    <form className = "login-form" onSubmit={handleSubmitName}>
                        <input
                            type="text"
                            className = "input-field"
                            placeholder="Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                        <button className = "button button-next" disabled={!name.trim()}>Next</button>
                    </form>
                </div>
            )}

            {currentStep === 2 && (
                <div>
                    <h2>Pick a race</h2>
                    <form className = "form" onSubmit={handleSubmitRace}>
                        <div className="radio-container">
                            {['human', 'dwarf', 'tiefling', 'elf', 'half-elf', 'dragonborn', 'gnome', 'halfling', 'half-orc'].map((races, index) => (
                                <div key={index} className="radio-option">
                                    <label>
                                        <input
                                            type="radio"
                                            name="races"
                                            value={races}
                                            checked={races === race}
                                            onChange={(e) => setRace(e.target.value)}
                                            required
                                        />
                                        {races.charAt(0).toUpperCase() + races.slice(1).toLowerCase()}
                                    </label>
                                </div>
                            ))}
                        </div>
                        <div className = "button-group">
                        <button className="button button-next" type="submit" disabled={!race}>
                            Next
                        </button>
                        <button className="button button-previous" type="button" onClick={handlePrevious}>
                            Previous
                        </button>
                        </div>
                    </form>
                    {traitNames.length > 0 && (
                        <div>
                            <h3>Traits for {race.charAt(0).toUpperCase() + race.slice(1).toLowerCase()}</h3>
                            <ul className = "list">
                                {traitInfo.map((trait, index) => (
                                    <li key={index}>
                                        <strong>{trait.name}:</strong>
                                        <p>{Array.isArray(trait.description) ? trait.description[0] : trait.description}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}


            {currentStep === 3 && (
                <div>
                    <h2>Languages</h2>
                    {race === 'human' && (
                        <form className = "form" onSubmit={handleSubmitHumanLanguage}>
                            <h3>Choose one language in addition to Common</h3>
                            <div className="radio-container">
                            {['Dwarfish', 'Elvish', 'Giant', 'Gnomish', 'Goblin', 'Halfling', 'Orc', 'Abyssal', 'Celestial', 'Draconic', 'Infernal'].map((lang, index) => (
                                <div key={index} className="radio-option">
                                    <label>
                                        <input
                                            type="radio"
                                            name="languages"
                                            value={lang}
                                            checked={lang === humanLang}
                                            onChange={(e) => setHumanLanguage(e.target.value)}
                                            required
                                        />
                                        {lang}
                                    </label>
                                </div>
                            ))}
                            </div>
                            <div className = "button-group">
                            <button className="button button-next" type="submit" disabled={!humanLang}>
                                Next
                            </button>
                            <button className="button button-previous" type="button" onClick={handlePrevious}>
                                Previous
                            </button>
                            </div>
                        </form>
                    )}
                    {race !=='human' && (
                        <>
                        <h3>You speak the following languages</h3>
                        <ul className = "list">
                            {languages.map((language) => (
                                <li key = {language}>{language}</li>
                            ))}
                        </ul> 
                        <div className = "button-group">
                        <button className="button button-next" onClick = {handleNext}>Next</button>
                        <button className="button button-previous" onClick = {handlePrevious}>Previous</button>
                        </div>
                        </>
                    )}
                </div>
            )}


            {currentStep === 4 && (
                <div>
                    <h2>Pick a class</h2>
                    <form onSubmit={handleSubmitClass}>
                        <div className="radio-container">
                            {['barbarian', 'bard', 'cleric', 'druid', 'fighter', 'monk', 'paladin', 'ranger',
                                'rogue', 'sorcerer', 'warlock', 'wizard'].map((charClassOption, index) => (
                                <div key={index} className="radio-option">
                                    <label>
                                        <input
                                            type="radio"
                                            name="classes"
                                            value={charClassOption}
                                            checked={charClass === charClassOption}
                                            onChange={(e) => setCharClass(e.target.value)}
                                            required
                                        />
                                        {charClassOption.charAt(0).toUpperCase() + charClassOption.slice(1).toLowerCase()}
                                    </label>
                                </div>
                            ))}
                        </div>
                        <div className = "button-group">
                        <button className="button button-next" type="submit" disabled={!charClass}>Next</button>
                        <button className="button button-previous" type="button" onClick={handlePrevious}>Previous</button>
                        </div>
                    </form>
                </div>
            )}

            {currentStep === 5 && (
                <div>
                <h3>Roll Your Stats</h3>
                <div>
                  <button className="button button-next" onClick={rollStats}>
                    Roll Stats
                  </button>
                </div>
              
                {stats.length > 0 && (
                  <div className="stats-container">
                    <h4>Your Rolled Stats</h4>
                    <ul className="list">
                      {stats.map((stat, index) => (
                        <li key={index} className="stat-item">
                          <strong>Stat {index + 1}:</strong>
                          <p>
                            Rolls: {stat.rolls.join(', ')}
                            <br />
                            Dropped: {stat.dropped}
                            <br />
                            Total: {stat.total}
                          </p>
                        </li>
                      ))}
                    </ul>
                    <div className = "button-group">
                        <button className= "button button-previous" onClick = {rollStats}>Reroll</button>
                        <button className = "button button-next" onClick = {handleNext}>Next</button>
                        </div>
                  </div>
                )}
              </div>
            )}


            {currentStep === 6 && (
                <div id="assign-stats">
                <h2>Assign Stats</h2>
                <p>A bonus (+) is added based on your race.</p>
                <ul id="stats-list">
                  {stats.map((stat, index) => (
                    <li
                      key={index}
                      className={`stat-item ${Object.values(assignedStats).includes(stat) ? 'disabled' : ''}`}
                      draggable={!Object.values(assignedStats).includes(stat)} // Disable dragging if already assigned
                      onDragStart={(e) => handleDragStart(e, index)}
                    >
                      Stat {index + 1}: {stat.total}
                    </li>
                  ))}
                </ul>
                <div id="drop-zones">
                  {Object.keys(assignedStats).map((ability) => {
                    const abbreviation = abilityAbbreviation[ability.toLowerCase()];
                    return (
                      <div
                        key={ability}
                        className="drop-zone"
                        onDrop={(e) => handleDrop(e, ability)}
                        onDragOver={(e) => e.preventDefault()}
                      >
                        <h4 className="ability-title">{ability.charAt(0).toUpperCase() + ability.slice(1)}</h4>
                        {assignedStats[ability] === null ? (
                          <p className="drop-message">Drag and drop your stats</p>
                        ) : (
                          <p className="assigned-stat">
                            {assignedStats[ability]?.total} 
                            {abilityBonuses[abbreviation] != null && abilityBonuses[abbreviation] !== 0 && (
                              <span className="bonus">(+{abilityBonuses[abbreviation]})</span>
                            )}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div id="buttons">
                  <button id="next-button" onClick={handleSubmitStats} disabled={!allAssigned}>Next</button>
                  <button id="previous-button" onClick={handlePrevious}>Previous</button>
                </div>
              </div>              
            )}

            {currentStep === 7 && (
                <div>
                    <h2>Tag Your Skills</h2>
                    <p>Your proficiency bonus is added to all tagged skills.</p>
                    <ul
                        style={{
                            listStyleType: 'none',
                            padding: 0,
                            margin: 0,
                            display: 'grid', /* Use grid for layout */
                            gridTemplateColumns: 'repeat(2, 1fr)', /* Two equal columns */
                            gap: '10px', /* Space between the grid items */
                        }}
                        >
                        {Object.entries(skillMapping).map(([skill, stat]) => {
                            const isTaggable = taggableSkills.includes(skill);
                            const isTagged = taggedSkills.has(skill);
                            const modifier = Math.floor((abilityScores[stat] - 10) / 2) + (isTagged ? skillBonus : 0);

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
                                        background: isTagged ? '#111' : isTaggable ? '#222' : '#222222',
                                        cursor: isTaggable ? 'pointer' : 'not-allowed',
                                        opacity: isTaggable ? 1 : 0.6,
                                    }}
                                    onClick={() => isTaggable && toggleSkillTag(skill)}
                                >
                                    <span>{skill} ({stat})</span>
                                    <span>
                                        Modifier: {modifier >= 0 ? '+' : ''}{modifier}
                                    </span>
                                </li>
                            );
                        })}
                    </ul>
                    <div className = "button-group">
                    <button className="button button-next" onClick={handleNext} disabled={taggedSkills.size !== maxTags}>
                        Next
                    </button>
                    <button className="button button-previous" onClick={handlePrevious}>Previous</button>
                    </div>
                </div>
            )}
            {currentStep === 8 && (
                <div>
                    <h2>Proficiences</h2>
                    <h3>You are proficient in the following: </h3>
                    <ul className = "list">
                        {proficiencies.map((proficiency) => (
                            <li key = {proficiency}>{proficiency}</li>
                        ))}
                    </ul>
                    <div className = "button-group">
                    <button className="button button-next" onClick = {handleNext}>Next</button>
                    <button className="button button-previous" onClick = {handlePrevious}>Previous</button>
                    </div>
                </div>
            )}
            {currentStep === 9 && (
                <div>
                    <h2>Choose your alignment</h2>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)', // Create 3 equal columns
                            gap: '15px', // Space between buttons
                            marginTop: '20px',
                            justifyItems: 'center', // Center the buttons within each column
                        }}
                        >
                    {alignments.map((a) => (
                        <button className = "button button-previous" key={a} onClick={() => setAlignment(a)}>
                            {a}
                        </button>
                    ))}
                    </div>
                    <div className = "button-group">
                    <button className="button button-next" onClick = {goToDashboard} disabled = {!alignment}>Return to Dashboard</button>
                    </div>
                </div>
            )}
            </div>
        </div>
    );
};

export default NewCharacter;
