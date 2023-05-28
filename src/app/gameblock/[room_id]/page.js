"use client";
import useQuestion from "@/hooks/useQuestion";
import { useEffect, useState } from "react";
import { checkAnswer } from "@/utils";
import { where } from "firebase/firestore";
import useSessionStorage from "@/hooks/useSessionStorage";
import { useRouter } from "next/navigation";
import { GAMES_PATH, RESULT_STATE, USERS_PATH } from "@/constants";
import {
  getMultipleDocuments,
  getSingleDocument,
  updateSingleDocument,
} from "@/firebase/utils";
import { validateUser } from "@/utils/authentication";

export default function Gameblock({ params }) {
  const roomId = params.room_id;
  const [currQuestion] = useQuestion(roomId);
  const [user] = useSessionStorage("user");
  const [answer, setAnswer] = useState(null);
  const router = useRouter();

  useEffect(() => {
    validateUser(roomId, user, router);
  }, []);

  async function submitAnswer(e) {
    e.preventDefault();
    const isCorrect = checkAnswer(answer, currQuestion.answer);
    await updateSingleDocument(USERS_PATH, user, {
      answerSubmitted: true,
      eliminated: !isCorrect,
    });
    const gameData = await getSingleDocument(GAMES_PATH, roomId);
    const numberOfPlayers = gameData.numberOfPlayers;
    const [completedPlayers] = await getMultipleDocuments(
      USERS_PATH,
      where("roomId", "==", roomId),
      where("answerSubmitted", "==", true)
    );
    if (completedPlayers === numberOfPlayers) {
      const gameState = gameData.state;
      if (gameState !== RESULT_STATE) {
        await updateSingleDocument(GAMES_PATH, roomId, {
          state: RESULT_STATE,
        });
      }
      router.push(`/gameblock/result/${roomId}`);
    } else {
      router.push(`/gameblock/wait/${roomId}`);
    }
  }

  return (
    <form onSubmit={submitAnswer}>
      <p>Question: {currQuestion?.question}</p>
      <label htmlFor="answer">Type in your answer:</label>
      <input
        type="text"
        id="answer"
        name="answer"
        onChange={(e) => setAnswer(e.target.value)}
      />
      <br />
      <button type={"submit"}>Submit</button>
    </form>
  );
}
