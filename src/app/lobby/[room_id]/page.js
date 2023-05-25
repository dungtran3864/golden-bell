"use client";

import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import firebaseDB from "@/firebase/initFirebase";
import { useEffect, useState } from "react";
import useSessionStorage from "@/hooks/useSessionStorage";
import { useRouter } from "next/navigation";
import { GAMEBLOCK_STATE } from "@/constants";

export default function LobbyPage({ params }) {
  const roomId = params.room_id;
  const [participants, setParticipants] = useState(0);
  const [user, setUser] = useSessionStorage("user");
  const router = useRouter();
  const [isHost, setHost] = useState(false);

  useEffect(() => {
    async function validateUser() {
      const roomRef = doc(firebaseDB, "games", roomId);
      const roomSnap = await getDoc(roomRef);
      if (!roomSnap.exists()) {
        router.push("/");
        return () => {};
      }
      if (user == null) {
        router.push("/");
        return () => {};
      }

      const userRef = doc(firebaseDB, "users", user);
      const userSnap = await getDoc(userRef);
      setHost(userSnap.data().isHost);
    }

    validateUser();
  }, []);

  const participationQuery = query(
    collection(firebaseDB, "users"),
    where("roomId", "==", roomId)
  );
  const participationUnsubscribe = onSnapshot(
    participationQuery,
    (querySnapshot) => {
      let count = 0;
      querySnapshot.forEach((doc) => {
        count++;
      });
      setParticipants(count);
    }
  );

  const gameUnsubscribe = onSnapshot(
    doc(firebaseDB, "games", roomId),
    (doc) => {
      const game = doc.data();
      if (game.state === GAMEBLOCK_STATE) {
        router.push(`/gameblock/${roomId}`);
      }
    }
  );

  async function startGame(e) {
    e.preventDefault();
    const roomRef = doc(firebaseDB, "games", roomId);
    await updateDoc(roomRef, {
      state: GAMEBLOCK_STATE,
    });
    router.push(`/gameblock/${roomId}`);
  }

  return (
    <form onSubmit={startGame}>
      <h1>Welcome to the game lobby!</h1>
      <h3>This is a lobby. Number of players joined: {participants}</h3>
      <p>
        Share this room id to your friends to join: <strong>{roomId}</strong>
      </p>
      {isHost && <button type={"submit"}>Start game</button>}
    </form>
  );
}
