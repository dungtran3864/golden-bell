"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function GamePinScreen() {
  const [pin, setPin] = useState(null);
  const router = useRouter();

  async function joinRoom(e) {
    e.preventDefault();
    router.push(`/join/${pin}?isHost=false`);
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
    </form>
  );
}
