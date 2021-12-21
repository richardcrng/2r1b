import styled from "styled-components";
import { IconType } from "react-icons";
import { AiFillStar as Star } from "react-icons/ai";
import { FaBomb as Bomb } from "react-icons/fa";
import { BsPersonBoundingBox as GreyIcon } from "react-icons/bs";
import {
  BlueRoleName,
  RedRoleName,
  GreyRoleName,
  RoleName,
  TeamColor,
} from "./role.types";
import { getTeamColorHex } from "../utils/colors";

const StyledCondition = styled.span`
  font-weight: bold;
`;

const StyledAction = styled.span`
  font-weight: bold;
`;

const StyledRole = styled.span`
  font-style: italic;
  font-weight: bold;
  background-color: white;
  padding: 0px 1.5px;
  margin: 0px 1px;
`;

const StyledBlueRole = styled(StyledRole)`
  color: ${getTeamColorHex(TeamColor.BLUE).primary};
`;

const StyledGreyRole = styled(StyledRole)`
  color: ${getTeamColorHex(TeamColor.GREY).primary};
`;

const StyledRedRole = styled(StyledRole)`
  color: ${getTeamColorHex(TeamColor.RED).primary};
`;

export const TEAM_ICONS: Record<TeamColor, IconType> = {
  [TeamColor.BLUE]: Star,
  [TeamColor.RED]: Bomb,
  [TeamColor.GREY]: GreyIcon,
};

const action = (actionName: string) => (
  <StyledAction>{actionName}</StyledAction>
);
const blue = (roleName: string) => <StyledBlueRole>{roleName}</StyledBlueRole>;
const condition = (conditionName: string) => (
  <StyledCondition>{conditionName}</StyledCondition>
);
const grey = (roleName: string) => <StyledGreyRole>{roleName}</StyledGreyRole>;
const red = (roleName: string) => <StyledRedRole>{roleName}</StyledRedRole>;
const responsibility = (responsibilityName: string) => (
  <strong>{responsibilityName}:</strong>
);

const BLUE_TEAM = blue("Blue Team");
const BOMBER = red("Bomber");
const CARD_SHARE = action("card share");
const DEAD = condition("dead");
const DOCTOR = blue(BlueRoleName.DOCTOR);
const ENGINEER = red(RedRoleName.ENGINEER);
const PRESIDENT = blue(BlueRoleName.PRESIDENT);
const RED_TEAM = red("Red Team");
const SNIPER = grey("Sniper");
const TARGET = grey("Target");

export const WIN_CONDITIONS = {
  BLUE: (
    <>
      You if the {PRESIDENT} does not die (i.e. gain the '{DEAD}' condition).
    </>
  ),
  [GreyRoleName.DECOY]: (
    <>
      You win if the {SNIPER} chooses to {action("Shoot")} you at the end of the
      last round.
    </>
  ),
  [GreyRoleName.GAMBLER]: <>You win if you make a correct {action("Wager")}.</>,
  [GreyRoleName.INTERN]: (
    <>
      You win if you are in the same room as the {PRESIDENT} at the end of the
      game.
    </>
  ),
  [GreyRoleName.MI6]: (
    <>
      You win if you card share with <i>both</i> the {PRESIDENT} and the{" "}
      {BOMBER} before the end of the game.
    </>
  ),
  [GreyRoleName.PRIVATE_EYE]: (
    <>You win if you make a correct {action("Identification")}.</>
  ),
  [GreyRoleName.RIVAL]: (
    <>
      You win if you are NOT in the same room as the {PRESIDENT} at the end of
      the game.
    </>
  ),
  [GreyRoleName.SNIPER]: (
    <>
      You win if you {action("Shoot")} the {TARGET} at the end of the last
      round.
    </>
  ),
  [GreyRoleName.SURVIVOR]: (
    <>
      You win if you are NOT in the same room as the {BOMBER} at the end of the
      game.
    </>
  ),
  [GreyRoleName.TARGET]: (
    <>
      You win if the {SNIPER} does NOT {action("Shoot")} you at the end of the
      last round.
    </>
  ),
  [GreyRoleName.VICTIM]: (
    <>
      You win if you are in the same room as the {BOMBER} at the end of the
      game.
    </>
  ),
  RED: (
    <>
      You win if the {PRESIDENT} is killed (gains the '{DEAD}' condition).
    </>
  ),
};

export type WinCondition = keyof typeof WIN_CONDITIONS;

