"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSingleDocument } from "@/firebase/utils";
import { GAMES_PATH, LOBBY_STATE } from "@/constants";

export default function GamePinScreen() {
  const [pin, setPin] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const router = useRouter();

  async function joinRoom(e) {
    e.preventDefault();
    const gameData = await getSingleDocument(GAMES_PATH, pin.trim());
    if (gameData.state === LOBBY_STATE) {
      router.push(`/join/${pin}?isHost=false`);
    } else {
      setErrorMessage(
        "This game has already started. Please join another game."
      );
    }
  }

  return (
    <form onSubmit={joinRoom}>
      <label htmlFor={"pin"}>Game Pin</label>
      <input
        type={"text"}
        id={"pin"}
        name={"pin"}
        onChange={(e) => setPin(e.target.value)}
      />
      <button type={"submit"}>Submit</button>
      <p>{errorMessage}</p>
    </form>
  );
}
