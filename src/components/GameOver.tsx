import React from "react";
import styles from "./GameOver.module.css";

interface GameOverProps {
  position: number;
  onStartNewGame: () => void;
}

export const GameOver: React.FC<GameOverProps> = ({
  position,
  onStartNewGame,
}) => {
  return (
    <div className={styles["game-over"]}>
      <div className={styles["game-over-message"]}>
        You finished in {position}
        {position === 1
          ? "st"
          : position === 2
          ? "nd"
          : position === 3
          ? "rd"
          : "th"}{" "}
        place!
      </div>
      <button className={styles["new-game-button"]} onClick={onStartNewGame}>
        Start New Game
      </button>
    </div>
  );
};
