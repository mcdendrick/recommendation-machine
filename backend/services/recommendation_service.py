from typing import List, Dict
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from .tmdb_service import TMDBService

class RecommendationService:
    def __init__(self):
        self.tmdb_service = TMDBService()
        # In-memory storage for user interactions (replace with database later)
        self.user_ratings: Dict[int, Dict[int, float]] = {}  # user_id -> {movie_id -> rating}
        self.user_watches: Dict[int, List[int]] = {}  # user_id -> [movie_ids]
        self.movie_features: Dict[int, Dict] = {}  # movie_id -> features

    async def add_user_rating(self, user_id: int, movie_id: int, rating: float):
        """Record a user's rating for a movie."""
        if user_id not in self.user_ratings:
            self.user_ratings[user_id] = {}
        self.user_ratings[user_id][movie_id] = rating

    async def add_user_watch(self, user_id: int, movie_id: int):
        """Record that a user watched a movie."""
        if user_id not in self.user_watches:
            self.user_watches[user_id] = []
        if movie_id not in self.user_watches[user_id]:
            self.user_watches[user_id].append(movie_id)

    async def _get_movie_features(self, movie_id: int) -> Dict:
        """Get or create feature vector for a movie."""
        if movie_id not in self.movie_features:
            movie = await self.tmdb_service.get_movie_details(movie_id)
            if movie:
                # Create a simple feature vector based on genres
                self.movie_features[movie_id] = {
                    'genres': movie['genres'],
                    'vote_average': movie['vote_average'],
                    'year': movie['year'] if movie.get('year') else 0
                }
        return self.movie_features.get(movie_id, {})

    async def get_content_based_recommendations(self, movie_id: int, limit: int = 10) -> List[int]:
        """Get recommendations based on movie content similarity."""
        target_features = await self._get_movie_features(movie_id)
        if not target_features:
            return []

        # Get popular movies to compare against
        popular_movies = await self.tmdb_service.get_popular_movies()
        similar_movies = []

        for movie in popular_movies:
            if movie['id'] == movie_id:
                continue

            movie_features = await self._get_movie_features(movie['id'])
            if not movie_features:
                continue

            # Calculate similarity score
            genre_similarity = len(
                set(target_features['genres']) & set(movie_features['genres'])
            ) / len(set(target_features['genres']) | set(movie_features['genres']))

            # Weight different factors
            similarity = (
                genre_similarity * 0.6 +
                (1 - abs(target_features['vote_average'] - movie_features['vote_average']) / 10) * 0.2 +
                (1 - abs(target_features['year'] - movie_features['year']) / 100) * 0.2
            )

            similar_movies.append((movie['id'], similarity))

        # Sort by similarity and return top N
        similar_movies.sort(key=lambda x: x[1], reverse=True)
        return [movie_id for movie_id, _ in similar_movies[:limit]]

    async def get_collaborative_recommendations(self, user_id: int, limit: int = 10) -> List[int]:
        """Get recommendations based on user similarity."""
        if user_id not in self.user_ratings or not self.user_ratings[user_id]:
            return []

        # Create user-movie rating matrix
        all_movie_ids = set()
        for ratings in self.user_ratings.values():
            all_movie_ids.update(ratings.keys())

        movie_id_to_idx = {movie_id: idx for idx, movie_id in enumerate(all_movie_ids)}
        user_id_to_idx = {u_id: idx for idx, u_id in enumerate(self.user_ratings.keys())}

        # Create rating matrix
        rating_matrix = np.zeros((len(self.user_ratings), len(all_movie_ids)))
        for u_id, ratings in self.user_ratings.items():
            for m_id, rating in ratings.items():
                rating_matrix[user_id_to_idx[u_id], movie_id_to_idx[m_id]] = rating

        # Calculate user similarity
        user_similarity = cosine_similarity(rating_matrix)
        user_idx = user_id_to_idx[user_id]
        similar_users = user_similarity[user_idx].argsort()[::-1][1:6]  # top 5 similar users

        # Get recommendations from similar users
        recommendations = []
        user_movies = set(self.user_ratings[user_id].keys())

        for similar_user_idx in similar_users:
            similar_user_id = list(user_id_to_idx.keys())[similar_user_idx]
            similar_user_ratings = self.user_ratings[similar_user_id]

            for movie_id, rating in similar_user_ratings.items():
                if movie_id not in user_movies and rating >= 4:
                    recommendations.append((movie_id, rating))

        recommendations.sort(key=lambda x: x[1], reverse=True)
        return [movie_id for movie_id, _ in recommendations[:limit]]

    async def get_hybrid_recommendations(self, user_id: int, limit: int = 10) -> List[int]:
        """Get recommendations using both collaborative and content-based approaches."""
        collaborative_recs = await self.get_collaborative_recommendations(user_id, limit)
        
        # If user has no ratings, fall back to content-based on their watched movies
        if not collaborative_recs and user_id in self.user_watches:
            watched_movies = self.user_watches[user_id]
            if watched_movies:
                # Get recommendations based on their most recently watched movie
                return await self.get_content_based_recommendations(watched_movies[-1], limit)
            
        # If still no recommendations, return popular movies
        if not collaborative_recs:
            popular_movies = await self.tmdb_service.get_popular_movies()
            return [movie['id'] for movie in popular_movies[:limit]]

        # Get content-based recommendations for each collaborative recommendation
        content_based_recs = []
        for movie_id in collaborative_recs[:3]:  # Use top 3 collaborative recommendations
            similar_movies = await self.get_content_based_recommendations(movie_id, limit=3)
            content_based_recs.extend(similar_movies)

        # Combine and deduplicate recommendations
        all_recs = collaborative_recs + content_based_recs
        return list(dict.fromkeys(all_recs))[:limit]  # Remove duplicates while preserving order 