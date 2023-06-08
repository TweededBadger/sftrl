import * as PIXI from "pixi.js";
import { CombatCharacter } from "./Character";
import { BodyPartBox, SwipePoint, processSwipe } from "../utils/combat/v1";
import { drawParts } from "../utils/combat/v1/drawParts";
import { drawAnimatedSwipe } from "../utils/combat/v1/drawAnimatedSwipe";
import { CharacterRenderer } from "../utils/combat/v1/CharacterRenderer";
import { calculateEndPoint } from "../utils/combat/v1/calculateEndPoint";

interface CombatProps {
  characters: CombatCharacter[];
  app: PIXI.Application;
  scale: number;
}

type CombatPhase =
  | "CHOOSE_ATTACK"
  | "CHOOSE_DEFEND"
  | "CHOOSE_DODGE"
  | "SHOW_OUTCOME";

const combatPhases: CombatPhase[] = [
  "CHOOSE_ATTACK",
  "CHOOSE_DEFEND",
  "CHOOSE_DODGE",
  "SHOW_OUTCOME",
];

export class Combat {
  private characters: CombatCharacter[];
  private app: PIXI.Application;
  private scale: number;
  private swipeTaken = false;
  private characterGraphics: PIXI.Graphics[] = [];
  private activeCharacterIndex: number | null = null;
  private combatPhase: CombatPhase = "CHOOSE_ATTACK";
  private drawingSwipeLine: boolean = false;
  private swipeStartPoint: SwipePoint | null = null;
  private swipeEndPoint: SwipePoint | null = null;
  private swipeLineGraphic: PIXI.Graphics = new PIXI.Graphics();

  private drawingDodgeLine: boolean = false;
  private dodgeStartPoint: SwipePoint | null = null;
  private dodgeEndPoint: SwipePoint | null = null;
  private dodgeLineGraphic: PIXI.Graphics = new PIXI.Graphics();

  private buttonDown: boolean = false;

  // Add new properties for the layers
  private characterLayer: PIXI.Container;
  private effectLayer: PIXI.Container;
  private uiLayer: PIXI.Container;

  private attackSwipeMultiplier: number = 1;
  private dodgeMultiplier: number = 1;

  private uiElements: Record<string, PIXI.Text> = {};

  constructor({ characters, app, scale }: CombatProps) {
    this.characters = characters;
    this.app = app;
    this.scale = scale;

    // Initialize the layers
    this.characterLayer = new PIXI.Container();
    this.effectLayer = new PIXI.Container();
    this.uiLayer = new PIXI.Container();

    // Add the layers to the stage
    this.app.stage.addChild(this.characterLayer);
    this.app.stage.addChild(this.effectLayer);
    this.app.stage.addChild(this.uiLayer);

    this.effectLayer.addChild(this.swipeLineGraphic);
    this.effectLayer.addChild(this.dodgeLineGraphic);

    this.drawCharacters();

    this.drawUI();
    this.registerEventListeners();
    this.addUIListeners();

    this.nextPlayer();

    this.uiCheck();
  }

  private drawUI() {
    // Remove all children from the UI layer
    this.uiLayer.removeChildren();

    // Draw the UI elements
    const nextTurnButton = new PIXI.Text("Next Turn", {
      fill: ["#ffffff", "#00ff99"], // gradient
      align: "center",
    });
    //put the text in the center of the screen
    nextTurnButton.x = this.app.view.width / 2 - nextTurnButton.width / 2;
    nextTurnButton.y = this.app.view.height / 2;

    this.uiLayer.addChild(nextTurnButton);
    this.uiElements.nextTurnButton = nextTurnButton;
    nextTurnButton.visible = false;

    // add feedback text at the top of the screen
    const feedbackText = new PIXI.Text("Swipe!", {
      fill: ["#ffffff", "#00ff99"], // gradient
      align: "center",
    });
    feedbackText.x = this.app.view.width / 2 - feedbackText.width / 2;
    feedbackText.y = 50;
    this.uiLayer.addChild(feedbackText);
    this.uiElements.feedbackText = feedbackText;
  }

  private addUIListeners() {
    this.uiElements.nextTurnButton.interactive = true;
    this.uiElements.nextTurnButton.on("pointerdown", () => {
      this.nextPhase();
      this.buttonDown = true;
      console.log("buttonDown");
    });
  }

