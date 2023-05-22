"use client";

import { useRouter } from "next/navigation";
import { collection, addDoc } from "firebase/firestore";
import firebaseDB from "@/firebase/initFirebase";
import { LOBBY_STATE } from "@/constants";

export default function Home() {
  const router = useRouter();

  async function createNewGame() {
    const gamesRef = await addDoc(collection(firebaseDB, "games"), {
      users: [],
      seconds: 15,
      state: LOBBY_STATE,
      question: null,
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
