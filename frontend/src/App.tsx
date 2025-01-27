import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { 
  ThemeProvider, 
  CssBaseline, 
  Container, 
  AppBar, 
  Toolbar, 
  Typography, 
  Box,
  Button
} from '@mui/material';
import { createTheme } from '@mui/material/styles';
import MovieIcon from '@mui/icons-material/Movie';
import { MoviesPage } from './pages/MoviesPage';
import { MovieDetailsPage } from './pages/MovieDetailsPage';

// Create pages later
const HomePage = () => (
  <Container>
    <Box sx={{ mt: 4, textAlign: 'center' }}>
      <Typography variant="h4" gutterBottom>
        Welcome to Movie Recommendations
      </Typography>
      <Typography variant="body1" paragraph>
        Discover new movies based on your preferences and viewing history.
      </Typography>
      <Button component={Link} to="/movies" variant="contained" size="large">
        Browse Movies
      </Button>
    </Box>
  </Container>
);

const RecommendationsPage = () => <div>Recommendations - Coming Soon</div>;

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#1976d2',
    },
  },
});

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <Box sx={{ flexGrow: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <AppBar position="static">
              <Toolbar>
                <MovieIcon sx={{ mr: 2 }} />
                <Typography variant="h6" component={Link} to="/" sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit' }}>
                  Movie Recommendations
                </Typography>
                <Button color="inherit" component={Link} to="/movies">
                  Movies
                </Button>
                <Button color="inherit" component={Link} to="/recommendations">
                  Recommendations
                </Button>
              </Toolbar>
            </AppBar>
            
            <Container component="main" sx={{ mt: 4, mb: 4, flex: 1 }}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/movies" element={<MoviesPage />} />
                <Route path="/movies/:id" element={<MovieDetailsPage />} />
                <Route path="/recommendations" element={<RecommendationsPage />} />
              </Routes>
            </Container>

            <Box component="footer" sx={{ py: 3, px: 2, mt: 'auto', backgroundColor: (theme) => theme.palette.grey[900] }}>
              <Container maxWidth="sm">
                <Typography variant="body2" color="text.secondary" align="center">
                  © {new Date().getFullYear()} Movie Recommendation Engine
                </Typography>
              </Container>
            </Box>
          </Box>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
