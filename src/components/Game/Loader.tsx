import { useState, useEffect } from "react";
import { API_BASE_URL } from "@/utils/api";

import { Game } from "./Game";
import { ToastProvider } from "./Toasts";

export const Loader = () => {
  const [gameLink, setGameLink] = useState();
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;

    fetch(API_BASE_URL + "/wikipedia/today")
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load puzzle: ${res.status}`);
        return res.json();
      })
      .then((puzzle) => {
        if (active) setGameLink(puzzle);
      })
      .catch((err) => {
        console.error(err);
        if (active) setError(true);
      });

    return () => {
      active = false;
    };
  }, []);

  if (error) {
    return <div>Today's puzzle couldn't be loaded, please try again later.</div>;
  }

  if (!gameLink) {
    return <div>Loading today's puzzle...</div>;
  }

  return (
    <ToastProvider>
      <Game gameType="regular" gameLink={gameLink} />
    </ToastProvider>
  );
};
