export interface FetcherResponse<T> {
  data: T;
  status: number;
}

export interface FetcherError {
  message: string;
  statusCode?: number;
  error: string;
}

export interface AuthProvider {
  getToken(): string | null;
  logout(): void;
}

export interface FetcherConfig {
  apiBaseUrl: string;
  authProvider?: AuthProvider;
}
