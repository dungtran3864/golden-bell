"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getMultipleDocuments, getSingleDocument } from "@/firebase/utils";
import {
  GAMES_PATH,
  LOBBY_STATE,
  MAX_ROOMS_STORAGE_KEY,
  USERS_PATH,
} from "@/constants";
import { where } from "firebase/firestore";
import useLocalStorage from "@/hooks/useLocalStorage";

export default function GamePinScreen() {
  const [pin, setPin] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const router = useRouter();
  const [maxRooms, setMaxRooms] = useLocalStorage(MAX_ROOMS_STORAGE_KEY, {});

  function isMaxRoomAlreadyChecked() {
    return maxRooms && maxRooms[pin.trim()];
  }

  async function joinRoom(e) {
    e.preventDefault();
    const gameData = await getSingleDocument(GAMES_PATH, pin.trim());
    if (gameData) {
      if (gameData.state === LOBBY_STATE) {
        if (isMaxRoomAlreadyChecked()) {
          setErrorMessage(
            "This game is already at max capacity. Please join another game."
          );
          return;
        }
        const [numberOfPlayers] = await getMultipleDocuments(
          USERS_PATH,
          where("roomId", "==", pin.trim())
        );
        if (numberOfPlayers < 100) {
          router.push(`/join/${pin}?isHost=false`);
          return;
        }
        const copyMaxRooms = {...maxRooms};
        copyMaxRooms[pin.trim()] = true;
        setMaxRooms(copyMaxRooms);
        setErrorMessage(
          "This game is already at max capacity. Please join another game."
        );
      } else {
        setErrorMessage(
          "This game has already started. Please join another game."
        );
      }
    } else {
      setErrorMessage("This game doesn't exist. Please join another game.");
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
