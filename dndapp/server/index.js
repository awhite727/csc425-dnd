const express = require('express');
const app = express();
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
// Middleware
app.use(cors());
app.use(express.json());
// Database setup
const db = new sqlite3.Database('./mydb.sqlite', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database');
    }
});
// Example API endpoint
app.get('/api/jobs', (req, res) => {
    db.all('SELECT * FROM jobs', [], (err, rows) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
    res.json({ data: rows });
    });
});
app.get('/api/users', (req,res) => {
    db.all('SELECT * FROM users', [], (err, rows) => {
        if (err) {
            res.status(400).json({error: err.message});
            return;
        }
    res.json({data:rows});
    });
});
app.get('/api/testcharacters', (req, res) => {
    const query = 'SELECT * FROM characters';
    db.all(query, (err, rows) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }

        res.json({data:rows});
    });
});
app.get('/api/usercharacters', (req, res) => {
    const { id: userId } = req.query;
    if (!userId) {
        return res.status(400).json({ error: 'User ID (id) is required' });
    }
    const query = 'SELECT * FROM characters WHERE userid = ?';
    db.all(query, [userId], (err, rows) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }

        res.json({data:rows});
    });
});
app.delete('/api/deletecharacter', (req, res) => {
    const { charId } = req.body; // Get `charId` from the request body
    if (!charId) {
        return res.status(400).json({ error: 'Character ID (charId) is required' });
    }

    // SQL queries to delete data from multiple tables
    const deleteCharacterQuery = 'DELETE FROM characters WHERE characterid = ?';
    const deleteSkillsQuery = 'DELETE FROM skills WHERE characterid = ?';
    const deleteTraitsQuery = 'DELETE FROM features WHERE characterid = ?';
    const deleteSpellsQuery = 'DELETE FROM spells WHERE characterid = ?';
    const deleteProficienciesQuery = 'DELETE FROM proficiencies WHERE characterid = ?';
    const deleteLanguagesQuery = 'DELETE FROM languages WHERE characterid = ?';

    // Start a transaction
    db.serialize(() => {
        // Delete from the characters table
        db.run(deleteCharacterQuery, [charId], function (err) {
            if (err) {
                console.error('Error deleting from characters:', err.message);
                return res.status(500).json({ error: 'Failed to delete character' });
            }
            console.log('Deleted from characters table');
        });

        // Delete from the skills table
        db.run(deleteSkillsQuery, [charId], function (err) {
            if (err) {
                console.error('Error deleting from skills:', err.message);
                return res.status(500).json({ error: 'Failed to delete skills' });
            }
            console.log('Deleted from skills table');
        });

        // Delete from the features (traits) table
        db.run(deleteTraitsQuery, [charId], function (err) {
            if (err) {
                console.error('Error deleting from features:', err.message);
                return res.status(500).json({ error: 'Failed to delete traits' });
            }
            console.log('Deleted from features table');
        });

        // Delete from the spells table
        db.run(deleteSpellsQuery, [charId], function (err) {
            if (err) {
                console.error('Error deleting from spells:', err.message);
                return res.status(500).json({ error: 'Failed to delete spells' });
            }
            console.log('Deleted from spells table');
        });

        // Delete from the proficiencies table
        db.run(deleteProficienciesQuery, [charId], function (err) {
            if (err) {
                console.error('Error deleting from proficiencies:', err.message);
                return res.status(500).json({ error: 'Failed to delete proficiencies' });
            }
            console.log('Deleted from proficiencies table');
        });

        // Delete from the languages table
        db.run(deleteLanguagesQuery, [charId], function (err) {
            if (err) {
                console.error('Error deleting from languages:', err.message);
                return res.status(500).json({ error: 'Failed to delete languages' });
            }
            console.log('Deleted from languages table');
        });

        // Respond after all queries run
        res.json({ message: 'Character and related data deleted successfully' });
    });
});
// get character information
app.get('/api/characters', (req, res) => {
    const { charId } = req.query;
    if (!charId) {
        return res.status(400).json({ error: 'Character ID (id) is required' });
    }
    const query = 'SELECT * FROM characters WHERE characterid = ?';
    db.all(query, [charId], (err, rows) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }

        res.json({data:rows});
    });
});
app.get('/api/spells', (req, res) => {
    const { charId } = req.query;
    if (!charId) {
        return res.status(400).json({ error: 'Character ID (id) is required' });
    }
    const query = 'SELECT * FROM spells WHERE characterid = ?';
    db.all(query, [charId], (err, rows) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }

        res.json({data:rows});
    });
});
app.get('/api/skills', (req, res) => {
    const { charId } = req.query;
    if (!charId) {
        return res.status(400).json({ error: 'Character ID (id) is required' });
    }
    const query = 'SELECT * FROM skills WHERE characterid = ?';
    db.all(query, [charId], (err, rows) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }

        res.json({data:rows});
    });
});
app.get('/api/proficiencies', (req, res) => {
    const { charId } = req.query;
    if (!charId) {
        return res.status(400).json({ error: 'Character ID (id) is required' });
    }
    const query = 'SELECT * FROM proficiencies WHERE characterid = ?';
    db.all(query, [charId], (err, rows) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }

        res.json({data:rows});
    });
});
app.get('/api/languages', (req, res) => {
    const { charId } = req.query;
    if (!charId) {
        return res.status(400).json({ error: 'Character ID (id) is required' });
    }
    const query = 'SELECT * FROM languages WHERE characterid = ?';
    db.all(query, [charId], (err, rows) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }

        res.json({data:rows});
    });
});
app.get('/api/features', (req, res) => {
    const { charId } = req.query;
    if (!charId) {
        return res.status(400).json({ error: 'Character ID (id) is required' });
    }
    const query = 'SELECT * FROM features WHERE characterid = ?';
    db.all(query, [charId], (err, rows) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }

        res.json({data:rows});
    });
});
// get specific information 
app.get('/api/spellbyid', (req,res) => {
    const {spellId} = req.query;
    if (!spellId) {
        return res.status(400).json({error: 'Spell ID is required'});
    }
    const query = 'SELECT * FROM spells WHERE spellid = ?';
    db.all(query, [spellId], (err,rows)=> {
        if (err) {
            return res.status(400).json({error: err.message});
        }
        res.json({data:rows});
    });
});
app.get('/api/featurebyid', (req,res) => {
    const {featureId} = req.query;
    if (!featureId) {
        return res.status(400).json({error: 'Feature ID is required'});
    }
    const query = 'SELECT * FROM features WHERE featureid = ?';
    db.all(query, [featureId], (err,rows)=> {
        if (err) {
            return res.status(400).json({error: err.message});
        }
        res.json({data:rows});
    });
});

