import { where } from "firebase/firestore";
import { useState } from "react";
import { onListenMultipleDocumentsRealTime } from "@/firebase/utils";
import { USERS_PATH } from "@/constants";

export default function useParticipation(roomId) {
  const [count, setCount] = useState(0);

  onListenMultipleDocumentsRealTime(
    USERS_PATH,
    (participantCount) => setCount(participantCount),
    where("roomId", "==", roomId)
  );

  return [count];
}
