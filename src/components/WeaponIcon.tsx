import React from "react";
import { IconType } from "react-icons";
import { AiOutlineScissor } from "react-icons/ai";
import { GiCleaver, GiShiningSword, GiCurlingStone } from "react-icons/gi";
import { FaFistRaised } from "react-icons/fa";
import { Weapons } from "../game/Combat";
import { createOffScreenIcon } from "../utils/icons";

interface WeaponIconProps {
  weapon: Weapons;
}

// const weaponToIcon: Record<Weapons, IconType> = {
//   CLEAVER: GiCleaver,
//   SWORD: GiShiningSword,
//   SCISSORS: AiOutlineScissor,
//   ROCK: GiCurlingStone,
//   HANDS: FaFistRaised,
// };

const WeaponIcon: React.FC<WeaponIconProps> = ({ weapon }) => {
  return null;
  // const IconComponent = weaponToIcon[weapon];
  // return <IconComponent />;
};

export default WeaponIcon;

export async function loadWeaponsIcons() {
  let weaponToImage: Record<string, HTMLImageElement> = {};

  // for (const [weapon, IconComponent] of Object.entries(weaponToIcon)) {
  //   const image = await createOffScreenIcon(<IconComponent color="white" />);

  //   weaponToImage[weapon as Weapons] = image;
  // }

  return weaponToImage;
}
