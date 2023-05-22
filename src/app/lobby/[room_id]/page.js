"use client";

import { collection, query, where, onSnapshot } from "firebase/firestore";
import firebaseDB from "@/firebase/initFirebase";
import { useState } from "react";

export default function LobbyPage({ params }) {
  const roomId = params.room_id;
  const [participants, setParticipants] = useState(0);

  const q = query(
    collection(firebaseDB, "users"),
    where("roomId", "==", roomId)
  );
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    let count = 0;
    querySnapshot.forEach((doc) => {
      count++;
    });
    setParticipants(count);
  });

  return (
    <div>
      <h1>Welcome to the game lobby!</h1>
      <h3>This is a lobby. Number of players joined: {participants}</h3>
      <p>
        Share this room id to your friends to join: <strong>{roomId}</strong>
      </p>
      <button type={"button"}>Start game</button>
    </div>
  );
}
