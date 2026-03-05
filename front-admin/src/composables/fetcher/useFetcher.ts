import { formatApiError } from "@/services/error/apiError.service";
import { FetcherResponse } from "@/services/fetcher/fetcher";
import { computed, ref } from "vue";

export type FetcherError = {
  message: string;
  statusCode?: number;
  error: string;
};

export function useFetcher<Response, Args extends unknown[] = []>(
  request: (...args: Args) => Promise<FetcherResponse<Response>>,
) {
  const isLoading = ref(false);
  const error = ref<FetcherError | null>(null);
  const errorMessage = computed(() =>
    error.value ? error.value.message : null,
  );
  const response = ref<Response | null>(null);

  const execute = async (...args: Args): Promise<Response | undefined> => {
    try {
      error.value = null;
      isLoading.value = true;
      const result = await request(...args);
      response.value = result.data;
      return response.value;
    } catch (e) {
      const formattedError = formatApiError(e);
      error.value = formattedError;
      return undefined;
    } finally {
      isLoading.value = false;
    }
  };

  return { isLoading, error, data: response, errorMessage, execute };
}
