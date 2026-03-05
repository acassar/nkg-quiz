import { FetcherError } from "@/composables/fetcher/useFetcher";

const formatErrorMessage = (message: unknown): string => {
  if (Array.isArray(message)) {
    return message.join(", ");
  }
  return typeof message === "string" ? message : "An error occurred";
};

export const formatApiError = (error: unknown): FetcherError => {
  const parsedError =
    error instanceof Error && typeof error.message === "string"
      ? JSON.parse(error.message)
      : "An error occurred";

  if (!parsedError || typeof parsedError !== "object") {
    return {
      message: "An unknown error occurred",
      statusCode: undefined,
      error: "Unknown error",
    };
  }

  const formattedError: FetcherError = {
    message: formatErrorMessage(parsedError.message),
    statusCode: parsedError.statusCode,
    error: parsedError.error,
  };

  return formattedError;
};
