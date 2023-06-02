import { where } from "firebase/firestore";
import { useState } from "react";
import { onListenMultipleDocumentsRealTime } from "@/firebase/utils";
import { USERS_PATH } from "@/constants";

export default function useParticipation(roomId) {
  const [count, setCount] = useState(0);
  const [survivors, setSurvivors] = useState(0);
  const [eliminated, setEliminated] = useState(0);

  onListenMultipleDocumentsRealTime(
    USERS_PATH,
    (participantCount) => setCount(participantCount),
    where("roomId", "==", roomId)
  );

  onListenMultipleDocumentsRealTime(
    USERS_PATH,
    (participantCount) => setSurvivors(participantCount),
    where("roomId", "==", roomId),
    where("eliminated", "==", false),
    where("active", "==", true)
  );

  onListenMultipleDocumentsRealTime(
    USERS_PATH,
    (participantCount) => setEliminated(participantCount),
    where("roomId", "==", roomId),
    where("eliminated", "==", true),
    where("active", "==", true)
  );

  return [count, survivors, eliminated];
}
