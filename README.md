# Nassets - Financial Planner

A comprehensive monthly budget-focused financial planner application with calendar view, recurring transactions, and real-time budget tracking.

## Features

- 📅 **Calendar View**: Visualize all upcoming expenses and incomes in a monthly calendar
- 💰 **Budget Tracking**: Track income vs expenses with running balance calculations
- 🔄 **Recurring Transactions**: Support for daily, weekly, monthly, and yearly recurring items
- 👤 **User Authentication**: Secure login and registration system
- 📊 **Budget Summary**: See remaining budget and daily breakdowns
- 🎯 **Individual & Recurring**: Add both one-time and recurring expenses/incomes

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for fast development and builds
- TanStack Query for data fetching and caching
- React Router for navigation
- Zustand for state management
- date-fns for date manipulation

### Backend
- FastAPI (Python)
- SQLModel for database ORM
- PostgreSQL database
- JWT authentication
- Automatic recurring transaction expansion

### Infrastructure
- Docker & Docker Compose
- GitHub Actions for CI/CD
- GitHub Container Registry (GHCR) for image hosting
- Coolify-ready deployment

## Project Structure

```
Nassets/
├── backend/                 # FastAPI backend
│   ├── main.py             # Main application and routes
│   ├── models.py           # SQLModel database models
│   ├── auth.py             # Authentication logic
│   ├── database.py         # Database connection
│   ├── requirements.txt    # Python dependencies
│   └── Dockerfile          # Backend container
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── lib/            # API and queries
│   │   ├── store/          # Zustand stores
│   │   └── types.ts        # TypeScript types
│   ├── package.json
│   ├── Dockerfile          # Frontend container
│   └── nginx.conf          # Nginx configuration
├── .github/workflows/      # CI/CD workflows
│   ├── backend.yml         # Backend build & push
│   └── frontend.yml        # Frontend build & push
└── docker-compose.yml      # Local development setup
```

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)

### Local Development with Docker Compose

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/Nassets.git
cd Nassets
```

2. Start all services:
```bash
docker-compose up --build
```

This will start:
- PostgreSQL on port 5432
- Backend API on port 8000
- Frontend on port 80

3. Access the application at `http://localhost`

### Local Development without Docker

#### Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export DATABASE_URL="postgresql://nassets:nassets@localhost:5432/nassets"
export SECRET_KEY="your-secret-key"

# Run the server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env and set VITE_API_URL=http://localhost:8000

# Run development server
npm run dev
```

## Deployment to Coolify

### Prerequisites

1. Push your code to GitHub
2. Ensure GitHub Actions have run and published images to GHCR
3. Make the packages public in your GitHub repository settings

### Coolify Setup

#### 1. Deploy PostgreSQL

- Create a new PostgreSQL database in Coolify
- Note the connection details (host, port, username, password, database)

#### 2. Deploy Backend

- Create a new "Docker Image" resource in Coolify
- Use image: `ghcr.io/YOUR_USERNAME/nassets-backend:latest`
- Set environment variables:
  - `DATABASE_URL`: `postgresql://user:pass@host:5432/dbname`
  - `SECRET_KEY`: Generate a secure random string
- Set port: 8000
- Deploy

#### 3. Deploy Frontend

- Create a new "Docker Image" resource in Coolify
- Use image: `ghcr.io/YOUR_USERNAME/nassets-frontend:latest`
- Set port: 80
- Configure domain/subdomain
- Deploy

## Environment Variables

### Backend

- `DATABASE_URL`: PostgreSQL connection string
- `SECRET_KEY`: Secret key for JWT tokens (change in production!)

### Frontend

- `VITE_API_URL`: Backend API URL (e.g., `https://api.yourdomain.com`)

## API Documentation

Once the backend is running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Key API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login (returns JWT token)
- `GET /api/auth/me` - Get current user

### Incomes
- `GET /api/incomes` - List all incomes
- `POST /api/incomes` - Create income
- `PUT /api/incomes/{id}` - Update income
- `DELETE /api/incomes/{id}` - Delete income

### Expenses
- `GET /api/expenses` - List all expenses
- `POST /api/expenses` - Create expense
- `PUT /api/expenses/{id}` - Update expense
- `DELETE /api/expenses/{id}` - Delete expense

### Calendar & Budget
- `GET /api/calendar?year={year}&month={month}` - Get calendar view
- `GET /api/budget/summary?year={year}&month={month}` - Get budget summary

## GitHub Actions Workflows

The repository includes two workflows that automatically build and push Docker images to GHCR:

- **Backend Workflow**: Triggers on changes to `backend/` directory
- **Frontend Workflow**: Triggers on changes to `frontend/` directory

Both workflows:
- Build Docker images
- Tag with `latest` and commit SHA
- Push to GitHub Container Registry
- Only push on main branch (not on PRs)

## Database Schema

### Users
- id, email, username, hashed_password, full_name, is_active

### Incomes
- id, user_id, title, amount, date, recurrence_type, recurrence_end_date, description

### Expenses
- id, user_id, title, amount, date, category, recurrence_type, recurrence_end_date, description

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Push to your fork
5. Open a pull request

## License

See LICENSE file for details.

## Support

For issues and questions, please open a GitHub issue.
