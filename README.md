# Movie Recommendation Engine

A full-stack movie recommendation system that uses collaborative filtering and content-based approaches to suggest movies to users. Built with FastAPI, React, and the TMDB API.

## Features

- Movie browsing with search and filtering
- User-based and item-based collaborative filtering
- Content-based recommendations
- User interaction tracking (views, likes, watch time)
- Modern, responsive UI
- Real-time movie data from TMDB

## Tech Stack

### Backend
- FastAPI (Python web framework)
- SQLAlchemy (ORM)
- scikit-learn (Machine Learning)
- TMDB API (Movie Database)
- PostgreSQL (coming soon)

### Frontend
- React with TypeScript
- Material-UI
- React Query
- React Router

## Setup

### Prerequisites
- Python 3.11+
- Node.js 16+
- TMDB API key (get it from [TMDB](https://www.themoviedb.org/settings/api))

### Backend Setup
1. Create a virtual environment and install dependencies:
```bash
cd backend
python3.11 -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
pip install -r requirements.txt
```

2. Create a `.env` file in the backend directory:
```bash
TMDB_API_KEY=your_api_key_here
```

3. Start the backend server:
```bash
python main.py
```

### Frontend Setup
1. Install dependencies:
```bash
cd frontend
npm install
```

2. Start the development server:
```bash
npm run dev
```

## Development

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
