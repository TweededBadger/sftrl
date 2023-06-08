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
import { actionCosts, actionLabels } from "../utils/actions";

interface ActionButtonProps {
  action: Action;
  onClick: () => void;
  highlight?: boolean;
  className?: string;
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
  className,
}) => {
  const IconComponent = actionToIcon[action];

  return (
    <button
      className={clsx("action-button", className, { highlight })}
      onClick={onClick}
    >
      {actionLabels[action]}{" "}
      {actionCosts[action] > 0 && <span> - {actionCosts[action]} AP</span>}
    </button>
  );
};

export default ActionButton;
