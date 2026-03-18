import { readonly, ref, watch } from "vue";
import { useSessionState } from "./useSessionState";
import { Player } from "../types/player.types";

export function usePlayer() {
  const { sessionCode } = useSessionState();
  const currentPlayerId = ref<string>();

  const getStorageKey = (sessionCode: string) => `playerId_${sessionCode}`;

  // Updates playerId according to sessionCode changes and localStorage
  watch(
    sessionCode,
    (newVal) => {
      // Clear playerId if sessionCode is cleared
      if (!newVal) {
        currentPlayerId.value = undefined;
        return;
      }

      // Try to load playerId from localStorage for the new sessionCode
      loadPlayerIdFromStorage(newVal);
    },
    { immediate: true },
  );

  /// Ensures the loaded data from localStorage has the correct structure
  function ensureCorrectStoredData(data: unknown): data is Player {
    return (
      data !== undefined &&
      data !== null &&
      typeof data === "object" &&
      "name" in data &&
      "id" in data
    );
  }

  /// Loads currentPlayerId from localStorage for the given session code, if it exists and is valid
  function loadPlayerIdFromStorage(sessionCode: string) {
    const saved = localStorage.getItem(getStorageKey(sessionCode));
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure the stored sessionCode matches the current one and that an id exists
      if (ensureCorrectStoredData(parsed)) {
        currentPlayerId.value = parsed.id;
      }
    }
  }

  /// Saves player info to localStorage for the given session code
  function savePlayer(props: {
    id: string;
    name: string;
    sessionCode: string;
  }) {
    currentPlayerId.value = props.id;
    localStorage.setItem(
      getStorageKey(props.sessionCode),
      JSON.stringify({ id: props.id, name: props.name }),
    );
  }

  /// Retrieves the player ID for a given session code from localStorage, if it exists and is valid
  function getPlayerForSession(sessionCode: string): Player | undefined {
    const saved = localStorage.getItem(getStorageKey(sessionCode));
    if (saved) {
      const parsed = JSON.parse(saved);
      if (ensureCorrectStoredData(parsed)) {
        return parsed;
      }
    }
    return undefined;
  }

  return {
    currentPlayerId: readonly(currentPlayerId),
    savePlayer,
    getPlayerForSession,
  };
}
