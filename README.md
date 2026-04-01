# DocOps Frontend

---

## What It Does

The DocOps Frontend is the user interface for the **document synchronization platform**. It allows users to manage **Projects**, configure **Integrations** (ACC or DroneDeploy), track **Synchronization** history, and view operational stats via a dashboard.

It communicates with the DocOps Backend API to orchestrate syncs between AWS S3 and third-party platforms.

---

## Tech Stack

| Layer            | Choice                    |
| ---------------- | ------------------------- |
| Framework        | React 19 (Vite)           |
| Language         | TypeScript                |
| Styling          | Tailwind CSS 4            |
| UI Components    | Radix UI (shadcn/ui)      |
| Icons            | Lucide React              |
| State Management | Zustand                   |
| Data Fetching    | TanStack React Query (v5) |
| API Client       | Axios                     |
| Forms            | React Hook Form + Zod     |
| Animations       | Framer Motion (`motion`)  |
| Charts           | Recharts                  |
| Routing          | React Router 7            |

---

## Project Structure

```
src/
├── components/     # UI components (shadcn) and shared blocks
├── contexts/       # React Contexts (Auth, Theme)
├── hooks/          # Custom React hooks
├── lib/            # Utilities and API layer
│   └── api/        # Resource-based API modules (axios instances)
├── pages/          # Main route components (Dashboard, Projects, etc.)
├── store.js        # Global state (Zustand)
└── locales/        # Internationalization (i18next)
```

Each domain module in `lib/api/` (e.g., `projects.ts`, `syncs.ts`) follows a consistent pattern:

- **TypeScript Interfaces**: Defining the entity and request/response shapes.
- **Raw API Object**: Axios-based methods for HTTP requests.
- **React Query Hooks**: `useQuery` for reads and `useMutation` for writes, with built-in cache invalidation.

---

## Core Entities (Frontend)

The frontend mirrors the backend data model using TypeScript interfaces:

**Project**

- `s3_bucket` + `s3_prefix` — S3 source configuration.
- `auto_sync` — Boolean flag for automated triggers.
- `status` — `active`, `inactive`, or `pending`.

**Integration**

- `integration_type` — `acc` or `drone_deploy`.
- `config` — JSON configuration (ACC folder IDs, project IDs).
- `enabled` — Flag to toggle integration state.

**Sync**

- `status` — `pending`, `in_progress`, `success`, or `failed`.
- `duration_ms` — Recorded sync time from Lambda.
- `s3_file_key` — The source file path in S3.

---

## Authentication

### Auth Flow

1. **Login**: `POST /users/login` via `AuthContext.login()`.
2. **Token Storage**: `access_token` and `refresh_token` are stored in `localStorage`.
3. **Interceptors**: An Axios request interceptor automatically attaches the `Authorization: Bearer <token>` header to all outgoing requests.
4. **Protected Routes**: The `AppRoutes` component gatekeeps private pages (Dashboard, Projects, etc.) and redirects unauthenticated users to `/login`.

### Usage in Components

```tsx
const { user, isAuthenticated } = useAuth();
```

---

## API & Data Fetching

We use **TanStack Query (React Query)** as the bridge between the UI and API.

### Pattern: Resource Hooks

```tsx
// Pattern used in src/lib/api/projects.ts
export const useProjects = (params: ProjectsQueryParams) => {
	return useQuery({
		queryKey: ['projects', params],
		queryFn: () => projectsAPI.getProjects(params),
	});
};

export const useCreateProject = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: CreateProjectData) => projectsAPI.createProject(data),
		onSuccess: () => {
			// Automatic invalidation of project lists
			queryClient.invalidateQueries({ queryKey: ['projects'] });
		},
	});
};
```

---

## Routes & Pages

| Path            | Component       | Description                              |
| --------------- | --------------- | ---------------------------------------- |
| `/login`        | `Login`         | Auth gateway                             |
| `/`             | `Dashboard`     | Sync stats, success/fail charts          |
| `/projects`     | `Projects`      | Project list and creation modal          |
| `/projects/:id` | `ProjectDetail` | Integration management & Sync triggering |
| `/sync`         | `Sync`          | Global sync history and logs             |

---

## Key Features

### 1. Project Management

Users can create projects defined by their S3 bucket and prefix. Projects can be toggled between `active` and `inactive` states directly from the list view.

### 2. Integration Setup

In the `ProjectDetail` page, users can:

- Initiate the **ACC Handshake** which triggers the backend Lambda OAuth flow.
- Configure specific folder mappings for each integration.
- Remove integrations.

### 3. Manual Sync Trigger

While S3 events handle automatic syncs, the frontend provides a **"Sync Now"** button in the Project Detail view to manually trigger a Lambda execution for that project's latest state.

### 4. Real-time Dashboard

The Dashboard uses **Recharts** to visualize synchronization success rates and counts across daily, weekly, or monthly periods. It leverages `useDashboardStats` and `useDashboardChart` hooks for data retrieval.

---

## Things to Know (Frontend)

1. **State Persistence**: User session and tokens persist across refreshes via `localStorage`. Clearing local storage effectively logs the user out.
2. **Error Handling**: Standardized error extraction via `getErrorMessage` in `lib/api/utils.ts` ensures consistent user feedback (via `sonner` toasts).
3. **Styling**: Uses Tailwind 4 for a modern, dark-themed UI. Custom components are built on top of Radix UI primitives.
4. **Auto-refresh**: React Query is configured with `staleTime` (30s) to minimize redundant API calls while keeping data fresh.
