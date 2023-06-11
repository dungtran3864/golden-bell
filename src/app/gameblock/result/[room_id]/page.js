"use client";
import { useEffect, useState } from "react";
import { validateUser } from "@/utils/validation";
import useSessionStorage from "@/hooks/useSessionStorage";
import {
  GAMEBLOCK_STATE,
  GAMES_PATH,
  HOST_STORAGE_KEY,
  USER_STORAGE_KEY,
  USERS_PATH,
  WINNER_STATE,
} from "@/constants";
import { useRouter } from "next/navigation";
import useQuestion from "@/hooks/useQuestion";
import {
  getMultipleDocuments,
  getSingleDocument,
  updateSingleDocument,
} from "@/firebase/utils";
import listenerGameState from "@/listener/listenerGameState";
import { where } from "firebase/firestore";

export default function ResultPage({ params }) {
  const roomId = params.room_id;
  const [user] = useSessionStorage(USER_STORAGE_KEY);
  const [isHost] = useSessionStorage(HOST_STORAGE_KEY);
  const [currQuestion, resetRound, isLastQuestion] = useQuestion(roomId);
  const [gameState, setGameState] = useState(null);
  const [eliminationStatus, setEliminationStatus] = useState(null);
  const [survived, setSurvived] = useState(null);
  const [eliminated, setEliminated] = useState(null);
  const router = useRouter();

  useEffect(() => {
    validateUser(roomId, user, router);
    const unsubscribe = listenerGameState(roomId, (state) =>
      setGameState(state)
    );
    getGameData();
    getCurrPlayerEliminationStatus();
    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (gameState === GAMEBLOCK_STATE) {
      if (!eliminationStatus) {
        navigateToNextRound();
      } else {
        crossEliminated();
      }
    } else if (gameState === WINNER_STATE) {
      navigateToChampionScreen();
    }
  }, [gameState]);

  async function getGameData() {
    const game = await getSingleDocument(GAMES_PATH, roomId);
    if (game) {
      setSurvived(game.numberOfPlayers - game.numberOfEliminated);
      setEliminated(game.numberOfEliminated);
    }
  }

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

  async function navigateToChampionScreen() {
    router.push(`/gameblock/winner/${roomId}`);
  }

  async function crossEliminated() {
    await updateSingleDocument(USERS_PATH, user, {
      active: false,
    });
    router.push("/");
  }

  async function proceed() {
    if (survived > 1 && !isLastQuestion) {
      await resetRound();
      await updateSingleDocument(GAMES_PATH, roomId, {
        state: GAMEBLOCK_STATE,
        numberOfPlayers: survived,
        numberOfSubmitted: 0,
        numberOfEliminated: 0,
      });
      await navigateToNextRound();
    } else {
      const [winnersCount, winners] = await getMultipleDocuments(
        USERS_PATH,
        where("roomId", "==", roomId),
        where("active", "==", true),
        where("eliminated", "==", false)
      );
      await updateSingleDocument(GAMES_PATH, roomId, {
        state: WINNER_STATE,
        winners,
      });
      navigateToChampionScreen();
    }
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
    <div className={"flex justify-center mt-8"}>
      <div className={""}>
        <h1
          className={
            "mb-4 text-4xl font-extrabold leading-none tracking-tight text-blue-900 mt-10"
          }
        >
          Summary of this round
        </h1>
        <p className={"text-purple-700 font-extrabold mb-4 text-2xl"}>
          You are {getEliminationMessage(eliminationStatus)}
        </p>
        <p className={"mb-1"}>
          Question:{" "}
          <strong className={"text-blue-900"}>{currQuestion?.question}</strong>
        </p>
        <p className={"mb-1"}>
          Answer:{" "}
          <strong className={"text-blue-900"}>{currQuestion?.answer}</strong>
        </p>
        <p className={"mb-1"}>
          Number of players survived:{" "}
          <strong className={"text-purple-700"}>{survived}</strong>
        </p>
        <p className={"mb-6"}>
          Number of players eliminated:{" "}
          <strong className={"text-red-500"}>{eliminated}</strong>
        </p>
        {isHost && (
          <button
            type={"button"}
            onClick={proceed}
            className={
              "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2 mb-4"
            }
          >
            Proceed
          </button>
        )}
      </div>
    </div>
  );
}
