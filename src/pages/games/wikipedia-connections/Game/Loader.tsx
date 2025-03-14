import { useState, useEffect } from "react";
import gameFileUrl from "/dynamic/wikipedia-game.json?url";

import { Game } from "./Game";
import { ToastProvider } from "./Toasts";

export const Loader = () => {
  const [gameLink, setGameLink] = useState();
  useEffect(() => {
    let fetching = true;

    const today = new Date();
    const date = today.toISOString().split("T")[0];
    const url = gameFileUrl + "?date=" + date;

    fetch(url)
      .then((res) => {
        return res.json().then((data) => {
          if (fetching) {
            setGameLink(data["regular"]);
          }
        });
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  if (!gameLink) {
    return <div>Loading...</div>;
  }

  return (
    <ToastProvider>
      <Game gameType="regular" gameLink={gameLink} />
    </ToastProvider>
  );
};
