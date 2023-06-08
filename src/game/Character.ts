import { BodyPartBox } from "../utils/combat/v1";
import { CharacterRenderer } from "../utils/combat/v1/CharacterRenderer";

export type BodyPart =
  | "leftArm"
  | "rightArm"
  | "leftLeg"
  | "rightLeg"
  | "torso";

export type Armor = {
  [key in BodyPart]: number;
};

export type Health = {
  [key in BodyPart]: number;
};

type Weapons = {
  leftHand: string;
  rightHand: string;
};

const bodyPartBoxes: BodyPartBox[] = [
  { bodyPart: "leftArm", x: 5, y: 5, width: 35, height: 20 },
  { bodyPart: "rightArm", x: 60, y: 5, width: 35, height: 20 },
  { bodyPart: "leftLeg", x: 20, y: 40, width: 20, height: 50 },
  { bodyPart: "rightLeg", x: 60, y: 40, width: 20, height: 50 },
  { bodyPart: "torso", x: 40, y: 5, width: 20, height: 60 },
];

export class CombatCharacter {
  public _stamina: number = 100;
  public _potentialNewStamina: number | null = null;
  public _blood: number = 100;
  public renderer: CharacterRenderer | null = null;
  public _isActivePlayer: boolean = false;
  get isActivePlayer(): boolean {
    return this._isActivePlayer;
  }

  set isActivePlayer(value: boolean) {
    this._isActivePlayer = value;
    if (this.renderer) {
      this.renderer.drawBodyParts();
    }
  }

  get stamina(): number {
    return this._stamina;
  }
  set stamina(value: number) {
    this._stamina = value;
    if (this.renderer) {
      this.renderer.updateStaminaBar();
    }
  }
  get blood(): number {
    return this._blood;
  }
  set blood(value: number) {
    this._blood = value;
    if (this.renderer) {
      this.renderer.updateHealthBar();
    }
  }

  get potentialNewStamina(): number | null {
    return this._potentialNewStamina;
  }

  set potentialNewStamina(value: number | null) {
    this._potentialNewStamina = value;
    if (this.renderer) {
      this.renderer.updatePotentialStaminaBar();
    }
  }

  public addStamina(value: number) {
    this.stamina = Math.min(this.stamina + value, 100);
  }

  public updateHealthAndArmor(health: Health, armor: Armor) {
    this.health = health;
    this.armor = armor;
    if (this.renderer) {
      this.renderer.drawBodyParts();
    }
  }

  public health: Health = {
    leftArm: 100,
    rightArm: 100,
    leftLeg: 100,
    rightLeg: 100,
    torso: 100,
  };
  public actionPoints: number = 2;
  public armor: Armor = {
    leftArm: 5,
    rightArm: 5,
    leftLeg: 5,
    rightLeg: 5,
    torso: 20,
  };
  public equippedWeapons: Weapons = {
    leftHand: "NONE",
    rightHand: "NONE",
  };
  public bodyParts: BodyPartBox[] = bodyPartBoxes;

  constructor() {
    // this.health = health;
    // this.actionPoints = actionPoints;
  }
}
