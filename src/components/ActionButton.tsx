import React from "react";
import { IconType } from "react-icons";
import {
  FaExchangeAlt,
  FaBoxOpen,
  FaHeart,
  FaShieldAlt,
  FaCrosshairs,
  FaHourglassEnd,
} from "react-icons/fa";
import clsx from "clsx";
import { Action } from "../game/Hex";

interface ActionButtonProps {
  action: Action;
  onClick: () => void;
  highlight?: boolean;
}

const actionToIcon: Record<Action, IconType> = {
  SWAP_WEAPON: FaExchangeAlt,
  OPEN_CHEST: FaBoxOpen,
  TAKE_HEALTH: FaHeart,
  TAKE_ARMOUR: FaShieldAlt,
  ATTACK: FaCrosshairs,
  END_TURN: FaHourglassEnd,
};

const ActionButton: React.FC<ActionButtonProps> = ({
  action,
  onClick,
  highlight,
}) => {
  const IconComponent = actionToIcon[action];

  return (
    <button className={clsx("action-button", { highlight })} onClick={onClick}>
      <IconComponent />
    </button>
  );
};

export default ActionButton;
