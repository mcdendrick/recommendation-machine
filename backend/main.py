from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
from services.tmdb_service import TMDBService
from services.recommendation_service import RecommendationService

app = FastAPI(title="Movie Recommendation Engine API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
recommendation_service = RecommendationService()

# Pydantic models
class Movie(BaseModel):
    id: int
    title: str
    genres: List[str]
    year: Optional[int]
    description: Optional[str]
    poster_path: Optional[str]
    vote_average: Optional[float]

class UserInteraction(BaseModel):
    user_id: int
    movie_id: int
    rating: Optional[float] = None
    watched: bool = False
    watch_time: Optional[int] = None  # in seconds

@app.get("/")
async def root():
    return {"message": "Movie Recommendation Engine API"}

@app.get("/movies/", response_model=List[Movie])
async def get_movies(
    page: int = Query(1, ge=1),
    search: Optional[str] = None
):
    """Get popular movies or search for movies."""
    tmdb_service = TMDBService()
    
    if search:
        movies = await tmdb_service.search_movies(search, page)
    else:
        movies = await tmdb_service.get_popular_movies(page)
    
    # Get full details for each movie to include genres
    detailed_movies = []
    for movie in movies:
        if details := await tmdb_service.get_movie_details(movie['id']):
            details['poster_path'] = tmdb_service.get_image_url(details['poster_path'])
            detailed_movies.append(details)
    
    return detailed_movies

@app.get("/movies/{movie_id}", response_model=Movie)
async def get_movie(movie_id: int):
    """Get detailed information about a specific movie."""
    tmdb_service = TMDBService()
    if movie := await tmdb_service.get_movie_details(movie_id):
        movie['poster_path'] = tmdb_service.get_image_url(movie['poster_path'])
        return movie
    raise HTTPException(status_code=404, detail="Movie not found")

@app.get("/recommendations/{user_id}", response_model=List[Movie])
async def get_recommendations(user_id: int, limit: int = 10):
    """Get personalized movie recommendations for a user."""
    tmdb_service = TMDBService()
    
    # Get movie IDs from recommendation service
    movie_ids = await recommendation_service.get_hybrid_recommendations(user_id, limit)
    
    # Fetch full movie details
    movies = []
    for movie_id in movie_ids:
        if movie := await tmdb_service.get_movie_details(movie_id):
            movie['poster_path'] = tmdb_service.get_image_url(movie['poster_path'])
            movies.append(movie)
    
    return movies

@app.get("/recommendations/similar/{movie_id}", response_model=List[Movie])
async def get_similar_movies(movie_id: int, limit: int = 10):
    """Get similar movies based on content."""
    tmdb_service = TMDBService()
    
    # Get similar movie IDs
    movie_ids = await recommendation_service.get_content_based_recommendations(movie_id, limit)
    
    # Fetch full movie details
    movies = []
    for similar_id in movie_ids:
        if movie := await tmdb_service.get_movie_details(similar_id):
            movie['poster_path'] = tmdb_service.get_image_url(movie['poster_path'])
            movies.append(movie)
    
    return movies

@app.post("/interactions/")
async def record_interaction(interaction: UserInteraction):
    """Record a user's interaction with a movie."""
    if interaction.rating is not None:
        await recommendation_service.add_user_rating(
            interaction.user_id,
            interaction.movie_id,
            interaction.rating
        )
    
    if interaction.watched:
        await recommendation_service.add_user_watch(
            interaction.user_id,
            interaction.movie_id
        )
    
    return {"status": "success", "message": "Interaction recorded"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
