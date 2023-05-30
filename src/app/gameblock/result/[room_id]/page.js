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
import {
  getMultipleDocuments,
  getSingleDocument,
  updateSingleDocument,
} from "@/firebase/utils";
import useGameState from "@/hooks/useGameState";
import { where } from "firebase/firestore";

export default function ResultPage({ params }) {
  const roomId = params.room_id;
  const [user] = useSessionStorage(USER_STORAGE_KEY);
  const [isHost] = useSessionStorage(HOST_STORAGE_KEY);
  const [currQuestion, resetRound] = useQuestion(roomId);
  const [gameState] = useGameState(roomId);
  const [eliminationStatus, setEliminationStatus] = useState(null);
  const [numOfEliminated, setNumOfEliminated] = useState(null);
  const [survived, setSurvived] = useState(null);
  const router = useRouter();

  useEffect(() => {
    validateUser(roomId, user, router);
    getCurrPlayerEliminationStatus();
    getNumberOfPlayersEliminated();
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

  async function getNumberOfPlayersEliminated() {
    const currGame = await getSingleDocument(GAMES_PATH, roomId);
    const [numOfSurvived] = await getMultipleDocuments(
      USERS_PATH,
      where("roomId", "==", roomId),
      where("eliminated", "==", false),
      where("active", "==", true)
    );
    if (currGame) {
      setSurvived(numOfSurvived);
      setNumOfEliminated(currGame.numberOfPlayers - numOfSurvived);
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

  return (
    <div>
      <h1>Summary of this round</h1>
      <strong>You are {eliminationStatus ? "ELIMINATED" : "A SURVIVOR"}</strong>
      <p>Question: {currQuestion?.question}</p>
      <p>
        Answer: <strong>{currQuestion?.answer}</strong>
      </p>
      <p>
        Number of players eliminated: <strong>{numOfEliminated}</strong>
      </p>
      <p>
        Number of players survived: <strong>{survived}</strong>
      </p>
      {isHost && (
        <button type={"button"} onClick={proceed}>
          Proceed
        </button>
      )}
    </div>
  );
}