// add a new user
app.use(bodyParser.json());
app.post('/api/signup', (req, res) => {
    const { username, password } = req.body;
    const query = `INSERT INTO users (username, password, premium) VALUES (?, ?, FALSE)`;
    db.run(query, [username, password], function (err) {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "User creation failed" });
        }
        res.status(201).json({ userId: this.lastID, message: "User created successfully" });
    });
});
// add new character
app.post('/api/newcharacter', (req, res) => {
    console.log(req.body);
    const {userId, charName, strength, dexterity, constitution, intelligence, 
        wisdom, charisma, race, charClass, ac, speed, alignment} = req.body;
    const query = `INSERT INTO characters (userid, name, strength, dexterity, constitution, intelligence, wisdom, charisma,
        level, race, class, subclass, ac, hp, speed, bonus, alignment) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, "none", ?, 0, ?, 2, ?)`;
    db.run(query, [userId, charName, strength, dexterity, constitution, intelligence, wisdom, charisma, 
        race, charClass, ac, speed, alignment], function (err) {
            if (err) {
                console.error("Database error: ", err);
                return res.status(500).json({error: "Character creation failed"});
            }
            res.status(201).json({charId: this.lastID, message: "Character created successfully"});
        }
    );
});
app.post('/api/newskills', (req, res) => {
    const { id: charId, skills } = req.body;

    // Validate payload
    if (!skills || !Array.isArray(skills) || !charId) {
        return res.status(400).send('Invalid payload');
    }

    // Map skill names to database columns
    const skillMapping = {
        Acrobatics: 'acrobatics',
        Arcana: 'arcana',
        Athletics: 'athletics',
        Deception: 'deception',
        History: 'history',
        Insight: 'insight',
        Intimidation: 'intimidation',
        Investigation: 'investigation',
        Medicine: 'medicine',
        Nature: 'nature',
        Perception: 'perception',
        Performance: 'performance',
        Persuasion: 'persuasion',
        Religion: 'religion',
        Sleight_of_Hand: 'sleightofhand',
        Stealth: 'stealth',
        Survival: 'survival',
    };

    // Initialize values array with charId
    const skillValues = [charId];

    // Extract skill values based on the mapping
    Object.keys(skillMapping).forEach((skill) => {
        const skillObj = skills.find((s) => s.skill_name === skill);
        skillValues.push(skillObj ? skillObj.is_tagged : 0); // Default to 0 if not found
    });

    // SQL query
    const query = `INSERT INTO skills (
        characterid,
        acrobatics,
        arcana,
        athletics,
        deception,
        history,
        insight,
        intimidation,
        investigation,
        medicine,
        nature,
        perception,
        performance,
        persuasion,
        religion,
        sleightofhand,
        stealth,
        survival
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    // Insert into the database
    db.run(query, skillValues, function (err) {
        if (err) {
            console.error('Error inserting skills:', err.message);
            return res.status(500).send('Error adding skills');
        }

        res.send('Skills added successfully');
    });
});
app.post('/api/newtraits', (req, res) => {
    console.log("Received request to insert traits: ", req.body);
    const charId = req.body.id;
    const traits = req.body.traits;

    if (!traits || !Array.isArray(traits) || !charId) {
        return res.status(400).send('Invalid payload');
    }

    const query = `INSERT INTO features (characterid, feature, otherinfo) VALUES(?, ?, 'none')`;

    // Create an array of promises for each insertion
    const traitPromises = traits.map(url => {
        return new Promise((resolve, reject) => {
            db.run(query, [charId, url], function (err) {
                console.log('Inserting trait:', charId, url);
                if (err) {
                    console.error('Error inserting trait:', err);
                    reject(err);  // Reject the promise if there's an error
                } else {
                    console.log(`Inserted trait: ${url}`);
                    resolve();  // Resolve the promise if the insert is successful
                }
            });
        });
    });

    // Wait for all insertions to complete
    Promise.all(traitPromises)
        .then(() => {
            res.send('Traits added successfully');  // Respond when all traits are inserted
        })
        .catch((error) => {
            console.error('Error inserting traits:', error);
            res.status(500).send('Error adding traits');
        });
});
// leveling characters
app.post('/api/updatecharacter', (req, res) => {
    const newChar = req.body;
    const { id, name, strength, dexterity, constitution, intelligence, wisdom, charisma, level, race, class: charClass, subclass,
        ac, hp, speed, bonus, alignment} = newChar;
    if (!newChar) {
        return res.status(400).send('Invalid payload');
    }
    const query= `UPDATE characters
        SET userid = ?,
        name = ?,
        strength = ?,
        dexterity = ?,
        constitution = ?,
        intelligence = ?,
        wisdom = ?,
        charisma = ?,
        level = ?,
        race = ?,
        class = ?,
        subclass = ?,
        ac = ?,
        hp = ?,
        speed = ?,
        bonus = ?,
        alignment = ?
        WHERE characterid = ?`
    const params = [name, strength, dexterity, constitution, intelligence, wisdom, charisma, level, race, charClass, subclass,
        ac, hp, speed, bonus, alignment, id];
    db.run(query, params, function(err) {
        if(err) {
            console.error("Error updating character: ", err);
        } else {
            console.log("Updated character.");
        }
    });
});
app.post('/api/newfeatures', (req, res) => {
    const id = req.body.id;
    const features = req.body.features;
    if (!features|| !Array.isArray(features) || !id) {
        return res.status(400).send('Invalid payload');
    }
    const query=`INSERT INTO features (characterid, feature, otherinfo) VALUES(?, ?, 'none')`;
    features.forEach(url => {
        db.run(query, [id, url], function(err) {
          if (err) {
            console.error('Error inserting feature:', err);
          } else {
            console.log(`Inserted feature: ${url}`);
          }
        });
      });
});
app.post('/api/newspells', (req, res) => {
    const id = req.body.id;
    const spells = req.body.spells;
    if (!spells || !Array.isArray(spells) || !id) {
        return res.status(400).send('Invalid payload');
    }
    const query = `INSERT INTO spells (characterid, spellname, type, level, feature) VALUES (?, ?, 'none', 0, FALSE)`;
    spells.forEach(spell => {
        db.run(query, spell, function(err) {
            if (err) {
                console.error("Error inserting spell: ", spell);
            } else {
                console.log("Inserted spell: ", spell);
            }
        });
    });
});
app.post('/api/subclassfeature', (req, res) => {
    const id = req.body.id;
    const features = req.body.features;
    if (!features|| !Array.isArray(features) || !id) {
        return res.status(400).send('Invalid payload');
    }
    const query=`INSERT INTO features (characterid, feature, otherinfo) VALUES(?, ?, 'subclass')`;
    features.forEach(feat => {
        db.run(query, [id, feat], function(err) {
          if (err) {
            console.error('Error inserting feature:', err);
          } else {
            console.log(`Inserted feature: ${feat}`);
          }
        });
      });
});
app.post('/api/subclassspells', (req, res) => {
    const id = req.body.id;
    const spells = req.body.spells;
    if (!spells || !Array.isArray(spells) || !id) {
        return res.status(400).send('Invalid payload');
    }
    const query = `INSERT INTO spells (characterid, spellname, type, level, feature) VALUES (?, ?, 'none', 0, TRUE)`;
    spells.forEach(spell => {
        db.run(query, spell, function(err) {
            if (err) {
                console.error("Error inserting spell: ", spell);
            } else {
                console.log("Inserted spell: ", spell);
            }
        });
    });
});
    

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});