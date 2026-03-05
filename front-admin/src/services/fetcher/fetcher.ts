import { useAuth } from "@/composables/useAuth";

const apiBase = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export type FetcherResponse<T> = {
  data: T;
  status: number;
};
export async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<FetcherResponse<T>> {
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
  const headers = new Headers(options.headers || {});
  const token = useAuth().token;

  headers.set("Content-Type", "application/json");
  if (token.value) headers.set("Authorization", `Bearer ${token.value}`);

  const response = await fetch(`${apiBase}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      useAuth().logout();
    }
    const text = await response.text();
    throw new Error(text || "Request failed");
  }

  return response;
}
