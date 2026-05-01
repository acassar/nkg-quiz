import { createSocketIoClient } from "@nkg-quiz/shared-socket";

const apiBase = import.meta.env.VITE_API_URL || "http://localhost:4000";
const wsBase = import.meta.env.VITE_WS_URL || apiBase;

export const socketClient = createSocketIoClient({
  url: wsBase,
  autoJoinSessionOnConnect: true,
});

export const connectAdminSocket = (sessionCode: string) => {
  if (!sessionCode) return;
  socketClient.connect(sessionCode);
};

export const disconnectAdminSocket = () => {
  socketClient.disconnect();
};

window.addEventListener("beforeunload", () => {
  socketClient.disconnect();
});
