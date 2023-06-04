"use client";
import { useEffect, useState } from "react";
import { getMultipleDocuments, getSingleDocument } from "@/firebase/utils";
import {
  GAMES_PATH,
  HOST_STORAGE_KEY,
  USER_STORAGE_KEY,
  USERS_PATH,
} from "@/constants";
import useSessionStorage from "@/hooks/useSessionStorage";
import { validateUser } from "@/utils/validation";
import { useRouter } from "next/navigation";
import { doc, where, writeBatch } from "firebase/firestore";
import firebaseDB from "@/firebase/initFirebase";

export default function WinnerPage({ params }) {
  const roomId = params.room_id;
  const [winners, setWinners] = useState([]);
  const [count, setCount] = useState(null);
  const [user] = useSessionStorage(USER_STORAGE_KEY);
  const [isHost] = useSessionStorage(HOST_STORAGE_KEY);
  const router = useRouter();

  useEffect(() => {
    validateUser(roomId, user, router);
    fetchWinners();
  }, []);

  async function fetchWinners() {
    const gameData = await getSingleDocument(GAMES_PATH, roomId);
    if (gameData) {
      setWinners(gameData.winners);
      setCount(gameData.winners.length);
    }
  }

  function consolidationMessage() {
    return (
      <div>
        <h1>Game over!</h1>
        <h2>Better luck next time!</h2>
      </div>
    );
  }

  function winningMessage(name) {
    return (
      <div>
        <h1>Congratulations!</h1>
        <h2>You are the winner, {name}!</h2>
      </div>
    );
  }

  function showHeader() {
    // Case: no one wins the game
    if (count === 0) {
      return <h1>Game over!</h1>;
    }
    // Case: you are NOT the winner
    if (count === 1 && user !== winners[0].uid) {
      return consolidationMessage();
    }
    // Case: you are the winner
    if (count === 1 && user === winners[0]?.uid) {
      return winningMessage(winners[0]?.name);
    }
    // Case: multiple winners, check if you are a winner or not
    if (count > 1) {
      for (let winner of winners) {
        if (winner.uid === user) {
          return winningMessage(winner.name);
        }
      }
      return consolidationMessage();
    }
    return null;
  }

  function showBodyMessage() {
    // Case: no one wins the game
    if (count === 0) {
      return (
        <p>
          Unfortunately, no one is able to win this game. Better luck next time!
        </p>
      );
    }
    // Case: you are NOT the winner
    if (count === 1 && user !== winners[0]?.uid) {
      return (
        <p>
          The winner of the game is: <strong>{winners[0]?.name}</strong>
        </p>
      );
    }
    // Case: multiple winners
    if (count > 1) {
      return (
        <div>
          <p>
            Here are the <strong>{count} winners</strong> of the game:
          </p>
          {winners.map((winner, index) => (
            <div key={index}>
              <strong>{winner.name}</strong>
            </div>
          ))}
        </div>
      );
    }
    return null;
  }

  async function cleanUpGame() {
    if (isHost) {
      const [usersCount, users] = await getMultipleDocuments(
        USERS_PATH,
        where("roomId", "==", roomId)
      );
      const gameData = await getSingleDocument(GAMES_PATH, roomId);
      const batch = writeBatch(firebaseDB);
      users.forEach((user) => {
        const userRef = doc(firebaseDB, USERS_PATH, user.uid);
        batch.delete(userRef);
      });
      if (gameData) {
        const gameRef = doc(firebaseDB, GAMES_PATH, roomId);
        batch.delete(gameRef);
      }
      await batch.commit();
    }
    router.push("/");
  }

  return (
    <div>
      {showHeader()}
      {showBodyMessage()}
      <button type={"button"} onClick={cleanUpGame}>
        Exit game
      </button>
    </div>
  );
}
