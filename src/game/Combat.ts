import { AIPlayer } from "./AIPlayer";
import { Player } from "./Player";

export type Weapons = "SWORD" | "HAMMER_2" | "TAZER" | "HAMMER_1" | "FIST";

type WeaponAttributes = {
  name: string;
  damage: number;
  speed: number;
  critChance: number;
};
export const weaponStats: Record<Weapons, WeaponAttributes> = {
  HAMMER_2: {
    name: "SledgeHammer",
    damage: 20,
    speed: 0.6,
    critChance: 0.1,
  },
  SWORD: {
    name: "Sword",
    damage: 15,
    speed: 0.8,
    critChance: 0.3,
  },
  TAZER: {
    name: "Tazer",

    damage: 10,
    speed: 1,
    critChance: 0.2,
  },
  HAMMER_1: {
    name: "Hammer",
    damage: 8,
    speed: 0.8,
    critChance: 0.5,
  },
  FIST: {
    name: "PowerFist",
    damage: 5,
    speed: 1,
    critChance: 0.3,
  },
};

export const weapons = Object.keys(weaponStats) as Weapons[];

interface PlayerState {
  player: Player | AIPlayer;
  health: number;
  armour: number;
}

// Define the CombatState and CombatAction types
export interface CombatState {
  winner?: Player;
  loser?: Player;
  isCombatFinished: boolean;
  actions: CombatAction[];
}

interface CombatAction {
  attacker: Player;
  defender: Player;
  damage: number;
  effectiveDamage: number;
  isCritical: boolean;
  didHit: boolean;
}

export class Combat {
  public playerStates: PlayerState[];
  public actions: CombatAction[] = [];
  public combatOver = false;

  constructor(players: Player[]) {
    this.playerStates = players.map((player) => ({
      player,
      health: player.health,
      armour: player.armour,
    }));
    // this.weaponImages = {} as Record<Weapons, string>;
  }

  public simulateCombat(): void {
    while (!this.combatOver) {
      this.simulateCombatStep();
    }
  }

  public resolveCombat(): void {
    this.playerStates.forEach((playerState) => {
      playerState.player.health = playerState.health;
      playerState.player.armour = playerState.armour;
    });
  }

  public simulateCombatStep(): CombatState {
    for (let i = 0; i < this.playerStates.length; i++) {
      const attackerState = this.playerStates[i];
      const defenderState = this.playerStates[
        (i + 1) % this.playerStates.length
      ];

      // Calculate damage based on attacker's weapon power
      const weapon = attackerState.player.currentWeapon;
      const baseDamage = weaponStats[weapon].damage;
      const critChance = weaponStats[weapon].critChance;
      const speed = weaponStats[weapon].speed;

      const isCritical = Math.random() < critChance;
      const damageMultiplier = isCritical ? 2 : 1;
      const hitChance = speed; // You can adjust the divisor to control hit/miss chances

      const didHit = Math.random() < hitChance;

      if (didHit) {
        const damage = baseDamage * damageMultiplier;

        // Apply damage to the defender, considering armour reduction
        const effectiveDamage = Math.max(0, damage - defenderState.armour);
        defenderState.health -= effectiveDamage;
        if (defenderState.armour > 0) {
          defenderState.armour = defenderState.armour / 2;
        }

        // Add the action to the actions array
        this.actions.push({
          attacker: attackerState.player,
          defender: defenderState.player,
          damage,
          effectiveDamage,
          isCritical,
          didHit,
        });

        // Check if the defender's health reaches zero
        if (defenderState.health <= 0) {
          const alivePlayers = this.playerStates.filter(
            (state) => state.health > 0
          );

          if (alivePlayers.length <= 1) {
            this.combatOver = true;
            return {
              winner: attackerState.player,
              loser: defenderState.player,
              isCombatFinished: true,
              actions: this.actions,
            };
          }
        }
      } else {
        // Add the action to the actions array, with damage and effectiveDamage set to 0
        this.actions.push({
          attacker: attackerState.player,
          defender: defenderState.player,
          damage: 0,
          effectiveDamage: 0,
          isCritical: false,
          didHit,
        });
      }
    }

    return {
      isCombatFinished: false,
      actions: this.actions,
    };
  }
}
