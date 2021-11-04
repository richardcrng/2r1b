import styled from 'styled-components';
import { Game, Player, Round, RoundStatus } from '../../../../types/game.types';

const Container = styled.div`

`

interface Props {
  game: Game;
  leaderName: string;
  isLeader: boolean;
  player: Player;
  round: Round;
}

function GameOngoingHostageSelection({ game, leaderName, isLeader, player, round }: Props) {
  return (
    <Container className="active-contents">
      <h1>Hostage selection</h1>
      {isLeader ? (
        <p>Select your hostage</p>
      ) : (
        <p>Waiting for {leaderName} to select hostages</p>
      )}
    </Container>
  );
}

export default GameOngoingHostageSelection;