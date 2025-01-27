export interface Movie {
    id: number;
    title: string;
    genres: string[];
    year: number;
    description?: string;
    poster_path?: string;
    vote_average?: number;
}

export interface UserInteraction {
    user_id: number;
    movie_id: number;
    rating?: number;
    watched: boolean;
    watch_time?: number;
} 