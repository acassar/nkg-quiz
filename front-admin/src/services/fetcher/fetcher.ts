import { useAuth } from "@/composables/useAuth";

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
    response = await useAuth().apiFetch(endpoint, options);
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
