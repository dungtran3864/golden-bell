"use client";
import useQuestion from "@/hooks/useQuestion";
import { useEffect, useState } from "react";
import { checkAnswer } from "@/utils";
import { runTransaction, doc } from "firebase/firestore";
import useSessionStorage from "@/hooks/useSessionStorage";
import { useRouter } from "next/navigation";
import { GAMES_PATH, RESULT_STATE, USERS_PATH } from "@/constants";
import {
  updateSingleDocument,
} from "@/firebase/utils";
import { validateUser } from "@/utils/authentication";
import firebaseDB from "@/firebase/initFirebase";

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
    await updateTotalSubmittedAnswers(false);
    await updateGameTransition();
  }

  async function updateTotalSubmittedAnswers(isCorrect) {
    const gameRef = doc(firebaseDB, GAMES_PATH, roomId);

    try {
      await runTransaction(firebaseDB, async (transaction) => {
        const gameDoc = await transaction.get(gameRef);
        if (!gameDoc.exists()) {
          throw "Game does not exist.";
        }

        if (isCorrect) {
          const updatedSubmitted = gameDoc.data().numberOfSubmitted + 1;
          transaction.update(gameRef, { numberOfSubmitted: updatedSubmitted });
        } else {
          const updatedSubmitted = gameDoc.data().numberOfSubmitted + 1;
          const updatedEliminated = gameDoc.data().numberOfEliminated + 1;
          transaction.update(gameRef, {
            numberOfSubmitted: updatedSubmitted,
            numberOfEliminated: updatedEliminated,
          });
        }
      });
    } catch (e) {
      console.log("Transaction failed: ", e);
    }
  }

  async function updateGameTransition(
    incompleteGameCallback,
    completeGameCallback
  ) {
    const gameRef = doc(firebaseDB, GAMES_PATH, roomId);

    try {
      await runTransaction(firebaseDB, async (transaction) => {
        const gameDoc = await transaction.get(gameRef);
        if (!gameDoc.exists()) {
          throw "Game does not exist.";
        }

        const numberOfPlayers = gameDoc.data().numberOfPlayers;
        const completedPlayers = gameDoc.data().numberOfSubmitted;
        if (completedPlayers === numberOfPlayers) {
          const gameState = gameDoc.data().state;
          if (gameState !== RESULT_STATE) {
            await updateSingleDocument(GAMES_PATH, roomId, {
              state: RESULT_STATE,
            });
            if (completeGameCallback) {
              completeGameCallback();
            }
          }
        } else {
          if (incompleteGameCallback) {
            incompleteGameCallback();
          }
        }
      });
    } catch (e) {
      console.error("Transaction failed: ", e);
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

    await updateTotalSubmittedAnswers(isCorrect);
    await updateGameTransition(
      () => router.push(`/gameblock/wait/${roomId}`),
      () => router.push(`/gameblock/result/${roomId}`)
    );
    router.push(`/gameblock/wait/${roomId}`);
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
