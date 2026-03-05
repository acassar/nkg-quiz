import { authFetcher } from "@/services/fetcher/auth/auth.fetcher";
import { useFetcher } from "../useFetcher";

export function useAuthFetcher() {
  const login = useFetcher(authFetcher.login);
  const register = useFetcher(authFetcher.register);

  return {
    login,
    register,
  };
}
