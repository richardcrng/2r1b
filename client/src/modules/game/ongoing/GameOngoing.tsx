import { selectCurrentGameRoomAllocation, selectCurrentGameRound, selectCurrentRoomCurrentLeaders } from '../../../selectors/game';
import { Game, Player, PlayerWithRoom, RoomName, RoundStatus } from "../../../types/game.types";
import { PlayerActionAbdicationOffered, PlayerActionShareOfferedType } from '../../../types/player-action.types';
import usePlayerActions from '../../player/usePlayerActions';
import GameOngoingDiscussion from './discussion/GameOngoingDiscussion';
import GameOngoingHostageSelection from './hostage-selection/GameOngoingHostageSelection';

export interface PlayerGameState {
  modal: {
    isOpen: boolean;
    title?: (props: Props) => string;
    content?: React.FC<Props>;
  };
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
  const currentRoom = selectCurrentGameRoomAllocation(props.game)![props.player.socketId];
  const currentLeaderId = selectCurrentRoomCurrentLeaders(props.game)[currentRoom]!;

  if (currentRound?.status === RoundStatus.ONGOING) {
    return (
      <GameOngoingDiscussion {...props} />
    )
  } else if (currentRound?.status === RoundStatus.HOSTAGE_SELECTION) {
    return (
      <GameOngoingHostageSelection
        game={props.game}
        leaderName={props.players[currentLeaderId].name!}
        isLeader={props.player.socketId === currentLeaderId}
        player={props.player}
        players={props.players}
        roomName={currentRoom}
        round={currentRound}
      />
    )
  } else {
    return <p>eh</p>
  }
}

export default GameOngoing;
