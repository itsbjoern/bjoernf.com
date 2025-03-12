import { useState, useEffect, useMemo } from "react";
// @ts-ignore
import confetti from "canvas-confetti";

interface Link {
  text: string;
  choice?: number;
  url: string;
  date: string;
  title: string;
  image?: string;
  summary: string;
  index: number;
  links: Link[];
}

interface Selection {
  [key: number]: number | null;
}

interface Toast {
  id?: number;
  message: string;
  color?: string;
  duration?: number;
}

function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const loadState = (gameType: string) => {
  const state = localStorage.getItem(`wikiSortGameState-${gameType}`);
  return state ? JSON.parse(state) : null;
};

const saveState = (gameType: string, state: any) => {
  localStorage.setItem(`wikiSortGameState-${gameType}`, JSON.stringify(state));
};

const colorMap = {
  0: "bg-red-100",
  1: "bg-cyan-100",
  2: "bg-slate-100",
  3: "bg-orange-100",
};

const formatTime = (startTime: number, cmp?: number) => {
  if (!startTime) {
    return "--:--";
  }
  const time = Math.floor(((cmp || Date.now()) - startTime) / 1000);
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
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
  const [popupContent, setPopupContent] = useState<Link | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [startTime, setStartTime] = useState(Date.now());
  const [winTime, setWinTime] = useState(null);

  const [timerString, setTimerString] = useState("00:00");

  const getRand = useMemo(() => {
    const parts = gameLink.date.split("-").map((part) => parseInt(part, 10));
    return mulberry32(parts.reduce((acc, part) => acc + part, 0));
  }, []);

  const shuffleArray = (array: any[]) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(getRand() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  };

  const choice = useMemo(
    () => Math.floor(getRand() * gameLink.links.length),
    [gameLink, getRand],
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

  const addToast = (toast: Toast) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, ...toast }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, toast.duration || 3000);
  };

  const handleSubmit = () => {
    let didWin = true;
    let correctGuesses: Selection = {};
    Object.entries(highlighted).forEach(([rowIndex, colIndex]) => {
      let row = parseInt(rowIndex, 10);
      if (rows[row][colIndex].index === lastItem!.index) {
        correctGuesses[row] = colIndex;
      } else {
        didWin = false;
      }
    });

    if (didWin) {
      setShowWinScreen(true);
      confetti({
        particleCount: 200,
        spread: 70,
        origin: { y: 0.6 },
      });
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

  const handleQuestionMarkClick = (link: Link) => {
    setPopupContent(link);
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
              handleQuestionMarkClick(gameLink!);
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
                      className={`p-2 flex flex-1 items-center justify-center text-center rounded-lg transition-all duration-200 bg-green-400`}
                    >
                      <b>{links[correctGuesses[rowIndex]].title}</b>
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
                              handleQuestionMarkClick(link);
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
                handleQuestionMarkClick(lastItem!);
              }}
            >
              ?
            </button>
          </div>
          <button
            className={`mt-4 p-2 bg-green-500 text-white rounded-lg shadow-md  ${
              hasWon || !canSubmit
                ? "opacity-50"
                : "hover:bg-green-600 transition-colors duration-200 cursor-pointer"
            }`}
            onClick={handleSubmit}
            disabled={!canSubmit || hasWon}
          >
            Check selection
          </button>
        </>

        {/* <div className="mt-4">
          <h2 className="text-xl font-bold">Previous guesses</h2>
          <div className="flex flex-col gap-6 bg-white rounded-lg p-4">
            {previousChoices.map((choices, i) => (
              <div key={i} className="flex gap-4">
                {Object.entries(choices).map(([rowIndex, colIndex]) => (
                  <div
                    key={rowIndex}
                    className={`flex flex-1 h-8 rounded-lg ${
                      colIndex === undefined || colIndex === null
                        ? "bg-red-300"
                        : colIndex ===
                          correctGuesses[rowIndex as unknown as number]
                        ? "bg-green-300"
                        : "bg-blue-200"
                    }`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div> */}
      </div>
      {showWinScreen ? (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50" />
          <div className="fixed inset-0 pointer-events-none">
            <canvas id="confetti-canvas" className="w-full h-full"></canvas>
          </div>
          <div className="fixed inset-x-2 md:inset-x-1/3 top-10 flex items-center justify-center">
            <div className="p-6 bg-white rounded-lg shadow-lg">
              <h2 className="text-3xl font-bold text-center">You won!</h2>
              <p className="text-center">
                You beat the game in {previousChoices.length} attempts!
              </p>
              <div className="border-b border-gray-300 my-4" />
              Time: {timerString}
              <div className="border-b border-gray-300 my-4" />
              <div className="flex flex-col gap-2">
                Your attempts were:
                {previousChoices.map((choices, i) => (
                  <div key={i} className="flex gap-2 bg-white rounded-lg">
                    {Object.entries(choices).map(([rowIndex, colIndex]) => (
                      <div
                        key={rowIndex}
                        className={`flex flex-1 h-8 rounded-lg ${
                          colIndex ===
                          correctGuesses[rowIndex as unknown as number]
                            ? "bg-green-300"
                            : "bg-red-300"
                        }`}
                      />
                    ))}
                  </div>
                ))}
              </div>
              <div className="border-b border-gray-300 my-4" />
              <div className="flex gap-4 justify-center">
                <button
                  className="p-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition-colors duration-200 cursor-pointer"
                  onClick={() => {
                    let text = `I beat the daily Wikipedia Connections in ${previousChoices.length} attempts! Time: ${timerString}\n\n`;
                    previousChoices.forEach((choices, i) => {
                      let row = "";
                      Object.entries(choices).forEach(
                        ([rowIndex, colIndex]) => {
                          if (
                            colIndex ===
                            correctGuesses[rowIndex as unknown as number]
                          ) {
                            row += "🟩";
                          } else {
                            row += "🟥";
                          }
                        },
                      );
                      text += row + "\n";
                    });
                    text += "\n";
                    text +=
                      "Play it yourself at https://bjoernf.com/games/wikipedia-connections";
                    navigator.clipboard.writeText(text);
                    addToast({ message: "Copied result to clipboard!" });
                  }}
                >
                  Share result
                </button>
                <button
                  className="p-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition-colors duration-200 cursor-pointer"
                  onClick={() => {
                    setShowWinScreen(false);
                  }}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </>
      ) : null}
      {showRulesModal ? (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50" />
          <div className="fixed inset-x-2 md:inset-x-1/3 top-2 md:top-10 flex items-center justify-center">
            <div className="p-6 bg-white rounded-lg shadow-lg">
              <h2 className="text-3xl font-bold text-center">How to Play</h2>
              <div className="flex flex-col max-h-[50vh] md:max-h-[70vh] overflow-auto">
                <p className="mt-4 text-center">
                  Every day you will be shown a random page of a Wikipedia
                  entry. For each page, it gives you a list of pages that it
                  links to. Then it shows the page that the last page links to,
                  and that one links to another page, and so on.
                </p>
                <p className="mt-4 text-center">
                  Your goal is to navigate from the start page to the end page
                  by correctly identifying the links between the pages that lead
                  you to the correct ending page. You can use the questionmark
                  to learn more about a page. To not spoil the game for
                  yourself, don't use the Wikipedia link unless you absolutely
                  have to.
                </p>
                <p className="mt-4 text-center">
                  When you have made a selection for all links, press the
                  "Check" button to see if you have made the correct choices.
                </p>
              </div>
              <div className="border-b border-gray-300 my-4" />
              <div className="flex gap-4 justify-center">
                <button
                  className="p-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition-colors duration-200 cursor-pointer"
                  onClick={() => {
                    setShowRulesModal(false);
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </>
      ) : null}
      {popupContent && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50" />
          <div className="fixed inset-x-2 md:inset-x-1/3 top-2 md:top-10 flex items-center justify-center">
            <div className="p-6 bg-white rounded-lg shadow-lg">
              <div className="flex flex-row md:flex-col gap-4 items-center">
                {popupContent.image ? (
                  <img
                    src={popupContent.image}
                    alt={popupContent.title}
                    className="w-16 h-16 md:w-32 md:h-32 md:mx-auto rounded-lg object-cover"
                  />
                ) : null}
                <h2 className="text-2xl font-bold md:text-center">
                  {popupContent.title}
                </h2>
              </div>
              <p className="mt-4 text-center max-h-[30vh] md:max-h-[70vh] overflow-auto">
                {popupContent.summary}
              </p>
              <a
                href={popupContent.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block mt-4 text-center text-blue-500 underline"
              >
                Read more on Wikipedia
              </a>
              <div className="border-b border-gray-300 my-4" />
              <div className="flex gap-4 justify-center">
                <button
                  className="p-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition-colors duration-200 cursor-pointer"
                  onClick={() => {
                    setPopupContent(null);
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </>
      )}
      <div className="fixed inset-x-2 md:inset-x-1/3 top-10 flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`p-2 ${
              toast.color || "bg-gray-800"
            } text-white rounded-lg shadow-md transition-all`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
};
