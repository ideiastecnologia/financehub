# FinanceHub - Personal Finance Management System

A comprehensive personal finance management application built with modern technologies.

![.NET 8](https://img.shields.io/badge/.NET-8.0-purple)
![Angular 17](https://img.shields.io/badge/Angular-17-red)
![SQL Server](https://img.shields.io/badge/SQL%20Server-2022-blue)
![Docker](https://img.shields.io/badge/Docker-Compose-blue)

## Screenshots

> Screenshots will be added after the first stable release.

| Dashboard | Transactions | Reports |
|-----------|-------------|---------|
| ![Dashboard](docs/screenshots/dashboard.png) | ![Transactions](docs/screenshots/transactions.png) | ![Reports](docs/screenshots/reports.png) |

## Tech Stack

### Backend
- **ASP.NET Core 8** - Web API
- **Entity Framework Core 8** - ORM with SQL Server
- **MediatR** - CQRS pattern
- **FluentValidation** - Request validation
- **AutoMapper** - Object mapping
- **SignalR** - Real-time communication
- **Serilog** - Structured logging
- **JWT** - Authentication with refresh tokens
- **Swagger/OpenAPI** - API documentation

### Frontend
- **Angular 17** - SPA framework
- **Angular Material** - UI component library
- **NgRx** - State management
- **Chart.js (ng2-charts)** - Data visualization
- **RxJS** - Reactive programming

### Infrastructure
- **SQL Server 2022** - Database
- **Redis 7** - Caching
- **Docker & Docker Compose** - Containerization
- **Nginx** - Web server for Angular

## Architecture

```
financehub/
├── src/
│   ├── FinanceHub.API/            # ASP.NET Core 8 Web API
│   │   ├── Controllers/           # REST API endpoints
│   │   ├── Hubs/                  # SignalR hubs
│   │   └── Middleware/            # Exception handling, logging
│   ├── FinanceHub.Domain/         # Domain layer
│   │   ├── Entities/              # Domain entities
│   │   ├── Enums/                 # Enumerations
│   │   └── Interfaces/            # Repository interfaces
│   ├── FinanceHub.Application/    # Application layer
│   │   ├── DTOs/                  # Data transfer objects
│   │   ├── Interfaces/            # Service interfaces
│   │   ├── Services/              # Business logic
│   │   ├── Mappings/              # AutoMapper profiles
│   │   └── Validators/            # FluentValidation
│   ├── FinanceHub.Infrastructure/ # Infrastructure layer
│   │   ├── Data/                  # DbContext, Seed data
│   │   └── Repositories/         # Repository implementations
│   └── FinanceHub.Web/            # Angular 17 frontend
│       └── src/app/
│           ├── core/              # Guards, interceptors, services
│           ├── shared/            # Shared components, pipes
│           ├── features/          # Feature modules
│           └── store/             # NgRx state management
├── docker-compose.yml
├── Dockerfile.api
└── Dockerfile.web
```

## Getting Started

### Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 20+](https://nodejs.org/)
- [Angular CLI 17](https://angular.io/cli)
- [Docker & Docker Compose](https://docs.docker.com/get-docker/)

### Running with Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/ideiastecnologia/financehub.git
cd financehub

# Start all services
docker-compose up -d

# Access the application
# Frontend: http://localhost:4200
# API: http://localhost:5000
# Swagger: http://localhost:5000/swagger
```

### Running Locally

#### Backend

```bash
# Start SQL Server (Docker)
docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=FinanceHub@2024" -p 1433:1433 -d mcr.microsoft.com/mssql/server:2022-latest

# Run the API
cd src/FinanceHub.API
dotnet run
# API available at http://localhost:5062
# Swagger at http://localhost:5062/swagger
```

#### Frontend

```bash
cd src/FinanceHub.Web
npm install
ng serve
# App available at http://localhost:4200
```

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/refresh` | Refresh JWT token |
| GET | `/api/auth/me` | Get current user |

### Accounts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/accounts` | List all accounts |
| GET | `/api/accounts/{id}` | Get account by ID |
| POST | `/api/accounts` | Create account |
| PUT | `/api/accounts/{id}` | Update account |
| DELETE | `/api/accounts/{id}` | Delete account |
| GET | `/api/accounts/summary` | Get accounts summary |

### Transactions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/transactions` | List transactions (paginated + filters) |
| GET | `/api/transactions/{id}` | Get transaction by ID |
| POST | `/api/transactions` | Create transaction |
| PUT | `/api/transactions/{id}` | Update transaction |
| DELETE | `/api/transactions/{id}` | Delete transaction |
| GET | `/api/transactions/summary` | Get summary (period=month\|year) |

### Categories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | List all categories |
| GET | `/api/categories/{id}` | Get category by ID |
| POST | `/api/categories` | Create category |
| PUT | `/api/categories/{id}` | Update category |
| DELETE | `/api/categories/{id}` | Delete category |
| GET | `/api/categories/tree` | Get category hierarchy |

### Goals
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/goals` | List all goals |
| GET | `/api/goals/{id}` | Get goal by ID |
| POST | `/api/goals` | Create goal |
| PUT | `/api/goals/{id}` | Update goal |
| DELETE | `/api/goals/{id}` | Delete goal |
| POST | `/api/goals/{id}/contribute` | Contribute to goal |

### Budgets
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/budgets` | List all budgets |
| GET | `/api/budgets/{id}` | Get budget by ID |
| POST | `/api/budgets` | Create budget |
| PUT | `/api/budgets/{id}` | Update budget |
| DELETE | `/api/budgets/{id}` | Delete budget |
| GET | `/api/budgets/overview` | Budget overview (month, year) |

### Dashboard & Reports
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard` | Full dashboard data |
| GET | `/api/reports/monthly` | Monthly report (year, month) |
| GET | `/api/reports/yearly` | Yearly report (year) |
| GET | `/api/reports/category-breakdown` | Category breakdown (period) |

## Demo Account

After first run, a demo account is created:
- **Email:** demo@financehub.com
- **Password:** demo123
- Includes 3 accounts, 15 categories, 100+ transactions, 3 goals, and monthly budgets

## Features

- JWT Authentication with refresh tokens
- Real-time dashboard updates via SignalR
- Advanced transaction filtering and search
- Category hierarchy (parent/subcategories)
- Budget tracking with progress alerts
- Financial goals with contribution tracking
- Monthly and yearly reports with charts
- Dark/Light theme support
- Responsive design (mobile-friendly)
- CSV export for transactions
- Structured logging with Serilog

## License

MIT License - see [LICENSE](LICENSE) for details.
