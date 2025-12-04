# Frontend Project Description

## Overview

A **React-based Shift Management Dashboard** that provides a user-friendly interface for managing employee shifts, including creating, editing, deleting shifts, and publishing weekly schedules.

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | React 19 |
| Language | TypeScript |
| UI Library | Material UI (MUI) v6 |
| State Management | Redux + Redux Persist |
| Server State | TanStack React Query v5 |
| Forms | React Hook Form + Joi validation |
| Routing | React Router v5 |
| HTTP Client | Axios |
| Data Table | react-data-table-component |
| Date Utils | date-fns |

## Architecture

```
src/
├── commons/          # Shared utilities & theme
│   ├── colors.ts         # Color palette
│   ├── date.ts           # Date formatting utilities
│   ├── errorCodes.ts     # Error code constants
│   └── theme.ts          # MUI theme configuration
├── components/       # Reusable UI components
│   ├── ConfirmDialog.tsx # Confirmation modal
│   ├── ErrorBoundary.tsx # Error boundary wrapper
│   └── ListItems.tsx     # Sidebar navigation items
├── helper/
│   ├── api/              # API layer
│   │   ├── hooks/            # React Query hooks
│   │   │   ├── useShiftQueries.ts
│   │   │   └── usePublishWeekQueries.ts
│   │   ├── shift.ts          # Shift API functions
│   │   └── publishWeek.ts    # Publish week API functions
│   └── error/            # Error handling utilities
├── layouts/
│   └── Dashboard.tsx     # Main layout with sidebar
└── pages/
    ├── Home.tsx          # Home page
    ├── shift/            # Shift list page
    │   ├── Shift.tsx
    │   ├── components/
    │   │   ├── ActionButton.tsx
    │   │   └── ShiftHeader.tsx
    │   ├── functions/
    │   │   └── helper.ts
    │   └── hooks/
    │       └── useShiftColumns.tsx
    └── shift-form/       # Shift create/edit page
        ├── ShiftForm.tsx
        ├── functions/
        │   └── helper.ts
        └── schema/
            └── shiftSchema.ts
```

## Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/` | Home | Landing page |
| `/shift` | Shift | Shift list with week navigation |
| `/shift/add` | ShiftForm | Create new shift |
| `/shift/:id/edit` | ShiftForm | Edit existing shift |

## Key Features

### 1. Weekly Shift View
- Navigate between weeks using Previous/Next buttons
- URL-based week selection (`/shift?week=2024-01-01`)
- Displays shifts filtered by selected week (Monday-Sunday)

### 2. Shift CRUD Operations
- **Create**: Add new shifts with name, date, start time, end time
- **Read**: View shifts in a paginated data table
- **Update**: Edit existing shifts
- **Delete**: Remove shifts with confirmation dialog

### 3. Shift Clash Handling
When creating/updating a shift that overlaps with existing shifts:
- Warning dialog shows conflicting shifts
- User can choose to:
  - Cancel and modify the shift
  - Force save anyway (bypass clash warning)

### 4. Week Publishing
- "Publish" button to lock a week's schedule
- Once published:
  - Edit/Delete buttons are disabled
  - Add Shift button is hidden
  - Visual indicator shows published status

### 5. Form Validation
Using Joi schema validation:
- Name: Required, max 100 characters
- Date: Required, valid date format
- Start Time: Required, valid time format
- End Time: Required, valid time format
- Start time cannot equal end time

### 6. React Query Integration
- Automatic caching with 1-minute stale time
- Automatic refetch on window focus
- Mutation hooks with cache invalidation
- Loading and error states handled

## State Management

### React Query (Server State)
- Shift list queries
- Publish week queries
- Mutation hooks for create/update/delete

### Redux (Client State)
- Persisted with redux-persist
- Used for app-wide client state

## Components

### ConfirmDialog
Reusable confirmation modal for delete operations with loading state.

### ErrorBoundary
React error boundary that catches and displays runtime errors gracefully.

### DataTable
Feature-rich table with:
- Sorting
- Pagination
- Dense mode
- Custom column definitions

## Running the Project

```bash
# Install dependencies
npm install

# Development (requires backend running)
npm run dev

# Production build
npm run build

# Run tests
npm run test
```

## Environment

The frontend expects the backend API to be running at:
```
http://localhost:3000/api/v1
```

## UI Theme

Custom MUI theme with StaffAny branding defined in `commons/theme.ts`.

