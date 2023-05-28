import { useState } from "react";
import { onListenSingleDocumentRealTime } from "@/firebase/utils";
import { GAMES_PATH } from "@/constants";

export default function useGameState(roomId) {
  const [gameState, setGameState] = useState(null);

  onListenSingleDocumentRealTime(GAMES_PATH, roomId, (game) =>
    setGameState(game.state)
  );

  return [gameState];
}
