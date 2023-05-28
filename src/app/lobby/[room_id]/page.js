"use client";

import {
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import firebaseDB from "@/firebase/initFirebase";
import { useEffect } from "react";
import useSessionStorage from "@/hooks/useSessionStorage";
import { useRouter } from "next/navigation";
import { GAMEBLOCK_STATE } from "@/constants";
import useParticipation from "@/hooks/useParticipation";
import useGameState from "@/hooks/useGameState";

export default function LobbyPage({ params }) {
  const roomId = params.room_id;
  const [user] = useSessionStorage("user");
  const router = useRouter();
  const [isHost] = useSessionStorage("isHost");
  const [participants] = useParticipation(roomId);
  const [gameState] = useGameState(roomId);

  useEffect(() => {
    async function validateUser() {
      const roomRef = doc(firebaseDB, "games", roomId);
      const roomSnap = await getDoc(roomRef);
      if (!roomSnap.exists()) {
        router.push("/");
        return () => {};
      }
      if (user == null) {
        router.push("/");
        return () => {};
      }
    }

    validateUser();
  }, []);

  useEffect(() => {
    if (gameState === GAMEBLOCK_STATE) {
      router.push(`/gameblock/${roomId}`);
    }
  }, [gameState]);

  async function startGame(e) {
    e.preventDefault();
    const roomRef = doc(firebaseDB, "games", roomId);
    await updateDoc(roomRef, {
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
