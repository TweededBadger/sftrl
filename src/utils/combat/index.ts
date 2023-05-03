import { AIPlayer } from "../../game/AIPlayer";
import { Combat, CombatState } from "../../game/Combat";
import { Player } from "../../game/Player";

export const startCombatWithNeighbours = (
  player: Player,
  aiPlayers: AIPlayer[]
): Combat | undefined => {
  if (!player) return;

  const neighbors = player.hex.neighbors();
  const opponents: Player[] = [];

  for (const hex of neighbors) {
    const hexKey = hex.toString();
    const otherPlayer = aiPlayers.find((p) => p.hex.toString() === hexKey);
    if (otherPlayer) {
      opponents.push(otherPlayer);
    }
  }

  if (opponents.length === 0) {
    console.warn("No neighbors found to start combat with");
    return;
  }

  return new Combat([player, ...opponents]);
};

export const resolveCombat = (currentCombat: Combat): Player[] => {
  const killList: Player[] = [];

  currentCombat.playerStates.forEach((playerState) => {
    playerState.player.health = playerState.health;
    playerState.player.armour = playerState.armour;
    if (
      "isAiPlayer" in playerState.player &&
      playerState.player.isAiPlayer &&
      playerState.player.health <= 0
    ) {
      killList.push(playerState.player);
    }
  });

  return killList;
};

export const killPlayer = (
  playerToRemove: Player,
  aiPlayers: AIPlayer[]
): AIPlayer[] => {
  // Find the index of the playerToRemove in the aiPlayers array
  const playerIndex = aiPlayers.findIndex(
    (player) => player === playerToRemove
  );

  // Remove the player from the aiPlayers array if found
  if (playerIndex !== -1) {
    return [
      ...aiPlayers.slice(0, playerIndex),
      ...aiPlayers.slice(playerIndex + 1),
    ];
  } else {
    console.warn("Player not found in aiPlayers array");
    return aiPlayers;
  }
};