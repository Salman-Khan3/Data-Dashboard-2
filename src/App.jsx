import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import md5 from 'md5';
import './App.css';
import { Bar } from 'react-chartjs-2';

function CharacterDetail() {
  const { id } = useParams();
  const [character, setCharacter] = useState(null);

  useEffect(() => {
    const fetchCharacterDetail = async () => {
      const apiKey = import.meta.env.VITE_MARVEL_PUBLIC_KEY;
      const privateKey = import.meta.env.VITE_MARVEL_PRIVATE_KEY;
      const ts = new Date().getTime();
      const hash = md5(ts + privateKey + apiKey);

      try {
        const response = await fetch(
          `https://gateway.marvel.com:443/v1/public/characters/${id}?ts=${ts}&apikey=${apiKey}&hash=${hash}`
        );
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setCharacter(data.data.results[0]);
      } catch (error) {
        console.error("Error fetching character details:", error);
      }
    };
    fetchCharacterDetail();
  }, [id]);

  return (
    <div>
      {character ? (
        <>
          <h2>{character.name}</h2>
          {character.thumbnail && (
            <img src={`${character.thumbnail.path}.${character.thumbnail.extension}`} alt={character.name} />
          )}
          <p>{character.description}</p>
          <p>Comics Available: {character.comics.available}</p>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

function App() {
  const [characters, setCharacters] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [minComics, setMinComics] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const apiKey = import.meta.env.VITE_MARVEL_PUBLIC_KEY;
      const privateKey = import.meta.env.VITE_MARVEL_PRIVATE_KEY;
      const ts = new Date().getTime();
      const hash = md5(ts + privateKey + apiKey);

      try {
        const response = await fetch(
          `https://gateway.marvel.com:443/v1/public/characters?ts=${ts}&apikey=${apiKey}&hash=${hash}`
        );
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setCharacters(data.data.results || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const totalCharacters = characters.length;
  const averageComicsAppearances =
    totalCharacters > 0
      ? (characters.reduce((sum, character) => sum + character.comics.available, 0) / totalCharacters)
      : 0;

  const handleSearchChange = (event) => setSearchTerm(event.target.value);
  const handleMinComicsChange = (event) => setMinComics(parseInt(event.target.value, 10) || 0);

  const filteredCharacters = characters
    .filter((character) =>
      character.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((character) => character.comics.available >= minComics);

  const chartData = {
    labels: filteredCharacters.map(character => character.name),
    datasets: [
      {
        label: 'Comics Appearances',
        data: filteredCharacters.map(character => character.comics.available),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  return (
    <div>
      <h1>Marvel Characters Dashboard</h1>

      {/* Search Bar */}
      <input 
        type="text" 
        placeholder="Search Characters..." 
        value={searchTerm}
        onChange={handleSearchChange}
      />

      {/* Min Comics Filter */}
      <input 
        type="number" 
        placeholder="Min Comics Appearances" 
        value={minComics}
        onChange={handleMinComicsChange}
      />

      <h2>Total Characters: {totalCharacters}</h2>
      <h2>Average Comics Appearances: {averageComicsAppearances.toFixed(2)}</h2>

      {chartData ? <Bar data={chartData} /> : <></>}
      
      <div>
        {filteredCharacters.length > 0 ? (
          <ul>
            {filteredCharacters.map((character) => (
              <li key={character.id}>
                {character.thumbnail && (
                  <img 
                    src={`${character.thumbnail.path}.${character.thumbnail.extension}`} 
                    alt={character.name} 
                  />
                )}
                <h3>
                  <Link to={`/character/${character.id}`}>{character.name}</Link>
                </h3>
              </li>
            ))}
          </ul>
        ) : (
          <p>No characters found.</p>
        )}
      </div>
    </div>
  );
}

export default App;
