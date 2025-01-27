import { Card, CardContent, CardMedia, Typography, Chip, Stack, Rating, Box } from '@mui/material';
import { Movie } from '../types/movie';

interface MovieCardProps {
    movie: Movie;
    onClick?: () => void;
}

const DEFAULT_MOVIE_POSTER = '/movie-placeholder.jpg'; // You'll need to add this image to your public folder

export const MovieCard = ({ movie, onClick }: MovieCardProps) => {
    return (
        <Card 
            sx={{ 
                maxWidth: 345, 
                cursor: onClick ? 'pointer' : 'default',
                '&:hover': onClick ? { transform: 'scale(1.02)', transition: 'transform 0.2s' } : {},
                display: 'flex',
                flexDirection: 'column',
                height: '100%'
            }}
            onClick={onClick}
        >
            <CardMedia
                component="img"
                height="400"
                image={movie.poster_path || DEFAULT_MOVIE_POSTER}
                alt={movie.title}
                sx={{ objectFit: 'cover' }}
            />
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography gutterBottom variant="h6" component="div">
                    {movie.title}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Rating 
                        value={movie.vote_average ? movie.vote_average / 2 : 0} 
                        precision={0.5} 
                        readOnly 
                        size="small"
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                        {movie.vote_average?.toFixed(1)}
                    </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                    {movie.year}
                </Typography>
                <Stack direction="row" spacing={1} mt={1} flexWrap="wrap" gap={1}>
                    {movie.genres.map((genre) => (
                        <Chip key={genre} label={genre} size="small" />
                    ))}
                </Stack>
                {movie.description && (
                    <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        mt={2}
                        sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                        }}
                    >
                        {movie.description}
                    </Typography>
                )}
            </CardContent>
        </Card>
    );
}; 