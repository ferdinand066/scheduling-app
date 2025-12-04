# Backend Project Description

## Overview

A REST API backend for a **Shift Management System** that allows users to create, read, update, and delete employee shifts, with support for weekly schedule publishing.

## Tech Stack

| Category | Technology |
|----------|------------|
| Runtime | Node.js 22.x |
| Framework | Hapi.js |
| Language | TypeScript |
| ORM | TypeORM 0.3.x |
| Database | PostgreSQL 14+ |
| Testing | Jest |
| Documentation | Swagger/OpenAPI (hapi-swagger) |

## Architecture

```
src/
├── config/           # Server & Swagger configuration
├── database/
│   └── default/
│       ├── entity/       # TypeORM entities (database models)
│       └── repository/   # Data access layer (CRUD operations)
│           └── service/  # Business logic services
├── routes/           # API endpoint definitions
│   └── v1/           # Versioned API routes
│       ├── shifts/       # Shift endpoints
│       └── publish-weeks/ # Publish week endpoints
├── shared/
│   ├── classes/      # Custom error classes
│   ├── constants/    # Error codes & constants
│   ├── dtos/         # Data transfer objects
│   ├── functions/    # Utility functions (error handling, logging)
│   └── interfaces/   # TypeScript interfaces
└── usecases/         # Business logic layer
```

## Database Entities

### Shift
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| name | string | Shift name/description |
| date | date | Shift date |
| startTime | time | Shift start time |
| endTime | time | Shift end time |
| createdAt | timestamp | Auto-generated |
| updatedAt | timestamp | Auto-generated |

### PublishWeek
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| startDate | date | Week start date |
| endDate | date | Week end date |
| createdAt | timestamp | Auto-generated |

## API Endpoints

### Shifts (`/api/v1/shifts`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all shifts (supports filtering & ordering) |
| GET | `/{id}` | Get shift by ID |
| POST | `/` | Create new shift |
| PATCH | `/{id}` | Update shift by ID |
| DELETE | `/{id}` | Delete shift by ID |

### Publish Weeks (`/api/v1/publish-weeks`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get publish week by date range |
| POST | `/` | Publish a week |

## Key Features

### 1. Shift Clash Detection
The system automatically detects overlapping shifts when creating or updating:
- Same-day time overlaps
- Midnight-crossing shifts (e.g., 22:00 - 06:00)
- Adjacent day conflicts

When a clash is detected, the API returns:
- Error code: `SHIFT_CLASH`
- HTTP Status: 422
- List of conflicting shifts in the response

The frontend can pass `force: true` to bypass clash warnings.

### 2. Date Range Filtering
Shifts can be filtered by date range using query parameters:
```
GET /api/v1/shifts?filter[date][gte]=2024-01-01&filter[date][lte]=2024-01-07
```

### 3. Week Publishing
Once a week is published, shifts in that week become read-only (enforced by frontend).

## Error Handling

Custom error codes defined in `errorCode.ts`:
- `SHIFT_CLASH` - Overlapping shifts detected
- `START_TIME_AND_END_TIME_CANNOT_BE_THE_SAME` - Invalid time range

## Running the Project

```bash
# Install dependencies
npm install

# Create database
./createdb.sh

# Development
npm run dev

# Production build
npm run build
npm start

# Run tests
npm run test
```

## API Documentation

When running, Swagger documentation is available at:
```
http://localhost:3000/documentation
```

