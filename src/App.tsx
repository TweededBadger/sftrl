import { useEffect, useRef, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { Main } from "./game/Main";
import { Player } from "./game/Player";
import { AiOutlineZoomIn, AiOutlineZoomOut } from "react-icons/ai";
import { BsFillShieldFill } from "react-icons/bs";
import { FaHeart, FaClock } from "react-icons/fa";
import { GrActions } from "react-icons/gr";
import { IoPeople } from "react-icons/io5";
import ActionButton from "./components/ActionButton";
import WeaponIcon from "./components/WeaponIcon";
import { Combat } from "./game/Combat";
import { CombatDisplay } from "./components/CombatDisplay";
import { GameOver } from "./components/GameOver";


import './index.css'
import { StartScreen } from "./components/StartScreen";
import { useFullScreen } from "./hooks/useFullScreen";

type GameState = {
  numAlivePlayers: number;
  numPlayers: number;
  turnNumber: number;
  actionsLeft: number;
  playerHealth: number;
  player?: Player;
  currentCombat?: Combat;
  gameState?: "NOT_PLAYING" | "PLAYING" | "GAME_OVER";
};

// const main = new Main(50);

function App() {

  const { ref, toggleFullScreen } = useFullScreen();

  const [gameState, setGameState] = useState<GameState>({
    numAlivePlayers: 0,
    numPlayers: 0,
    turnNumber: 0,
    actionsLeft: 0,
    playerHealth: 0,
  });

  const main = useRef<Main>();
  const canvas = useRef<HTMLCanvasElement>(
    null
    // document.getElementById("hex-grid-canvas") as HTMLCanvasElement
  );

  useEffect(() => {
    if (!canvas.current) return;
    if (canvas.current) {
      canvas.current.width = window.innerWidth;
      canvas.current.height = window.innerHeight;
    }
    if (!main.current) {
      main.current = new Main(canvas.current);
    }
    const handleCurrentState = (currentState: GameState) => {
      console.log(currentState);
      setGameState(currentState);
      if (currentState.currentCombat) console.log(currentState.currentCombat);
    };

    main.current.events.on("currentState", handleCurrentState);

    const handleResize = () => {
      if (canvas.current) {
        canvas.current.width = window.innerWidth;
        canvas.current.height = window.innerHeight;
      }
      main.current?.render();
    };

    window.addEventListener("resize", handleResize);

    if (main.current.gameState === "NOT_INIT") {
      main.current.start();
    }
    // Cleanup the event listener when the component is unmounted
    return () => {
      main.current?.events.off("currentState", handleCurrentState);
      window.removeEventListener("resize", handleResize);
    };
  }, [canvas.current]);

  // if (!gameState.player) return null;

  const player = gameState.player;

  return (
    <div className="App" ref={ref}>
      {player && <><div className="left-panel">
        <div>
          <div>
            <IoPeople />
          </div>
          {gameState.numAlivePlayers}
        </div>
        <div>
          <div>
            <FaClock />
          </div>
          {gameState.turnNumber}
        </div>
        <button onClick={() => main.current?.zoomIn()}>
          <AiOutlineZoomIn />
        </button>
        <button onClick={() => main.current?.zoomOut()}>
          <AiOutlineZoomOut />
        </button>
      </div>
        <div className="right-panel">
          <div>
            <div>
              <FaHeart />
            </div>
            {player.health}
          </div>
          <div>
            <div>
              <BsFillShieldFill />
            </div>
            {player.armour}
          </div>
          <div>
            <WeaponIcon weapon={player.currentWeapon} />
          </div>

          <div>
            <div>
              <GrActions />
            </div>
            {player.actionsTaken}/{player.actionsPerTurn}
          </div>
          {player.availableActions.map((action) => (
            <ActionButton
              action={action}
              key={action}
              onClick={() => {
                main.current?.performAction(action);
              }}
              highlight={
                player.actionsTaken === player.actionsPerTurn &&
                action === "END_TURN"
              }
            />
          ))}
        </div> </>}

      {gameState.currentCombat && (
        <div className="combat-panel">
          <CombatDisplay
            combat={gameState.currentCombat}
            onCombatStep={() => main.current?.nextCombatStep()}
          />
        </div>
      )}

      {gameState.gameState === "GAME_OVER" && (
        <div className="game-over-screen">
          <GameOver
            position={gameState.numAlivePlayers}
            onStartNewGame={() => {
              main.current?.reset();
            }}
          />
        </div>
      )}

      {gameState.gameState === "NOT_PLAYING" && (
        <div className="game-over-screen">
          <StartScreen
            position={gameState.numAlivePlayers}
            onStartNewGame={() => {
              toggleFullScreen();
              main.current?.reset();
            }}
          />
        </div>
      )}
      {/* <h1>
        {gameState.numPlayers} {gameState.numAlivePlayers}
      </h1>
      <button onClick={() => main.current?.zoomIn()}>+</button>
      <button onClick={() => main.current?.zoomOut()}>-</button>
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
              main.current?.performAction(action);
            }}
          >
            {action}
          </button>
        ))}
      </div> */}

      <canvas
        className="hex-grid-canvas"
        ref={canvas}
        width="100%"
        height="100%"
      />
    </div>
  );
}

export default App;
