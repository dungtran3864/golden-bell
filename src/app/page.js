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
    });
    router.push(`/join/${roomId}?isHost=true`);
  }

  function joinGame() {
    router.push("/join");
  }

  return (
    <div>
      <h1>Welcome to Golden Bell</h1>
      <button type={"button"} onClick={joinGame}>
        Join a game
      </button>
      <button type={"button"} onClick={createNewGame}>
        Create a new game
      </button>
    </div>
  );
}
