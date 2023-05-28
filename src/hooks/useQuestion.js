import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import firebaseDB from "@/firebase/initFirebase";
import { getSingleDocument, updateSingleDocument } from "@/firebase/utils";
import { GAMES_PATH } from "@/constants";

export default function useQuestion(roomId) {
  const [question, setQuestion] = useState(null);

  useEffect(() => {
    async function fetchQuestion() {
      const gameData = await getSingleDocument(GAMES_PATH, roomId);
      let currQuestion = gameData.currQuestion;
      if (!currQuestion) {
        const questions = gameData.questions;
        const currQuestionIdx = gameData.currQuestionIdx + 1;
        currQuestion = questions[currQuestionIdx];
        await updateSingleDocument(GAMES_PATH, roomId, {
          currQuestionIdx,
          currQuestion,
        });
      }
      setQuestion(currQuestion);
    }

    fetchQuestion();
  }, []);

  return [question];
}
