import { useQuery } from '@tanstack/react-query';
import {
    Container,
    Grid,
    Typography,
    Box,
    CircularProgress,
    Alert,
    Tabs,
    Tab,
    Paper,
    Tooltip,
    IconButton
} from '@mui/material';
import { useState } from 'react';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { movieApi } from '../api/movieApi';
import { MovieCard } from '../components/MovieCard';

// Mock user ID (replace with actual user authentication later)
const MOCK_USER_ID = 1;

const TabInfo = {
    0: {
        label: "Hybrid",
        description: "Combines collaborative and content-based approaches for the best recommendations",
        queryFn: (userId: number) => movieApi.getHybridRecommendations(userId)
    },
    1: {
        label: "Collaborative",
        description: "Recommendations based on ratings from users with similar taste",
        queryFn: (userId: number) => movieApi.getCollaborativeRecommendations(userId)
    },
    2: {
        label: "Content-Based",
        description: "Recommendations based on movie features like genres, ratings, and release year",
        queryFn: (userId: number) => movieApi.getContentBasedRecommendations(userId)
    },
    3: {
        label: "Popular",
        description: "Currently trending and popular movies",
        queryFn: () => movieApi.getMovies(1)
    }
} as const;

export const RecommendationsPage = () => {
    const [tabValue, setTabValue] = useState(0);

    const currentTab = TabInfo[tabValue as keyof typeof TabInfo];

    const { data: movies, isLoading, error } = useQuery({
        queryKey: ['recommendations', currentTab.label, MOCK_USER_ID],
        queryFn: () => currentTab.queryFn(MOCK_USER_ID),
        staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    });

    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    if (error) {
        return (
            <Container>
                <Alert severity="error" sx={{ mt: 4 }}>
                    Error loading recommendations. Please try again later.
                </Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl">
            <Box sx={{ py: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Your Movie Recommendations
                </Typography>
                
                <Typography variant="body1" color="text.secondary" paragraph>
                    Discover movies tailored to your taste based on your ratings and viewing history.
                </Typography>

                <Paper sx={{ mt: 4 }}>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center' }}>
                        <Tabs
                            value={tabValue}
                            onChange={handleTabChange}
                            indicatorColor="primary"
                            textColor="primary"
                            centered
                            sx={{ flex: 1 }}
                        >
                            {Object.entries(TabInfo).map(([key, { label }]) => (
                                <Tab key={key} label={label} />
                            ))}
                        </Tabs>
                        <Tooltip title={currentTab.description} arrow placement="left">
                            <IconButton size="small" sx={{ mr: 2 }}>
                                <HelpOutlineIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>

                    <Box sx={{ p: 2 }}>
                        <Typography variant="body2" color="text.secondary" align="center">
                            {currentTab.description}
                        </Typography>
                    </Box>

                    {isLoading ? (
                        <Box display="flex" justifyContent="center" my={4}>
                            <CircularProgress />
                        </Box>
                    ) : movies && movies.length > 0 ? (
                        <Box sx={{ p: 2 }}>
                            <Grid container spacing={3}>
                                {movies.map((movie) => (
                                    <Grid item xs={12} sm={6} md={4} lg={3} key={movie.id}>
                                        <MovieCard movie={movie} />
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    ) : (
                        <Alert severity="info" sx={{ mx: 2, mb: 2 }}>
                            {tabValue === 3 ? 
                                "No popular movies available at the moment." :
                                "Start rating movies to get personalized recommendations!"}
                        </Alert>
                    )}
                </Paper>
            </Box>
        </Container>
    );
}; 