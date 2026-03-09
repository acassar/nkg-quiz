# @nkg-quiz/shared-fetcher

Shared HTTP fetcher utilities for nkg-quiz applications.

## Installation

```bash
npm install @nkg-quiz/shared-fetcher
```

## Usage

### 1. Configure the fetcher

#### With authentication (front-admin)

```typescript
import { configureFetcher, type AuthProvider } from '@nkg-quiz/shared-fetcher';

// Create an auth provider (example with Vue composable)
const authProvider: AuthProvider = {
  getToken: () => {
    // Return the current auth token
    return localStorage.getItem('token');
  },
  logout: () => {
    // Handle logout logic
    localStorage.removeItem('token');
    router.push('/login');
  }
};

// Configure the fetcher
configureFetcher({
  apiBaseUrl: 'http://localhost:4000/api',
  authProvider
});
```

#### Without authentication (front-player, front-screen)

```typescript
import { configureFetcher } from '@nkg-quiz/shared-fetcher';

// Simple configuration without authentication
configureFetcher({
  apiBaseUrl: 'http://localhost:4000/api'
  // No authProvider = no token required
});
```

### 2. Use the apiFetch function

```typescript
import { apiFetch } from '@nkg-quiz/shared-fetcher';

// Make API calls
const response = await apiFetch<{ users: User[] }>('/users');
console.log(response.data.users);
```

### 3. Use the useFetcher composable

```typescript
import { useFetcher, apiFetch } from '@nkg-quiz/shared-fetcher';

// In a Vue component
const { data, isLoading, error, execute } = useFetcher(
  (userId: string) => apiFetch<User>(`/users/${userId}`)
);

// Execute the request
const user = await execute('123');

// Reactive state is automatically managed
console.log(isLoading.value); // false after request completes
console.log(data.value);      // User data
console.log(error.value);     // null if no error
```

## API Reference

### Types

- `FetcherResponse<T>`: Response wrapper with data and status
- `FetcherError`: Error object with message, statusCode, and error
- `AuthProvider`: Interface for auth token management
- `FetcherConfig`: Configuration object for the fetcher

### Functions

- `configureFetcher(config: FetcherConfig)`: Configure global fetcher settings
- `apiFetch<T>(endpoint: string, options?: RequestInit)`: Make API requests
- `useFetcher<Response, Args>(request)`: Vue composable for reactive API calls
- `formatApiError(error: unknown)`: Format errors for consistent handling