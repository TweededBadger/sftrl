export const patterns1 = {
  wall1: {
    name: "wall1",
    center: {
      elements: [
        { type: "WALL", position: { q: 0, r: 0 } },
        { type: "ROAD", position: { q: 1, r: 0 } },
        { type: "ROAD", position: { q: 2, r: 0 } },
        { type: "WALL", position: { q: -1, r: 1 } },
        { type: "ROAD", position: { q: 0, r: 1 } },
        { type: "ROAD", position: { q: 1, r: 1 } },
        { type: "WALL", position: { q: -1, r: 2 } },
        { type: "WALL", position: { q: 0, r: 2 } },
        { type: "WALL", position: { q: 1, r: 2 } },
      ],
    },
    neighbors: [
      { direction: 0, types: ["wall3", "wall6", "wall5", "wall4", "wall7"] },
      { direction: 1, types: ["wall2", "wall6", "wall8"] },
      { direction: 2, types: ["wall3", "wall6", "wall10"] },
      { direction: 3, types: [] },
    ],
  },
  wall2: {
    name: "wall2",
    center: {
      elements: [
        { type: "ROAD", position: { q: 0, r: 0 } },
        { type: "ROAD", position: { q: 1, r: 0 } },
        { type: "WALL", position: { q: 2, r: 0 } },
        { type: "ROAD", position: { q: -1, r: 1 } },
        { type: "ROAD", position: { q: 0, r: 1 } },
        { type: "WALL", position: { q: 1, r: 1 } },
        { type: "WALL", position: { q: -1, r: 2 } },
        { type: "WALL", position: { q: 0, r: 2 } },
        { type: "ROAD", position: { q: 1, r: 2 } },
      ],
    },
    neighbors: [
      { direction: 0, types: [] },
      { direction: 1, types: ["wall9"] },
      { direction: 2, types: ["wall4", "wall9"] },
      { direction: 3, types: ["wall3", "wall1", "wall4", "wall6"] },
    ],
  },
  wall3: {
    name: "wall3",
    center: {
      elements: [
        { type: "ROAD", position: { q: 0, r: 0 } },
        { type: "ROAD", position: { q: 1, r: 0 } },
        { type: "ROAD", position: { q: 2, r: 0 } },
        { type: "ROAD", position: { q: -1, r: 1 } },
        { type: "WALL", position: { q: 0, r: 1 } },
        { type: "WALL", position: { q: 1, r: 1 } },
        { type: "WALL", position: { q: -1, r: 2 } },
        { type: "ROAD", position: { q: 0, r: 2 } },
        { type: "ROAD", position: { q: 1, r: 2 } },
      ],
    },
    neighbors: [
      { direction: 0, types: ["wall1", "wall10"] },
      {
        direction: 1,
        types: ["wall2", "wall4", "wall5", "wall7", "wall8", "wall9"],
      },
      { direction: 2, types: ["wall1", "wall5", "wall6", "empty"] },
      { direction: 3, types: [] },
    ],
  },
  wall4: {
    name: "wall4",
    center: {
      elements: [
        { type: "ROAD", position: { q: 0, r: 0 } },
        { type: "ROAD", position: { q: 1, r: 0 } },
        { type: "ROAD", position: { q: 2, r: 0 } },
        { type: "WALL", position: { q: -1, r: 1 } },
        { type: "DOOR", position: { q: 0, r: 1 } },
        { type: "WALL", position: { q: 1, r: 1 } },
        { type: "ROAD", position: { q: -1, r: 2 } },
        { type: "ROAD", position: { q: 0, r: 2 } },
        { type: "WALL", position: { q: 1, r: 2 } },
      ],
    },
    neighbors: [
      { direction: 0, types: ["wall2", "wall7", "wall9"] },
      {
        direction: 1,
        types: ["wall5", "wall9", "wall2", "wall7", "wall8", "wall6"],
      },
      { direction: 2, types: ["wall5", "wall1"] },
      { direction: 3, types: ["wall9", "wall3", "wall10"] },
    ],
  },
  wall5: {
    name: "wall5",
    center: {
      elements: [
        { type: "ROAD", position: { q: 0, r: 0 } },
        { type: "ROAD", position: { q: 1, r: 0 } },
        { type: "ROAD", position: { q: 2, r: 0 } },
        { type: "WALL", position: { q: -1, r: 1 } },
        { type: "DOOR", position: { q: 0, r: 1 } },
        { type: "WALL", position: { q: 1, r: 1 } },
        { type: "ROAD", position: { q: -1, r: 2 } },
        { type: "ROAD", position: { q: 0, r: 2 } },
        { type: "ROAD", position: { q: 1, r: 2 } },
      ],
    },
    neighbors: [
      { direction: 0, types: ["wall3", "wall4", "wall6", "empty"] },
      { direction: 1, types: ["wall5", "wall8", "wall7", "wall9"] },
      { direction: 2, types: ["wall1", "empty"] },
      { direction: 3, types: ["wall5", "wall4", "wall9", "wall3", "wall10"] },
    ],
  },
  wall6: {
    name: "wall6",
    center: {
      elements: [
        { type: "ROAD", position: { q: 0, r: 0 } },
        { type: "ROAD", position: { q: 1, r: 0 } },
        { type: "ROAD", position: { q: 2, r: 0 } },
        { type: "ROAD", position: { q: -1, r: 1 } },
        { type: "ROAD", position: { q: 0, r: 1 } },
        { type: "ROAD", position: { q: 1, r: 1 } },
        { type: "WALL", position: { q: -1, r: 2 } },
        { type: "WALL", position: { q: 0, r: 2 } },
        { type: "WALL", position: { q: 1, r: 2 } },
      ],
    },
    neighbors: [
      { direction: 0, types: ["wall3", "wall1", "empty"] },
      { direction: 1, types: ["wall6", "wall2"] },
      { direction: 2, types: ["wall5", "wall1", "wall7", "empty"] },
      { direction: 3, types: ["wall6", "wall1", "wall4"] },
    ],
  },
  empty: {
    name: "empty",
    center: {
      elements: [
        { type: "ROAD", position: { q: 0, r: 0 } },
        { type: "ROAD", position: { q: 1, r: 0 } },
        { type: "ROAD", position: { q: 2, r: 0 } },
        { type: "ROAD", position: { q: -1, r: 1 } },
        { type: "WALL", position: { q: 0, r: 1 } },
        { type: "ROAD", position: { q: 1, r: 1 } },
        { type: "ROAD", position: { q: -1, r: 2 } },
        { type: "ROAD", position: { q: 0, r: 2 } },
        { type: "ROAD", position: { q: 1, r: 2 } },
      ],
    },
    neighbors: [
      { direction: 0, types: ["wall3", "wall6", "wall5", "wall9"] },
      { direction: 1, types: ["wall9", "wall10"] },
      { direction: 2, types: ["wall7", "wall6", "wall5", "wall8", "wall9"] },
      { direction: 3, types: ["wall8", "wall10", "wall7"] },
    ],
  },
  wall7: {
    name: "wall7",
    center: {
      elements: [
        { type: "ROAD", position: { q: 0, r: 0 } },
        { type: "ROAD", position: { q: 1, r: 0 } },
        { type: "WALL", position: { q: 2, r: 0 } },
        { type: "WALL", position: { q: -1, r: 1 } },
        { type: "WALL", position: { q: 0, r: 1 } },
        { type: "WALL", position: { q: 1, r: 1 } },
        { type: "ROAD", position: { q: -1, r: 2 } },
        { type: "ROAD", position: { q: 0, r: 2 } },
        { type: "ROAD", position: { q: 1, r: 2 } },
      ],
    },
    neighbors: [
      { direction: 0, types: ["wall6", "empty"] },
      { direction: 1, types: ["empty"] },
      { direction: 2, types: ["wall4", "wall9", "wall1"] },
      { direction: 3, types: ["wall9", "wall3", "wall4", "wall5", "wall10"] },
    ],
  },
  wall8: {
    name: "wall8",
    center: {
      elements: [
        { type: "WALL", position: { q: 0, r: 0 } },
        { type: "ROAD", position: { q: 1, r: 0 } },
        { type: "ROAD", position: { q: 2, r: 0 } },
        { type: "WALL", position: { q: -1, r: 1 } },
        { type: "ROAD", position: { q: 0, r: 1 } },
        { type: "ROAD", position: { q: 1, r: 1 } },
        { type: "ROAD", position: { q: -1, r: 2 } },
        { type: "ROAD", position: { q: 0, r: 2 } },
        { type: "ROAD", position: { q: 1, r: 2 } },
      ],
    },
    neighbors: [
      { direction: 0, types: ["empty"] },
      { direction: 1, types: ["wall9", "empty", "wall10"] },
      { direction: 2, types: ["wall10"] },
      { direction: 3, types: ["wall5", "wall3", "wall4", "wall1", "wall10"] },
    ],
  },
  wall9: {
    name: "wall9",
    center: {
      elements: [
        { type: "ROAD", position: { q: 0, r: 0 } },
        { type: "ROAD", position: { q: 1, r: 0 } },
        { type: "WALL", position: { q: 2, r: 0 } },
        { type: "WALL", position: { q: -1, r: 1 } },
        { type: "DOOR", position: { q: 0, r: 1 } },
        { type: "WALL", position: { q: 1, r: 1 } },
        { type: "ROAD", position: { q: -1, r: 2 } },
        { type: "ROAD", position: { q: 0, r: 2 } },
        { type: "WALL", position: { q: 1, r: 2 } },
      ],
    },
    neighbors: [
      { direction: 0, types: ["wall9", "wall7", "wall2", "wall10", "empty"] },
      { direction: 1, types: ["wall7", "wall4", "wall5"] },
      { direction: 2, types: ["wall9", "wall4", "wall10", "empty"] },
      {
        direction: 3,
        types: ["wall2", "wall4", "wall8", "empty", "wall10", "wall5", "wall3"],
      },
    ],
  },
  wall10: {
    name: "wall10",
    center: {
      elements: [
        { type: "WALL", position: { q: 0, r: 0 } },
        { type: "ROAD", position: { q: 1, r: 0 } },
        { type: "ROAD", position: { q: 2, r: 0 } },
        { type: "WALL", position: { q: -1, r: 1 } },
        { type: "WALL", position: { q: 0, r: 1 } },
        { type: "WALL", position: { q: 1, r: 1 } },
        { type: "WALL", position: { q: -1, r: 2 } },
        { type: "ROAD", position: { q: 0, r: 2 } },
        { type: "ROAD", position: { q: 1, r: 2 } },
      ],
    },
    neighbors: [
      { direction: 0, types: ["wall8", "wall1", "wall10", "wall9"] },
      {
        direction: 1,
        types: ["empty", "wall9", "wall7", "wall5", "wall4", "wall8"],
      },
      { direction: 2, types: ["wall3", "wall10", "wall9"] },
      { direction: 3, types: ["wall8", "empty"] },
    ],
  },
};
