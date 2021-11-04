import styled from 'styled-components'
import { selectCurrentGameRound } from '../../../selectors/game';
import { Game, Player, PlayerWithRoom, RoomName, RoundStatus } from "../../../types/game.types";
import { PlayerActionAbdicationOffered, PlayerActionShareOfferedType } from '../../../types/player-action.types';
import usePlayerActions from '../../player/usePlayerActions';
import GameOngoingDiscussion from './discussion/GameOngoingDiscussion';

const Container = styled.div`
  display: grid;
  grid-template-columns: auto;
  grid-template-rows: auto auto 1fr auto;
  grid-template-areas:
    "header"
    "timer"
    "votes"
    "actions";
  width: 100%;
`

const Header = styled.div`
  grid-area: header;
`

const TimerArea = styled.div`
  grid-area: timer;
`

const VotesArea = styled.div`
  grid-area: votes;
`

const Actions = styled.div`
  grid-area: actions;
`

export interface PlayerGameState {
  modal: {
    isOpen: boolean;
    title?: (props: Props) => string;
    content?: React.FC<Props>;
  };
}

const DEFAULT_PLAYER_GAME_STATE: PlayerGameState = {
  modal: {
    isOpen: false
  }
}

interface Props {
  currentLeader?: Player;
  currentRoom: RoomName;
  game: Game;
  player: Player;
  players: Record<string, PlayerWithRoom>;
  onAppointLeader(appointedLeaderId: string, roomName: RoomName): void;
  onOfferAbdication(roomName: RoomName, proposedLeaderId?: string): void;
  onOfferShare(roomName: RoomName, playerId: string, shareType: PlayerActionShareOfferedType): void
  onWithdrawAbdicationOffer(action: PlayerActionAbdicationOffered): void;
  onProposeLeader(
    proposedLeaderId: string | undefined,
    roomName: RoomName
  ): void;
}

function GameOngoing(props: Props) {

  usePlayerActions(props.game, props.player);

  const currentRound = selectCurrentGameRound(props.game);

  if (currentRound?.status === RoundStatus.ONGOING) {
    return (
      <GameOngoingDiscussion {...props} />
    )
  } else if (currentRound?.status === RoundStatus.HOSTAGE_SELECTION) {
    return (
      <p>Hostage selection!</p>
    )
  } else {
    return <p>eh</p>
  }
}

export default GameOngoing;
