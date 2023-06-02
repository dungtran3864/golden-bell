"use client";
import { RESULT_STATE, USER_STORAGE_KEY } from "@/constants";
import { useRouter } from "next/navigation";
import {useEffect, useState} from "react";
import { validateUser } from "@/utils/authentication";
import useSessionStorage from "@/hooks/useSessionStorage";
import listenerGameState from "@/listener/listenerGameState";

export default function WaitingPage({ params }) {
  const [user] = useSessionStorage(USER_STORAGE_KEY);
  const roomId = params.room_id;
  const router = useRouter();
  const [gameState, setGameState] = useState(null);

  useEffect(() => {
    validateUser(roomId, user, router);
    listenerGameState(roomId, (state) => setGameState(state));
  }, []);

  useEffect(() => {
    if (gameState === RESULT_STATE) {
      router.push(`/gameblock/result/${roomId}`);
    }
  }, [gameState]);

  return (
    <div>
      <p>Waiting for other players to submit their answers.</p>
    </div>
  );
}
