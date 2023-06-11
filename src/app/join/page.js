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
    <div className={"flex justify-center mt-8"}>
      <div className={"flex-auto"} />
      <div className={"flex-auto"}>
        <form
          onSubmit={joinRoom}
          className={"bg-yellow-200 shadow-md rounded px-8 pt-6 pb-8 mb-4"}
        >
          <div className={"mb-4"}>
            <label
              htmlFor={"pin"}
              className={"block text-lg font-bold mb-2"}
            >
              Game Pin
            </label>
            <input
              type={"text"}
              id={"pin"}
              name={"pin"}
              onChange={(e) => setPin(e.target.value)}
              autoComplete={"off"}
              className={
                "shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              }
            />
          </div>
          <button
            type={"submit"}
            className={
              "bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded mr-2"
            }
          >
            Next
          </button>
        </form>
      </div>
      <div className={"flex-auto"} />
    </div>
  );
}
