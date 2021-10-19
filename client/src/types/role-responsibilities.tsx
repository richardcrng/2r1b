import styled from 'styled-components'
import { IconType } from 'react-icons'
import { AiFillStar as Star } from 'react-icons/ai'
import { FaBomb as Bomb } from 'react-icons/fa'
import { BsPersonBoundingBox as GreyIcon } from 'react-icons/bs'
import { BlueRoleName, RedRoleName, GreyRoleName, RoleName, TeamColor } from "./role.types";

const StyledCondition = styled.span`
  font-weight: bold;
`

const StyledRole = styled.span`
  font-style: italic;
  font-weight: bold;
  background-color: white;
  padding: 0px 1.5px;
  margin: 0px 1px;
`

const StyledBlueRole = styled(StyledRole)`
  color: blue;
`

const StyledRedRole = styled(StyledRole)`
  color: red;
`

export const TEAM_ICONS: Record<TeamColor, IconType> = {
  [TeamColor.BLUE]: Star,
  [TeamColor.RED]: Bomb,
  [TeamColor.GREY]: GreyIcon
}

const blue = (roleName: string) => <StyledBlueRole>{roleName}</StyledBlueRole>
const condition = (conditionName: string) => <StyledCondition>{conditionName}</StyledCondition>
const red = (roleName: string) => <StyledRedRole>{roleName}</StyledRedRole>
const responsibility = (responsibilityName: string) => <strong>{responsibilityName}:</strong>

const BLUE_TEAM = blue("Blue Team")
const BOMBER = red("Bomber")
const DEAD = condition("dead")
const DOCTOR = blue(BlueRoleName.DOCTOR)
const ENGINEER = red(RedRoleName.ENGINEER)
const PRESIDENT = blue(BlueRoleName.PRESIDENT)
const RED_TEAM = red("Red Team")

export const WIN_CONDITIONS = {
  BLUE: <>{BLUE_TEAM} wins if the {PRESIDENT} does not die (i.e. gain the '{DEAD}' condition).</>,
  [GreyRoleName.GAMBLER]: <>You win if, at the end of the final round, you can correctly predict which main team will win ({BLUE_TEAM}, {RED_TEAM} or neither).</>,
  [GreyRoleName.PRIVATE_EYE]: <>You win if, at the end of the final round, you can correctly predict the identity of the Buried card.</>,
  RED: <>You win if the {PRESIDENT} is killed (gains the '{DEAD}' condition).</>
};

export type WinCondition = keyof typeof WIN_CONDITIONS

export const ROLE_RESPONSIBILITIES: Record<RoleName, JSX.Element> = {
  [BlueRoleName.CLOWN]: <>You must do your best to smile at all times.</>,

  [BlueRoleName.DOCTOR]: (
    <>
      To keep the {PRESIDENT} alive, you must card share with the {PRESIDENT}{" "}
      before the game ends. If you do not succeed, you and the rest of your team
      lose.
    </>
  ),

  [BlueRoleName.NURSE]: (
    <>
      You are the backup character for the {DOCTOR}. If the {DOCTOR} card is
      buried, you must carry out {DOCTOR} responsibilities (i.e. card sharing
      with the {PRESIDENT}).
    </>
  ),

  [BlueRoleName.PRESIDENT]: (
    <ul>
      <li>
        {responsibility("Primary")} You are the primary character for the{" "}
        {BLUE_TEAM}.
      </li>
      <li>{responsibility("Survival")} Your team cannot win if you gain the '{DEAD}' condition.</li>
    </ul>
  ),

  [BlueRoleName.PRESIDENTS_DAUGHTER]: (
    <>
      You are the backup character for the {PRESIDENT}. If the {PRESIDENT} card
      is buried you must carry out all responsibilities associated with the{" "}
      {PRESIDENT}.
    </>
  ),

  [BlueRoleName.TEAM]: <>Protect the {PRESIDENT}!</>,

  [RedRoleName.BOMBER]: (
    <ul>
      <li>
        {responsibility("Primary")} You are the Primary character for the{" "}
        {RED_TEAM}.
      </li>
      <li>
        {responsibility("Detonate")} Everyone in the same room as you at the end
        of the game gains the '{DEAD}' condition.
      </li>
    </ul>
  ),

  [RedRoleName.ENGINEER]: (
    <>
      To arm the {BOMBER}'s explosives, you must card share with the {BOMBER}{" "}
      before the game ends. If you do not succeed, you and the rest of your team
      lose.
    </>
  ),

  [RedRoleName.MARTYR]: (
    <>
      You are the backup character for the {BOMBER}. If the {BOMBER} card is
      buried you must carry out all responsibilities associated with the{" "}
      {BOMBER}.
    </>
  ),

  [RedRoleName.TEAM]: <>Support the {BOMBER}!</>,

  [RedRoleName.TINKERER]: (
    <>
      You are the backup character for the {ENGINEER}. If the {ENGINEER} card is
      buried, you must carry out {ENGINEER} responsibilities (i.e. card sharing
      with the {BOMBER}).
    </>
  ),

  [GreyRoleName.GAMBLER]: (
    <>
      At the end of the last round, before all players reveal their cards, you
      must publicly announce which team ({RED_TEAM}, {BLUE_TEAM}, or neither)
      you think won the game.
    </>
  ),

  [GreyRoleName.PRIVATE_EYE]: (
    <>
      At the end of the last round, before all players reveal their character
      cards, you must publicly announce the identity of the buried card.
    </>
  ),
};