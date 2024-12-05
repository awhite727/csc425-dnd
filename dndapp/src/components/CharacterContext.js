// allows character id to be shared between components
import React, { createContext, useState, useContext } from 'react';

const CharacterContext = createContext();

export const CharacterProvider = ({ children }) => {
    const [characterId, setCharacterId] = useState(null);

    return (
        <CharacterContext.Provider value={{ characterId, setCharacterId }}>
            {children}
        </CharacterContext.Provider>
    );
};

export const useCharacter = () => useContext(CharacterContext);
