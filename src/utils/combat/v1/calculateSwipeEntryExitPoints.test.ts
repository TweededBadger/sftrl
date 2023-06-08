import { calculateSwipeEntryExitPoints, SwipePoint, BodyPartBox } from "./";

describe("calculateSwipeEntryExitPoints", () => {
  test("calculates correct entry and exit points for swipe on body part box", () => {
    const swipeStart: SwipePoint = { x: 0, y: 0 };
    const swipeEnd: SwipePoint = { x: 100, y: 100 };
    const bodyPartBoxes: BodyPartBox[] = [
      { bodyPart: "leftArm", x: 20, y: 20, width: 30, height: 30 },
    ];

    const result = calculateSwipeEntryExitPoints({
      swipeStart,
      swipeEnd,
      bodyPartBoxes,
    });

    expect(result.get("leftArm")).toEqual([
      { x: 20, y: 20 },
      { x: 50, y: 50 },
    ]);
  });

  test("calculates correct entry and exit points for swipe on body part boxes", () => {
    // const swipeStart: SwipePoint = { x: 10, y: 10 };
    // const swipeEnd: SwipePoint = { x: 100, y: 190 };
    const bodyPartBoxes: BodyPartBox[] = [
      { bodyPart: "leftArm", x: 0, y: 0, width: 40, height: 20 },
      { bodyPart: "rightArm", x: 60, y: 0, width: 40, height: 20 },
      { bodyPart: "leftLeg", x: 20, y: 40, width: 20, height: 60 },
      { bodyPart: "rightLeg", x: 60, y: 40, width: 20, height: 60 },
      { bodyPart: "torso", x: 40, y: 0, width: 20, height: 60 },
    ];

    const result1 = calculateSwipeEntryExitPoints({
      swipeStart: { x: 0, y: 80 },
      swipeEnd: { x: 100, y: 80 },
      bodyPartBoxes,
    });

    expect(result1.get("leftLeg")).toEqual([
      { x: 20, y: 80 },
      { x: 40, y: 80 },
    ]);

    expect(result1.get("rightLeg")).toEqual([
      { x: 60, y: 80 },
      { x: 80, y: 80 },
    ]);

    const result2 = calculateSwipeEntryExitPoints({
      swipeStart: { x: 0, y: 50 },
      swipeEnd: { x: 100, y: 50 },
      bodyPartBoxes,
    });

    expect(result2.get("torso")).toEqual([
      { x: 40, y: 50 },
      { x: 60, y: 50 },
    ]);

    const result3 = calculateSwipeEntryExitPoints({
      swipeStart: { x: 0, y: 0 },
      swipeEnd: { x: 100, y: 100 },
      bodyPartBoxes,
    });

    expect(result3.get("torso")).toEqual([
      { x: 40, y: 40 },
      { x: 60, y: 60 },
    ]);

    expect(result3.get("leftArm")).toEqual([
      { x: 0, y: 0 },
      { x: 20, y: 20 },
    ]);

    expect(result3.get("rightLeg")).toEqual([
      { x: 60, y: 60 },
      { x: 80, y: 80 },
    ]);
  });
});
