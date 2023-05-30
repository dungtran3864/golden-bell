"use client";
import { useEffect, useState } from "react";
import { validateUser } from "@/utils/authentication";
import useSessionStorage from "@/hooks/useSessionStorage";
import {
  GAMEBLOCK_STATE,
  GAMES_PATH,
  HOST_STORAGE_KEY,
  USER_STORAGE_KEY,
  USERS_PATH,
} from "@/constants";
import { useRouter } from "next/navigation";
import useQuestion from "@/hooks/useQuestion";
import { getSingleDocument, updateSingleDocument } from "@/firebase/utils";
import useGameState from "@/hooks/useGameState";
import useParticipation from "@/hooks/useParticipation";

export default function ResultPage({ params }) {
  const roomId = params.room_id;
  const [user] = useSessionStorage(USER_STORAGE_KEY);
  const [isHost] = useSessionStorage(HOST_STORAGE_KEY);
  const [currQuestion, resetRound] = useQuestion(roomId);
  const [gameState] = useGameState(roomId);
  const [eliminationStatus, setEliminationStatus] = useState(null);
  const [participants, survived, eliminated] = useParticipation(roomId);
  const router = useRouter();

  useEffect(() => {
    validateUser(roomId, user, router);
    getCurrPlayerEliminationStatus();
  }, []);

  useEffect(() => {
    if (gameState === GAMEBLOCK_STATE) {
      if (!eliminationStatus) {
        navigateToNextRound();
      } else {
        crossEliminated();
      }
    }
  }, [gameState]);

  async function getCurrPlayerEliminationStatus() {
    const currUser = await getSingleDocument(USERS_PATH, user);
    if (currUser) {
      setEliminationStatus(currUser.eliminated);
    }
  }

  async function navigateToNextRound() {
    await updateSingleDocument(USERS_PATH, user, {
      answerSubmitted: false,
    });
    router.push(`/gameblock/${roomId}`);
  }

  async function crossEliminated() {
    await updateSingleDocument(USERS_PATH, user, {
      active: false,
    });
    router.push("/");
  }

  async function proceed() {
    await resetRound();
    await updateSingleDocument(GAMES_PATH, roomId, {
      state: GAMEBLOCK_STATE,
      numberOfPlayers: survived,
    });
    await navigateToNextRound();
  }

  function getEliminationMessage(status) {
    switch (status) {
      case true:
        return "ELIMINATED";
      case false:
        return "A SURVIVOR";
      default:
        return null;
    }
  }

  return (
    <div>
      <h1>Summary of this round</h1>
      <strong>You are {getEliminationMessage(eliminationStatus)}</strong>
      <p>Question: {currQuestion?.question}</p>
      <p>
        Answer: <strong>{currQuestion?.answer}</strong>
      </p>
      <p>
        Number of players survived: <strong>{survived}</strong>
      </p>
      <p>
        Number of players eliminated: <strong>{eliminated}</strong>
      </p>
      {isHost && (
        <button type={"button"} onClick={proceed}>
          Proceed
        </button>
      )}
    </div>
  );
}
