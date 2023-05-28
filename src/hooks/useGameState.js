import { doc, onSnapshot } from "firebase/firestore";
import firebaseDB from "@/firebase/initFirebase";
import { useState } from "react";

export default function useGameState(roomId) {
  const [gameState, setGameState] = useState(null);

  const gameUnsubscribe = onSnapshot(
    doc(firebaseDB, "games", roomId),
    (doc) => {
      if (doc.exists()) {
        const game = doc.data();
        setGameState(game.state);
      }
    }
  );

  return [gameState];
}
