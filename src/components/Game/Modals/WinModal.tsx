// @ts-ignore
import confetti from "canvas-confetti";
import { useEffect } from "react";
import { Modal } from "./Modal";
import type { Selection } from "../util";

type WinModalProps = {
  attempts: Selection[];
  correctGuesses: Selection;
  timerString: string;
  open: boolean;
  setOpen: (show: boolean) => void;
  addToast: (toast: { message: string }) => void;
};

export const WinModal = ({
  attempts,
  correctGuesses,
  timerString,
  open,
  setOpen,
  addToast,
}: WinModalProps) => {
  useEffect(() => {
    if (!open) {
      return;
    }
    confetti({
      particleCount: 400,
      angle: 45,
      spread: 90,
      gravity: 0.3,
      drift: 0.5,
      origin: { y: 1, x: 0 },
    });
    setTimeout(() => {
      confetti({
        particleCount: 400,
        angle: 135,
        spread: 90,
        gravity: 0.3,
        drift: 0.5,
        origin: { y: 1, x: 1 },
      });
    }, 500);
    setTimeout(() => {
      confetti({
        particleCount: 200,
        angle: 230,
        spread: 30,
        gravity: 0.3,
        drift: 0.5,
        origin: { y: -0.2, x: 0.5 },
      });
    }, 1100);
    setTimeout(() => {
      confetti({
        particleCount: 200,
        angle: 310,
        spread: 30,
        gravity: 0.3,
        drift: 0.5,
        origin: { y: -0.2, x: 0.5 },
      });
    }, 1200);
    setTimeout(() => {
      confetti({
        particleCount: 400,
        angle: 270,
        spread: 45,
        gravity: 0.6,
        drift: 0.5,
        origin: { y: -0.2, x: 0.5 },
        startingVelocity: 90,
      });
    }, 1500);
  }, [open]);

  if (!open) {
    return;
  }

  return (
    <>
      <div className="fixed inset-0 pointer-events-none">
        <canvas id="confetti-canvas" className="w-full h-full"></canvas>
      </div>
      <Modal
        title="Congratulations!"
        open={true}
        setOpen={setOpen}
        content={
          <>
            <p className="text-center">
              You beat the game in {attempts.length} attempts!
            </p>
            <div className="border-b border-gray-300 my-4" />
            Time: {timerString}
            <div className="border-b border-gray-300 my-4" />
            <div className="flex flex-col gap-2">
              Your attempts were:
              {attempts.map((choices, i) => (
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
          </>
        }
        actions={
          <>
            <button
              className="p-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition-colors duration-200 cursor-pointer"
              onClick={() => {
                let text = `I beat the daily Wikipedia Connections in ${attempts.length} attempts! Time: ${timerString}\n\n`;
                attempts.forEach((choices, i) => {
                  let row = "";
                  Object.entries(choices).forEach(([rowIndex, colIndex]) => {
                    if (
                      colIndex === correctGuesses[rowIndex as unknown as number]
                    ) {
                      row += "🟩";
                    } else {
                      row += "🟥";
                    }
                  });
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
                setOpen(false);
              }}
            >
              Done
            </button>
          </>
        }
      />
    </>
  );
};
