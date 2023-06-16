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
import Spinner from "@/component/Spinner";

export default function ResultPage({ params }) {
  const roomId = params.room_id;
  const [user] = useSessionStorage(USER_STORAGE_KEY);
  const [isHost] = useSessionStorage(HOST_STORAGE_KEY);
  const [currQuestion, resetRound, isLastQuestion, isLoadingQuestion] =
    useQuestion(roomId);
  const [gameState, setGameState] = useState(null);
  const [eliminationStatus, setEliminationStatus] = useState(null);
  const [survived, setSurvived] = useState(null);
  const [eliminated, setEliminated] = useState(null);
  const [isLoading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    validateUser(roomId, user, router);
    const unsubscribe = listenerGameState(roomId, (state) =>
      setGameState(state)
    );
    fetchData();
    return () => {
      unsubscribe();
    };
  }, []);

  async function fetchData() {
    try {
      await getGameData();
      await getCurrPlayerEliminationStatus();
    } catch (error) {
      console.log("Failed to fetch result summary data", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!isHost) {
      if (gameState === GAMEBLOCK_STATE) {
        if (!eliminationStatus) {
          navigateToNextRound();
        } else {
          crossEliminated();
        }
      } else if (gameState === WINNER_STATE) {
        navigateToChampionScreen();
      }
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
    if (isHost && eliminationStatus) {
      router.push(`/gameblock/wait/${roomId}`);
    } else {
      router.push(`/gameblock/${roomId}`);
    }
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
    setProcessing(true);
    try {
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
    } catch (error) {
      console.log("Failed to proceed to next round", error);
    } finally {
      setProcessing(false);
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
    <div className={"flex justify-start md:justify-center mt-8"}>
      <div>
        <h1
          className={
            "mb-4 text-4xl font-extrabold leading-none tracking-tight text-blue-900 mt-10"
          }
        >
          Summary of this round
        </h1>
        <p className={"text-purple-700 font-extrabold mb-4 text-2xl"}>
          You are{" "}
          {isLoading ? (
            <strong>...</strong>
          ) : (
            getEliminationMessage(eliminationStatus)
          )}
        </p>
        <p className={"mb-1"}>
          Question:{" "}
          <strong className={"text-blue-900"}>
            {isLoadingQuestion ? "..." : currQuestion?.question}
          </strong>
        </p>
        <p className={"mb-1"}>
          Answer:{" "}
          <strong className={"text-blue-900"}>
            {isLoadingQuestion ? "..." : currQuestion?.answer}
          </strong>
        </p>
        <p className={"mb-1"}>
          Number of players survived:{" "}
          <strong className={"text-purple-700"}>
            {isLoading ? "..." : survived}
          </strong>
        </p>
        <p className={"mb-6"}>
          Number of players eliminated:{" "}
          <strong className={"text-red-500"}>
            {isLoading ? "..." : eliminated}
          </strong>
        </p>
        {isHost && (
          <button
            type={"button"}
            onClick={proceed}
            className={
              "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2 mb-4"
            }
          >
            {processing ? <Spinner twW={"w-6"} twH={"h-6"} /> : "Proceed"}
          </button>
        )}
      </div>
    </div>
  );
}
