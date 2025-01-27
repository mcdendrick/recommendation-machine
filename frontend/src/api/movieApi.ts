import axios from 'axios';
import { Movie, UserInteraction } from '../types/movie';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
    baseURL: API_BASE_URL,
});

export const movieApi = {
    getMovies: async (page = 1, search?: string) => {
        const params = new URLSearchParams({
            page: page.toString()
        });
        
        if (search) {
            params.append('search', search);
        }
        
        const response = await api.get<Movie[]>(`/movies/?${params}`);
        return response.data;
    },

    getMovie: async (id: number): Promise<Movie> => {
        const response = await api.get<Movie>(`/movies/${id}`);
        return response.data;
    },

    getRecommendations: async (userId: number, limit = 10) => {
        const response = await api.get<Movie[]>(`/recommendations/${userId}?limit=${limit}`);
        return response.data;
    },

    recordInteraction: async (interaction: UserInteraction) => {
        const response = await api.post('/interactions/', interaction);
        return response.data;
    },
}; 