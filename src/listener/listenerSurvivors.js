import { onListenMultipleDocumentsRealTime } from "@/firebase/utils";
import { USERS_PATH } from "@/constants";
import { where } from "firebase/firestore";

export default function listenerSurvivors(roomId, callback) {
  onListenMultipleDocumentsRealTime(
    USERS_PATH,
    (participantCount) => callback(participantCount),
    where("roomId", "==", roomId),
    where("eliminated", "==", false),
    where("active", "==", true)
  );
}
