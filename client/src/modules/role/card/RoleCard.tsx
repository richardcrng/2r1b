import styled from 'styled-components'
import { ROLE_RESPONSIBILITIES } from '../../../types/role-responsibilities';
import { FullyDefined, PlayerRole, TeamColor } from "../../../types/role.types";

interface Props {
  role: FullyDefined<PlayerRole>
}

const CardContainer = styled.div`
  color: white;
  display: grid;
  grid-template-columns: 4fr 1fr;
  grid-template-rows: 3fr 1fr;
  grid-template-areas:
    "description role"
    "team icon"
`

const Description = styled.div`
  grid-area: description;
  padding: 5px;
`

const RoleReveal = styled.div`
  grid-area: role;
  padding: 5px;
  writing-mode: vertical-rl;
`;

const RoleName = styled.p`
  font-size: 2rem;
  font-weight: 900;
`

const TeamName = styled.div`
  grid-area: team;
  padding: 5px;
`;

const TeamIcon = styled.div`
  grid-area: icon;
  padding: 5px;
`;

function RoleCard({ role }: Props): JSX.Element {

  const { primary, secondary } = getColors(role.color)

  return (
    <CardContainer style={{ backgroundColor: primary }}>
      <Description style={{ backgroundColor: secondary  }}>
        <h3>Win condition</h3>
        {role.info.winCondition}
        <h3>Responsibilities</h3>
        {ROLE_RESPONSIBILITIES[role.roleName]}
      </Description>
      <RoleReveal>
        <div>
          <p>YOU ARE THE</p>
          <RoleName>{role.roleName.toUpperCase()}</RoleName>
        </div>
      </RoleReveal>
      <TeamName>
        {role.color} Team
      </TeamName>
      <TeamIcon>
        {role.color[0]}
      </TeamIcon>
    </CardContainer>
  )
}

interface Colors {
  primary: string;
  secondary: string;
}

const getColors = (teamColor: TeamColor): Colors => {
  switch (teamColor) {
  
    case TeamColor.BLUE:
      return { primary: "#0100E5", secondary: "#4D4DFE" };

    case TeamColor.GREY:
      return { primary: "#656363", secondary: "#868685" };

    case TeamColor.RED:
      return { primary: "#E50000", secondary: "#FE4D4D" }; 
  }
}

export default RoleCard