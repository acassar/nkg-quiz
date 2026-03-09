import type { FetcherResponse, FetcherConfig } from "./types";

let globalConfig: FetcherConfig | null = null;

export function configureFetcher(config: FetcherConfig): void {
  globalConfig = config;
}

export async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<FetcherResponse<T>> {
  if (!globalConfig) {
    throw new Error(
      "Fetcher must be configured before use. Call configureFetcher() first.",
    );
  }

  let response: Response | undefined;
  try {
    response = await handleFetch(endpoint, options);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }

    const data = await response.json();
    return {
      data: data,
      status: response.status,
    };
  } catch (error) {
    const errMsg =
      error instanceof Error ? error.message : "An unknown error occurred";
    throw new Error(errMsg);
  }
}

async function handleFetch(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  if (!globalConfig) {
    throw new Error("Fetcher must be configured before use.");
  }

  const headers = new Headers(options.headers || {});
  const token = globalConfig.authProvider?.getToken();

  headers.set("Content-Type", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${globalConfig.apiBaseUrl}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401 && globalConfig.authProvider) {
      globalConfig.authProvider.logout();
    }
    const text = await response.text();
    throw new Error(text || "Request failed");
  }

  return response;
}
