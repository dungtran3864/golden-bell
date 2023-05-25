import { collection, onSnapshot, query, where } from "firebase/firestore";
import firebaseDB from "@/firebase/initFirebase";
import { useState } from "react";

export default function useParticipation(roomId) {
  const [count, setCount] = useState(0);

  const participationQuery = query(
    collection(firebaseDB, "users"),
    where("roomId", "==", roomId)
  );
  const participationUnsubscribe = onSnapshot(
    participationQuery,
    (querySnapshot) => {
      let count = 0;
      querySnapshot.forEach((doc) => {
        count++;
      });
      setCount(count);
    }
  );

  return [count];
}
