import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
    Container,
    Grid,
    Typography,
    Box,
    Chip,
    Rating,
    Button,
    CircularProgress,
    Paper
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { movieApi } from '../api/movieApi';

export const MovieDetailsPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { data: movie, isLoading, error } = useQuery({
        queryKey: ['movie', id],
        queryFn: () => movieApi.getMovie(Number(id)),
        enabled: !!id,
    });

    const handleBack = () => {
        navigate(-1);
    };

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error || !movie) {
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
                </Grid>
            </Grid>
        </Container>
    );
}; 