  private drawCharacters() {
    // this.removeCharacters();
    const characterWidth = 100; // Assume each character takes 100 units of space
    const gap = 30; // Gap between each character
    const container = new PIXI.Container();

    this.characters.map((character, index) => {
      const renderer = new CharacterRenderer(character, this.scale);
      container.addChild(renderer.container);
      renderer.container.x = index * (characterWidth + gap) * this.scale;
      character.renderer = renderer;
      return renderer;
    });

    // Center the container
    container.x = (this.app.view.width - container.width) / 2;
    container.y = (this.app.view.height - container.height) / 2;

    this.characterLayer.addChild(container);
  }

  private registerEventListeners() {
    this.app.stage.interactive = true;

    this.app.stage.hitArea = this.app.screen;
    this.app.stage.on("pointerdown", this.handlePointerDown);
    this.app.stage.on("pointermove", this.handlePointerMove);
    this.app.stage.on("pointerup", this.handlePointerUp);
  }

  private handlePointerDown = (e: PIXI.FederatedPointerEvent) => {
    console.log("handlePointerDown. buttonDown", this.buttonDown);
    if (this.buttonDown) return;
    const { x, y } = e.screen;

    switch (this.combatPhase) {
      case "CHOOSE_ATTACK":
        this.drawingSwipeLine = true;
        this.swipeLineGraphic.clear();
        this.swipeStartPoint = { x, y };
        this.swipeEndPoint = null;
        break;

      case "CHOOSE_DODGE":
        this.drawingDodgeLine = true;
        this.dodgeLineGraphic.clear();
        this.dodgeStartPoint = { x, y };
        this.dodgeEndPoint = null;
        break;

      default:
        break;
    }
  };

  private handleDrawAttackLine = (
    e: PIXI.FederatedPointerEvent,
    setEndPoint: boolean = false
  ) => {
    let { x, y } = e.screen;
    if (
      !this.swipeStartPoint ||
      !this.swipeLineGraphic ||
      this.swipeTaken ||
      this.activeCharacterIndex === null ||
      this.swipeEndPoint
    )
      return;

    const activeCharacter = this.characters[this.activeCharacterIndex];

    let { distance, endPoint } = calculateEndPoint(
      this.swipeStartPoint,
      new PIXI.Point(x, y),
      activeCharacter.stamina * this.scale * this.attackSwipeMultiplier
    );

    this.drawLine(this.swipeLineGraphic, this.swipeStartPoint, endPoint);

    const staminaLoss = distance / (this.scale * this.attackSwipeMultiplier);
    activeCharacter.potentialNewStamina = activeCharacter.stamina - staminaLoss;
    if (setEndPoint) this.swipeEndPoint = endPoint;
  };

  private handleDrawDodgeLine = (
    e: PIXI.FederatedPointerEvent,
    setEndPoint: boolean = false
  ) => {
    let { x, y } = e.screen;
    if (
      !this.dodgeStartPoint ||
      !this.dodgeLineGraphic ||
      this.activeCharacterIndex === null ||
      this.dodgeEndPoint
    )
      return;

    const activeCharacter = this.characters[this.activeCharacterIndex];

    let { distance, endPoint } = calculateEndPoint(
      this.dodgeStartPoint,
      new PIXI.Point(x, y),
      activeCharacter.stamina * this.scale * this.dodgeMultiplier
    );

    this.drawLine(
      this.dodgeLineGraphic,
      this.dodgeStartPoint,
      endPoint,
      0x00ffff
    );

    const staminaLoss = distance / (this.scale * this.dodgeMultiplier);
    activeCharacter.potentialNewStamina = activeCharacter.stamina - staminaLoss;

    if (setEndPoint) this.dodgeEndPoint = endPoint;
  };

  private drawLine = (
    graphic: PIXI.Graphics,
    startPoint: SwipePoint,
    endPoint: SwipePoint,
    color: number = 0xff0000
  ) => {
    // Redraw the line from start point to current point
    graphic.clear();
    graphic.lineStyle(2 * this.scale, color);
    graphic.moveTo(startPoint.x, startPoint.y);
    graphic.lineTo(endPoint.x, endPoint.y);
  };

  private drawSwipeStartPoint = (startPoint: SwipePoint) => {
    if (!this.swipeLineGraphic) return;

    this.swipeLineGraphic.clear();
    this.swipeLineGraphic.beginFill("red");
    this.swipeLineGraphic.drawCircle(
      startPoint.x,
      startPoint.y,
      5 * this.scale
    );
    this.swipeLineGraphic.endFill();
  };

