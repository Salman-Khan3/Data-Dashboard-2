import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import md5 from 'md5';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const CharacterDetail = () => {
  const { id } = useParams();
  const [character, setCharacter] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCharacter = async () => {
      const apiKey = process.env.REACT_APP_MARVEL_PUBLIC_KEY;
      const privateKey = process.env.REACT_APP_MARVEL_PRIVATE_KEY;

      if (!apiKey || !privateKey) {
        setError("API keys are missing. Please check your environment variables.");
        console.error("API keys are missing. Please check your environment variables.");
        return;
      }
      const ts = new Date().getTime();
      const hash = md5(ts + privateKey + apiKey);

      try {
        const response = await fetch(
          `https://gateway.marvel.com:443/v1/public/characters/${id}?ts=${ts}&apikey=${apiKey}&hash=${hash}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.data.results.length > 0) {
          setCharacter(data.data.results[0]);
        } else {
          setError("Character not found.");
        }
      } catch (error) {
        setError("Error fetching character data: " + error.message);
        console.error("Error fetching character data:", error);
      }
    };

    fetchCharacter();
  }, [id]);

  if (error) {
    return <p>{error}</p>;
  }

  if (!character) {
    return <p>Loading...</p>;
  }

  const comicAppearancesData = {
    labels: character.comics && character.comics.items ? character.comics.items.map((comic) => comic.name) : [],
    datasets: [
      {
        label: 'Comic Appearances',
        data: character.comics && character.comics.items ? character.comics.items.map(() => 1) : [], // Each comic appearance counts as 1
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
      },
    ],
  };
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        beginAtZero: true,
      },
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div>
      <h1>{character.name}</h1>
      {character.thumbnail && (
        <img
          src={`${character.thumbnail.path}.${character.thumbnail.extension}`}
          alt={character.name}
        />
      )}
      <p>{character.description || "No description available."}</p>

      {/* Comics List */}
      {character.comics && character.comics.items && character.comics.items.length > 0 ? (
        <ul>
          {character.comics.items.map((comic, index) => (
            <li key={index}>{comic.name}</li>
          ))}
        </ul>
      ) : (
        <p>No comics available.</p>
      )}

      {/* Data Visualization - Comic Appearances */}
      <h2>Comic Appearances Visualization</h2>
      <Bar data={comicAppearancesData} options={options} />
    </div>
  );
};

export default CharacterDetail;