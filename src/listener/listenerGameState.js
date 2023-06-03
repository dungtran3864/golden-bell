import { onListenSingleDocumentRealTime } from "@/firebase/utils";
import { GAMES_PATH } from "@/constants";

export default function listenerGameState(roomId, callback) {
  return onListenSingleDocumentRealTime(GAMES_PATH, roomId, (game) =>
    callback(game.state)
  );
}
