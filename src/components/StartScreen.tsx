import React from "react";
import styles from "./GameOver.module.css";

interface StartScreenProps {
  position: number;
  onStartNewGame: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  position,
  onStartNewGame,
}) => {
  return (
    <div className={styles["game-over"]}>
      <img src="/start_screen.jpg" />
      <button className={styles["new-game-button"]} onClick={onStartNewGame}>
        Start New Game
      </button>
    </div>
  );
};
