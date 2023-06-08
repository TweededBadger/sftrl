import { Armor, Health } from "../../../game/Character";
import { processSwipe, SwipePoint, BodyPartBox } from "./index";

describe("processSwipe", () => {
  const swipeStart: SwipePoint = { x: 10, y: 20 };
  const swipeEnd: SwipePoint = { x: 100, y: 200 };
  const bodyPartBoxes: BodyPartBox[] = [
    { bodyPart: "leftArm", x: 30, y: 40, width: 10, height: 20 },
    { bodyPart: "rightArm", x: 80, y: 40, width: 10, height: 20 },
  ];
  const weaponAttributes: any = { damage: 15, resilience: 0.7 };
  const playerHealth: Health = {
    leftArm: 100,
    rightArm: 100,
    leftLeg: 100,
    rightLeg: 100,
    torso: 100,
  };
  const playerArmor: Armor = {
    leftArm: 5,
    rightArm: 10,
    leftLeg: 0,
    rightLeg: 0,
    torso: 0,
  };

  test("returns new playerHealth object and swipe data", () => {
    const result = processSwipe({
      swipeStart,
      swipeEnd,
      bodyPartBoxes,
      weaponAttributes,
      playerHealth,
      playerArmor,
    });

    expect(result.newPlayerHealth).toEqual({
      leftArm: 85, // Example updated health after applying damage
      rightArm: 90, // Example updated health after applying damage
      leftLeg: 100,
      rightLeg: 100,
      torso: 100,
    });

    expect(result.swipeData.length).toBe(2);
    expect(result.swipeData[0].bodyPart).toBe("leftArm");
    expect(result.swipeData[0].entryPoint).toEqual({ x: 30, y: 60 }); // Example entry point
    expect(result.swipeData[0].exitPoint).toEqual({ x: 40, y: 80 }); // Example exit point
    expect(result.swipeData[0].entrySpeed).toBeCloseTo(20); // Example entry speed
    expect(result.swipeData[0].exitSpeed).toBeCloseTo(14); // Example exit speed

    expect(result.swipeData[1].bodyPart).toBe("rightArm");
    expect(result.swipeData[1].entryPoint).toEqual({ x: 80, y: 160 }); // Example entry point
    expect(result.swipeData[1].exitPoint).toEqual({ x: 90, y: 180 }); // Example exit point
    expect(result.swipeData[1].entrySpeed).toBeCloseTo(9.8); // Example entry speed
    expect(result.swipeData[1].exitSpeed).toBeCloseTo(6.86); // Example exit speed
  });
});
