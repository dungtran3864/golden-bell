"use client";
import { doc, onSnapshot } from "firebase/firestore";
import firebaseDB from "@/firebase/initFirebase";
import { RESULT_STATE } from "@/constants";
import { useRouter } from "next/navigation";

export default function WaitingPage({ params }) {
  const roomId = params.room_id;
  const router = useRouter();
  const unsub = onSnapshot(doc(firebaseDB, "games", roomId), (doc) => {
    const gameState = doc.data().state;
    if (gameState === RESULT_STATE) {
      router.push(`/gameblock/result/${roomId}`);
    }
  });

  return (
    <div>
      <p>Waiting for other players to submit their answers.</p>
    </div>
  );
}
