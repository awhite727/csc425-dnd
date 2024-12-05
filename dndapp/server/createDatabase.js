const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./mydb.sqlite');
db.serialize(() => {
    // Create Users Table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        userid INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        premium BOOLEAN
        )`, (err) => {
        if (err) {
        console.error('Error creating users table:', err.message);
        } else {
        console.log('Users table created successfully');
        }
    });
    // Insert admin user
    db.run(`CREATE TABLE IF NOT EXISTS characters (
        characterid INTEGER PRIMARY KEY AUTOINCREMENT,
        userid INTEGER,
        name TEXT,
        strength INTEGER,
        dexterity INTEGER,
        constitution INTEGER,
        intelligence INTEGER,
        wisdom INTEGER,
        charisma INTEGER,
        level INTEGER,
        race TEXT,
        class TEXT,
        subclass TEXT,
        ac INTEGER,
        hp INTEGER,
        speed INTEGER,
        bonus INTEGER,
        alignment TEXT
        )`, (err) => {
            if (err) {
                console.error('Error creating character table:', err.message);
            } else {
                console.log('Characters table created successfully');
            }
        }); 
    db.run(`INSERT INTO characters (userid, name, strength, dexterity, constitution, intelligence, wisdom, charisma,
        level, race, class, subclass, ac, hp, speed, bonus, alignment) VALUES (4, 'Billy', 10, 10, 10, 10, 10, 10, 1, 'elf', 'druid', 'none', 20, 20, 20, 2,'True Neutral')`, (err) =>
        {
            if (err) {
                console.error('Error inserting character: ', err.message);
            } else {
                console.log('Character added successfully');
        }
        }); //add values later
    db.run(`CREATE TABLE IF NOT EXISTS spells (
        spellid INTEGER PRIMARY KEY AUTOINCREMENT,
        characterid INTEGER,
        spellname TEXT,
        type TEXT,
        level INTEGER,
        feature BOOLEAN
        )`, (err) => {
            if (err) {
                console.error('Error creating spells table:', err.message);
            } else {
                console.log('Spells table created successfully');
            }
        });
    db.run(`CREATE TABLE IF NOT EXISTS skills (
        skillid INTEGER PRIMARY KEY AUTOINCREMENT,
        characterid INTEGER,
        acrobatics INTEGER,
        animalhandling INTEGER,
        arcana INTEGER,
        athletics INTEGER,
        deception INTEGER,
        history INTEGER,
        insight INTEGER,
        intimidation INTEGER,
        investigation INTEGER,
        medicine INTEGER,
        nature INTEGER,
        perception INTEGER,
        performance INTEGER,
        persuasion INTEGER,
        religion INTEGER,
        sleightofhand INTEGER,
        stealth INTEGER,
        survival INTEGER
        )`, (err) => {
            if (err) {
                console.error('Error creating skills table:', err.message);
            } else {
                console.log('Skills table created successfully');
            } 
        });
    db.run(`CREATE TABLE IF NOT EXISTS proficiencies (
        proficiencyid INTEGER PRIMARY KEY AUTOINCREMENT,
        characterid INTEGER,
        proficiency TEXT
        )` , (err) => {
            if (err) {
                console.error('Error creating proficiencies table:', err.message);
            } else {
                console.log('Proficiencies table created successfully');
            }
        });
    db.run(`CREATE TABLE IF NOT EXISTS languages (
        languageid INTEGER PRIMARY KEY AUTOINCREMENT,
        characterid INTEGER,
        language TEXT
        )` , (err) => {
            if (err) {
                console.error('Error creating languages table:', err.message);
            } else {
                console.log('Languages table created successfully');
            }
        });
    db.run(`CREATE TABLE IF NOT EXISTS features (
        featureid INTEGER PRIMARY KEY AUTOINCREMENT,
        characterid INTEGER,
        feature TEXT
        otherinfo TEXT
        )` , (err) => {
            if (err) {
                console.error('Error creating features table:', err.message);
            } else {
                console.log('Features table created successfully');
            }
        });
});
db.close();

