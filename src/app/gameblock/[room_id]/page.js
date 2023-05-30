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

let countdown;
let countdownTracker;

export default function Gameblock({ params }) {
  const roomId = params.room_id;
  const [currQuestion] = useQuestion(roomId);
  const [user] = useSessionStorage("user");
  const [answer, setAnswer] = useState(null);
  const [timer, setTimer] = useState(15);
  const router = useRouter();

  useEffect(() => {
    validateUser(roomId, user, router);
    startCountdown();
  }, []);

  function startCountdown() {
    countdown = timer;
    countdownTracker = setInterval(async function () {
      setTimer(countdown);
      if (countdown > 0) {
        countdown--;
      } else {
        clearInterval(countdownTracker);
        await gameOver();
      }
    }, 1000);
  }

  async function gameOver() {
    router.push(`/gameblock/wait/${roomId}`);
    await updateSingleDocument(USERS_PATH, user, {
      answerSubmitted: true,
      eliminated: true,
    });
    const gameData = await getSingleDocument(GAMES_PATH, roomId);
    const numberOfPlayers = gameData.numberOfPlayers;
    const [completedPlayers] = await getMultipleDocuments(
      USERS_PATH,
      where("roomId", "==", roomId),
      where("answerSubmitted", "==", true),
      where("active", "==", true)
    );
    if (completedPlayers === numberOfPlayers) {
      const gameState = gameData.state;
      if (gameState !== RESULT_STATE) {
        await updateSingleDocument(GAMES_PATH, roomId, {
          state: RESULT_STATE,
        });
      }
    }
  }

  async function submitAnswer(e) {
    e.preventDefault();
    clearInterval(countdownTracker);
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
      where("answerSubmitted", "==", true),
      where("active", "==", true)
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
      <p>
        Time left: <strong>{timer}</strong> seconds
      </p>
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
