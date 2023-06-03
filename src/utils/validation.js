import { getSingleDocument } from "@/firebase/utils";
import { GAMES_PATH, USERS_PATH } from "@/constants";

export async function validateUser(roomId, user, router) {
  const roomData = await getSingleDocument(GAMES_PATH, roomId);
  // Check if room exists
  if (!roomData) {
    router.push("/");
    return () => {};
  }
  // Check if user exists and joined the room
  if (user == null) {
    router.push("/");
    return () => {};
  } else {
    const userData = await getSingleDocument(USERS_PATH, user);
    if (!userData || userData.roomId !== roomId) {
      router.push("/");
      return () => {};
    }
  }
}
