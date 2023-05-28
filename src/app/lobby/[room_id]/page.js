"use client";
import { useEffect } from "react";
import useSessionStorage from "@/hooks/useSessionStorage";
import { useRouter } from "next/navigation";
import { GAMEBLOCK_STATE, GAMES_PATH } from "@/constants";
import useParticipation from "@/hooks/useParticipation";
import useGameState from "@/hooks/useGameState";
import { updateSingleDocument } from "@/firebase/utils";
import { validateUser } from "@/utils/authentication";

export default function LobbyPage({ params }) {
  const roomId = params.room_id;
  const [user] = useSessionStorage("user");
  const router = useRouter();
  const [isHost] = useSessionStorage("isHost");
  const [participants] = useParticipation(roomId);
  const [gameState] = useGameState(roomId);

  useEffect(() => {
    validateUser(roomId, user, router);
  }, []);

  useEffect(() => {
    if (gameState === GAMEBLOCK_STATE) {
      router.push(`/gameblock/${roomId}`);
    }
  }, [gameState]);

  async function startGame(e) {
    e.preventDefault();
    await updateSingleDocument(GAMES_PATH, roomId, {
      state: GAMEBLOCK_STATE,
      numberOfPlayers: participants,
    });
    router.push(`/gameblock/${roomId}`);
  }

  return (
    <form onSubmit={startGame}>
      <h1>Welcome to the game lobby!</h1>
      <h3>This is a lobby. Number of players joined: {participants}</h3>
      <p>
        Share this room id to your friends to join: <strong>{roomId}</strong>
      </p>
      {isHost && <button type={"submit"}>Start game</button>}
    </form>
  );
}
