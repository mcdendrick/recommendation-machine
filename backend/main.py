from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
from services.tmdb_service import TMDBService

app = FastAPI(title="Movie Recommendation Engine API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
    """Get movie recommendations for a user."""
    # TODO: Implement actual recommendation logic
    # For now, return popular movies as recommendations
    tmdb_service = TMDBService()
    movies = await tmdb_service.get_popular_movies()
    return movies[:limit]

@app.post("/interactions/")
async def record_interaction(interaction: UserInteraction):
    # TODO: Implement interaction recording in database
    return {"status": "success", "message": "Interaction recorded"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
