"use client";
import { useEffect, useState } from "react";
import { getMultipleDocuments } from "@/firebase/utils";
import { USERS_PATH } from "@/constants";
import { where } from "firebase/firestore";

export default function WinnerPage({ params }) {
  const roomId = params.room_id;
  const [winners, setWinners] = useState([]);
  const [count, setCount] = useState(null);

  useEffect(() => {
    fetchWinners();
  }, []);

  async function fetchWinners() {
    const [winnerCount, winnersResult] = await getMultipleDocuments(
      USERS_PATH,
      where("roomId", "==", roomId),
      where("active", "==", true),
      where("eliminated", "==", false)
    );
    setWinners(winnersResult);
    setCount(winnerCount);
  }

  return (
    <div>
      <h1>Game over!</h1>
      {count === 0 && (
        <p>
          Unfortunately, no one is able to win this game. Good luck next time!
        </p>
      )}
      {count === 1 && (
        <p>
          The winner of the game is: <strong>{winners[0]?.name}</strong>
        </p>
      )}
      {count > 1 && (
        <div>
          <p>Here are the winners of the game:</p>
          {winners.map((winner, index) => (
            <div key={index}>
              <strong>{winner.name}</strong>
            </div>
          ))}
        </div>
      )}
      <button type={"button"}>Exit game</button>
    </div>
  );
}
