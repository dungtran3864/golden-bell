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
  const [currQuestion, resetRound, isQuestionRunOut, isLoadingQuestion] =
    useQuestion(roomId);
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

  async function updateGameTransition(db, transaction) {
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
      }
    }
  }

  async function submitAnswer(e) {
    e.preventDefault();
    clearInterval(countdownTracker);
    router.push(`/gameblock/wait/${roomId}`);
    const isCorrect = checkAnswer(answer, currQuestion.answer);
    await updateSingleDocument(USERS_PATH, user, {
      answerSubmitted: true,
      eliminated: !isCorrect,
    });

    await makeTransaction((db, transaction) =>
      updateTotalSubmittedAnswers(db, transaction, isCorrect)
    );
    await makeTransaction((db, transaction) =>
      updateGameTransition(db, transaction)
    );
  }

  return (
    <div className={"flex justify-center mt-8"}>
      <div className={"flex-auto"} />
      <div className={"flex-auto w-6/12"}>
        <form
          onSubmit={submitAnswer}
          className={"bg-yellow-200 shadow-md rounded px-8 pt-6 pb-8 mb-4"}
        >
          <div className={"mb-4"}>
            <p className={"text-lg"}>
              Time left: <strong className={"text-red-500"}>{timer}</strong>{" "}
              seconds
            </p>
            <p className={"mb-2 text-lg"}>
              Question:{" "}
              <strong className={"text-blue-900"}>
                {isLoadingQuestion ? "..." : currQuestion?.question}
              </strong>
            </p>
            <label htmlFor="answer" className={"block text-lg font-bold mb-2"}>
              Type in your answer:
            </label>
            <input
              type="text"
              id="answer"
              name="answer"
              autoComplete={"off"}
              onChange={(e) => setAnswer(e.target.value)}
              required
              className={
                "shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              }
            />
          </div>
          <button
            type={"submit"}
            className={
              "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2 mb-4"
            }
          >
            Submit
          </button>
        </form>
      </div>
      <div className={"flex-auto"} />
    </div>
  );
}
