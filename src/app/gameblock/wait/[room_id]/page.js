"use client";
import { GAMES_PATH, RESULT_STATE, USER_STORAGE_KEY } from "@/constants";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { validateUser } from "@/utils/authentication";
import useSessionStorage from "@/hooks/useSessionStorage";
import { onListenSingleDocumentRealTime } from "@/firebase/utils";

export default function WaitingPage({ params }) {
  const [user] = useSessionStorage(USER_STORAGE_KEY);
  const roomId = params.room_id;
  const router = useRouter();

  useEffect(() => {
    validateUser(roomId, user, router);
  }, []);

  onListenSingleDocumentRealTime(GAMES_PATH, roomId, (gameData) => {
    if (gameData.state === RESULT_STATE) {
      router.push(`/gameblock/result/${roomId}`);
    }
  });

  return (
    <div>
      <p>Waiting for other players to submit their answers.</p>
    </div>
  );
}
