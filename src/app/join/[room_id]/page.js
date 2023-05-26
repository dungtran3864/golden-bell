"use client";

import { addDoc, collection } from "firebase/firestore";
import firebaseDB from "@/firebase/initFirebase";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { convertStringToBoolean } from "@/utils";
import useSessionStorage from "@/hooks/useSessionStorage";

export default function JoinPage({ params }) {
  const roomId = params.room_id;
  const [name, setName] = useState(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useSessionStorage("user");
  const [isHost, setHost] =  useSessionStorage("isHost");

  async function addUser(e) {
    e.preventDefault();
    const isHost = convertStringToBoolean(searchParams.get("isHost"));
    const userRef = await addDoc(collection(firebaseDB, "users"), {
      name: name,
      roomId: roomId,
      answer: null,
      eliminated: false,
    });
    setUser(userRef.id);
    setHost(isHost);
    router.push(`/lobby/${roomId}`);
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
