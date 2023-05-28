"use client";
import { doc, onSnapshot } from "firebase/firestore";
import firebaseDB from "@/firebase/initFirebase";
import { RESULT_STATE, USER_STORAGE_KEY } from "@/constants";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { validateUser } from "@/utils/authentication";
import useSessionStorage from "@/hooks/useSessionStorage";

export default function WaitingPage({ params }) {
  const [user] = useSessionStorage(USER_STORAGE_KEY);
  const roomId = params.room_id;
  const router = useRouter();

  useEffect(() => {
    validateUser(roomId, user, router);
  }, []);

  const unsub = onSnapshot(doc(firebaseDB, "games", roomId), (doc) => {
    if (doc.exists()) {
      const gameState = doc.data().state;
      if (gameState === RESULT_STATE) {
        router.push(`/gameblock/result/${roomId}`);
      }
    }
  });

  return (
    <div>
      <p>Waiting for other players to submit their answers.</p>
    </div>
  );
}
