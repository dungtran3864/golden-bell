"use client";

import { useRouter } from "next/navigation";
import { GAMES_PATH, LOBBY_STATE } from "@/constants";
import { getData, shuffle } from "@/utils";
import { addSingleDocument } from "@/firebase/utils";
import { useState } from "react";
import Spinner from "@/component/Spinner";
import Link from "next/link";

export default function Home() {
  const [processing, setProcessing] = useState(false);
  const router = useRouter();

  async function createNewGame() {
    setProcessing(true);
    try {
      const questionData = await getData(
        "https://opentdb.com/api.php?amount=20&difficulty=easy&type=multiple"
      );
      const questionsWithAnswersList = questionData.results.map((questionItem) => {
        return {
          question: questionItem.question,
          answer: questionItem.correct_answer,
          answersList: shuffle([
            questionItem.correct_answer,
            ...questionItem.incorrect_answers,
          ]),
        };
      });
      const shuffledQuestions = shuffle(questionsWithAnswersList);
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
    } catch (error) {
      console.log("Failed to create a game", error);
      setProcessing(false);
    }
  }

  return (
    <div className={"flex flex-col md:items-center"}>
      <h1
        className={
          "mb-10 text-4xl font-extrabold leading-none tracking-tight text-blue-900 md:text-5xl lg:text-6xl mt-10"
        }
      >
        Welcome to Golden Bell
      </h1>
      <div className={"flex flex-row"}>
        <Link
          className={
            "bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded mr-2"
          }
          href={"/join"}
        >
          Join a game
        </Link>
        <button
          className={
            "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          }
          type={"button"}
          onClick={createNewGame}
          disabled={processing}
        >
          {processing ? <Spinner twW={"w-6"} twH={"h-6"} /> : "Create a game"}
        </button>
      </div>
      <img
        src={"golden-bell-clipart-design-illustration-free-png.webp"}
        alt={"golden bell image"}
        className={"object-scale-down h-48 w-96 mt-24"}
      />
    </div>
  );
}
