import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Container,
    Grid,
    Typography,
    Box,
    Chip,
    Rating,
    Button,
    CircularProgress,
    Paper,
    Divider,
    Alert,
    Snackbar
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { movieApi } from '../api/movieApi';
import { MovieCard } from '../components/MovieCard';
import { Movie } from '../types/movie';

// Mock user ID (replace with actual user authentication later)
const MOCK_USER_ID = 1;

export const MovieDetailsPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [userRating, setUserRating] = useState<number | null>(null);
    const [showRatingSuccess, setShowRatingSuccess] = useState(false);

    const { data: movie, isLoading: isLoadingMovie, error: movieError } = useQuery({
        queryKey: ['movie', id],
        queryFn: () => movieApi.getMovie(Number(id)),
        enabled: !!id,
    });

    const { data: similarMovies, isLoading: isLoadingSimilar } = useQuery({
        queryKey: ['similar-movies', id],
        queryFn: () => movieApi.getSimilarMovies(Number(id)),
        enabled: !!id,
    });

    const rateMutation = useMutation({
        mutationFn: (rating: number) => 
            movieApi.recordInteraction({
                user_id: MOCK_USER_ID,
                movie_id: Number(id),
                rating,
                watched: true
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['recommendations'] });
            setShowRatingSuccess(true);
        }
    });

    const handleBack = () => {
        navigate(-1);
    };

    const handleRatingChange = (_: React.SyntheticEvent, value: number | null) => {
        if (value !== null) {
            setUserRating(value);
            rateMutation.mutate(value * 2); // Convert 5-star scale to 10-point scale
        }
    };

    if (isLoadingMovie) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                <CircularProgress />
            </Box>
        );
    }

    if (movieError || !movie) {
        return (
            <Container>
                <Typography color="error" align="center" mt={4}>
                    Error loading movie details. Please try again later.
                </Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg">
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={handleBack}
                sx={{ mt: 4, mb: 2 }}
            >
                Back to Movies
            </Button>

            <Grid container spacing={4}>
                {/* Movie Poster */}
                <Grid item xs={12} md={4}>
                    <Paper elevation={3}>
                        <img
                            src={movie.poster_path}
                            alt={movie.title}
                            style={{
                                width: '100%',
                                height: 'auto',
                                display: 'block',
                                borderRadius: '4px'
                            }}
                        />
                    </Paper>

                    {/* User Rating Section */}
                    <Paper sx={{ mt: 2, p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Rate this Movie
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Rating
                                value={userRating}
                                onChange={handleRatingChange}
                                precision={0.5}
                                size="large"
                            />
                            {userRating && (
                                <Typography variant="body2" sx={{ ml: 1 }}>
                                    {userRating.toFixed(1)}
                                </Typography>
                            )}
                        </Box>
                    </Paper>
                </Grid>

                {/* Movie Details */}
                <Grid item xs={12} md={8}>
                    <Typography variant="h4" gutterBottom>
                        {movie.title}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Rating
                            value={movie.vote_average ? movie.vote_average / 2 : 0}
                            precision={0.5}
                            readOnly
                        />
                        <Typography variant="body1" sx={{ ml: 1 }}>
                            {movie.vote_average?.toFixed(1)} / 10
                        </Typography>
                    </Box>

                    <Box sx={{ mb: 3 }}>
                        {movie.genres.map((genre) => (
                            <Chip
                                key={genre}
                                label={genre}
                                sx={{ mr: 1, mb: 1 }}
                            />
                        ))}
                    </Box>

                    <Typography variant="h6" gutterBottom>
                        Overview
                    </Typography>
                    <Typography variant="body1" paragraph>
                        {movie.description}
                    </Typography>

                    <Box sx={{ mt: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                            Release Year: {movie.year}
                        </Typography>
                    </Box>

                    {/* Similar Movies Section */}
                    <Divider sx={{ my: 4 }} />
                    <Typography variant="h6" gutterBottom>
                        Similar Movies
                    </Typography>
                    {isLoadingSimilar ? (
                        <Box display="flex" justifyContent="center" my={4}>
                            <CircularProgress />
                        </Box>
                    ) : similarMovies && similarMovies.length > 0 ? (
                        <Grid container spacing={2}>
                            {similarMovies.map((similar: Movie) => (
                                <Grid item xs={12} sm={6} md={4} key={similar.id}>
                                    <MovieCard movie={similar} />
                                </Grid>
                            ))}
                        </Grid>
                    ) : (
                        <Alert severity="info">No similar movies found.</Alert>
                    )}
                </Grid>
            </Grid>

            <Snackbar
                open={showRatingSuccess}
                autoHideDuration={3000}
                onClose={() => setShowRatingSuccess(false)}
            >
                <Alert severity="success" sx={{ width: '100%' }}>
                    Rating saved successfully!
                </Alert>
            </Snackbar>
        </Container>
    );
}; 