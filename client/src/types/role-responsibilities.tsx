import styled from 'styled-components'
import { BlueRoleName, RedRoleName, GreyRoleName, RoleName } from "./role.types";

const StyledCondition = styled.span`
  font-weight: bold;
`

const StyledRole = styled.span`
  font-style: italic;
`

const StyledBlueRole = styled(StyledRole)`
  color: blue;
`

const StyledRedRole = styled(StyledRole)`
  color: red;
`

const blue = (roleName: string) => <StyledBlueRole>{roleName}</StyledBlueRole>
const condition = (conditionName: string) => <StyledCondition>{conditionName}</StyledCondition>
const red = (roleName: string) => <StyledRedRole>{roleName}</StyledRedRole>

const BLUE_TEAM = blue("Blue Team")
const BOMBER = red("Bomber")
const DEAD = condition("dead")
const DOCTOR = blue(BlueRoleName.DOCTOR)
const ENGINEER = red(RedRoleName.ENGINEER)
const PRESIDENT = blue(BlueRoleName.PRESIDENT)
const RED_TEAM = red("Red Team")

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
    <>You are the primary character for the {BLUE_TEAM}.</>
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
    <>
      You are the primary character for the {RED_TEAM}. Everyone in the same
      room as you at the end of the game gains the '{DEAD}' condition.
    </>
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