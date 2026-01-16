# Team Incident Dashboard - Starter Project

A minimal React + TypeScript + Vite starter project for the coding challenge.

> **Note**: This is a starter project for a coding challenge. See [candidate-brief.md](candidate-brief.md) for the full requirements and task description.

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Opens the app at [http://localhost:5173](http://localhost:5173)

### Testing

```bash
npm test
```

### Build

```bash
npm run build
```

## Project Structure

```
src/
├── api/                  # Mock API with localStorage persistence
│   ├── index.ts          # API exports
│   ├── mockApi.ts        # API client with simulated delay
│   ├── seedData.ts       # Default data for incidents and users
│   ├── storage.ts        # localStorage persistence layer
│   └── types.ts          # TypeScript types
├── test/
│   └── setup.ts          # Test setup
├── App.css
├── App.test.tsx
├── App.tsx
├── index.css
├── main.tsx
└── vite-env.d.ts
```

## Mock API

The starter includes a mock API that intercepts `fetch()` requests to `/api/*` endpoints. Data is persisted in localStorage and survives page refreshes.

The mock API is automatically initialized in `main.tsx`.

### Available Endpoints

| Method | Endpoint             | Description            |
| ------ | -------------------- | ---------------------- |
| GET    | `/api/incidents`     | List all incidents     |
| GET    | `/api/incidents/:id` | Get incident by ID     |
| POST   | `/api/incidents`     | Create new incident    |
| PATCH  | `/api/incidents/:id` | Update incident        |
| DELETE | `/api/incidents/:id` | Delete incident        |
| GET    | `/api/users`         | List all users         |
| POST   | `/api/reset`         | Reset data to defaults |

### Usage Example

Use standard `fetch()` calls just like you would with a real REST API:

```typescript
// Fetch all incidents
const response = await fetch("/api/incidents");
const incidents = await response.json();

// Fetch a single incident
const response = await fetch("/api/incidents/inc-1");
const incident = await response.json();

// Create an incident
const response = await fetch("/api/incidents", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    title: "New issue",
    description: "Description here",
    severity: "Medium",
    assigneeId: "user-1",
  }),
});
const newIncident = await response.json();

// Update an incident
const response = await fetch("/api/incidents/inc-1", {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    status: "In Progress",
    assigneeId: "user-2",
  }),
});
const updated = await response.json();

// Delete an incident
await fetch("/api/incidents/inc-1", { method: "DELETE" });

// Get users for assignee dropdown
const response = await fetch("/api/users");
const users = await response.json();

// Reset data to defaults
await fetch("/api/reset", { method: "POST" });
```

### Data Types

```typescript
type IncidentStatus = "Open" | "In Progress" | "Resolved";
type IncidentSeverity = "Low" | "Medium" | "High" | "Critical";

interface Incident {
  id: string;
  title: string;
  description: string;
  status: IncidentStatus;
  severity: IncidentSeverity;
  assigneeId: string | null;
  createdAt: string;
  updatedAt: string;
  statusHistory: StatusHistoryEntry[];
}

interface User {
  id: string;
  name: string;
  email: string;
}
```

## Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Vitest** - Testing
- **React Testing Library** - Component testing
