import { FetcherResponse } from "@/services/fetcher/fetcher";
import { ref } from "vue";

export function useFetcher<Response, Args extends unknown[] = []>(
  request: (...args: Args) => Promise<FetcherResponse<Response>>,
) {
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const response = ref<Response | null>(null);

  const execute = async (...args: Args): Promise<Response | undefined> => {
    try {
      error.value = null;
      isLoading.value = true;
      const result = await request(...args);
      response.value = result.data;
      return response.value;
    } catch (e) {
      error.value = e instanceof Error ? e.message : "An error occurred";
    } finally {
      isLoading.value = false;
    }
  };

  return { isLoading, error, data: response, execute };
}
