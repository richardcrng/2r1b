import styled from 'styled-components'
import { ROLE_RESPONSIBILITIES, TEAM_ICONS, WIN_CONDITIONS } from '../../../types/role-responsibilities';
import { FullyDefined, PlayerRole, TeamColor } from "../../../types/role.types";

interface Props {
  role: FullyDefined<PlayerRole>
}

const CardContainer = styled.div`
  color: white;
  display: grid;
  max-width: 300px;
  grid-template-columns: 1fr 70px;
  grid-template-rows: 400px 50px;
  grid-template-areas:
    "description role"
    "team icon"
`

const Description = styled.div`
  grid-area: description;
  padding: 10px;
  overflow-y: scroll;

  ul {
    text-align: left;
  }

  ul > li {
    margin-bottom: 5px;
  }
`

const RoleReveal = styled.div`
  grid-area: role;
  padding: 5px;
  padding-top: 30px;
  writing-mode: vertical-rl;
`;

const RoleName = styled.p`
  font-size: 2rem;
  font-weight: 900;
`

const TeamName = styled.div`
  grid-area: team;
  padding: 5px;
  font-size: 2rem;
  font-weight: 900;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const TeamIcon = styled.div`
  grid-area: icon;
  padding: 5px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

function RoleCard({ role }: Props): JSX.Element {

  const { primary, secondary } = getColors(role.color)

  const Icon = TEAM_ICONS[role.color]

  return (
    <CardContainer style={{ backgroundColor: primary }}>
      <Description style={{ backgroundColor: secondary }}>
        <section>
          <h3>Win condition</h3>
          <span>{WIN_CONDITIONS[role.info.winCondition]}</span>
        </section>
        <hr />
        <section>
          <h3>Responsibilities</h3>
          <span>{ROLE_RESPONSIBILITIES[role.roleName]}</span>
        </section>
      </Description>
      <RoleReveal>
        <div>
          <p>YOU ARE THE</p>
          <RoleName>{role.roleName.toUpperCase()}</RoleName>
        </div>
      </RoleReveal>
      <TeamName>
        <div>{role.color.toUpperCase()} TEAM</div>
      </TeamName>
      <TeamIcon>
        <div><Icon size={32} /></div>
      </TeamIcon>
    </CardContainer>
  );
}

interface Colors {
  primary: string;
  secondary: string;
}

export const getColors = (teamColor: TeamColor): Colors => {
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