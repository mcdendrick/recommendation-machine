import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Grid, 
  Container, 
  TextField, 
  InputAdornment, 
  Box,
  CircularProgress,
  Typography,
  Pagination
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { MovieCard } from '../components/MovieCard';
import { movieApi } from '../api/movieApi';
import { useDebounce } from '../hooks/useDebounce';

export const MoviesPage = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 500);

  const { data: movies, isLoading, error } = useQuery({
    queryKey: ['movies', debouncedSearch, page],
    queryFn: () => movieApi.getMovies(page - 1, debouncedSearch),
  });

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    setPage(1); // Reset to first page when search changes
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (error) {
    return (
      <Container>
        <Typography color="error" align="center" mt={4}>
          Error loading movies. Please try again later.
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search movies..."
          value={search}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 4 }}
        />

        {isLoading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Grid container spacing={3}>
              {movies?.map((movie) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={movie.id}>
                  <MovieCard movie={movie} />
                </Grid>
              ))}
            </Grid>

            <Box display="flex" justifyContent="center" mt={4}>
              <Pagination
                count={10} // We'll update this with actual total pages later
                page={page}
                onChange={handlePageChange}
                color="primary"
                size="large"
              />
            </Box>
          </>
        )}
      </Box>
    </Container>
  );
}; 