import React, { useState, useEffect } from 'react';
import Search from './components/Search';
import Spinner from './components/Spinner';
import { useDebounce } from 'react-use';
import MovieCard from './components/MovieCard';
import  {updateSearchCount,getTrendingMovies} from './appwrite';

const API_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
};

const App = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const[trendingMovies,setTrendingMovies]=useState([]);
  const [movieList, setMovieList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Debounce search input
  useDebounce(() => {
    setDebouncedSearchTerm(searchTerm);
  }, 500, [searchTerm]); // Use 500ms for responsiveness

  const fetchMovies = async (query = '') => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

      const response = await fetch(endpoint, API_OPTIONS);
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const data = await response.json();
if (!data?.results || data.results.length === 0) {
  setErrorMessage('No movies found.');
  setMovieList([]);
  return;
}
      

      setMovieList(data.results);
      if (query && data.results.length>0) {
        await updateSearchCount(query,data.results[0]);
        
      }
      
    } catch (error) {
      console.error(`Error fetching movies: ${error}`);
      setErrorMessage('Error fetching movies. Try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  const loadTrendingMovies = async () => {
    try {
      const movies = await getTrendingMovies();

      setTrendingMovies(movies);
    } catch (error) {
      console.error(`Error fetching trending movies: ${error}`);
    }
  }

  useEffect(() => {
    fetchMovies(debouncedSearchTerm);
  }, [debouncedSearchTerm]);
   useEffect(() => {
    loadTrendingMovies();
  }, []);

  return (
    <main>
      <div className="pattern" />
      <div className="wrapper">
        <header>
          <img src="/hero.png" alt="Hero Banner" />
          <h1>
            Find <span className="text-gradient">Movies</span> You will enjoy without the hustle
          </h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>

         {trendingMovies.length > 0 && (
          <section className="trending">
            <h2>Trending Movies</h2>

            <ul>
              {trendingMovies.map((movie, index) => (
                <li key={movie.$id}>
                  <p>{index + 1}</p>
                  <img src={movie.poster_url} alt={movie.title} />
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="all-movies">
          <h2 >All Movies</h2>

          {isLoading ? (
            <Spinner />
          ) : errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {movieList.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
};

export default App;
