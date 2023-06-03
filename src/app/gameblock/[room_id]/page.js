"use client";
import useQuestion from "@/hooks/useQuestion";
import { useEffect, useState } from "react";
import { checkAnswer } from "@/utils";
import { doc } from "firebase/firestore";
import useSessionStorage from "@/hooks/useSessionStorage";
import { useRouter } from "next/navigation";
import { GAMES_PATH, RESULT_STATE, USERS_PATH } from "@/constants";
import { makeTransaction, updateSingleDocument } from "@/firebase/utils";
import { validateUser } from "@/utils/validation";

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
    await makeTransaction((db, transaction) =>
      updateTotalSubmittedAnswers(db, transaction, false)
    );
    await makeTransaction((db, transaction) =>
      updateGameTransition(db, transaction)
    );
  }

  async function updateTotalSubmittedAnswers(db, transaction, isCorrect) {
    console.log("hello");
    const gameRef = doc(db, GAMES_PATH, roomId);

    const gameDoc = await transaction.get(gameRef);
    if (!gameDoc.exists()) {
      throw "Game does not exist.";
    }
    const gameData = gameDoc.data();

    if (isCorrect) {
      const updatedSubmitted = gameData.numberOfSubmitted + 1;
      transaction.update(gameRef, { numberOfSubmitted: updatedSubmitted });
    } else {
      const updatedSubmitted = gameData.numberOfSubmitted + 1;
      const updatedEliminated = gameData.numberOfEliminated + 1;
      transaction.update(gameRef, {
        numberOfSubmitted: updatedSubmitted,
        numberOfEliminated: updatedEliminated,
      });
    }
  }

  async function updateGameTransition(
    db,
    transaction,
    incompleteGameCallback,
    completeGameCallback
  ) {
    const gameRef = doc(db, GAMES_PATH, roomId);

    const gameDoc = await transaction.get(gameRef);
    if (!gameDoc.exists()) {
      throw "Game does not exist.";
    }
    const gameData = gameDoc.data();

    const numberOfPlayers = gameData.numberOfPlayers;
    const completedPlayers = gameData.numberOfSubmitted;
    if (completedPlayers === numberOfPlayers) {
      const gameState = gameData.state;
      if (gameState !== RESULT_STATE) {
        transaction.update(gameRef, {
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
  }

  async function submitAnswer(e) {
    e.preventDefault();
    clearInterval(countdownTracker);
    const isCorrect = checkAnswer(answer, currQuestion.answer);
    await updateSingleDocument(USERS_PATH, user, {
      answerSubmitted: true,
      eliminated: !isCorrect,
    });

    await makeTransaction((db, transaction) =>
      updateTotalSubmittedAnswers(db, transaction, isCorrect)
    );
    await makeTransaction((db, transaction) =>
      updateGameTransition(
        db,
        transaction,
        () => router.push(`/gameblock/wait/${roomId}`),
        () => router.push(`/gameblock/result/${roomId}`)
      )
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
