"use client";
import { useEffect, useState } from "react";
import useSessionStorage from "@/hooks/useSessionStorage";
import { useRouter } from "next/navigation";
import { GAMEBLOCK_STATE, GAMES_PATH } from "@/constants";
import listenerGameState from "@/listener/listenerGameState";
import { updateSingleDocument } from "@/firebase/utils";
import { validateUser } from "@/utils/validation";
import listenerParticipation from "@/listener/listenerParticipation";
import Spinner from "@/component/Spinner";

export default function LobbyPage({ params }) {
  const roomId = params.room_id;
  const [user] = useSessionStorage("user");
  const router = useRouter();
  const [isHost] = useSessionStorage("isHost");
  const [participants, setParticipants] = useState(0);
  const [gameState, setGameState] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    validateUser(roomId, user, router);
    const unsubscribeGameState = listenerGameState(roomId, (state) =>
      setGameState(state)
    );
    const unsubscribeParticipation = listenerParticipation(roomId, (count) =>
      setParticipants(count)
    );
    return () => {
      unsubscribeGameState();
      unsubscribeParticipation();
    };
  }, []);

  useEffect(() => {
    if (gameState === GAMEBLOCK_STATE) {
      router.push(`/gameblock/${roomId}`);
    }
  }, [gameState]);

  async function startGame(e) {
    e.preventDefault();
    if (participants > 1) {
      setProcessing(true);
      try {
        await updateSingleDocument(GAMES_PATH, roomId, {
          state: GAMEBLOCK_STATE,
          numberOfPlayers: participants,
        });
        router.push(`/gameblock/${roomId}`);
      } catch (error) {
        console.log("Failed to start the game", error);
        setProcessing(false);
      }
    } else {
      setErrorMessage(
        "The game needs to have at least 2 players. Please invite more people to join."
      );
    }
  }

  return (
    <form onSubmit={startGame} className={"flex flex-col md:items-center"}>
      <div>
        <h1
          className={
            "mb-10 text-4xl font-extrabold leading-none tracking-tight text-blue-900 md:text-5xl mt-10"
          }
        >
          Welcome to the game lobby!
        </h1>
        {isHost ? (
          <p className={"mb-2"}>
            Number of players joined:{" "}
            <strong className={"text-purple-700"}>{participants}</strong>
          </p>
        ) : (
          <p className={"mb-2"}>
            Waiting for the host to start the game. Number of players joined:{" "}
            <strong className={"text-purple-700"}>{participants}</strong>
          </p>
        )}
        <p className={"mb-2"}>
          Share this room id to your friends to join:{" "}
          <strong className={"text-blue-900"}>{roomId}</strong>
        </p>
        <p className={"text-red-500 font-bold mb-6"}>{errorMessage}</p>
        {isHost && (
          <button
            type={"submit"}
            className={
              "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-2"
            }
            disabled={processing}
          >
            {processing ? <Spinner twW={"w-6"} twH={"h-6"} /> : "Start game"}
          </button>
        )}
      </div>
    </form>
  );
}