  private handlePointerMove = (e: PIXI.FederatedPointerEvent) => {
    switch (this.combatPhase) {
      case "CHOOSE_ATTACK":
        if (this.drawingSwipeLine) this.handleDrawAttackLine(e);
        break;

      case "CHOOSE_DODGE":
        if (this.drawingDodgeLine) this.handleDrawDodgeLine(e);
        break;

      default:
        break;
    }
  };

  private handleDrawAttackLineEnd = (e: PIXI.FederatedPointerEvent) => {
    if (!this.swipeStartPoint || !this.swipeLineGraphic || this.swipeTaken)
      return;

    // The swipe ends here
    const swipeEndPoint = { x: e.data.global.x, y: e.data.global.y };
    this.swipeEndPoint = swipeEndPoint;
    this.drawLine(this.swipeLineGraphic, this.swipeStartPoint, swipeEndPoint);
  };

  private handleDrawDodgeLineEnd = (e: PIXI.FederatedPointerEvent) => {
    if (!this.dodgeStartPoint || !this.dodgeLineGraphic) return;

    // The swipe ends here
    const dodgeEndPoint = { x: e.data.global.x, y: e.data.global.y };
    this.dodgeEndPoint = dodgeEndPoint;
    this.drawLine(
      this.dodgeLineGraphic,
      this.dodgeStartPoint,
      dodgeEndPoint,
      0x00ffff
    );
  };

  private handlePointerUp = (e: PIXI.FederatedPointerEvent) => {
    this.buttonDown = false;
    switch (this.combatPhase) {
      case "CHOOSE_ATTACK":
        if (!this.drawingSwipeLine) return;
        this.handleDrawAttackLine(e, true);
        this.drawingSwipeLine = false;
        break;

      case "CHOOSE_DODGE":
        if (!this.drawingDodgeLine) return;
        if (this.drawingDodgeLine) this.handleDrawDodgeLine(e, true);
        this.drawingDodgeLine = false;

      default:
        break;
    }

    this.uiCheck();

    // // Do the calculations, draw the actual swipe, update health etc.
    // // Then redraw the characters
    // this.updateHealthAndRedraw(swipeEndPoint);

    // // Clear the swipe line graphic and reset the swipe start point
    // this.swipeLineGraphic.clear();
    // this.effectLayer.removeChild(this.swipeLineGraphic);
    // this.swipeLineGraphic = null;
    // this.swipeStartPoint = null;
  };

  uiCheck() {
    this.uiElements.nextTurnButton.visible = false;
    switch (this.combatPhase) {
      case "CHOOSE_ATTACK":
        this.uiElements.feedbackText.text = `It's player ${this.activeCharacterIndex}'s turn to attack!`;

        if (this.swipeStartPoint && this.swipeEndPoint) {
          this.uiElements.nextTurnButton.visible = true;
          this.uiElements.nextTurnButton.text = "Next Phase";
          break;
        }
        break;

      case "CHOOSE_DEFEND":
        this.uiElements.feedbackText.text = `It's player ${this.activeCharacterIndex}'s turn to defend!`;

        break;
      case "CHOOSE_DODGE":
        this.uiElements.feedbackText.text = `Does player${this.activeCharacterIndex} want to dodge?`;

        // if (this.dodg && this.swipeEndPoint) {
        this.uiElements.nextTurnButton.visible = true;
        this.uiElements.nextTurnButton.text = "Next Phase";
        //   break;
        // }

        break;
      case "SHOW_OUTCOME":

      default:
        break;
    }
  }

  nextPhase() {
    switch (this.combatPhase) {
      case "CHOOSE_ATTACK":
        if (!this.swipeStartPoint || !this.swipeEndPoint) break;
        this.combatPhase = "CHOOSE_DODGE";
        this.swipeLineGraphic?.clear();
        this.drawSwipeStartPoint(this.swipeStartPoint);

        this.nextPlayer();

        break;

      case "CHOOSE_DODGE":
        // this.combatPhase = "CHOOSE_DEFEND";
        this.combatPhase = "SHOW_OUTCOME";

        this.animateOutCome();

        break;

      default:
        break;
    }
    this.uiCheck();
    this.drawingSwipeLine = false;
    this.drawingDodgeLine = false;
  }

