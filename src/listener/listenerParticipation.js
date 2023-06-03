import { onListenSingleDocumentRealTime } from "@/firebase/utils";
import { GAMES_PATH } from "@/constants";

export default function listenerParticipation(roomId, callback) {
  return onListenSingleDocumentRealTime(GAMES_PATH, roomId, (data) =>
    callback(data.numberOfPlayers)
  );
}
