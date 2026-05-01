import { createSocketIoClient, C2S_EVENTS } from "@nkg-quiz/shared-socket";
import { useSessionState } from "../composable/useSessionState";
import { usePlayer } from "../composable/usePlayer";

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

  useSessionState().setSessionCode(sessionCode);
  useSessionState().setStatus("joining");

  const player = usePlayer().getPlayerForSession(sessionCode);
  socketClient.setPlayerId(player?.id ? parseInt(player.id) : undefined);
  socketClient.connect(sessionCode);
};

export const disconnectSocket = () => {
  socketClient.disconnect();
  useSessionState().sessionCode.value = undefined;
  useSessionState().setStatus("disconnected");
};

export const sendAnswer = (props: {
  questionId: number;
  playerId: number;
  choiceId: number;
  sessionCode: string;
}) => {
  if (!socketClient.isConnected()) {
    console.error("Cannot submit answer: not connected to socket server");
    return;
  }
  socketClient.emit(C2S_EVENTS.PLAYER_ANSWER, {
    code: props.sessionCode,
    playerId: props.playerId,
    questionId: props.questionId,
    choiceId: props.choiceId,
  });
};

window.addEventListener("beforeunload", () => {
  socketClient.disconnect();
});
