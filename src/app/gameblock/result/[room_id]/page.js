"use client";
import { useEffect } from "react";
import { validateUser } from "@/utils/authentication";
import useSessionStorage from "@/hooks/useSessionStorage";
import { USER_STORAGE_KEY } from "@/constants";
import { useRouter } from "next/navigation";

export default function ResultPage({ params }) {
  const roomId = params.room_id;
  const [user] = useSessionStorage(USER_STORAGE_KEY);
  const router = useRouter();

  useEffect(() => {
    validateUser(roomId, user, router);
  }, []);

  return <div>This is result page</div>;
}
