"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import Keycap from "./components/keycap/Keycap";
import { generateRandomSequence } from "./helpers";
import { Roboto_Mono } from "next/font/google";
import useLocalStorageState from "use-local-storage-state";
import "./page.css";
import {
  LossByLetGoInformation,
  LossByTimeInformation,
  LossByWrongInputInformation,
} from "./types";
import {
  BEGINNING_LENGTH,
  BEGINNING_LEVEL,
  BEGINNING_TIMER,
  PLAYBACK_RATE_DEFAULT,
} from "./constants";
import { themeChange } from "theme-change";
import { TypeAnimation } from "react-type-animation";
import { useTimer } from "react-timer-hook";
import useSound from "use-sound";
import beepSound from "/public/audio/beep.mp3";

const robotoMono = Roboto_Mono({
  weight: "400",
  subsets: ["latin"],
});

const App = () => {
  const [currentLevel, setCurrentLevel] = useState(BEGINNING_LEVEL);
  const [currentLength, setCurrentLength] = useState(BEGINNING_LENGTH);
  const [currentInput, setCurrentInput] = useState("");
  const [currentSequence, setCurrentSequence] = useState("");
  const [isLevelStarted, setIsLevelStarted] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(BEGINNING_TIMER);
  const [lossByLetGo, setLossByLetGo] = useState<LossByLetGoInformation | null>(
    null
  );
  const [lossByWrongInput, setLossByWrongInput] =
    useState<LossByWrongInputInformation | null>(null);
  const [lossByTime, setLossByTime] = useState<LossByTimeInformation | null>(
    null
  );
  const [lastEnteredKey, setLastEnteredKey] = useState("");
  const { seconds, restart, pause } = useTimer({
    expiryTimestamp: (() => {
      const time = new Date();

      time.setSeconds(time.getSeconds() + BEGINNING_TIMER);

      return time;
    })(),
    onExpire: () => {
      setPlaybackRate(PLAYBACK_RATE_DEFAULT);

      setLossByTime({
        level: currentLevel,
        sequence: currentSequence,
      });
      setIsLevelStarted(false);
      setCurrentLevel(BEGINNING_LEVEL);
      setCurrentInput("");
      setCurrentSequence(generateRandomSequence(currentLength));
    },
    autoStart: false,
  });
  const [highScore, setHighScore] = useLocalStorageState("highScore", {
    defaultValue: 0,
  });
  const [theme, setTheme] = useLocalStorageState("forest", {
    defaultValue: "forest",
  });
  const [playbackRate, setPlaybackRate] = useState(PLAYBACK_RATE_DEFAULT);
  const [play] = useSound(beepSound, {
    playbackRate,
    interrupt: false,
  });

  const keycaps = useMemo(
    () =>
      currentSequence.split("").map((c) => {
        return (
          <Keycap
            key={crypto.randomUUID()}
            character={c.toUpperCase()}
            isPressed={currentInput.includes(c)}
          />
        );
      }),
    [currentSequence, currentInput]
  );

  const timerDots = useMemo(
    () => (
      <div className="flex flex-row gap-4">
        {[...Array(seconds)].map((_, index) => (
          <div key={index} className="w-5 h-5 rounded-full timerDot" />
        ))}
      </div>
    ),
    [seconds]
  );

  const onKeyDown = useCallback(
    (event: globalThis.KeyboardEvent) => {
      setLastEnteredKey(event.key);

      if (!isLevelStarted && event.key === "Enter") {
        const time = new Date();

        time.setSeconds(time.getSeconds() + timerSeconds);

        restart(time, true);

        setPlaybackRate(PLAYBACK_RATE_DEFAULT);

        setLossByLetGo(null);
        setLossByWrongInput(null);
        setLossByTime(null);
        setCurrentInput("");
        setIsLevelStarted(true);
      }

      if (!isLevelStarted) {
        return;
      }

      if (event.repeat) {
        return;
      }

      play();

      setPlaybackRate((prev) => prev + 0.25);

      setCurrentInput((prev) => prev + event.key.toLowerCase());
    },
    [isLevelStarted, restart, timerSeconds]
  );

  const onKeyUp = useCallback(
    (event: globalThis.KeyboardEvent) => {
      if (
        isLevelStarted &&
        currentInput !== currentSequence &&
        event.key !== "Enter"
      ) {
        pause();

        setPlaybackRate(PLAYBACK_RATE_DEFAULT);

        setLossByLetGo({
          level: currentLevel,
          sequence: currentSequence,
          character: event.key,
        });
        setIsLevelStarted(false);
        setCurrentLevel(BEGINNING_LEVEL);
        setCurrentInput("");
        setCurrentSequence(generateRandomSequence(currentLength));
      }
    },
    [
      currentInput,
      currentLength,
      currentLevel,
      currentSequence,
      isLevelStarted,
      pause,
    ]
  );

  // KEY COUNT INCREASES
  useEffect(() => {
    switch (currentLevel) {
      case 1:
        setCurrentLength(BEGINNING_LENGTH); // 3
        setTimerSeconds(BEGINNING_TIMER); // 5
        break;
      case 5:
        setCurrentLength((prev) => ++prev); // 4
        setTimerSeconds((prev) => ++prev); // 6
        break;
      case 15:
        setCurrentLength((prev) => ++prev); // 5
        setTimerSeconds((prev) => prev + 2); // 8
        break;
      case 30:
        setCurrentLength((prev) => ++prev); // 6
        setTimerSeconds((prev) => prev + 2); // 10
        break;
      case 50:
        setCurrentLength((prev) => ++prev); // 7
        setTimerSeconds((prev) => prev + 2); // 12
        break;
      case 75:
        setCurrentLength((prev) => ++prev); // 8
        setTimerSeconds((prev) => ++prev); // 13
        break;
      case 105:
        setCurrentLength((prev) => ++prev); // 9
        setTimerSeconds((prev) => ++prev); // 14
        break;
      case 140:
        setCurrentLength((prev) => ++prev); // 10
        setTimerSeconds((prev) => ++prev); // 15
        break;
      case 145:
        setCurrentLength((prev) => ++prev); // 11
        setTimerSeconds((prev) => ++prev); // 16
        break;
      case 150:
        setCurrentLength((prev) => ++prev); // 12
        setTimerSeconds((prev) => ++prev); // 17
        break;
      default:
        break;
    }
  }, [currentLevel]);

  // INPUT TYPE WIN & LOSE CONDITIONS
  useEffect(() => {
    // LOSE BY WRONG INPUT
    const currentSequenceToCompare = currentSequence.substring(
      0,
      currentInput.length
    );

    if (currentInput !== currentSequenceToCompare) {
      pause();

      setPlaybackRate(PLAYBACK_RATE_DEFAULT);

      setLossByWrongInput({
        level: currentLevel,
        sequence: currentSequence,
        character: lastEnteredKey,
        expectedCharacter:
          currentSequenceToCompare[currentSequenceToCompare.length - 1],
      });
      setIsLevelStarted(false);
      setCurrentLevel(BEGINNING_LEVEL);
      setCurrentInput("");
      setCurrentSequence(generateRandomSequence(currentLength));
    }

    // WIN LEVEL
    if (
      currentSequence.length === currentLength &&
      currentInput === currentSequence
    ) {
      if (currentLevel > highScore) {
        setHighScore(currentLevel);
      }
      pause();

      setIsLevelStarted(false);
      setCurrentLevel((prev) => ++prev);
      setCurrentInput("");
      setCurrentSequence(generateRandomSequence(currentLength));
    }
  }, [
    currentInput,
    currentLength,
    currentLevel,
    currentSequence,
    highScore,
    lastEnteredKey,
    pause,
    setHighScore,
  ]);

  // ADD & REMOVE EVENT HANDLERS
  useEffect(() => {
    document.addEventListener("keydown", onKeyDown);

    if (isLevelStarted) {
      document.addEventListener("keyup", onKeyUp);
    } else {
      document.removeEventListener("keyup", onKeyUp);
    }

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keyup", onKeyUp);
    };
  }, [isLevelStarted, onKeyDown, onKeyUp]);

  // FIX HYDRATION ISSUE
  useEffect(() => {
    setCurrentSequence(generateRandomSequence(currentLength));
  }, [currentLength]);

  useEffect(() => {
    themeChange(false);
  }, []);

  return (
    <div className={`${robotoMono.className} h-full`}>
      <div className="flex flex-row justify-between items-center">
        <div className="dropdown w-96 invisible">
          <div tabIndex={0} role="button" className="btn text-base font-normal">
            Theme
            <svg
              width="12px"
              height="12px"
              className="h-2 w-2 fill-current opacity-60 inline-block"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 2048 2048"
            >
              <path d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z"></path>
            </svg>
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content z-[1] p-2 shadow-2xl bg-base-300 rounded-box w-52 mt-1"
          >
            <li>
              <input
                data-set-theme="forest"
                type="radio"
                name="theme-dropdown"
                className="theme-controller btn btn-sm btn-block btn-ghost justify-start font-normal"
                aria-label="Forest"
                value="forest"
                checked={theme === "forest"}
                onChange={() => {
                  setTheme("forest");
                }}
              />
            </li>
          </ul>
        </div>
        {!isLevelStarted && <div>GALACTIC BREACH</div>}
        {!isLevelStarted && (
          <div className="w-96 text-right">
            DEEPEST SECURITY LAYER BREACHED: {highScore}
          </div>
        )}
      </div>
      {isLevelStarted ? (
        <div className="flex flex-col justify-center items-center gap-20 h-[calc(100%-50px)]">
          <div className="flex flex-row gap-4">{keycaps}</div>
          {timerDots}
        </div>
      ) : (
        <div className="flex flex-col justify-center items-center gap-20 h-[calc(100%-50px)]">
          {currentLevel === 1 && (
            <div className="flex flex-col justify-center items-center">
              {lossByLetGo && (
                <div className="loss-reason">
                  You got booted on security layer {lossByLetGo.level} by
                  letting go of {lossByLetGo.character.toUpperCase()} in{" "}
                  {lossByLetGo.sequence.toUpperCase()}.
                </div>
              )}
              {lossByWrongInput && (
                <div className="loss-reason">
                  You got booted on security layer {lossByWrongInput.level} by
                  pressing {lossByWrongInput.character.toUpperCase()} instead of{" "}
                  {lossByWrongInput.expectedCharacter.toUpperCase()} in{" "}
                  {lossByWrongInput.sequence.toUpperCase()}.
                </div>
              )}
              {lossByTime && (
                <div className="loss-reason">
                  You got booted on security layer {lossByTime.level} by running
                  out of time finishing {lossByTime.sequence.toUpperCase()}.
                </div>
              )}
              {!lossByLetGo && !lossByTime && !lossByWrongInput && (
                <>
                  <div className="mb-5">
                    <TypeAnimation
                      sequence={["THE HUMAN CIVILIZATION NEEDS YOUR HELP!"]}
                      speed={50}
                      cursor={false}
                    />
                  </div>
                  <div className="mr-auto">
                    <TypeAnimation
                      style={{ whiteSpace: "pre-line" }}
                      sequence={[
                        `Greetings, human. Our forces require your expertise to breach the enemy aliens' central control system.\n\nBelow are the instructions you'll need to initiate the infiltration:\n\n- Ensure you are using a keyboard with high-level N-Key Rollover (NKRO) functionality\n- Each security layer will present a sequence of random keys\n- You must press and hold each key, one after the other from left to right\n- You'll have a finite amount of time for each security layer`,
                      ]}
                      speed={75}
                      cursor={false}
                    />
                  </div>
                </>
              )}
            </div>
          )}
          <div className="blink">
            PRESS ENTER TO BREACH SECURITY LAYER {currentLevel}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
