import * as PIXI from "pixi.js";
import { CombatCharacter } from "../../../game/Character";
import { BodyPartBox, SwipePoint } from ".";
import { drawParts } from "./drawParts";
import { gsap } from "gsap";

export class CharacterRenderer {
  private character: CombatCharacter;
  public container: PIXI.Container;
  public bodyContainer: PIXI.Container;
  private bodyPartGraphic: PIXI.Graphics | undefined;
  private healthBar: PIXI.Container;
  private staminaBar: PIXI.Container;
  private potentialStaminaBarLine: PIXI.Graphics;
  private scale: number;

  constructor(character: CombatCharacter, scale: number) {
    this.scale = scale;

    this.character = character;
    this.container = new PIXI.Container();
    this.bodyContainer = new PIXI.Container();
    this.container.addChild(this.bodyContainer);
    // this.container.scale.set(scale);

    // Initialize health bar and label
    this.healthBar = new PIXI.Container();
    this.drawBar(this.healthBar, 0xff0000, "Blood");
    this.container.addChild(this.healthBar);

    // Initialize stamina bar and label
    this.staminaBar = new PIXI.Container();
    this.drawBar(this.staminaBar, 0x0000ff, "Stamina");
    this.container.addChild(this.staminaBar);
    this.potentialStaminaBarLine = new PIXI.Graphics();
    this.drawPotentialStaminaBarLine();
    this.staminaBar.addChild(this.potentialStaminaBarLine);

    // Set the position of the bars
    this.healthBar.y = 120 * this.scale; // Position health bar at 100 (height of body parts)
    this.staminaBar.y = 140 * this.scale; // Position stamina bar 20 units below health bar

    this.drawBodyParts();
    // this.updateHealthBar();
    // this.updateStaminaBar();
  }

  public drawBodyParts() {
    console.log("drawBodyParts");

    this.bodyContainer.removeChildren();
    if (this.bodyPartGraphic) {
      this.bodyPartGraphic.destroy();
    }

    const bodyParts: BodyPartBox[] = this.character.bodyParts; // You need to implement getBodyParts function that returns BodyPartBox[] for a character
    const graphic = drawParts({
      bodyParts,
      healthMap: this.character.health,
      armorMap: this.character.armor,
      multiplier: this.scale,
      isActivePlayer: this.character.isActivePlayer,
    });
    this.bodyPartGraphic = graphic;
    this.bodyContainer.addChild(graphic);
  }
  private drawBar(
    barContainer: PIXI.Container,
    color: number,
    labelText: string
  ) {
    // Create bar graphic
    const bar = new PIXI.Graphics();

    // Draw the constant outline
    bar.lineStyle(2, 0xffffff, 3);
    bar.drawRect(0, 0, 100 * this.scale, 10 * this.scale); // Assuming the max value is 100

    // Draw the initial fill (will be updated in updateHealthBar and updateStaminaBar)
    bar.beginFill(color);
    bar.drawRect(0, 0, 100 * this.scale, 10 * this.scale); // Initial width is 0
    bar.endFill();

    // Create the label text
    const label = new PIXI.Text(labelText, {
      fill: ["#ffffff", "#00ff99"], // gradient
      align: "center",
    });
    label.x = 0;
    label.y = -10 * this.scale; // Position the label above the bar
    // label.scale.set(this.scale); // Scale the label text

    // Add elements to the bar container
    barContainer.addChild(bar);
    barContainer.addChild(label);
  }

  public updateHealthBar() {
    const newWidth = this.character.blood;

    // Find the bar graphic in the container and update its fill width
    const bar = this.healthBar.children.find(
      (child) => child instanceof PIXI.Graphics
    ) as PIXI.Graphics;
    gsap.to(bar, {
      width: newWidth,
      duration: 0.5, // Change duration as needed
    });
  }

  public updateStaminaBar() {
    const newWidth = this.character.stamina * this.scale;

    // Find the bar graphic in the container and update its fill width
    const bar = this.staminaBar.children.find(
      (child) => child instanceof PIXI.Graphics
    ) as PIXI.Graphics;
    gsap.to(bar, {
      width: newWidth,
      duration: 0.5, // Change duration as needed
    });
  }
  private drawPotentialStaminaBarLine() {
    this.potentialStaminaBarLine.clear();
    this.potentialStaminaBarLine.lineStyle(2, 0xffffff, 1); // white line
    this.potentialStaminaBarLine.moveTo(0, 0);
    this.potentialStaminaBarLine.lineTo(0, 10 * this.scale); // assuming the bar's height is 10 units
  }

  public animateDodge(vector: SwipePoint, duration: number = 0.5) {
    console.log(vector);

    gsap.to(this.container, {
      keyframes: [
        {
          x: this.container.x + vector.x,
          y: this.container.y + vector.y,
          ease: "easeIn",
        },
        {
          x: this.container.x,
          y: this.container.y,
          ease: "easeOut",
        },
      ],
      duration: duration,
    });
  }

  public updatePotentialStaminaBar() {
    const potentialNewStamina = this.character._potentialNewStamina;

    if (potentialNewStamina !== null) {
      // move the white line to the potential new stamina position
      this.potentialStaminaBarLine.x = potentialNewStamina * this.scale;
    } else {
      // if potentialNewStamina is null, hide the line
      this.potentialStaminaBarLine.x = -1;
    }
  }

  public update() {
    // Call this method whenever the character's state changes
    // to update the graphics
    this.updateHealthBar();
    this.updateStaminaBar();
  }
}
