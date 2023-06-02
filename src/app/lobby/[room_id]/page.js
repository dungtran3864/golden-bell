"use client";
import { useEffect, useState } from "react";
import useSessionStorage from "@/hooks/useSessionStorage";
import { useRouter } from "next/navigation";
import { GAMEBLOCK_STATE, GAMES_PATH } from "@/constants";
import listenerGameState from "@/listener/listenerGameState";
import { updateSingleDocument } from "@/firebase/utils";
import { validateUser } from "@/utils/authentication";
import listenerParticipation from "@/listener/listenerParticipation";

export default function LobbyPage({ params }) {
  const roomId = params.room_id;
  const [user] = useSessionStorage("user");
  const router = useRouter();
  const [isHost] = useSessionStorage("isHost");
  const [participants, setParticipants] = useState(0);
  const [gameState, setGameState] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    validateUser(roomId, user, router);
    listenerGameState(roomId, (state) => setGameState(state));
    if (isHost) {
      listenerParticipation(roomId, (count) => setParticipants(count));
    }
  }, []);

  useEffect(() => {
    if (gameState === GAMEBLOCK_STATE) {
      router.push(`/gameblock/${roomId}`);
    }
  }, [gameState]);

  async function startGame(e) {
    e.preventDefault();
    if (participants > 1) {
      await updateSingleDocument(GAMES_PATH, roomId, {
        state: GAMEBLOCK_STATE,
        numberOfPlayers: participants,
      });
      router.push(`/gameblock/${roomId}`);
    } else {
      setErrorMessage(
        "The game needs to have at least 2 players. Please invite more people to join."
      );
    }
  }

  return (
    <form onSubmit={startGame}>
      <h1>Welcome to the game lobby!</h1>
      {isHost ? (
        <h3>Number of players joined: {participants}</h3>
      ) : (
        <h3>Waiting for the host to start the game.</h3>
      )}
      <p>
        Share this room id to your friends to join: <strong>{roomId}</strong>
      </p>
      {isHost && <button type={"submit"}>Start game</button>}
      <p>{errorMessage}</p>
    </form>
  );
}