export const ROLE_RESPONSIBILITIES: Record<RoleName, JSX.Element> = {
  [BlueRoleName.CLOWN]: (
    <>{responsibility("Smile")} You must do your best to smile at all times.</>
  ),

  [BlueRoleName.DOCTOR]: (
    <>
      {responsibility("Treatment")} The President will die unless you{" "}
      {CARD_SHARE} with them before the game ends.
    </>
  ),

  [BlueRoleName.NURSE]: (
    <ul>
      <li>
        {responsibility("Backup Doctor")} If the {DOCTOR} role is Buried, or
        receives the '{DEAD}' condition before it has Treated the {PRESIDENT},
        you assume all of its duties and your latent responsibility activates.
      </li>
      <li>
        {responsibility("Treatment (latent)")} The President will die unless you
        {CARD_SHARE} with them before the game ends.
      </li>
    </ul>
  ),

  [BlueRoleName.PRESIDENT]: (
    <ul>
      <li>
        {responsibility("Primary")} You are the primary character for the{" "}
        {BLUE_TEAM}.
      </li>
      <li>
        {responsibility("Survival")} Your team cannot win if you gain the '
        {DEAD}' condition.
      </li>
    </ul>
  ),

  [BlueRoleName.TEAM]: (
    <>
      Use your powers of deduction, persuasion and organisation to keep the{" "}
      {PRESIDENT} alive!
    </>
  ),

  [BlueRoleName.VICE_PRESIDENT]: (
    <ul>
      <li>
        {responsibility("Backup President")} If the {PRESIDENT} role is Buried,
        you assume all of its duties and your latent responsibility activates.
      </li>
      <li>
        {responsibility("Secondary")} You are the secondary character for the{" "}
        {BLUE_TEAM}.
      </li>
      <li>
        {responsibility("Survival (latent)")} Your team cannot win if you gain
        the '{DEAD}' condition.
      </li>
    </ul>
  ),

  [RedRoleName.BOMBER]: (
    <ul>
      <li>
        {responsibility("Primary")} You are the Primary character for the{" "}
        {RED_TEAM}.
      </li>
      <li>
        {responsibility("Explosives")} Everyone in the same room as you at the
        end of the game gains the '{DEAD}' condition.
      </li>
    </ul>
  ),

  [RedRoleName.ENGINEER]: (
    <>
      {responsibility("Wiring")} The {BOMBER}'s explosives will be ineffectual
      unless you {CARD_SHARE} with them before the game ends.
    </>
  ),

  [RedRoleName.MARTYR]: (
    <ul>
      <li>
        {responsibility("Backup Bomber")} If the {BOMBER} role is Buried, or
        receives the '{DEAD}' condition before its explosives detonate, you
        assume all of its duties and your latent responsibility activates.
      </li>
      <li>
        {responsibility("Secondary")} You are the secondary character for the{" "}
        {RED_TEAM}.
      </li>
      <li>
        {responsibility("Explosives (latent)")} Everyone in the same room as you
        at the end of the game gains the '{DEAD}' condition.
      </li>
    </ul>
  ),

  [RedRoleName.TEAM]: (
    <>
      Use your powers of deduction, persuasion and organisation to support the{" "}
      {BOMBER}'s mission!
    </>
  ),

  [RedRoleName.TINKERER]: (
    <ul>
      <li>
        {responsibility("Backup Engineer")} If the {ENGINEER} role is Buried, or
        receives the '{DEAD}' condition before it has wired the {BOMBER}'s
        explosives, you assume all of its duties and your latent responsibility
        activates.
      </li>
      <li>
        {responsibility("Wiring (latent)")} The {BOMBER}'s explosives will be
        ineffectual unless you {CARD_SHARE} with them before the game ends.
      </li>
    </ul>
  ),

  [GreyRoleName.DECOY]: (
    <>
      You're here to distract the {SNIPER} - try to get them to{" "}
      {action("Shoot")} you!
    </>
  ),

  [GreyRoleName.GAMBLER]: (
    <>
      {responsibility("Wager")} At the end of the last round, before all players
      reveal their cards, you must predict the winning team ({RED_TEAM},{" "}
      {BLUE_TEAM}, or neither).
    </>
  ),

  [GreyRoleName.INTERN]: (
    <>You're a keen intern - get close to the {PRESIDENT}!</>
  ),

  [GreyRoleName.MI6]: (
    <>
      Locate the identities of the {PRESIDENT} and the {BOMBER}!
    </>
  ),

  [GreyRoleName.PRIVATE_EYE]: (
    <>
      {responsibility("Identification")} At the end of the last round, before
      all players reveal their character cards, you must predict the identity of
      the buried card.
    </>
  ),

  [GreyRoleName.RIVAL]: (
    <>
      You're a competitive hotshot jockeying with the {PRESIDENT} - try to avoid
      them!
    </>
  ),

  [GreyRoleName.SNIPER]: (
    <>
      {responsibility("Shoot")} At the end of the last round, before all players
      reveal their character cards, you must choose a player to{" "}
      {action("Shoot")}.
    </>
  ),

  [GreyRoleName.SURVIVOR]: (
    <>You're only looking out for yourself - try to avoid the {BOMBER}!</>
  ),

  [GreyRoleName.TARGET]: (
    <>
      The {SNIPER} is looking for you - try to avoid getting shot at the end of
      the game!
    </>
  ),

  [GreyRoleName.VICTIM]: (
    <>You're here to suffer - get close to the {BOMBER}!</>
  ),
};
