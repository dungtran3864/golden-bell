import { getSingleDocument } from "@/firebase/utils";
import { GAMES_PATH } from "@/constants";

export async function validateUser(roomId, user, router) {
  const roomData = await getSingleDocument(GAMES_PATH, roomId);
  if (!roomData) {
    router.push("/");
    return () => {};
  }
  if (user == null) {
    router.push("/");
    return () => {};
  }
}
