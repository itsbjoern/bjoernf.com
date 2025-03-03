import { useState, useEffect } from "react";
import gameFileUrl from "/wikipedia-game.json?url";

import { Game } from "./Game";

export const Loader = () => {
  const [gameLink, setGameLink] = useState();
  useEffect(() => {
    let fetching = true;
    fetch(gameFileUrl)
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

  return <Game gameType="regular" gameLink={gameLink} />;
};
