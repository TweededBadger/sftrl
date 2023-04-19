import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { Main } from "./game/Main";
import { Player } from "./game/Player";

type GameState = {
  numAlivePlayers: number;
  numPlayers: number;
  turnNumber: number;
  actionsLeft: number;
  playerHealth: number;
  player?: Player;
};

const main = new Main(30);
main.start();

function App() {
  const [gameState, setGameState] = useState<GameState>({
    numAlivePlayers: main.numAlivePlayers,
    numPlayers: main.numPlayer,
    turnNumber: 0,
    actionsLeft: 0,
    playerHealth: 0,
  });

  useEffect(() => {
    const handleCurrentState = (currentState: GameState) => {
      console.log({ currentState });
      setGameState(currentState);
    };

    main.events.on("currentState", handleCurrentState);

    // Cleanup the event listener when the component is unmounted
    return () => {
      main.events.off("currentState", handleCurrentState);
    };
  }, []);

  if (!gameState.player) return null;

  const { player } = gameState;

  return (
    <div className="App">
      <h1>
        {gameState.numPlayers} {gameState.numAlivePlayers}
      </h1>
      <h2>
        Turn: {gameState.turnNumber} Actions taken: {player.actionsTaken}{" "}
        Health: {player.health} Current Weapon: {player.currentWeapon} Armour:{" "}
        {player.armour}
      </h2>

      <div className="actions">
        {gameState.player.availableActions.map((action) => (
          <button
            key={action}
            onClick={() => {
              main.performAction(action);
            }}
          >
            {action}
          </button>
        ))}
      </div>
    </div>
  );
}

export default App;