  nextPlayer() {
    // Increment activeCharacterIndex, wrapping back to 0 if it's at the end of the array
    if (this.activeCharacterIndex === null) {
      this.activeCharacterIndex = 0;
    } else {
      this.characters[this.activeCharacterIndex].isActivePlayer = false;
      this.activeCharacterIndex =
        (this.activeCharacterIndex + 1) % this.characters.length;
    }

    this.characters[this.activeCharacterIndex].isActivePlayer = true;
    // // Update the character graphics to reflect the new active character
    // this.characterGraphics.forEach((graphic, index) => {
    //   this.app.stage.removeChild(graphic);
    // });
    // this.characterGraphics = [];
    // this.swipeTaken = false;

    // const activeCharacter = this.characters[this.activeCharacterIndex];
    // activeCharacter.addStamina(25);
  }

  private calculateOutcome() {}

  private animateOutCome() {
    if (
      !this.activeCharacterIndex ||
      !this.dodgeEndPoint ||
      !this.dodgeStartPoint
    )
      return;
    const activeCharacter = this.characters[this.activeCharacterIndex];

    console.log("this.dodgeStartPoint", this.dodgeStartPoint);
    console.log("this.dodgeEndPoint", this.dodgeEndPoint);

    if (this.dodgeStartPoint && this.dodgeEndPoint) {
      const dodgeVector = {
        x: (this.dodgeEndPoint.x - this.dodgeStartPoint.x) * this.scale,
        y: (this.dodgeEndPoint.y - this.dodgeStartPoint.y) * this.scale,
      };
      activeCharacter.renderer?.animateDodge(dodgeVector);
    }
  }

  private updateHealthAndRedraw(swipeEndPoint: SwipePoint) {
    if (!this.swipeStartPoint || this.activeCharacterIndex === null) return;

    const activeCharacter = this.characters[this.activeCharacterIndex];

    this.characters.forEach((character, index) => {
      if (
        index === this.activeCharacterIndex ||
        !this.swipeStartPoint ||
        !character.renderer
      ) {
        // Skip the active character
        return;
      }

      const graphic = character.renderer.container;
      const characterPosition = graphic.toGlobal(new PIXI.Point(0, 0));

      const normalizedStart = new PIXI.Point(
        (this.swipeStartPoint.x - characterPosition.x) / this.scale,
        (this.swipeStartPoint.y - characterPosition.y) / this.scale
      );

      let normalizedEnd: SwipePoint = new PIXI.Point(
        (swipeEndPoint.x - characterPosition.x) / this.scale,
        (swipeEndPoint.y - characterPosition.y) / this.scale
      );

      const { distance, endPoint } = calculateEndPoint(
        normalizedStart,
        normalizedEnd,
        activeCharacter.stamina
      );
      normalizedEnd = endPoint;

      if (distance > activeCharacter.stamina) {
        console.log(
          "distance is greater than stamina",
          distance,
          activeCharacter.stamina
        );
        return;
      }

      const result = processSwipe({
        swipeStart: normalizedStart,
        swipeEnd: normalizedEnd,
        bodyPartBoxes: character.bodyParts,
        playerHealth: character.health,
        playerArmor: character.armor, // Change this value according to your game's mechanics
      });
      console.log(result);

      const { swipeEntryExitPoints, startEndSpeed } = result;

      if (startEndSpeed.size === 0) {
        // No swipe was made
        return;
      }

      this.uiElements.nextTurnButton.visible = true;
      this.swipeTaken = true;

      const swipe = drawAnimatedSwipe({
        swipeStart: normalizedStart,
        swipeEnd: normalizedEnd,
        app: this.app,
        swipeEntryExitPoints: swipeEntryExitPoints.entryExitPoints,
        startEndSpeed: startEndSpeed,
        order: swipeEntryExitPoints.order, // replace with actual order calculation
        multiplier: this.scale,
      });

      // Convert the local character's position to a global one
      const globalPos = graphic.toGlobal(new PIXI.Point(0, 0));

      // Apply this global position to the swipe
      swipe.x = globalPos.x;
      swipe.y = globalPos.y;

      this.effectLayer.addChild(swipe);

      //   graphic.addChild(swipe);

      character.updateHealthAndArmor(result.newHealth, result.newArmor);

      const staminaLoss = distance;

      activeCharacter.stamina = activeCharacter.stamina - staminaLoss;
      activeCharacter.potentialNewStamina = null;
    });
  }
}
