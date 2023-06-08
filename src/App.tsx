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
import { Combat, weaponStats } from "./game/Combat";
import { CombatDisplay } from "./components/CombatDisplay";
import { GameOver } from "./components/GameOver";

import "./index.css";
import { StartScreen } from "./components/StartScreen";
import { useFullScreen } from "./hooks/useFullScreen";
import SpriteCanvas from "./components/SingleSprite";

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
  const canvas2 = useRef<HTMLCanvasElement>(
    null
    // document.getElementById("hex-grid-canvas") as HTMLCanvasElement
  );

  useEffect(() => {
    if (!canvas.current || !canvas2.current) return;
    if (canvas.current) {
      canvas.current.width = window.innerWidth;
      canvas.current.height = window.innerHeight;
    }
    if (canvas2.current) {
      canvas2.current.width = window.innerWidth;
      canvas2.current.height = window.innerHeight;
    }
    if (!main.current) {
      main.current = new Main(canvas.current, canvas2.current);
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
      if (canvas2.current) {
        canvas2.current.width = window.innerWidth;
        canvas2.current.height = window.innerHeight;
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
      {player && (
        <>
          <div className="left-panel">
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
              {main.current && main.current.spritesLoaded && (
                <SpriteCanvas
                  spriteManager={main.current.spriteManager}
                  sheetId="ITEMS"
                  spriteKey="HEALTH"
                />
              )}
              {player.health}
            </div>
            <div>
              {main.current && main.current.spritesLoaded && (
                <SpriteCanvas
                  spriteManager={main.current.spriteManager}
                  sheetId="ITEMS"
                  spriteKey="ARMOUR"
                />
              )}
              {player.armour}
            </div>
            <div className="current-weapon">
              <h2>Current Weapon</h2>
              {main.current && main.current.spritesLoaded && (
                <SpriteCanvas
                  spriteManager={main.current.spriteManager}
                  sheetId="WEAPONS"
                  spriteKey={player.currentWeapon}
                />
              )}
              <div>{weaponStats[player.currentWeapon].name}</div>
            </div>

            <div>
              <h2>AP: {player.actionsPerTurn - player.actionsTaken}</h2>
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
          </div>{" "}
        </>
      )}

      {gameState.currentCombat && main.current && (
        <div className="combat-panel">
          <CombatDisplay
            combat={gameState.currentCombat}
            onCombatStep={() => main.current?.nextCombatStep()}
            spriteManager={main.current.spriteManager}
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
              // toggleFullScreen();
              main.current?.reset();
            }}
          />
        </div>
      )}

      <div className="end-turn-buttons">
        {player &&
          player.availableActions
            .filter((action) => {
              if (
                action === "END_TURN" &&
                player.actionsTaken !== player.actionsPerTurn
              )
                return false;

              return true;
            })
            .map((action) => (
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
      </div>

      {/* {player && player.actionsTaken === player.actionsPerTurn && (
        <ActionButton
          className="end-turn-button"
          action="END_TURN"
          onClick={() => main.current?.performAction("END_TURN")}
          highlight
        />
      )} */}
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
      <canvas
        className="hex-grid-canvas"
        id="hex-grid-canvas-2"
        ref={canvas2}
        width="100%"
        height="100%"
      />
    </div>
  );
}

export default App;
