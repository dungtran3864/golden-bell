"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { convertStringToBoolean } from "@/utils";
import useSessionStorage from "@/hooks/useSessionStorage";
import { addSingleDocument, makeTransaction } from "@/firebase/utils";
import {
  GAMES_PATH,
  HOST_STORAGE_KEY,
  USER_STORAGE_KEY,
  USERS_PATH,
} from "@/constants";
import { doc } from "firebase/firestore";

export default function JoinPage({ params }) {
  const roomId = params.room_id;
  const [name, setName] = useState(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useSessionStorage(USER_STORAGE_KEY);
  const [isHost, setHost] = useSessionStorage(HOST_STORAGE_KEY);

  async function addUser(e) {
    e.preventDefault();
    const isHost = convertStringToBoolean(searchParams.get(HOST_STORAGE_KEY));
    const userId = await addSingleDocument(USERS_PATH, {
      name: name,
      roomId: roomId,
      answerSubmitted: false,
      eliminated: false,
      active: true,
    });
    setUser(userId);
    setHost(isHost);
    await makeTransaction((db, transaction) =>
      incrementPlayerInGame(db, transaction, roomId)
    );
    router.push(`/lobby/${roomId}`);
  }

  async function incrementPlayerInGame(db, transaction, roomId) {
    const gameRef = doc(db, GAMES_PATH, roomId);

    const gameDoc = await transaction.get(gameRef);
    if (!gameDoc.exists()) {
      throw "Game does not exist.";
    }
    const gameData = gameDoc.data();

    const updatedNumberOfPlayers = gameData.numberOfPlayers + 1;
    transaction.update(gameRef, { numberOfPlayers: updatedNumberOfPlayers });
  }

  return (
    <form onSubmit={addUser}>
      <label htmlFor={"fname"}>Name</label>
      <input
        type={"text"}
        id={"fname"}
        name={"fname"}
        onChange={(e) => setName(e.target.value)}
      />
      <button type={"submit"}>Submit</button>
    </form>
  );
}
