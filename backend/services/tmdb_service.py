import os
import tmdbsimple as tmdb
from typing import List, Optional
from dotenv import load_dotenv

load_dotenv()

# Initialize TMDB with API key
tmdb.API_KEY = os.getenv('TMDB_API_KEY')

class TMDBService:
    @staticmethod
    async def get_popular_movies(page: int = 1) -> List[dict]:
        """Get popular movies from TMDB."""
        movies = tmdb.Movies()
        response = movies.popular(page=page)
        return [{
            'id': movie['id'],
            'title': movie['title'],
            'genres': [], # We'll populate this in the next step
            'year': int(movie['release_date'].split('-')[0]) if movie.get('release_date') else None,
            'description': movie['overview'],
            'poster_path': movie.get('poster_path'),
            'vote_average': movie['vote_average']
        } for movie in response['results']]

    @staticmethod
    async def get_movie_details(movie_id: int) -> Optional[dict]:
        """Get detailed information about a specific movie."""
        try:
            movie = tmdb.Movies(movie_id)
            response = movie.info()
            return {
                'id': response['id'],
                'title': response['title'],
                'genres': [genre['name'] for genre in response['genres']],
                'year': int(response['release_date'].split('-')[0]) if response.get('release_date') else None,
                'description': response['overview'],
                'poster_path': response.get('poster_path'),
                'vote_average': response['vote_average'],
                'runtime': response.get('runtime'),
                'tagline': response.get('tagline')
            }
        except Exception:
            return None

    @staticmethod
    async def search_movies(query: str, page: int = 1) -> List[dict]:
        """Search for movies by title."""
        search = tmdb.Search()
        response = search.movie(query=query, page=page)
        return [{
            'id': movie['id'],
            'title': movie['title'],
            'genres': [], # We'll populate this when getting details
            'year': int(movie['release_date'].split('-')[0]) if movie.get('release_date') else None,
            'description': movie['overview'],
            'poster_path': movie.get('poster_path'),
            'vote_average': movie['vote_average']
        } for movie in response['results']]

    @staticmethod
    def get_image_url(poster_path: str, size: str = 'w500') -> Optional[str]:
        """Get the full URL for a movie poster."""
        if not poster_path:
            return None
        return f"https://image.tmdb.org/t/p/{size}{poster_path}" 