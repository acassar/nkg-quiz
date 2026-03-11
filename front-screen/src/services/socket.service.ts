import { io, Socket } from "socket.io-client";
import { useSessionState } from "../composables/useSessionState";
import { SessionState } from "@nkg-quiz/shared-fetcher";

const apiBase = import.meta.env.VITE_API_URL || "http://localhost:4000";
const wsBase = import.meta.env.VITE_WS_URL || apiBase;
let socket: Socket | null = null;

const onConnect = () => {
  console.log("Connected to socket server");
  const sessionCode = useSessionState().sessionCode.value;
  if (sessionCode) {
    socket?.emit("join-session", { code: sessionCode.trim() });
  }
};

const onDisconnect = () => {
  console.log("Disconnected from socket server");
  useSessionState().setStatus("disconnected");
};

const onSessionNotFound = () => {
  console.log("Session not found");
  useSessionState().setStatus("session not found");
};

const onSessionJoined = () => {
  console.log("Joined session");
  useSessionState().setStatus("connected");
};

const onAnswerReceived = () => {
  useSessionState().incrementAnswersCount();
};

const onSessionStateUpdate = (payload: SessionState) => {
  useSessionState().updateState(payload);
};

const onConnectError = () => {
  console.error("Socket connection error");
  useSessionState().setStatus("error");
};

const setupSocketListeners = () => {
  if (!socket) return;

  socket.on("connect", onConnect);
  socket.on("session:not-found", onSessionNotFound);
  socket.on("session:joined", onSessionJoined);
  socket.on("disconnect", onDisconnect);
  socket.on("session:state", onSessionStateUpdate);
  socket.on("answer:received", onAnswerReceived);
  socket.on("session:end", onSessionStateUpdate);
  socket.on("connect_error", onConnectError);
};

const removeSocketListeners = () => {
  if (!socket) return;
  socket.removeAllListeners();
};

export const connectSocket = (sessionCode: string) => {
  if (!sessionCode) return;

  // Avoid reconnecting if already connected to the same session
  if (
    socket?.connected &&
    useSessionState().sessionCode.value === sessionCode
  ) {
    return;
  }

  // Clean up the old connection if it exists
  if (socket) {
    removeSocketListeners();
    socket.disconnect();
  }

  useSessionState().sessionCode.value = sessionCode;

  useSessionState().setStatus("connecting");
  useSessionState().resetAnswersCount();

  // Create a new connection
  socket = io(wsBase, { transports: ["websocket"] });
  setupSocketListeners();
};

export const disconnectSocket = () => {
  if (socket) {
    removeSocketListeners();
    socket.disconnect();
    socket = null;
    useSessionState().sessionCode.value = undefined;
  }
  useSessionState().setStatus("disconnected");
};

export const isConnected = () => {
  return socket?.connected ?? false;
};

// Clean up on page change/refresh
window.addEventListener("beforeunload", () => {
  if (socket) socket.disconnect();
});
