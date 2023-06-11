"use client";

import { useRouter } from "next/navigation";
import { GAMES_PATH, LOBBY_STATE, QUESTIONS_PATH } from "@/constants";
import { shuffle } from "@/utils";
import { addSingleDocument, getMultipleDocuments } from "@/firebase/utils";

export default function Home() {
  const router = useRouter();

  async function createNewGame() {
    const [count, questions] = await getMultipleDocuments(QUESTIONS_PATH);
    const shuffledQuestions = shuffle(questions);
    const roomId = await addSingleDocument(GAMES_PATH, {
      state: LOBBY_STATE,
      currQuestion: null,
      currQuestionIdx: -1,
      questions: shuffledQuestions,
      numberOfPlayers: 0,
      numberOfSubmitted: 0,
      numberOfEliminated: 0,
    });
    router.push(`/join/${roomId}?isHost=true`);
  }

  function joinGame() {
    router.push("/join");
  }

  return (
    <div className={"flex flex-col items-center"}>
      <h1
        className={
          "mb-10 text-4xl font-extrabold leading-none tracking-tight text-blue-900 md:text-5xl lg:text-6xl mt-10"
        }
      >
        Welcome to Golden Bell
      </h1>
      <div className={"flex flex-row"}>
        <button
          className={
            "bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded mr-2"
          }
          type={"button"}
          onClick={joinGame}
        >
          Join a game
        </button>
        <button
          className={
            "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          }
          type={"button"}
          onClick={createNewGame}
        >
          Create a new game
        </button>
      </div>
      <img src={"golden-bell-clipart-design-illustration-free-png.webp"} alt={"golden bell image"} className={"object-scale-down h-48 w-96 mt-24"} />
    </div>
  );
}
