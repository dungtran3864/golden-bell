"use client";
import useQuestion from "@/hooks/useQuestion";

export default function Gameblock({ params }) {
  const roomId = params.room_id;
  const [currQuestion] = useQuestion(roomId);

  return (
    <form>
      <p>Question: {currQuestion?.question}</p>
      <label htmlFor="answer">Type in your answer:</label>
      <input type="text" id="answer" name="answer" /><br/>
      <button type={"button"}>Submit</button>
    </form>
  );
}
