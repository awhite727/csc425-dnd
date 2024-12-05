import React, { useEffect,useState } from 'react';
import axios from 'axios';
import {useNavigate} from 'react-router-dom';
import { useCharacter } from './CharacterContext';

const LevelCharacter = () => {

    const charId = useCharacter();
    const [char, setCharacter] = useState({});  // used for previous stats, does not update
    const [newChar, setNewCharacter] = useState({}); // used for new stats, sent to database after leveling up
    const [featureUrls, setFeatureUrls] = useState([]);
    const [spells, setSpells] = useState([]);
    const [spellsTaken, setSpellsTaken] = useState(0);
    const [characterSelected, setCharacterSelected] = useState(0);
    const [cantrips, setCantrips] = useState([]);


    const navigate = useNavigate();
    

    /*
    useEffect(() => {
        axios
            .get('http://localhost:5000/api/characters', {
                params: { id: charId }
            })
            .then(response => {
                const character = response.data.data;
                setCharacter(character);
                setNewCharacter(character); 
            })
            .catch(error => {
                console.error('Error fetching character:', error);
            });
        axios.get('http://localhost:5000/api/spells', {
            params: {
                id: charId
            }
        })
            .then(response => {
                const spls = response.data.data;
                setSpells(spls);
                const splsTaken = spls.filter(spell => !spell.feature).length;
                setSpellsTaken(splsTaken);
            })
            .catch(error => {
                console.error('Error fetching spells:', error);
            });
    }, [charId]); */

    const statsMapping = {
        strength: ["Barbarian", "Fighter", "Paladin"],
        dexterity: ["Monk", "Rogue", "Ranger"],
        constitution: ["Barbarian", "Fighter", "Sorcerer"],
        intelligence: ["Wizard", "Warlock", "Artificer"],
        wisdom: ["Cleric", "Druid", "Monk"],
        charisma: ["Bard", "Sorcerer", "Warlock"]
      };
      
      const defaultStatValue = 10; // Base value for all stats
      const specializedStatValue = 15; // Value for specialized stats
      
      const createCharacter = (className) => {
        const character = {
          name: classNames[className] || "",
          strength: defaultStatValue,
          dexterity: defaultStatValue,
          constitution: defaultStatValue,
          intelligence: defaultStatValue,
          wisdom: defaultStatValue,
          charisma: defaultStatValue,
          level: 0,
          class: className,
          subclass: "none",
          ac: 0,
          hp: 0,
          speed: 0,
          bonus: 1,
          alignment: ""
        };
      
        // Assign specialized stat values
        Object.keys(statsMapping).forEach(stat => {
          if (statsMapping[stat].includes(className)) {
            character[stat] = specializedStatValue;
          } else {
            character[stat] += Math.floor(Math.random() * 6) - 2;
          }
        });
        setCurrentStep(1);
        setCharacterSelected(1);
        setCharacter(character);
      };
      
      const classes = [
        "barbarian", "bard", "cleric", "druid", "fighter", 
        "monk", "paladin", "ranger", "rogue", "sorcerer", 
        "warlock", "wizard"
      ];
      const classNames = {
        barbarian: "Thogar the Mighty",
        bard: "Lira Songweaver",
        cleric: "Eldon Lightbringer",
        druid: "Kael Oakroot",
        fighter: "Duncan Ironblade",
        monk: "Zin Fistsworn",
        paladin: "Arden Valiant",
        ranger: "Sylas Windstrider",
        rogue: "Shade Daggerfall",
        sorcerer: "Aria Stormcaller",
        warlock: "Dren Shadowbound",
        wizard: "Merric Spellwright"
      };
      

    // fetching character info
    const [spellsKnown, setSpellsKnown] = useState(0);
    const [cantripsKnown, setCantripsKnown] = useState(0);
    const [maxSpellSlot, setMaxSpellSlot] = useState(0);
    const [potentialCantrips, setPotentialCantrips] = useState([]);
    const [spellUrls, setSpellUrls] = useState([]);
    const [cantripsTaken, setCantripsTaken] = useState(0);
    const [spellcastInfo, setSpellcastInfo] = useState([]);
    const [classInfo, setClassInfo] = useState({});

    useEffect(() => {
        // setting new character information
        setNewCharacter({
            ...char,
            level: char.level + 1, 
        });
    
        if ((char.level + 1) === 1) {
            setNewCharacter((prevChar) => ({
                ...prevChar,
                hp: hitDice[char.class] + Math.max(calculateModifier(char.constitution), 0),
            }));
        }
    
        if ((char.level + 1) % 4 === 1) {
            setNewCharacter((prevChar) => ({
                ...prevChar,
                bonus: prevChar.bonus + 1,
            }));
        }
        setSpellsTaken(spells.length);
        setCantripsTaken(cantrips.length);
    
        // getting information about this level
        const fetchLevelInfo = async (query) => {
            try {
                const response = await fetch(query);
                if (!response.ok) {
                    throw new Error("Failed to fetch class info");
                }
                const data = await response.json();
                if (data.features)
                if (data.features.length > 0) {
                    const urls = data.features.map((feat) => feat.url);
                    setFeatureUrls(urls);
                }
                if (data.spellcasting) {
                    if (data.spellcasting.spells_known) {
                        setSpellsKnown(data.spellcasting.spells_known);
                    } else if (char.class === "cleric" || char.class === "druid") {
                        setSpellsKnown(Math.max(char.level + 1 + calculateModifier(char.wisdom), 1));
                    } else if (char.class === "paladin" && char.level>1) {
                        setSpellsKnown(Math.max(Math.floor((char.level + 1) / 2) + calculateModifier(char.charisma), 1));
                    } else if (char.class === "wizard") {
                        if ((char.level + 1) === 1) {
                            setSpellsKnown(6);
                        } else {
                            setSpellsKnown(6 + (char.level + 1) * 2);
                        }
                    }
        
                    if (data.spellcasting.cantrips_known) {
                        setCantripsKnown(data.spellcasting.cantrips_known);
                    }
        
                    let max = 0;
                    for (let i = 1; i <= 9; i++) {
                        if (data.spellcasting[`spell_slots_level_${i}`] > 0) {
                            max = i;  // Update maxSpellSlot to the highest level with available slots
                        }
                    }
                    setMaxSpellSlot(max);
                    setSpellcastInfo(data.spellcasting);
                    setClassInfo(data.class_specific);
        
                    // After setting maxSpellSlot, fetch the potential spells
                    const spellQuery = `https://www.dnd5eapi.co/api/classes/${char.class}/spells`;
                    fetchPotentialSpells(spellQuery, max);
                }
            } catch (error) {
                console.error("Error fetching class info:", error);
            }
        };
    
        const levelQuery = `https://www.dnd5eapi.co/api/classes/${char.class}/levels/${char.level + 1}`;
        fetchLevelInfo(levelQuery);
    
    }, [char]); 
    
    // Separate function for fetching potential spells
    const fetchPotentialSpells = async (query, maxSpellSlot) => {
        try {
            const response = await fetch(query);
            if (!response.ok) {
                console.error("Error fetching spells: ", response);
                return;
            }
            const spellList = await response.json();
            const potCantrips = spellList.results.filter((spell) => 
                spell.level === 0 &&
                !spells.some((knownSpell) => knownSpell.spellname === spell.index)
            );
            const potSpells = spellList.results.filter((spell) => 
                spell.level > 0 &&
                spell.level <= maxSpellSlot && // Only include spells up to maxSpellSlot level
                !spells.some((knownSpell) => knownSpell === spell.index) // Exclude known spells
            );
            setPotentialCantrips(potCantrips);
            setSpellUrls(potSpells.map(spell => spell.url));
        } catch (error) {
            console.error("Error fetching spells:", error);
        }
    };
    

    const [currentStep, setCurrentStep] = useState(0);
    const handleNext = () => {
        setCurrentStep((prevStep) => prevStep + 1); // Go to next step immediately
    };

    // step 1: updating stats
    const hitDice = {
        barbarian: 12,
        bard: 8,
        cleric: 8,
        druid: 8,
        fighter: 10,
        monk: 8,
        paladin: 10,
        ranger: 10,
        rogue: 8,
        sorcerer: 6,
        warlock: 8,
        wizard: 6
    };
    const calculateModifier = (score) => Math.floor((score - 10) / 2);
    const [hpDice, setHpDice] = useState(0);
    const rollHP = () => {
        const diceRoll = Math.floor(Math.random() * hitDice[char.class]) + 1;
        const conMod = calculateModifier(char.constitution);
        setHpDice(diceRoll);
        setNewCharacter((prevChar) => ({
            ...prevChar,
            hp: char.hp + diceRoll + Math.max(conMod, 0)}));
    };

    // step 2: feature list

    const [features, setFeatures] = useState([]);

    useEffect(() => {
        const fetchFeatures = async () => {
            try {
                const feats = await Promise.all(
                    featureUrls.map(async (url) => {
                        const query = `https://www.dnd5eapi.co${url}`;
                        const response = await fetch(query);
                        if (!response.ok) {
                            throw new Error("Failed to fetch features");
                        }
                        return response.json();
                    })
                );
                setFeatures(feats);
            } catch (error) {
                console.error("Error fetching features:", error);
            }
        };
        if (featureUrls.length > 0) {
            fetchFeatures();
        }
    }, [featureUrls]);

    // step 3: subclass stuff
    // object that holds subclass information
    const subclasses = {
        barbarian: {
            subclassLevels: [3, 6, 10, 14],
            choices: {
                berserker: {
                    index: "lore",
                    name: "Path of the Berserker",
                    description: "For some barbarians, rage is a means to an end, that end being violence. The Path of the Berserker is a path of untrammeled fury,slick with blood. As you enter the berserker's rage, you thrill in the chaos of battle, heedless of your own health or well-being.",
                    features: {
                        3: [{
                            index: "subclass.berserker.3",
                            name: "Frenzy",
                            description: "Starting when you choose this path at 3rd level, you can go into a frenzy when you rage. If you do so, for the duration of your rage you can make a single melee weapon attack as a bonus action on each of your turns after this one. When your rage ends, you suffer one level of exhaustion."
                        }],
                        6: [{
                            index: "subclass.berserker.6",
                            name: "Mindless Rage",
                            description: "Beginning at 6th level, you can't be charmed or frightened while raging. If you are charmed or frightened when you enter your rage, the effect is suspended for the duration of the rage."
                        }],
                        10: [{
                            index: "subclass.berserker.10",
                            name: "Intimidating Presence",
                            description: "Beginning at 10th level, you can use your action to frighten someone with your menacing presence. When you do so, choose one creature that you can see within 30 feet of you. If the creature can see or hear you, it must succeed on a Wisdom saving throw (DC equal to 8 + your proficiency bonus + your Charisma modifier) or be frightened of you until the end of your next turn. On subsequent turns, you can use your action to extend the duration of this effect on the frightened creature until the end of your next turn. This effect ends if the creature ends its turn out of line of sight or more than 60 feet away from you. If the creature succeeds on its saving throw, you can't use this feature on that creature again for 24 hours."
                        }],
                        14: [{
                            index: "subclass.berserker.14",
                            name: "Retaliation",
                            description: "Starting at 14th level, when you take damage from a creature that is within 5 feet of you, you can use your reaction to make a melee weapon attack against that creature."
                        }]
                    }
                }
            }
        },
        bard: {
            subclassLevels: [3, 6, 14],
            choices: {
                lore: {
                    index: "lore",
                    name: "College of Lore",
                    description: "Bards of the College of Lore know something about most things, collecting bits of knowledge from sources as diverse as scholarly tomes and peasant tales. Whether singing folk ballads in taverns or elaborate compositions in royal courts, these bards use their gifts to hold audiences spellbound. When the applause dies down, the audience members might find themselves questioning everything they held to be true, from their faith in the priesthood of the local temple to their loyalty to the king.",
                    features: {
                        3: [{
                            index: "subclass.lore.3",
                            name: "Cutting Words",
                            description: "You learn how to use your wit to distract, confuse, and otherwise sap the confidence and competence of others. When a creature that you can see within 60 feet of you makes an attack roll, an ability check, or a damage roll, you can use your reaction to expend one of your uses of Bardic Inspiration, rolling a Bardic Inspiration die and subtracting the number rolled from the creature's roll. You can choose to use this feature after the creature makes its roll, but before the DM determines whether the attack roll or ability check succeeds or fails, or before the creature deals its damage. The creature is immune if it can't hear you or if it's immune to being charmed."
                        }],
                        6: [{
                            index: "subclass.lore.6",
                            name: "Additional Magical Secrets",
                            description: "At 6th level, you learn two spells of your choice from any class. A spell you choose must be of a level you can cast, as shown on the Bard table, or a cantrip. The chosen spells count as bard spells for you but don't count against the number of bard spells you know."
                        }],
                        14: [{
                            index: "subclass.lore.14",
                            name: "Peerless Skill",
                            description: "Starting at 14th level, when you make an ability check, you can expend one use of Bardic Inspiration. Roll a Bardic Inspiration die and add the number rolled to your ability check. You can choose to do so after you roll the die for the ability check, but before the DM tells you whether you succeed or fail."
                        }]
                    }
                },
                valor: {
                    index: "valor",
                    name: "College of Valor",
                    description: "Bards of the College of Valor are daring skalds whose tales keep alive the memory of the great heroes of the past, and thereby inspire a new generation of heroes. These bards gather in mead halls or around great bonfires to sing the deeds of the mighty, both past and present. They travel the land to witness great events firsthand and to ensure that the memory of those events doesn't pass from the world. With their songs, they inspire others to reach the same heights of accomplishment as the heroes of old.",
                    features: {
                        3: [{
                            index: "subclass.valor.3",
                            name: "Combat Inspiration",
                            description: "You learn to inspire others in battle. A creature that has a Bardic Inspiration die from you can roll that die and add the number rolled to a weapon damage roll it just made. Alternatively, when an attack roll is made against the creature, it can use its reaction to roll the Bardic Inspiration die and add the number rolled to its AC against that attack, after seeing the roll but before knowing whether it hits or misses."
                        }],
                        6: [{
                            index: "subclass.valor.6",
                            name: "Extra Attack",
                            description: "Starting at 6th level, you can attack twice, instead of once, whenever you take the Attack action on your turn."
                        }],
                        14: [{
                            index: "subclass.valor.14",
                            name: "Battle Magic",
                            description: "At 14th level, you have mastered the art of weaving spellcasting and weapon use into a single harmonious act. When you use your action to cast a bard spell, you can make one weapon attack as a bonus action."
                        }]
                    }
                }
            }
        },
        cleric: {
            subclassLevels: [1, 2, 3, 5, 6, 7, 8, 17],
            choices: {
                life: {
                    index: "life",
                    name: "Life Domain",
                    description: "The Life domain focuses on the vibrant positive energy, one of the fundamental forces of the universe, that sustains all life. The gods of life promote vitality and health through healing the sick and wounded, caring for those in need, and driving away the forces of death and undeath. Almost any non-evil deity can claim influence over this domain, particularly agricultural deities (such as Chauntea, Arawai, and Demeter), sun gods (such as Lathander, Pelor, and Re-Horakhty), gods of healing or endurance (such as Ilmater, Mishakal, Apollo, and Diancecht), and gods of home and community (such as Hestia, Hathor, and Boldrci).",
                    features: {
                        1: [{
                            index: "subclass.life.1",
                            name: "Disciple of Life",
                            description: "Your healing spells are more effective. Whenever you use a spell of 1st level or higher to restore hit points to a creature, the creature regains additional hit points equal to 2 + the spell's level."
                        }],
                        2: [{
                            index: "subclass.life.2",
                            name: "Channel Divinity: Preserve Life",
                            description: "As an action, you present your holy symbol and evoke healing energy that can restore a number of hit points equal to five times your cleric level. Choose any creatures within 30 feet of you, and divide those hit points among them. This feature can restore a creature to no more than half of its hit point maximum. You can't use this feature on an undead or a construct."
                        }],
                        6: [{
                            index: "subclass.life.6",
                            name: "Blessed Healer",
                            description: "Beginning at 6th level, the healing spells you cast on others heal you as well. When you cast a spell of 1st level or higher that restores hit points to a creature other than you, you regain hit points equal to 2 + the spell's level."
                        }],
                        8: [{
                            index: "subclass.life.8",
                            name: "Divine Strike",
                            description: "At 8th level, you gain the ability to infuse your weapon strikes with divine energy. Once on each of your turns when you hit a creature with a weapon attack, you can cause the attack to deal an extra 1d8 radiant damage to the target. When you reach 14th level, the extra damage increases to 2d8."
                        }],
                        17: [{
                            index: "subclass.life.17",
                            name: "Supreme Healing",
                            description: "Starting at 17th level, when you would normally roll one or more dice to restore hit points with a spell, you instead use the highest number possible for each die. For example, instead of restoring 2d6 hit points to a creature, you restore 12."
                        }]
                    },
                    spells: {
                        1: [{
                            index: "bless",
                            name: "Bless"
                        },
                        {
                            index: "cure-wounds",
                            name: "Cure Wounds"
                        }],
                        3: [{
                            index: "lesser-restoration",
                            name: "Lesser Restoration"
                        },
                        {
                            index: "spiritual-weapon",
                            name: "Spiritual Weapon"
                        }],
                        5: [{
                            index: "beacon-of-hope",
                            name: "Beacon of Hope"
                        },
                        {
                            index: "revivify",
                            name: "Revivify"
                        }],
                        7: [{
                            index: "death-ward",
                            name: "Death Ward"
                        },
                        {
                            index: "guardian-of-faith",
                            name: "Guardian of Faith"
                        }],
                        9: [{
                            index: "mass-cure-wounds",
                            name: "Mass Cure Wounds"
                        },
                        {
                            index: "raise-dead",
                            name: "Raise Dead"
                        }]
                    }
                },
                war: {
                    index: "war",
                    name: "War Domain",
                    description: "War has many manifestations. It can make heroes of ordinary people. It can be desperate and horrific, with acts of cruelty and cowardice eclipsing instances of excellence and courage. In either case, the gods of war watch over warriors and reward them for their great deeds. The clerics of such gods excel in battle, inspiring others to fight the good fight or offering acts of violence as prayers. Gods of war include champions of honor and chivalry (such as Torm, Heironeous, and Kiri-Jolith) as well as gods of destruction and pillage (such as Erythnul, the Fury, Gruumsh, and Ares) and gods of conquest and domination (such as Bane, Hextor, and Maglubiyet). Other war gods (such as Tempus, Nike, and Nuada) take a more neutral stance, promoting war in all its manifestations and supporting warriors in any circumstance.",
                    features: {
                        1: [{
                            index: "subclass.war.1",
                            name: "War Priest",
                            description: "From 1st level, your god delivers bolts of inspiration to you while you are engaged in battle. When you use the Attack action, you can make one weapon attack as a bonus action. You can use this feature a number of times equal to your Wisdom modifier (a minimum of once). You regain all expended uses when you finish a long rest."
                        }],
                        2: [{
                            index: "subclass.war.2",
                            name: "Channel Divinity: Guided Strike",
                            description: "Starting at 2nd level, you can use your Channel Divinity to strike with supernatural accuracy. When you make an attack roll, you can use your Channel Divinity to gain a +10 bonus to the roll. You make this choice after you see the roll, but before the DM says whether the attack hits or misses."
                        }],
                        6: [{
                            index: "subclass.war.6",
                            name: "Channel Divinity: War God's Blessing",
                            description: "At 6th level, when a creature within 30 feet of you makes an attack roll, you can use your reaction to grant that creature a +10 bonus to the roll, using your Channel Divinity. You make this choice after you see the roll, but before the DM says whether the attack hits or misses."
                        }],
                        8: [{
                            index: "subclass.war.8",
                            name: "Divine Strike",
                            description: "At 8th level, you gain the ability to infuse your weapon strikes with divine energy. Once on each of your turns when you hit a creature with a weapon attack, you can cause the attack to deal an extra 1d8 damage of the same type dealt by the weapon to the target. When you reach 14th level, the extra damage increases to 2d8."
                        }],
                        17: [{
                            index: "subclass.war.17",
                            name: "Avatar of Battle",
                            description: "At 17th level, you gain resistance to bludgeoning, piercing, and slashing damage from nonmagical attacks."
                        }]
                    },
                    spells: {
                        1: [{
                            index: "divine-favor",
                            name: "Divine Favor"
                        },
                        {
                            index: "shield-of-faith",
                            name: "Shield of Faith"
                        }],
                        3: [{
                            index: "magic-weapon",
                            name: "Magic Weapon"
                        },
                        {
                            index: "spiritual-weapon",
                            name: "Spiritual Weapon"
                        }],
                        5: [{
                            index: "spirit-guardians",
                            name: "Spirit Guardians"
                        }],
                        7: [{
                            index: "freedom-of-movement",
                            name: "Freedom of Movement"
                        },
                        {
                            index: "stoneskin",
                            name: "Stoneskin"
                        }],
                        9: [{
                            index: "flame-strike",
                            name: "Flame Strike"
                        },
                        {
                            index: "hold-monster",
                            name: "Hold Monster"
                        }]
                    }
                }
            }
        },
        druid: {
            subclassLevels: [2, 6, 10, 14],
            choices: {
                moon: {
                    index: "moon",
                    name: "Circle of the Moon",
                    description: "Druids of the Circle of the Moon are fierce guardians of the wilds. Their order gathers under the full moon to share news and trade warnings. They haunt the deepest parts of the wilderness, where they might go for weeks on end before crossing paths with another humanoid creature, let alone another druid.",
                    features: {
                        2: [{
                            index: "subclass.moon.2",
                            name: "Combat Wild Shape",
                            description: "When you choose this circle at 2nd level, you gain the ability to use Wild Shape on your turn as a bonus action, rather than as an action. Additionally, while you are transformed by Wild Shape, you can use a bonus action to expend one spell slot to regain 1d8 hit points per level of the spell slot expended."
                        }],
                        6: [{
                            index: "subclass.moon.6",
                            name: "Primal Strike",
                            description: "Starting at 6th level, your attacks in beast form count as magical for the purpose of overcoming resistance and immunity to nonmagical attacks and damage."
                        }],
                        10: [{
                            index: "subclass.moon.10",
                            name: "Elemental Wild Shape",
                            description: "At 10th level, you can expend two uses of Wild Shape at the same time to transform into an air elemental, an earth elemental, a fire elemental, or a water elemental."
                        }],
                        14: [{
                            index: "subclass.moon.14",
                            name: "Thousand Forms",
                            description: "By 14th level, you have learned to use magic to alter your physical form in more subtle ways. You can cast the Alter Self spell at will."
                        }]
                    }
                },
                dreams: {
                    index: "dreams",
                    name: "Circle of Dreams",
                    description: "Druids who are members of the Circle of Dreams hail from regions that have strong ties to the Feywild and its dreamlike realms. The druids’ guardianship of the natural world makes for a natural alliance between them and good-aligned fey. These druids seek to fill the world with dreamy wonder. Their magic mends wounds and brings joy to downcast hearts, and the realms they protect are gleaming, fruitful places, where dream and reality blur together and where the weary can find rest.",
                    features: {
                        2: [{
                            index: "subclass.dreams.2",
                            name: "Balm of the Summer Court",
                            description: "At 2nd level, you become imbued with the blessings of the Summer Court. You are a font of energy that offers respite from injuries. You have a pool of fey energy represented by a number of d6s equal to your druid level. As a bonus action, you can choose an ally you can see within 120 feet of you and spend a number of those dice equal to half your druid level or less. Roll the spent dice and add them together. The target regains a number of hit points equal to the total. The target also gains 1 temporary hit point per die spent."
                        }],
                        6: [{
                            index: "subclass.dreams.6",
                            name: "Hearth of Moonlight and Shadow",
                            description: "At 6th level, home can be wherever you are. During a short or long rest, you can invoke the shadowy power of the Gloaming Court to help guard your respite. At the start of the rest, you touch a point in space, and an invisible, 30-foot-radius sphere of magic appears, centered on that point. Total cover blocks the sphere. While within the sphere, you and your allies gain a +5 bonus to Dexterity (Stealth) and Wisdom (Perception) checks, and any light from open flames in the sphere (a campfire, torches, or the like) isn't visible outside it."
                        }],
                        10: [{
                            index: "subclass.dreams.10",
                            name: "Hidden Paths",
                            description: "Starting at 10th level, you can use the hidden, magical pathways that some fey use to traverse space in a blink of an eye. As a bonus action on your turn, you can teleport up to 60 feet to an unoccupied space you can see. Alternatively, you can use your action to teleport one willing creature you touch up to 30 feet to an unoccupied space you can see."
                        }],
                        14: [{
                            index: "subclass.dreams.14",
                            name: "Walker of Dreams",
                            description: "At 14th level, the magic of the Feywild grants you the ability to travel mentally or physically through dreamlands. When you finish a short rest, you can cast one of the following spells, without expending a spell slot or requiring material components: Dream (with you as the messenger), Scrying, or Teleportation Circle. This use of Teleportation Circle is special. Rather than opening a portal to a permanent teleportation circle, it opens a portal to the last location where you finished a long rest on your current plane of existence. If you haven't taken a long rest on your current plane, the spell fails but isn't wasted."
                        }]
                    }
                }
            }
        },
        fighter: {
            subclassLevels: [3, 7, 10, 15, 18],
            choices: {
                champion: {
                    index: "champion",
                    name: "Champion",
                    description: "The archetypal Champion focuses on the development of raw physical power honed to deadly perfection. Those who model themselves on this archetype combine rigorous training with physical excellence to deal devastating blows.",
                    features: {
                        3: [{
                            index: "subclass.champion.3",
                            name: "Improved Critical",
                            description: "Beginning when you choose this archetype at 3rd level, your weapon attacks score a critical hit on a roll of 19 or 20"
                        }],
                        7: [{
                            index: "subclass.champion.7",
                            name: "Remarkable Athlete",
                            description: "Starting at 7th level, you can add half your proficiency bonus (rounded up) to any Strength, Dexterity, or Constitution check you make that doesn't already use your proficiency bonus. In addition, when you make a running long jump, the distance you can cover increases by a number of feet equal to your Strength modifier."
                        }],
                        10: [{
                            index: "subclass.champion.10",
                            name: "Additional Fighting Style",
                            description: "At 10th level, you can choose a second option from the Fighting Style class feature."
                        }],
                        15: [{
                            index: "subclass.champion.15",
                            name: "Superior Critical",
                            description: "Starting at 15th level, your weapon attacks score a critical hit on a roll of 18-20."
                        }],
                        18: [{
                            index: "subclass.champion.18",
                            name: "Survivor",
                            description: "At 18th level, you attain the pinnacle of resilience in battle. At the start of each of your turns, you regain hit points equal to 5 + your Constitution modifier if you have no more than half of your hit points left. You don't gain this benefit if you have 0 hit points."
                        }]
                    }
                },
                cavalier: {
                    index: "cavalier",
                    name: "Cavalier",
                    description: "The archetypal cavalier excels at mounted combat. Usually born among the nobility and raised at court, a cavalier is equally at home leading a cavalry charge or exchanging repartee at a state dinner. Cavaliers also learn how to guard those in their charge from harm, often serving as the protectors of their superiors and of the weak. Compelled to right wrongs or earn prestige, many of these fighters leave their lives of comfort to embark on glorious adventure.",
                    features: {
                        3: [{
                            index: "subclass.cavalier.3",
                            name: "Born to the Saddle",
                            description: "Starting at 3rd level, your mastery as a rider becomes apparent. You have advantage on saving throws made to avoid falling off your mount. If you fall off your mount and descend no more than 10 feet, you can land on your feet if you’re not incapacitated. Finally, mounting or dismounting a creature costs you only 5 feet of movement, rather than half your speed."
                        }],
                        7: [{
                            index: "subclass.cavalier.7",
                            name: "Warding Maneuver",
                            description: "At 7th level, you learn to fend off strikes directed at you, your mount, or other creatures nearby. If you or a creature you can see within 5 feet of you is hit by an attack, you can roll 1d8 as a reaction if you're wielding a melee weapon or a shield. Roll the die, and add the number rolled to the target's AC against that attack. If the attack still hits, the target has resistance against the attack's damage. You can use this feature a number of times equal to your Constitution modifier (a minimum of once), and you regain all expended uses of it when you finish a long rest."
                        }],
                        10: [{
                            index: "subclass.cavalier.10",
                            name: "Hold the Line",
                            description: "At 10th level, you become a master of locking down your enemies. Creatures provoke an opportunity attack from you when they move 5 feet or more while within your reach, and if you hit a creature with an opportunity attack, the target's speed is reduced to 0 until the end of the current turn."
                        }],
                        15: [{
                            index: "subclass.cavalier.15",
                            name: "Ferocious Charger",
                            description: "Starting at 15th level, you can run down your foes, whether you're mounted or not. If you move at least 10 feet in a straight line right before attacking a creature and you hit it with the attack, that target must succeed on a Strength saving throw (DC 8 + your proficiency bonus + your Strength modifier) or be knocked prone. You can use this feature only once on each of your turns."
                        }],
                        18: [{
                            index: "subclass.cavalier.18",
                            name: "Vigilant Defender",
                            description: "Starting at 18th level, you respond to danger with extraordinary vigilance. In combat, you get a special reaction that you can take once on every creature's turn, except your turn. You can use this special reaction only to make an opportunity attack, and you can't use it on the same turn that you take your normal reaction."
                        }]
                    }
                }
            }
        },
        monk: {
            subclassLevels: [3, 6, 11, 17],
            choices: {
                openhand: {
                    index: "openhand",
                    name: "Way of the Open Hand",
                    description: "Monks of the Way of the Open Hand are the ultimate masters of martial arts combat, whether armed or unarmed. They learn techniques to push and trip their opponents, manipulate ki to heal damage to their bodies, and practice advanced meditation that can protect them from harm.",
                    features: {
                        3: [{
                            index: "subclass.openhand.3",
                            name: "Open Hand Technique",
                            description: "Starting when you choose this tradition at 3rd level, you can manipulate your enemy's ki when you harness your own. Whenever you hit a creature with one of the attacks granted by your Flurry of Blows, you can impose one of the following effects on that target: It must succeed on a Dexterity saving throw or be knocked prone. It must make a Strength saving throw. If it fails, you can push it up to 15 feet away from you. It can't take reactions until the end of your next turn."
                        }],
                        6: [{
                            index: "subclass.openhand.6",
                            name: "Wholeness of Body",
                            description: "At 6th level, you gain the ability to heal yourself. As an action, you can regain hit points equal to three times your monk level. You must finish a long rest before you can use this feature again."
                        }],
                        11: [{
                            index: "subclass.openhand.11",
                            name: "Tranquility",
                            description: "Beginning at 11th level, you can enter a special meditation that surrounds you with an aura of peace. At the end of a long rest, you gain the effect of a Sanctuary spell that lasts until the start of your next long rest (the spell can end early as normal). The saving throw DC for the spell equals 8 + your Wisdom modifier + your proficiency bonus."
                        }],
                        17: [{
                            index: "subclass.openhand.17",
                            name: "Quivering Palm",
                            description: "At 17th level, you gain the ability to set up lethal vibrations in someone's body. When you hit a creature with an unarmed strike, you can spend 3 ki points to start these imperceptible vibrations, which last for a number of days equal to your monk level. The vibrations are harmless unless you use your action to end them. To do so, you and the target must be on the same plane of existence. When you use this action, the creature must make a Constitution saving throw. If it fails, it is reduced to 0 hit points. If it succeeds, it takes 10d10 necrotic damage. You can have only one creature under the effect of this feature at a time. You can choose to end the vibrations harmlessly without using an action."
                        }]
                    }
                },
                shadow: {
                    index: "shadow",
                    name: "Way of the Shadow",
                    description: "Monks of the Way of Shadow follow a tradition that values stealth and subterfuge. These monks might be called ninjas or shadowdancers, and they serve as spies and assassins. Sometimes the members of a ninja monastery are family members, forming a clan sworn to secrecy about their arts and missions. Other monasteries are more like thieves' guilds, hiring out their services to nobles, rich merchants, or anyone else who can pay their fees. Regardless of their methods, the heads of these monasteries expect the unquestioning obedience of their students.",
                    features: {
                        3: [{
                            index: "subclass.shadow.3",
                            name: "Shadow Arts",
                            description: "Starting when you choose this tradition at 3rd level, you can use your ki to duplicate the effects of certain spells. As an action, you can spend 2 ki points to cast darkness, darkvision, pass without trace, or silence, without providing material components. Additionally, you gain the minor illusion cantrip if you don't already know it."
                        }],
                        6: [{
                            index: "subclass.shadow.6",
                            name: "Shadow Step",
                            description: "At 6th level, you gain the ability to step from one shadow into another. When you are in dim light or darkness, as a bonus action you can teleport up to 60 feet to an unoccupied space you can see that is also in dim light or darkness. You then have advantage on the first melee attack you make before the end of the turn."
                        }],
                        11: [{
                            index: "subclass.shadow.11",
                            name: "Cloak of Shadows",
                            description: "By 11th level, you have learned to become one with the shadows. When you are in an area of dim light or darkness, you can use your action to become invisible. You remain invisible until you make an attack, cast a spell, or are in an area of bright light."
                        }],
                        17: [{
                            index: "subclass.shadow.17",
                            name: "Opportunist",
                            description: "At 17th level, you can exploit a creature's momentary distraction when it is hit by an attack. Whenever a creature within 5 feet of you is hit by an attack made by a creature other than you, you can use your reaction to make a melee attack against that creature."
                        }]
                    }
                }
            }
        },
        paladin: {
            subclassLevels: [3, 5, 7, 9, 13, 15, 17, 20],
            choices: {
                vengeance: {
                    index: "vengeance",
                    name: "Oath of Vengeance",
                    description: "The Oath of Vengeance is a solemn commitment to punish those who have committed a grievous sin. When evil forces slaughter helpless villagers, when an entire people turns against the will of the gods, when a thieves' guild grows too violent and powerful, when a dragon rampages through the countryside, at times like these, paladins arise and swear an Oath of Vengeance to set right that which has gone wrong. To these paladins, sometimes called avengers or dark knights, their own purity is not as important as delivering justice.",
                    features: {
                        3: [{
                            index: "subclass.vengeance.3",
                            name: "Channel Divinity",
                            description: "When you take this oath at 3rd level, you gain the following two Channel Divinity options. Abjure Enemy: As an action, you present your holy symbol and speak a prayer of denunciation, using your Channel Divinity. Choose one creature within 60 feet of you that you can see. That creature must make a Wisdom saving throw, unless it is immune to being frightened. Fiends and undead have disadvantage on this saving throw. On a failed save, the creature is frightened for 1 minute or until it takes any damage. While frightened, the creature's speed is 0, and it can't benefit from any bonus to its speed. On a successful save, the creature's speed is halved for 1 minute or until the creature takes any damage. Vow of Enmity: As a bonus action, you can utter a vow of enmity against a creature you can see within 10 feet of you, using your Channel Divinity. You gain advantage on attack rolls against the creature for 1 minute or until it drops to 0 hit points or falls unconscious."
                        }],
                        7: [{
                            index: "subclass.vengeance.7",
                            name: "Relentless Avenger",
                            description: "By 7th level, your supernatural focus helps you close off a foe's retreat. When you hit a creature with an opportunity attack, you can move up to half your speed immediately after the attack and as part of the same reaction. This movement doesn't provoke opportunity attacks."
                        }],
                        15: [{
                            index: "subclass.vengeance.15",
                            name: "Soul of Vengeance",
                            description: "Starting at 15th level, the authority with which you speak your Vow of Enmity gives you greater power over your foe. When a creature under the effect of your Vow of Enmity makes an attack, you can use your reaction to make a melee weapon attack against that creature if it is within range."
                        }],
                        20: [{
                            index: "subclass.vengeance.20",
                            name: "Avenging Angel",
                            description: "At 20th level, you can assume the form of an angelic avenger. Using your action, you undergo a transformation. For 1 hour, you gain the following benefits: Wings sprout from your back and grant you a flying speed of 60 feet. You emanate an aura of menace in a 30-foot radius. The first time any enemy creature enters the aura or starts its turn there during a battle, the creature must succeed on a Wisdom saving throw or become frightened of you for 1 minute or until it takes any damage. Attack rolls against the frightened creature have advantage."
                        }]
                    },
                    spells: {
                        3: [{
                            index: "bane",
                            name: "Bane"
                        },
                        {
                            index: "hunters-mark",
                            name: "Hunter's Mark"
                        }],
                        5: [{
                            index: "hold-person",
                            name: "Hold Person"
                        },
                        {
                            index: "misty-step",
                            name: "Misty Step"
                        }],
                        9: [{
                            index: "haste",
                            name: "Haste"
                        },
                        {
                            index: "protection-from-energy",
                            name: "Protection from Energy"
                        }],
                        13: [{
                            index: "banishment",
                            name: "Banishment"
                        },
                        {
                            index: "dimension-door",
                            name: "Dimension Door"
                        }],
                        17: [{
                            index: "hold-monster",
                            name: "Hold Monster"
                        }]
                    }
                },
                oathbreaker: {
                    index: "oathbreaker",
                    name: "Oathbreaker",
                    description: "An oathbreaker is a paladin who breaks their sacred oaths to pursue some dark ambition or serve an evil power. Whatever light burned in the paladin's heart been extinguished. Only darkness remains.",
                    features: {
                        3: [{
                            index: "subclass.oathbreaker.3",
                            name: "Channel Divinity",
                            description: "When you take this oath at 3rd level, you gain the following two Channel Divinity options. Control Undead. As an action, you target one undead creature you can see within 30 feet of you. The target must make a Wisdom saving throw. On a failed save, the target must obey your commands for the next 24 hours, or until you use this Channel Divinity option again. An undead whose challenge rating is equal to or greater than your paladin level is immune to this effect. Dreadful Aspect. As an action, you channel the darkest emotions and focus them into a burst of magical menace. Each creature of your choice within 30 feet of you must make a Wisdom saving throw if it can see you. On a failed save, the target is frightened of you for 1 minute. If a creature frightened by this effect ends its turn more than 30 feet away from you, it can attempt another Wisdom saving throw to end the effect on it."
                        }],
                        7: [{
                            index: "subclass.oathbreaker.7",
                            name: "Aura of Hate",
                            description: "Starting at 7th level you, as well any fiends and undead within 10 feet of you, gain a bonus to melee weapon damage rolls equal to your Charisma modifier (minimum of +1). A creature can benefit from this feature from only one paladin at a time. At 18th level, the range of this aura increases to 30 feet."
                        }],
                        15: [{
                            index: "subclass.oathbreaker.15",
                            name: "Supernatural Resistance",
                            description: "At 15th level, you gain resistance to bludgeoning, piercing, and slashing damage from nonmagical weapons."
                        }],
                        20: [{
                            index: "subclass.oathbreaker.20",
                            name: "Dread Lord",
                            description: "At 20th level, you can, as an action, surround yourself with an aura of gloom that lasts for 1 minute. The aura reduces any bright light in a 30-foot radius around you to dim light. Whenever an enemy that is frightened by you starts its turn in the aura, it takes 4d10 psychic damage. Additionally, you and any creatures of your choosing in the aura are draped in deeper shadow. Creatures that rely on sight have disadvantage on attack rolls against creatures draped in this shadow. While the aura lasts, you can use a bonus action on your turn to cause the shadows in the aura to attack one creature. Make a melee spell attack against the target. If the attack hits, the target takes necrotic damage equal to 3d10 + your Charisma modifier."
                        }]
                    },
                    spells: {
                        3: [{
                            index: "hellish-rebuke",
                            name: "Hellish Rebuke"
                        },
                        {
                            index: "inflict-wounds",
                            name: "Inflict Wounds"
                        }],
                        5: [{
                            index: "darkness",
                            name: "Darkness"
                        }],
                        9: [{
                            index: "animate-dead",
                            name: "Animate Dead"
                        },
                        {
                            index: "bestow-curse",
                            name: "Bestow Curse"
                        }],
                        13: [{
                            index: "blight",
                            name: "Blight"
                        },
                        {
                            index: "confusion",
                            name: "Confusion"
                        }],
                        17: [{
                            index: "contagion",
                            name: "Contagion"
                        },
                        {
                            index: "dominate-person",
                            name: "Dominate Person"
                        }]
                    }
                }
            }
        },
        ranger: {
            subclassLevels: [3, 5, 7, 9, 11, 13, 15, 17],
            choices: {
                feywanderer: {
                    index: "feywanderer",
                    name: "Fey Wanderer",
                    description: "A fey mystique surrounds you, thanks to the boon of an archfey, the shining fruit you ate from a talking tree, the magic spring you swam in, or some other auspicious event. However you acquired your fey magic, you are now a Fey Wanderer, a ranger who represents both the mortal and the fey realms. As you wander the multiverse, your joyful laughter brightens the hearts of the downtrodden, and your martial prowess strikes terror in your foes, for great is the mirth of the fey and dreadful is their fury.",
                    features: {
                        3: [{
                            index: "subclass.feywanderer.3",
                            name: "Dreadful Strikes",
                            description: "At 3rd level, you can augment your weapon strikes with mind-scarring magic, drawn from the gloomy hollows of the Feywild. When you hit a creature with a weapon, you can deal an extra 1d4 psychic damage to the target, which can take this extra damage only once per turn. The extra damage increases to 1d6 when you reach 11th level in this class."
                        }],
                        7: [{
                            index: "subclass.feywanderer.7",
                            name: "Beguiling Twist",
                            description: "Beginning at 7th level, the magic of the Feywild guards your mind. You have advantage on saving throws against being charmed or frightened. In addition, whenever you or a creature you can see within 120 feet of you succeeds on a saving throw against being charmed or frightened, you can use your reaction to force a different creature you can see within 120 feet of you to make a Wisdom saving throw against your spell save DC. If the save fails, the target is charmed or frightened by you (your choice) for 1 minute. The target can repeat the saving throw at the end of each of its turns, ending the effect on itself on a successful save."
                        }],
                        11: [{
                            index: "subclass.feywanderer.11",
                            name: "Fey Reinforcements",
                            description: "At 11th level, the royal courts of the Feywild have blessed you with the assistance of fey beings: you know the spell Summon Fey. It doesn't count against the number of ranger spells you know, and you can cast it without a material component. You can also cast it once without using a spell slot, and you regain the ability to do so when you finish a long rest."
                        }],
                        15: [{
                            index: "subclass.feywanderer.15",
                            name: "Misty Wanderer",
                            description: "When you reach 15th level, you can slip in and out of the Feywild to move in a blink of an eye: you can cast Misty Step without expending a spell slot. You can do so a number of times equal to your Wisdom modifier (minimum of once), and you regain all expended uses when you finish a long rest. In addition, whenever you cast Misty Step, you can bring along one willing creature you can see within 5 feet of you. That creature teleports to an unoccupied space of your choice within 5 feet of your destination space."
                        }]
                    },
                    spells: {
                        3: [{
                            index: "charm-person",
                            name: "Charm Person"
                        }],
                        5: [{
                            index: "misty-step",
                            name: "Misty Step"
                        }],
                        9: [{
                            index: "dispel-magic",
                            name: "Dispel Magic"
                        }],
                        13: [{
                            index: "dimension-door",
                            name: "Dimension Door"
                        }],
                        17: [{
                            index: "mislead",
                            name: "Mislead"
                        }]
                    }
                },
                horizonwalker: {
                    index: "horizonwalker",
                    name: "Horizon Walker",
                    description: "Horizon walkers guard the world against threats that originate from other planes or that seek to ravage the mortal realm with otherworldly magic. They seek out planar portals and keep watch over them, venturing to the Inner Planes and the Outer Planes as needed to pursue their foes. These rangers are also friends to any forces in the multiverse – especially benevolent dragons, fey, and elementals – that work to preserve life and the order of the planes.",
                    features: {
                        3: [{
                            index: "subclass.horizonwalker.3",
                            name: "Detect Portal",
                            description: "At 3rd level, you gain the ability to magically sense the presence of a planar portal. As an action, you detect the distance and direction to the closest planar portal within 1 mile of you. Once you use this feature, you can't use it again until you finish a short or long rest."
                        }],
                        7: [{
                            index: "subclass.horizonwalker.7",
                            name: "Ethereal Step",
                            description: "At 7th level, you learn to step through the Ethereal Plane. As a bonus action on your turn, you can cast the Etherealness spell with this feature, without expending a spell slot, but the spell ends at the end of the current turn. Once you use this feature, you can’t use it again until you finish a short or long rest."
                        }],
                        11: [{
                            index: "subclass.horizonwalker.11",
                            name: "Distant Strike",
                            description: "At 11th level, you gain the ability to pass between the planes in a blink of an eye. When you use the Attack action, you can teleport up to 10 feet before each attack to an unoccupied space you can see. If you attack at least two different creatures with the action, you can make one additional attack with it against a third creature."
                        }],
                        15: [{
                            index: "subclass.horizonwalker.15",
                            name: "Spectral Defense",
                            description: "At 15th level, your ability to move between planes enables you to slip through the planar boundaries to lessen the harm done to you during battle. When you take damage from an attack, you can use your reaction to give yourself resistance to all of that attack's damage on this turn."
                        }]
                    },
                    spells: {
                        3: [{
                            index: "protection-from-evil-and-good",
                            name: "Protection from Evil and Good"
                        }],
                        5: [{
                            index: "misty-step",
                            name: "Misty Step"
                        }],
                        9: [{
                            index: "haste",
                            name: "Haste"
                        }],
                        13: [{
                            index: "banishment",
                            name: "Banishment"
                        }],
                        17: [{
                            index: "teleportation-circle",
                            name: "Teleportation Circle"
                        }]
                    }
                }
            }
        },
        rogue: {
            subclassLevels: [3, 9, 13, 17],
            choices: {
                assassin: {
                    index: "assassin",
                    name: "Assassin",
                    description: "You focus your training on the grim art of death. Those who adhere to this archetype are diverse: hired killers, spies, bounty hunters, and even specially anointed priests trained to exterminate the enemies of their deity. Stealth, poison, and disguise help you eliminate your foes with deadly efficiency.",
                    features: {
                        3: [{
                            index: "subclass.assassin.3",
                            name: "Assassinate",
                            description: "Starting at 3rd level, you are at your deadliest when you get the drop on your enemies. You have advantage on attack rolls against any creature that hasn't taken a turn in the combat yet. In addition, any hit you score against a creature that is surprised is a critical hit."
                        }],
                        9: [{
                            index: "subclass.assassin.9",
                            name: "Infiltration Expertise",
                            description: "Starting at 9th level, you can unfailingly create false identities for yourself. You must spend seven days and 25 gp to establish the history, profession, and affiliations for an identity. You can't establish an identity that belongs to someone else. For example, you might acquire appropriate clothing, letters of introduction, and official- looking certification to establish yourself as a member of a trading house from a remote city so you can insinuate yourself into the company of other wealthy merchants."
                        }],
                        13: [{
                            index: "subclass.assassin.13",
                            name: "Impostor",
                            description: "At 13th level, you gain the ability to unerringly mimic another person's speech, writing, and behavior. You must spend at least three hours studying these three components of the person's behavior, listening to speech, examining handwriting, and observing mannerisms. Your ruse is indiscernible to the casual observer. If a wary creature suspects something is amiss, you have advantage on any Charisma (Deception) check you make to avoid detection."
                        }],
                        17: [{
                            index: "subclass.assassin.17",
                            name: "Death Strike",
                            description: "Starting at 17th level, you become a master of instant death. When you attack and hit a creature that is surprised, it must make a Constitution saving throw (DC 8 + your Dexterity modifier + your proficiency bonus). On a failed save, double the damage of your attack against the creature."
                        }]
                    }
                },
                thief: {
                    index: "thief",
                    name: "Thief",
                    description: "You hone your skills in the larcenous arts. Burglars, bandits, cutpurses, and other criminals typically follow this archetype, but so do rogues who prefer to think of themselves as professional treasure seekers, explorers, delvers, and investigators. In addition to improving your agility and stealth, you learn skills useful for delving into ancient ruins, reading unfamiliar languages, and using magic items you normally couldn't employ.",
                    features: {
                        3: [{
                            index: "subclass.thief.3",
                            name: "Fast Hands",
                            description: "Starting at 3rd level, you can use the bonus action granted by your Cunning Action to make a Dexterity (Sleight of Hand) check, use your thieves' tools to disarm a trap or open a lock, or take the Use an Object action."
                        }],
                        9: [{
                            index: "subclass.thief.9",
                            name: "Supreme Sneak",
                            description: "Starting at 9th level, you have advantage on a Dexterity (Stealth) check if you move no more than half your speed on the same turn."
                        }],
                        13: [{
                            index: "subclass.thief.13",
                            name: "Use Magic Device",
                            description: "By 13th level, you have learned enough about the workings of magic that you can improvise the use of items even when they are not intended for you. You ignore all class, race, and level requirements on the use of magic items."
                        }],
                        17: [{
                            index: "subclass.thief.17",
                            name: "Thief's Reflexes",
                            description: "When you reach 17th level, you have become adept at laying ambushes and quickly escaping danger. You can take two turns during the first round of any combat. You take your first turn at your normal initiative and your second turn at your initiative minus 10. You can't use this feature when you are surprised."
                        }]
                    }
                }
            }
        },
        sorcerer: {
            subclassLevels: [1, 6, 14, 18],
            choices: {
                draconic: {
                    index: "draconic",
                    name: "Draconic Bloodline",
                    description: "Your innate magic comes from draconic magic that was mingled with your blood or that of your ancestors. Most often, sorcerers with this origin trace their descent back to a mighty sorcerer of ancient times who made a bargain with a dragon or who might even have claimed a dragon parent. Some of these bloodlines are well established in the world, but most are obscure. Any given sorcerer could be the first of a new bloodline, as a result of a pact or some other exceptional circumstance.",
                    features: {
                        1: [{
                            index: "subclass.draconic.1",
                            name: "Draconic Resilience",
                            description: "As magic flows through your body, it causes physical traits of your dragon ancestors to emerge. At 1st level, your hit point maximum increases by 1 and increases by 1 again whenever you gain a level in this class. Additionally, parts of your skin are covered by a thin sheen of dragon-like scales. When you aren't wearing armor, your AC equals 13 + your Dexterity modifier."
                        }],
                        6: [{
                            index: "subclass.draconic.6",
                            name: "Elemental Affinity",
                            description: "Starting at 6th level, when you cast a spell that deals damage of the type associated with your draconic ancestry, add your Charisma modifier to one damage roll of that spell. At the same time, you can spend 1 sorcery point to gain resistance to that damage type for 1 hour."
                        }],
                        14: [{
                            index: "subclass.draconic.14",
                            name: "Dragon Wings",
                            description: "At 14th level, you gain the ability to sprout a pair of dragon wings from your back, gaining a flying speed equal to your current speed. You can create these wings as a bonus action on your turn. They last until you dismiss them as a bonus action on your turn. You can't manifest your wings while wearing armor unless the armor is made to accommodate them, and clothing not made to accommodate your wings might be destroyed when you manifest them."
                        }],
                        18: [{
                            index: "subclass.draconic.18",
                            name: "Draconic Presence",
                            description: "Beginning at 18th level, you can channel the dread presence of your dragon ancestor, causing those around you to become awestruck or frightened. As an action, you can spend 5 sorcery points to draw on this power and exude an aura of awe or fear (your choice) to a distance of 60 feet. For 1 minute or until you lose your concentration (as if you were casting a concentration spell), each hostile creature that starts its turn in this aura must succeed on a Wisdom saving throw or be charmed (if you chose awe) or frightened (if you chose fear) until the aura ends. A creature that succeeds on this saving throw is immune to your aura for 24 hours."
                        }]
                    }
                },
                shadowmagic: {
                    index: "shadowmagic",
                    name: "Shadow Magic",
                    description: "You are a creature of shadow, for your innate magic comes from the Shadowfell itself. You might trace your lineage to an entity from that place, or perhaps you were exposed to its fell energy and transformed by it. The power of shadow magic casts a strange pall over your physical presence. The spark of life that sustains you is muffled, as if it struggles to remain viable against the dark energy that imbues your soul.",
                    features: {
                        1: [{
                            index: "subclass.shadowmagic.1",
                            name: "Strength of the Grave",
                            description: "Starting at 1st level, your existence in a twilight state between life and death makes you difficult to defeat. When damage reduces you to 0 hit points, you can make a Charisma saving throw (DC 5 + the damage taken). On a success, you instead drop to 1 hit point. You can't use this feature if you are reduced to 0 hit points by radiant damage or by a critical hit."
                        }],
                        6: [{
                            index: "subclass.shadowmagic.6",
                            name: "Hound of Ill Omen",
                            description: "At 6th level, you gain the ability to call forth a howling creature of darkness to harass your foes. As a bonus action, you can spend 3 sorcery points to summon a hound of ill omen to target one creature you can see within 120 feet of you."
                        }],
                        14: [{
                            index: "subclass.shadowmagic.14",
                            name: "Shadow Walk",
                            description: "At 14th level, you gain the ability to step from one shadow into another. When you are in dim light or darkness, as a bonus action, you can teleport up to 120 feet to an unoccupied space you can see that is also in dim light or darkness."
                        }],
                        18: [{
                            index: "subclass.shadowmagic.18",
                            name: "Umbral Form",
                            description: "Starting at 18th level, you can spend 6 sorcery points as a bonus action to transform yourself into a shadowy form. In this form, you have resistance to all damage except force and radiant damage, and you can move through other creatures and objects as if they were difficult terrain. You take 5 force damage if you end your turn inside an object."
                        }]
                    }
                }
            }
        },
        warlock: {
            subclassLevels: [1, 6, 10, 14],
            choices: {
                archfey: {
                    index: "archfey",
                    name: "Archfey",
                    description: "Your patron is a lord or lady of the fey, a creature of legend who holds secrets that were forgotten before the mortal races were born. This being's motivations are often inscrutable, and sometimes whimsical, and might involve a striving for greater magical power or the settling of age-old grudges. Beings of this sort include the Prince of Frost; the Queen of Air and Darkness, ruler of the Gloaming Court; Titania of the Summer Court; her consort Oberon, the Green Lord; Hyrsam, the Prince of Fools; and ancient hags.",
                    features: {
                        1: [{
                            index: "subclass.archfey.1",
                            name: "Fey Presence",
                            description: "Starting at 1st level, your patron bestows upon you the ability to project the beguiling and fearsome presence of the fey. As an action, you can cause each creature in a 10-foot cube originating from you to make a Wisdom saving throw against your warlock spell save DC. The creatures that fail their saving throws are all charmed or frightened by you (your choice) until the end of your next turn."
                        }],
                        6: [{
                            index: "subclass.archfey.6",
                            name: "Misty Escape",
                            description: "Starting at 6th level, you can vanish in a puff of mist in response to harm. When you take damage, you can use your reaction to turn invisible and teleport up to 60 feet to an unoccupied space you can see. You remain invisible until the start of your next turn or until you attack or cast a spell."
                        }],
                        10: [{
                            index: "subclass.archfey.10",
                            name: "Beguiling Defenses",
                            description: "Beginning at 10th level, your patron teaches you how to turn the mind-affecting magic of your enemies against them. You are immune to being charmed, and when another creature attempts to charm you, you can use your reaction to attempt to turn the charm back on that creature. The creature must succeed on a Wisdom saving throw against your warlock spell save DC or be charmed by you for 1 minute or until the creature takes any damage."
                        }],
                        14: [{
                            index: "subclass.archfey.14",
                            name: "Dark Delirium",
                            description: "Starting at 14th level, you can plunge a creature into an illusory realm. As an action, choose a creature that you can see within 60 feet of you. It must make a Wisdom saving throw against your warlock spell save DC. On a failed save, it is charmed or frightened by you (your choice) for 1 minute or until your concentration is broken (as if you are concentrating on a spell). This effect ends early if the creature takes any damage."
                        }]
                    }
                },
                fiend: {
                    index: "fiend",
                    name: "Fiend",
                    description: "You have made a pact with a fiend from the lower planes of existence, a being whose aims are evil, even if you strive against those aims. Such beings desire the corruption or destruction of all things, ultimately including you. Fiends powerful enough to forge a pact include demon lords such as Demogorgon, Orcus, Fraz'Urb-luu, and Baphomet; archdevils such as Asmodeus, Dispater, Mephistopheles, and Belial; pit fiends and balors that are especially mighty; and ultroloths and other lords of the yugoloths.",
                    features: {
                        1: [{
                            index: "subclass.fiend.1",
                            name: "Dark One's Blessing",
                            description: "Starting at 1st level, when you reduce a hostile creature to 0 hit points, you gain temporary hit points equal to your Charisma modifier + your warlock level (minimum of 1)."
                        }],
                        6: [{
                            index: "subclass.fiend.6",
                            name: "Dark One's Own Luck",
                            description: "Starting at 6th level, you can call on your patron to alter fate in your favor. When you make an ability check or a saving throw, you can use this feature to add a d10 to your roll. You can do so after seeing the initial roll but before any of the roll's effects occur."
                        }],
                        10: [{
                            index: "subclass.fiend.10",
                            name: "Fiendish Resilience",
                            description: "Starting at 10th level, you can choose one damage type when you finish a short or long rest. You gain resistance to that damage type until you choose a different one with this feature. Damage from magical weapons or silver weapons ignores this resistance."
                        }],
                        14: [{
                            index: "subclass.fiend.14",
                            name: "Hurl Through Hell",
                            description: "Starting at 14th level, when you hit a creature with an attack, you can use this feature to instantly transport the target through the lower planes. The creature disappears and hurtles through a nightmare landscape. At the end of your next turn, the target returns to the space it previously occupied, or the nearest unoccupied space. If the target is not a fiend, it takes 10d10 psychic damage as it reels from its horrific experience."
                        }]
                    }
                }
            }
        },
        wizard: {
            subclassLevels: [2, 6, 10, 14],
            choices: {
                conjuration: {
                    index: "conjuration",
                    name: "School of Conjuration",
                    description: "As a conjurer, you favor spells that produce objects and creatures out of thin air. You can conjure billowing clouds of killing fog or summon creatures from elsewhere to fight on your behalf. As your mastery grows, you learn spells of transportation and can teleport yourself across vast distances, even to other planes of existence, in an instant.",
                    features: {
                        2: [{
                            index: "subclass.conjuration.2",
                            name: "Minor Conjuration",
                            description: "Starting at 2nd level when you select this school, you can use your action to conjure up an inanimate object in your hand or on the ground in an unoccupied space that you can see within 10 feet of you. This object can be no larger than 3 feet on a side and weigh no more than 10 pounds, and its form must be that of a nonmagical object that you have seen. The object is visibly magical, radiating dim light out to 5 feet."
                        }],
                        6: [{
                            index: "subclass.conjuration.6",
                            name: "Benign Transportation",
                            description: "Starting at 6th level, you can use your action to teleport up to 30 feet to an unoccupied space that you can see. Alternatively, you can choose a space within range that is occupied by a Small or Medium creature. If that creature is willing, you both teleport, swapping places."
                        }],
                        10: [{
                            index: "subclass.conjuration.10",
                            name: "Focused Conjuration",
                            description: "Beginning at 10th level, while you are concentrating on a conjuration spell, your concentration can't be broken as a result of taking damage."
                        }],
                        14: [{
                            index: "subclass.conjuration.14",
                            name: "Durable Summons",
                            description: "Starting at 14th level, any creature that you summon or create with a conjuration spell has 30 temporary hit points."
                        }]
                    }
                },
                illusion: {
                    index: "illusion",
                    name: "School of Illusion",
                    description: "You focus your studies on magic that dazzles the senses, befuddles the mind, and tricks even the wisest folk. Your magic is subtle, but the illusions crafted by your keen mind make the impossible seem real. Some illusionists, including many gnome wizards, are benign tricksters who use their spells to entertain. Others are more sinister masters of deception, using their illusions to frighten and fool others for their personal gain.",
                    features: {
                        2: [{
                            index: "subclass.illusion.2",
                            name: "Illusion Savant",
                            description: "Beginning when you select this school at 2nd level, the gold and time you must spend to copy a Illusion spell into your spellbook is halved."
                        }],
                        6: [{
                            index: "subclass.illusion.6",
                            name: "Malleable Illusions",
                            description: "Starting at 6th level, when you cast an illusion spell that has a duration of 1 minute or longer, you can use your action to change the nature of that illusion (using the spell's normal parameters for the illusion), provided that you can see the illusion."
                        }],
                        10: [{
                            index: "subclass.illusion.10",
                            name: "Illusory Self",
                            description: "Beginning at 10th level, you can create an illusory duplicate of yourself as an instant, almost instinctual reaction to danger. When a creature makes an attack roll against you, you can use your reaction to interpose the illusory duplicate between the attacker and yourself. The attack automatically misses you, then the illusion dissipates."
                        }],
                        14: [{
                            index: "subclass.illusion.14",
                            name: "Illusory Reality",
                            description: "By 14th level, you have learned the secret of weaving shadow magic into your illusions to give them a semi-reality. When you cast an illusion spell of 1st level or higher, you can choose one inanimate, nonmagical object that is part of the illusion and make that object real. You can do this on your turn as a bonus action while the spell is ongoing. The object remains real for 1 minute. For example, you can create an illusion of a bridge over a chasm and then make it real long enough for your allies to cross."
                        }]
                    }
                }
            }
        }
    };

    const canSubclass = (character) => {
        const classData = subclasses[character.class];
        if (!classData) {
          console.error("Class not found!");
          return false;
        }
        return classData.subclassLevels.includes(character.level);
      };
    const canChooseSubclass = (character) => {
        const classData = subclasses[character.class];
        if (!classData) {
            console.error("Class not found!");
            return false;
        }
        const firstSubclassLevel = classData.subclassLevels[0];
        return character.level === firstSubclassLevel;
    };

    // step 4: spell selecting
    const [potentialSpells, setPotentialSpells] = useState([]);

    useEffect(() => {
        const fetchSpells = async () => {
            try {
                const spellList = await Promise.all(
                    spellUrls.map(async (url) => {
                        const query = `https://www.dnd5eapi.co${url}`;
                        const response = await fetch(query);
                        if (!response.ok) {
                            throw new Error("Failed to fetch features");
                        }
                        return response.json();
                    })
                );
                setPotentialSpells(spellList);
            } catch (error) {
                console.error("Error fetching features:", error);
            }
        };
        if (spellUrls.length > 0) {
            fetchSpells();
        }
    }, [spellUrls]);

    const [selectedSpells, setSelectedSpells] = useState([]);
    const handleSpellSelection = (e, spell) => {
        const index = spell.index;
        if (e.target.checked) {
            // Add spell if selected
            setSelectedSpells([...selectedSpells, index]);
        } else {
            // Remove spell if unselected
            setSelectedSpells(selectedSpells.filter(s => s !== index));
        }
    };

    const [selectedCantrips, setSelectedCantrips] = useState([]);
    const handleCantripSelection = (e, cantrip) => {
        const index = cantrip.index;
        if (e.target.checked) {
            // Add spell if selected
            setSelectedCantrips([...selectedCantrips, index]);
        } else {
            // Remove spell if unselected
            setSelectedCantrips(selectedCantrips.filter(s => s !== index));
        }
    };

    const goToDashboard = () => {
        navigate('/dashboard');
    }
    
    // step 5: update the character stats
    const updateCharacter = () => {
        setCurrentStep(1);
        setFeatureUrls([]);
        setFeatures([]);
        setHpDice(0);
        setCharacter(newChar);
        spells.push(...selectedSpells);
        cantrips.push(...selectedCantrips);
        setSelectedSpells([]);
        setSelectedCantrips([]);

       
        /*
        try {
            const requests = [
                axios.post('http://localhost:5000/api/updatecharacter', { character: newChar }),
            ];
    
            if (featureUrls?.length) {
                requests.push(axios.post('http://localhost:5000/api/newfeatures', { id: charId, features: featureUrls }));
            }
            if (selectedSpells?.length) {
                requests.push(axios.post('http://localhost:5000/api/newspells', { id: charId, spells: selectedSpells }));
            }
            if (subclassFeatures?.length) {
                requests.push(axios.post('http://localhost:5000/api/subclassfeatures', { id: charId, features: subclassFeatures }));
            }
            if (subclassSpells?.length) {
                requests.push(axios.post('http://localhost:5000/api/subclassspells', { id: charId, spells: subclassSpells }));
            }
    
            await Promise.all(requests);
    
            navigate('/dashboard');
        } catch (error) {
            console.error('Error updating character:', error.response?.data || error.message);
        } */
    };
    

    

    return (
        <div>
            <header class="app-header">
                <div class="app-title">How to DND</div>
                <div class="page-description">Level Character</div>
            </header>
        <div className = "section-container">
            {characterSelected === 0 && (
                <div>
                    <h2>Choose a Class to Level</h2>
                    <div className="radio-container">
                        {['barbarian', 'bard', 'cleric', 'druid', 'fighter', 'monk', 'paladin', 'ranger',
                            'rogue', 'sorcerer', 'warlock', 'wizard'].map((charClassOption, index) => (
                            <div key={index} className="radio-option">
                                <label>
                                    <input
                                        type="radio"
                                        name="classes"
                                        value={charClassOption}
                                        onChange={(e) => createCharacter(e.target.value)}
                                        required
                                    />
                                    {charClassOption.charAt(0).toUpperCase() + charClassOption.slice(1).toLowerCase()}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {characterSelected === 1 && (
            <h1>{char.name} | Level {newChar.level} {char.class.charAt(0).toUpperCase() + char.class.slice(1).toLowerCase()}</h1>
            )}
            {currentStep === 1 && (
                <div>
                    <h2>Update Stats</h2>
                    {newChar.level>1 && (
                        <div>
                        {hpDice === 0 ? (
                            <button className = "button button-next" onClick={rollHP}>Roll for HP</button>
                        ) : (
                            <div>
                                <h3>HP: {char.hp} + {hpDice} + {Math.max(calculateModifier(char.constitution), 0)} = {newChar.hp}</h3>
                                <h4>New HP = Previous HP + 1d{hitDice[char.class]} + Con Modifier</h4>
                            </div>
                        )}

                        </div>
                    )}
                    {newChar.level === 1 && (
                        <div className = "border-section">
                            <h3>HP: {hitDice[char.class]} + {Math.max(calculateModifier(char.constitution), 0)} = {newChar.hp}</h3>
                            <h4>HP = Max Hit Dice + Con Modifier</h4>
                        </div>
                    )}
                    {newChar.level % 4 === 1 && (
                        <h3>Proficiency Bonus: {char.bonus ? char.bonus + 1 : "N/A"}</h3>
                    )}
                    {spellcastInfo && (
                        <div className = "border-section">
                        <h3>Spellcasting Information</h3>
                        {spellcastInfo.cantrips_known !== undefined && (
                            <h4>Cantrips Known: {spellcastInfo.cantrips_known}</h4>
                        )}
                        {spellcastInfo.spells_known !== undefined && (
                            <h4>Spells Known: {spellcastInfo.spells_known}</h4>
                        )}
                        <div className = "border-section">
                        <h3>Spell Slots</h3>
                        <ul className = "spellcasting-list">
                        {Object.entries(spellcastInfo)
                            .filter(
                                ([key, value]) => key.startsWith("spell_slots_level_") && value > 0
                            )
                            .map(([key, value]) => (
                                <li key={key}>
                                    {key.replace("spell_slots_level_", "Level ")}: {value}
                                </li>
                            ))}
                        </ul>
                        </div>
                    </div>
                    )}
                    {
                    <div className = "border-section">
                    {char.class === 'barbarian' && classInfo && (
                            <div>
                                <h3>Barbarian Information</h3>
                                {classInfo.rage_count !== undefined && (
                                    <h4>Number of Rages: {classInfo.rage_count}</h4>
                                )}
                                {classInfo.rage_damage_bonus !== undefined && (
                                    <h4>Rage Bonus Damage: {classInfo.rage_damage_bonus}</h4>
                                )}
                                {classInfo.brutal_critical_die !== undefined && classInfo.brutal_critical_die !== 0 && (
                                    <h4>Number of Brutal Critical Die: {classInfo.brutal_critical_die}</h4>
                                )}
                            </div>
                        )}
                        {char.class === 'bard' && classInfo && (
                            <div>
                                <h3>Bard Information</h3>
                                {classInfo.bardic_inspiration_die !== undefined && (
                                    <h4>Bardic Inspiration: 1d{classInfo.bardic_inspiration_die}</h4>
                                )}
                                {classInfo.song_of_rest_die !== undefined && classInfo.song_of_rest_die !== 0 && (
                                    <h4>Song of Rest: 1d{classInfo.song_of_rest_die}</h4>
                                )}
                            </div>
                        )}

                        {char.class === 'cleric' && classInfo && newChar.level > 1 && (
                            <div>
                                <h3>Cleric Information</h3>
                                {classInfo.channel_divinity_charges !== undefined && classInfo.channel_divinity_charges !== 0 && (
                                    <h4>Channel Divinity Charges: {classInfo.channel_divinity_charges}</h4>
                                )}
                                {classInfo.destroy_undead_cr !== undefined && classInfo.destroy_undead_cr !== 0 && (
                                    <h4>Destroy Undead Challenge Rating: {classInfo.destroy_undead_cr}</h4>
                                )}
                            </div>
                        )}

                        {char.class === 'druid' && classInfo && newChar.level > 1 && classInfo.wild_shape_max_cr !== 'undefined' && classInfo.wild_shape_max_cr !== 0 && (
                            <div>
                                <h3>Druid Information</h3>
                                <h4>Max Wild Shape Challenge Rating: {classInfo.wild_shape_max_cr}</h4>
                                {classInfo.wild_shape_swim !== undefined && (
                                    <h4>
                                        {classInfo.wild_shape_swim ? "You can swim in wild shape" : "You can't swim in wild shape"}
                                    </h4>
                                )}
                                {classInfo.wild_shape_fly !== undefined && (
                                    <h4>
                                        {classInfo.wild_shape_fly ? "You can fly in wild shape" : "You can't fly in wild shape"}
                                    </h4>
                                )}
                            </div>
                        )}

                        {char.class === 'fighter' && classInfo && newChar.level > 1 && (
                            <div>
                                <h3>Fighter Information</h3>
                                {classInfo.action_surges !== undefined && classInfo.action_surges !== 0 && (
                                    <h4>Action Surges: {classInfo.action_surges}</h4>
                                )}
                                {classInfo.indomitable_uses !== undefined && classInfo.indomitable_uses !== 0 && (
                                    <h4>Indomitable Uses: {classInfo.indomitable_uses}</h4>
                                )}
                                {classInfo.extra_attacks !== undefined && classInfo.extra_attacks !== 0 && (
                                    <h4>Extra Attacks: {classInfo.extra_attacks}</h4>
                                )}
                            </div>
                        )}

                        {char.class === 'monk' && classInfo && (
                            <div>
                                <h3>Monk Information</h3>
                                {classInfo.ki_points !== undefined && classInfo.ki_points !== 0 && (
                                    <h4>Ki Points: {classInfo.ki_points}</h4>
                                )}
                                {classInfo.unarmored_movement !== undefined && classInfo.unarmored_movement !== 0 && (
                                    <h4>Unarmored Movement: {classInfo.unarmored_movement}</h4>
                                )}
                                {classInfo.martial_arts?.dice_value !== undefined && (
                                    <h4>Martial Arts: 1d{classInfo.martial_arts.dice_value}</h4>
                                )}
                            </div>
                        )}

                        {char.class === 'paladin' && classInfo && newChar.level > 5 && (
                            <div>
                                <h3>Paladin Information</h3>
                                {classInfo.aura_range !== undefined && (
                                    <h4>Aura Range: {classInfo.aura_range}</h4>
                                )}
                            </div>
                        )}

                        {char.class === 'rogue' && classInfo && (
                            <div>
                                <h3>Rogue Information</h3>
                                {classInfo.sneak_attack?.dice_count !== undefined && (
                                    <h4>Sneak Attack: {classInfo.sneak_attack.dice_count}d6</h4>
                                )}
                            </div>
                        )}

                        {char.class === 'sorcerer' && classInfo && newChar.level > 1 && (
                            <div>
                                <h3>Sorcerer Information</h3>
                                {classInfo.sorcery_points !== undefined && (
                                    <h4>Sorcery Points: {classInfo.sorcery_points}</h4>
                                )}
                            </div>
                        )}

                        {char.class === 'warlock' && classInfo && newChar.level > 1 && (
                            <div>
                                <h3>Warlock Information</h3>
                                {classInfo.invocations_known !== undefined && (
                                    <h4>Invocations: {classInfo.invocations_known}</h4>
                                )}
                            </div>
                        )}

                        {char.class === 'wizard' && classInfo && (
                            <div>
                                <h3>Wizard Information</h3>
                                {classInfo.arcane_recovery_levels !== undefined && (
                                    <h4>Arcane Recovery Levels: {classInfo.arcane_recovery_levels}</h4>
                                )}
                            </div>
                        )}
                    </div>
                    }
                    <button className = "button button-next" onClick = {handleNext} disabled = {!hpDice && newChar.level > 1}>Next</button>
                </div>
            )}
            {currentStep === 2 && features.length > 0 && (
                <div>
                    <h2>New Features</h2>
                    <ul className = "list">
                    {features.map((feature, index) => (
                        <li key={index}>
                            <strong>{feature.name}:</strong>
                            <p>{feature.desc}</p>
                        </li>
                    ))}
                    </ul>
                    <button className = "button button-next" onClick = {handleNext}>Next</button>
                </div>
            )} 
            {currentStep === 2 && features.length === 0 && (
                <div>
                    <h2>New Features</h2>
                    <h3>There are no new features for this class level</h3>
                    <button className = "button button-next" onClick = {handleNext}>Next</button>
                </div>
            )}
            {currentStep === 3 && canSubclass(newChar) && (
                <div>
                    <h2>Subclass</h2>
                    {canChooseSubclass(newChar) ? (
                        <div>
                            <h3>Choose a Subclass</h3>
                            <button className = "button button-next" onClick = {handleNext} disabled = {newChar.subclass === "none"}>Next</button>
                            <ul className = "list">
                                {Object.entries(subclasses[newChar.class].choices).map(([key, subclass]) => (
                                    <li key={key}>
                                        <h4>{subclass.name}</h4>
                                        <button className = "button button-next" onClick={() => setNewCharacter({ ...newChar, subclass: subclass.index })}>
                                    Choose {subclass.name}
                                </button>
                                        <p>{subclass.description}</p>
                                        <div>
                                            <h5>Features at Level {subclasses[newChar.class].subclassLevels[0]}</h5>
                                            <ul className = "list">
                                                {subclass.features[subclasses[newChar.class].subclassLevels[0]].map((feature) => (
                                                    <li key={feature.index}>
                                                        <strong>{feature.name}</strong>: {feature.description}
                                                    </li>
                                                ))}
                                            </ul>
                                            {subclass.spells?.[subclasses[newChar.class].subclassLevels[0]] && (
                                                <div>
                                                    <h5>Spells at Level {subclasses[newChar.class].subclassLevels[0]}</h5>
                                                    <ul className = "list">
                                                        {subclass.spells[subclasses[newChar.class].subclassLevels[0]].map((spell) => (
                                                            <li key={spell.index}>
                                                                <strong>{spell.name}</strong>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : (
                        <div>
                            <h3>Subclass Features</h3>
                            <button className = "button button-next" onClick = {handleNext} disabled = {newChar.subclass === "none"}>Next</button>
                            <ul className = "list">
                                {subclasses[newChar.class]?.choices[newChar.subclass]?.features[newChar.level]?.map((feature) => (
                                    <li key={feature.index}>
                                        <strong>{feature.name}</strong>: {feature.description}
                                    </li>
                                ))}
                            </ul>
                            {subclasses[newChar.class]?.choices[newChar.subclass]?.spells?.[newChar.level] && (
                                <div>
                                    <h3>Subclass Spells</h3>
                                    <ul className = "list">
                                        {subclasses[newChar.class].choices[newChar.subclass].spells[newChar.level].map((spell) => (
                                            <li key={spell.index}>
                                                <strong>{spell.name}</strong>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
            {currentStep === 3 && !canSubclass(newChar) && (
                <div>
                    <h2>Subclass</h2>
                    <h3>There are no subclassing options at this level</h3>
                    <button className = "button button-next" onClick = {handleNext}>Next</button>
                </div>
            )}
            {currentStep === 4 && spellsTaken < spellsKnown && (
                <div>
                    <h2>New Spells</h2>
                    <p>Select {spellsKnown - spellsTaken} spells:</p>
                    <div className= "checkbox-list">
                        {potentialSpells.map((spell, index) => (
                            <div key={index} className = "spell-container">
                                <label className = "checkbox-item">
                                    <input
                                        type="checkbox"
                                        value={spell.name}
                                        disabled={
                                            selectedSpells.length >= spellsKnown - spellsTaken &&
                                            !selectedSpells.includes(spell.name)
                                        }
                                        onChange={(e) => handleSpellSelection(e, spell)}
                                    />
                                    {spell.name}
                                    <span className = "tooltip">{spell.desc}</span>
                                </label>
                            </div>
                        ))}
                    </div>
                    <button className = "button button-next" onClick = {handleNext} disabled = {spellsKnown !== spellsTaken + selectedSpells.length}>Next</button>
                </div>
            )}
            {currentStep === 4 &&  spellsTaken >= spellsKnown && selectedSpells.length === 0 && (
                <div>
                    <h2>New Spells</h2>
                    <h3>There are no spells available at this time.</h3>
                    <button className = "button button-next" onClick = {handleNext}>Next</button>
                </div>
            )}
            {currentStep === 5 && cantripsTaken < cantripsKnown && (
                <div>
                <h2>New Cantrips</h2>
                <p>Select {cantripsKnown - cantripsTaken} cantrips:</p>
                <div className= "checkbox-list">
                    {potentialCantrips.map((cantrip, index) => (
                        <div key={index} className = "spell-container">
                            <label className = "checkbox-item">
                                <input
                                    type="checkbox"
                                    value={cantrip.name}
                                    disabled={
                                        selectedCantrips.length >= cantripsKnown - cantripsTaken &&
                                        !selectedCantrips.includes(cantrip.name)
                                    }
                                    onChange={(e) => handleCantripSelection(e, cantrip)}
                                />
                                {cantrip.name}
                            </label>
                        </div>
                    ))}
                </div>
                <button className = "button button-next" onClick = {handleNext} disabled = {cantripsKnown !== cantripsTaken + selectedCantrips.length}>Next</button>
            </div>
            )}
            {currentStep === 5 && cantripsTaken >= cantripsKnown && selectedCantrips.length === 0 && (
                <div>
                    <h2>New Cantrips</h2>
                    <h3>There are no cantrips available at this time.</h3>
                    <button className = "button button-next" onClick = {handleNext}>Next</button>
                </div>
            )}
            {currentStep === 6 && (
                <div>
                    <h2>Finished!</h2>
                    <div className = "button-group">
                    <button className = "button button-next" onClick = {updateCharacter} disabled = {newChar.level === 20}>Level Up</button>
                    <button className = "button button-next" onClick = {goToDashboard}>Return to Dashboard</button>
                    </div>
                </div>
            )}
        </div>
        </div>
    );
};
export default LevelCharacter;