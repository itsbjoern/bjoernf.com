import { useState, useEffect, useMemo } from "react";

import { RulesModal } from "./Modals/RulesModal";
import { LinkModal } from "./Modals/LinkModal";
import { WinModal } from "./Modals/WinModal";
import {
  colorMap,
  formatTime,
  loadState,
  saveState,
  SeededRandom,
  type Link,
  type Selection,
} from "./util";
import { Toasts, useToast } from "./Toasts";

type SubmitButtonProps = {
  canSubmit: boolean;
  hasWon: boolean;
  handleSubmit: () => void;
};

const SubmitButton = ({
  canSubmit,
  hasWon,
  handleSubmit,
}: SubmitButtonProps) => {
  return (
    <button
      className={`p-2 bg-green-500 text-white rounded-lg shadow-md  ${
        hasWon || !canSubmit
          ? "opacity-50"
          : "hover:bg-green-600 transition-colors duration-200 cursor-pointer"
      }`}
      onClick={handleSubmit}
      disabled={!canSubmit || hasWon}
    >
      Check selection
    </button>
  );
};

export const Game = ({
  gameType,
  gameLink,
}: {
  gameType: string;
  gameLink: Link;
}) => {
  const [highlighted, setHighlighted] = useState<Selection>({});
  const [previousChoices, setPreviousChoices] = useState<Selection[]>([]);
  const [showWinScreen, setShowWinScreen] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [popupLink, setPopupLink] = useState<Link | null>(null);
  const [startTime, setStartTime] = useState(Date.now());
  const [winTime, setWinTime] = useState(null);

  const [timerString, setTimerString] = useState("00:00");
  const { addToast } = useToast();

  const randomiser = useMemo(() => {
    const parts = gameLink.date.split("-").map((part) => parseInt(part, 10));
    const seed = parts.reduce((acc, part) => acc + part, 0);
    return new SeededRandom(seed);
  }, [gameLink.date]);

  const shuffleArray = (array: any[]) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(randomiser.next() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  };

  const choice = useMemo(
    () => Math.floor(randomiser.next() * gameLink.links.length),
    [gameLink, randomiser],
  );

  const [rows, lastItem] = useMemo(() => {
    const rows: Link[][] = [];

    gameLink.links.forEach((link, i) => {
      if (!rows[i]) {
        rows[i] = [];
      }
      let rowIndex = 0;
      link.index = i;

      rows[rowIndex].push(link);

      let currentLink = link.links[0];
      while (currentLink) {
        currentLink.index = i;
        rowIndex++;
        if (!rows[rowIndex]) {
          rows[rowIndex] = [];
        }
        rows[rowIndex].push(currentLink);
        currentLink = currentLink.links[0];
      }
    });

    const lastItem = rows.splice(rows.length - 1, 1)[0];

    rows.forEach((row, rowIndex) => {
      shuffleArray(row);
    });

    return [rows, lastItem[choice]];
  }, [gameLink]);

  const correctGuesses = previousChoices.reduce((acc, choices) => {
    Object.entries(choices).forEach(([rowIndex, colIndex]) => {
      const row = parseInt(rowIndex, 10);
      if (colIndex === null) {
        acc[row] = null;
      } else if (rows[row][colIndex].index === lastItem?.index) {
        acc[row] = colIndex;
      }
    });
    return acc;
  }, {});

  const canSubmit =
    Object.values(highlighted).filter(
      (val) => val !== undefined && val !== null,
    ).length === rows.length;

  const hasWon =
    Object.values(correctGuesses).filter(
      (val) => val !== undefined && val !== null,
    ).length === rows.length;

  useEffect(() => {
    if (hasWon) {
      return;
    }
    let interval = setInterval(() => {
      setTimerString(formatTime(startTime));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, hasWon]);

  useEffect(() => {
    const savedState = loadState(gameType);
    if (savedState && savedState.dayDate === gameLink.date) {
      setPreviousChoices(savedState.previousChoices);
      setShowWinScreen(savedState.hasWon);

      setStartTime(savedState.startTime);
      setWinTime(savedState.winTime);
      setTimerString(formatTime(savedState.startTime, savedState.winTime));

      // @ts-ignore
      const correct = savedState.previousChoices.reduce((acc, choices) => {
        Object.entries(choices).forEach(([rowIndex, colIndex]) => {
          const row = parseInt(rowIndex, 10);
          if (colIndex === null) {
            acc[row] = null;
            // @ts-ignore
          } else if (rows[row][colIndex].index === lastItem?.index) {
            acc[row] = colIndex;
          }
        });
        return acc;
      }, {});

      setHighlighted(correct);
    } else {
      setHighlighted({});
      setPreviousChoices([]);
      setShowWinScreen(false);
    }
  }, [gameType, gameLink]);

  const handleLinkClick = (rowIndex: number, colIndex: number) => {
    if (
      correctGuesses[rowIndex] !== undefined &&
      correctGuesses[rowIndex] !== null
    ) {
      return;
    }

    const incorrectGuess = previousChoices.some(
      (choice) =>
        choice[rowIndex] === colIndex &&
        rows[rowIndex][choice[rowIndex]].index !== lastItem?.index,
    );
    if (incorrectGuess) {
      return;
    }

    setHighlighted((prev) => ({
      ...prev,
      [rowIndex]: prev[rowIndex] === colIndex ? null : colIndex,
    }));
  };

  const handleSubmit = () => {
    let didWin = true;
    let correctGuesses: Selection = {};
    Object.entries(highlighted).forEach(([rowIndex, colIndex]) => {
      let row = parseInt(rowIndex, 10);
      if (rows[row][colIndex!].index === lastItem!.index) {
        correctGuesses[row] = colIndex;
      } else {
        didWin = false;
      }
    });

    if (didWin) {
      setShowWinScreen(true);
    } else {
      if (Object.keys(correctGuesses).length === rows.length - 1) {
        addToast({
          message: "Almost there, try again!",
          color: "bg-red-400",
        });
      } else {
        addToast({ message: "Not quite, try again!", color: "bg-red-400" });
      }
    }

    saveState(gameType, {
      dayDate: gameLink.date,
      previousChoices: [...previousChoices, highlighted],
      hasWon: didWin,
      startTime,
      winTime: didWin ? Date.now() : null,
    });

    setHighlighted(correctGuesses);
    setPreviousChoices((prev) => [...prev, highlighted]);
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg shadow-lg width-full relative">
      <h1 className="text-3xl font-bold ">Wiki Connections</h1>
      <p>Daily Wikipedia connections, can you beat it?</p>
      <div className="border-b border-gray-300 mt-4 mb-2" />
      <div className="absolute top-4 right-4 flex gap-2">
        {hasWon ? (
          <button
            className="text-sm p-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition-colors duration-200 cursor-pointer"
            onClick={() => setShowWinScreen(true)}
          >
            Check win
          </button>
        ) : null}
        <button
          className="text-sm p-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition-colors duration-200 cursor-pointer"
          onClick={() => setShowRulesModal(true)}
        >
          How to play
        </button>
      </div>
      <div className="mb-2">Elapsed time: {timerString}</div>

      <div className="flex flex-col gap-4">
        <SubmitButton
          canSubmit={canSubmit}
          hasWon={hasWon}
          handleSubmit={handleSubmit}
        />
        <div className="p-3 gap-4 items-center bg-blue-500 text-white rounded-lg relative flex">
          {gameLink!.image ? (
            <img
              src={gameLink!.image}
              alt={gameLink!.title}
              className="flex-0 w-16 h-16 mx-auto rounded-lg object-cover"
            />
          ) : null}
          <div className="flex-1 -mt-1">
            <span className="text-xs">Starting at</span>
            <p>
              <strong>{gameLink!.title}</strong>
            </p>
          </div>
          <button
            className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full transition-colors hover:bg-blue-400"
            onClick={(e) => {
              e.stopPropagation();
              setPopupLink(gameLink!);
            }}
          >
            ?
          </button>
        </div>

        <>
          <div className="flex flex-col bg-white p-4 gap-4 md:gap-2 rounded-lg">
            {rows.map((links, rowIndex) => (
              <>
                <div
                  className="flex gap-1 md:gap-4 flex-col md:flex-row"
                  key={rowIndex}
                >
                  {!hasWon &&
                  correctGuesses[rowIndex] !== undefined &&
                  correctGuesses[rowIndex] !== null ? (
                    <div
                      className={`relative p-2 flex flex-1 items-center justify-center text-center rounded-lg transition-all duration-200 bg-green-400`}
                    >
                      <b>{links[correctGuesses[rowIndex]].title}</b>
                      <button
                        className="absolute -top-2 -right-2 w-6 h-6 bg-gray-200 rounded-full transition-colors hover:bg-gray-300"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPopupLink(links[correctGuesses[rowIndex]!]);
                        }}
                      >
                        ?
                      </button>
                    </div>
                  ) : (
                    links.map((link, colIndex) => {
                      const incorrectGuess = previousChoices.some(
                        (choice) =>
                          choice[rowIndex] === colIndex &&
                          rows[rowIndex][choice[rowIndex]].index !==
                            lastItem?.index,
                      );

                      return (
                        <div
                          key={colIndex}
                          className={`p-2 flex flex-1 items-center justify-center text-center rounded-lg cursor-pointer transition-colors duration-200 relative ${
                            correctGuesses[rowIndex] === colIndex &&
                            !showWinScreen
                              ? "bg-green-400"
                              : hasWon && !showWinScreen
                              ? colorMap[link.index as keyof typeof colorMap]
                              : incorrectGuess && !showWinScreen
                              ? "bg-red-300"
                              : highlighted[rowIndex] === colIndex &&
                                !showWinScreen
                              ? "bg-blue-200"
                              : "bg-gray-200 hover:bg-gray-300"
                          }`}
                          onClick={() => handleLinkClick(rowIndex, colIndex)}
                        >
                          <b>{link.title}</b>
                          <button
                            className="absolute -top-2 -right-2 w-6 h-6 bg-gray-200 rounded-full transition-colors hover:bg-gray-300"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPopupLink(link);
                            }}
                          >
                            ?
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
                {rowIndex < rows.length - 1 ? (
                  <div className="flex justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 14l-7 7m0 0l-7-7m7 7V3"
                      />
                    </svg>
                  </div>
                ) : null}
              </>
            ))}
          </div>
          <div className="p-3 gap-4 items-center bg-blue-500 text-white rounded-lg relative flex">
            {lastItem!.image ? (
              <img
                src={lastItem!.image}
                alt={lastItem!.title}
                className="flex-0 w-16 h-16 mx-auto rounded-lg object-cover"
              />
            ) : null}
            <div className="flex-1 -mt-1">
              <span className="text-xs">To</span>
              <p>
                <strong>{lastItem!.title}</strong>
              </p>
            </div>
            <button
              className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full transition-colors hover:bg-blue-400"
              onClick={(e) => {
                e.stopPropagation();
                setPopupLink(lastItem);
              }}
            >
              ?
            </button>
          </div>
          <SubmitButton
            canSubmit={canSubmit}
            hasWon={hasWon}
            handleSubmit={handleSubmit}
          />
        </>
      </div>
      <WinModal
        open={showWinScreen}
        setOpen={setShowWinScreen}
        attempts={previousChoices}
        correctGuesses={correctGuesses}
        timerString={timerString}
        addToast={addToast}
      />
      <RulesModal open={showRulesModal} setOpen={setShowRulesModal} />
      <LinkModal
        link={popupLink}
        setLink={() => {
          setPopupLink(null);
        }}
      />
      <Toasts />
    </div>
  );
};
