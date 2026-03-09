// Types
export type {
  FetcherResponse,
  FetcherError,
  AuthProvider,
  FetcherConfig,
} from "./fetcher/types";

// Core fetcher
export { configureFetcher, apiFetch } from "./fetcher/fetcher";

// Composables
export { useFetcher } from "./fetcher/useFetcher";

// Error handling
export { formatApiError } from "./errorFormatter";

// Models
export type {
  SessionState,
  CreateSessionResponse,
  SESSION_STATUS,
  Session,
  SessionAction,
  SessionStateResponse,
} from "./types/session/session.types";
export type { Question, QuestionInput } from "./types/question/question.types";
export type { Choice, ChoiceInput } from "./types/choice/choice.types";
export type { Category, CategoryInput } from "./types/category/category.types";
export type { Quiz } from "./types/quiz/quiz.types";
