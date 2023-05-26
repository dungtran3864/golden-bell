import {useEffect, useState} from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import firebaseDB from "@/firebase/initFirebase";

export default function useQuestion(roomId) {
  const [question, setQuestion] = useState(null);

  useEffect(() => {
    async function fetchQuestion() {
      const gameRef = doc(firebaseDB, "games", roomId);
      const gameSnap = await getDoc(gameRef);
      let currQuestion = gameSnap.data().currQuestion;
      if (!currQuestion) {
        const questions = gameSnap.data().questions;
        const currQuestionIdx = gameSnap.data().currQuestionIdx + 1;
        currQuestion = questions[currQuestionIdx];
        await updateDoc(gameRef, {
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
