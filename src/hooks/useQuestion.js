import { useEffect, useState } from "react";
import { getSingleDocument, updateSingleDocument } from "@/firebase/utils";
import { GAMES_PATH } from "@/constants";

export default function useQuestion(roomId) {
  const [question, setQuestion] = useState(null);
  const [isQuestionRunOut, setQuestionRunOut] = useState(false);

  useEffect(() => {
    fetchQuestion();
  }, []);

  async function fetchQuestion() {
    const gameData = await getSingleDocument(GAMES_PATH, roomId);
    if (gameData) {
      let currQuestion = gameData.currQuestion;
      const numberOfQuestions = gameData.questions.length;
      let currQuestionIdx = gameData.currQuestionIdx;
      if (!currQuestion) {
        const questions = gameData.questions;
        currQuestionIdx = currQuestionIdx + 1;
        currQuestion = questions[currQuestionIdx];
        await updateSingleDocument(GAMES_PATH, roomId, {
          currQuestionIdx,
          currQuestion,
        });
      }
      setQuestion(currQuestion);
      setQuestionRunOut(currQuestionIdx + 1 === numberOfQuestions);
    }
  }

  async function resetRound() {
    await updateSingleDocument(GAMES_PATH, roomId, {
      currQuestion: null,
    });
  }

  return [question, resetRound, isQuestionRunOut];
}
