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
      <button className={styles["new-game-button"]} onClick={onStartNewGame}>
        Start New Game
      </button>
    </div>
  );
};
