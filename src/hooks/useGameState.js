import { doc, onSnapshot } from "firebase/firestore";
import firebaseDB from "@/firebase/initFirebase";
import { GAMEBLOCK_STATE } from "@/constants";
import { useState } from "react";

export default function useGameState(roomId) {
  const [gameState, setGameState] = useState(null);

  const gameUnsubscribe = onSnapshot(
    doc(firebaseDB, "games", roomId),
    (doc) => {
      const game = doc.data();
      setGameState(game.state);
    }
  );

  return [gameState];
}
