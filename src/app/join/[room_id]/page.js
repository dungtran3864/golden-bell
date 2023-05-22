"use client";

import {
  addDoc,
  collection,
} from "firebase/firestore";
import firebaseDB from "@/firebase/initFirebase";
import { useState } from "react";
import {useRouter} from "next/navigation";

export default function JoinPage({ params }) {
  const roomId = params.room_id;
  const [name, setName] = useState(null);
  const router = useRouter();

  async function addUser(e) {
    e.preventDefault();
    await addDoc(collection(firebaseDB, "users"), {
      name: name,
      roomId: roomId,
      answer: null,
      eliminated: false,
    });
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
