import { BodyPartBox } from ".";
import { calculateHitCentrality } from "./calculateHitCentrality";
import { EntryExitPoints } from "./calculateSwipeEntryExitPoints";

describe("calculateHitCentrality", () => {
  test("calculates correct hit centrality for a swipe on leftArm body part box", () => {
    const bodyPartBoxes: BodyPartBox[] = [
      { bodyPart: "leftArm", x: 0, y: 0, width: 100, height: 100 },
    ];
    const entryExitPoints: EntryExitPoints = new Map([
      [
        "leftArm",
        [
          { x: 0, y: 0 },
          { x: 100, y: 100 },
        ],
      ],
    ]);

    const result = calculateHitCentrality({ entryExitPoints, bodyPartBoxes });

    expect(result.get("leftArm")).toBeCloseTo(1);
  });

  test("calculates correct hit centrality of 0.05 for a swipe on leftArm body part box", () => {
    const bodyPartBoxes: BodyPartBox[] = [
      { bodyPart: "leftArm", x: 0, y: 0, width: 100, height: 100 },
    ];
    const entryExitPoints: EntryExitPoints = new Map([
      [
        "leftArm",
        [
          { x: 0, y: 30 },
          { x: 30, y: 0 },
        ],
      ],
    ]);

    const result = calculateHitCentrality({ entryExitPoints, bodyPartBoxes });

    expect(result.get("leftArm")).toBeCloseTo(0.05);
  });

  test("calculates correct hit centrality of 0.5 for a swipe on leftArm body part box", () => {
    const bodyPartBoxes: BodyPartBox[] = [
      { bodyPart: "leftArm", x: 0, y: 0, width: 100, height: 100 },
    ];
    const entryExitPoints: EntryExitPoints = new Map([
      [
        "leftArm",
        [
          { x: 33.33333, y: 0 },
          { x: 33.33333, y: 100 },
        ],
      ],
    ]);

    const result = calculateHitCentrality({ entryExitPoints, bodyPartBoxes });

    expect(result.get("leftArm")).toBeCloseTo(0.5);
  });

  test("calculates correct hit centrality of 0.5 for a horizontal swipe on leftArm body part box", () => {
    const bodyPartBoxes: BodyPartBox[] = [
      { bodyPart: "leftArm", x: 0, y: 0, width: 100, height: 100 },
    ];
    const entryExitPoints: EntryExitPoints = new Map([
      [
        "leftArm",
        [
          { y: 33.33333, x: 0 },
          { y: 33.33333, x: 100 },
        ],
      ],
    ]);

    const result = calculateHitCentrality({ entryExitPoints, bodyPartBoxes });

    expect(result.get("leftArm")).toBeCloseTo(0.5);
  });

  test("returns 0 for a body part with no entry and exit points", () => {
    const bodyPartBoxes: BodyPartBox[] = [
      { bodyPart: "leftArm", x: 30, y: 40, width: 10, height: 20 },
    ];

    const emptyEntryExitPoints: EntryExitPoints = new Map();

    const result = calculateHitCentrality({
      entryExitPoints: emptyEntryExitPoints,
      bodyPartBoxes,
    });

    expect(result.get("leftArm")).toBe(0);
  });
});
