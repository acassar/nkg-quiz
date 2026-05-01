import { createSocketIoClient } from "@nkg-quiz/shared-socket";
import { useSessionState } from "../composables/useSessionState";

const apiBase = import.meta.env.VITE_API_URL || "http://localhost:4000";
const wsBase = import.meta.env.VITE_WS_URL || apiBase;

export const socketClient = createSocketIoClient({
  url: wsBase,
  autoJoinSessionOnConnect: true,
});

export const connectSocket = (sessionCode: string) => {
  if (!sessionCode) return;

  if (
    socketClient.isConnected() &&
    useSessionState().sessionCode.value === sessionCode
  ) {
    return;
  }

  useSessionState().sessionCode.value = sessionCode;
  useSessionState().setStatus("connecting");
  useSessionState().resetAnswersCount();

  socketClient.connect(sessionCode);
};

export const disconnectSocket = () => {
  socketClient.disconnect();
  useSessionState().sessionCode.value = undefined;
  useSessionState().setStatus("disconnected");
};

export const isConnected = () => socketClient.isConnected();

window.addEventListener("beforeunload", () => {
  socketClient.disconnect();
});
