import { useEffect, useState } from "react";

export default function useSessionStorage(key, defaultValue = null) {
  const [value, setValue] = useState(() => {
    try {
      const saved = sessionStorage.getItem(key);
      if (saved !== null) {
        return JSON.parse(saved);
      }
      return defaultValue;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    const rawValue = JSON.stringify(value);
    sessionStorage.setItem(key, rawValue);
  }, [key, value]);

  return [value, setValue];
}
