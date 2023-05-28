"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { convertStringToBoolean } from "@/utils";
import useSessionStorage from "@/hooks/useSessionStorage";
import { addSingleDocument } from "@/firebase/utils";
import { HOST_STORAGE_KEY, USER_STORAGE_KEY, USERS_PATH } from "@/constants";

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
    });
    setUser(userId);
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
