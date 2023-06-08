import React, { useEffect, useRef } from "react";
import { BsFillShieldFill } from "react-icons/bs";
import { FaHeart } from "react-icons/fa";
import WeaponIcon from "./WeaponIcon";
import styles from "./CombatDisplay.module.css";
import { Combat, weaponStats } from "../game/Combat";
import SpriteCanvas from "./SingleSprite";
import { SpriteManager } from "../game/SpriteManager";

interface CombatDisplayProps {
  combat: Combat;
  spriteManager: SpriteManager;
  onCombatStep: () => void;
}

export const CombatDisplay: React.FC<CombatDisplayProps> = ({
  combat,
  onCombatStep,
  spriteManager,
}) => {
  const actionsContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (actionsContainerRef.current) {
      actionsContainerRef.current.scrollTop =
        actionsContainerRef.current.scrollHeight;
    }
  }, [combat.actions.length]);

  const renderPlayerDetails = () => {
    return combat.playerStates.map((state, index) => (
      <div key={index} className={styles["player-details"]}>
        <div className={styles["player-name"]}>{state.player.name}</div>
        <div className={styles["player-stat"]}>
          <BsFillShieldFill /> {Math.round(state.armour)}
        </div>
        <div className={styles["player-stat"]}>
          <FaHeart /> {Math.round(state.health)}
        </div>
        <div className={styles["player-stat"]}>
          <SpriteCanvas
            spriteManager={spriteManager}
            sheetId="WEAPONS"
            spriteKey={state.player.currentWeapon}
          />
        </div>

        <h2>{weaponStats[state.player.currentWeapon].name}</h2>
      </div>
    ));
  };

  const renderCombatActions = () => {
    return combat.actions.map((action, index) => (
      <div key={index} className={styles["combat-action"]}>
        {action.didHit
          ? `Player ${action.attacker.name} hit Player ${action.defender.name} with their ${action.attacker.currentWeapon} for ${action.effectiveDamage} damage`
          : `Player ${action.attacker.name} missed Player ${action.defender.name} with their ${action.attacker.currentWeapon}`}
      </div>
    ));
  };

  return (
    <div className={styles["combat-display"]}>
      <div className={styles["left-panel"]}>
        <div className={styles["player-details-container"]}>
          {renderPlayerDetails()}
        </div>
        <button className={styles["combat-step-button"]} onClick={onCombatStep}>
          Next Combat Step
        </button>
      </div>
      <div
        ref={actionsContainerRef}
        className={styles["combat-actions-container"]}
      >
        {renderCombatActions()}
      </div>
    </div>
  );
};
