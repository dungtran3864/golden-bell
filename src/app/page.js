"use client";

import { useRouter } from "next/navigation";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import firebaseDB from "@/firebase/initFirebase";
import { LOBBY_STATE } from "@/constants";
import { shuffle } from "@/utils";

export default function Home() {
  const router = useRouter();

  async function createNewGame() {
    const questionQuery = query(collection(firebaseDB, "questions"));
    const querySnapshot = await getDocs(questionQuery);
    const questions = [];
    querySnapshot.forEach((doc) => {
      questions.push(doc.data());
    });
    const shuffledQuestions = shuffle(questions);
    const gamesRef = await addDoc(collection(firebaseDB, "games"), {
      state: LOBBY_STATE,
      currQuestion: null,
      currQuestionIdx: -1,
      questions: shuffledQuestions,
    });
    router.push(`/join/${gamesRef.id}?isHost=true`);
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
