"use client";
import { RESULT_STATE, USER_STORAGE_KEY } from "@/constants";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { validateUser } from "@/utils/authentication";
import useSessionStorage from "@/hooks/useSessionStorage";
import useGameState from "@/hooks/useGameState";

export default function WaitingPage({ params }) {
  const [user] = useSessionStorage(USER_STORAGE_KEY);
  const roomId = params.room_id;
  const router = useRouter();
  const [gameState] = useGameState(roomId);

  useEffect(() => {
    validateUser(roomId, user, router);
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
