import { selectCurrentGameRoomAllocation, selectCurrentRoomCurrentLeaders, selectGamePlayersWithRooms } from "../../selectors/game";
import { Game, GameStatus, Player, RoomName } from "../../types/game.types";
import { PlayerActionAbdicationOffered, PlayerActionShareOfferedType } from "../../types/player-action.types";
import { RoleKey } from "../../types/role.types";
import GameLobby from "./lobby/GameLobby";
import GameOngoing from "./ongoing/GameOngoing";

interface Props {
  game: Game;
  onAppointLeader(appointedLeaderId: string, currentRoom: RoomName): void;
  onGameStart(): void;
  onOfferAbdication: (roomName: RoomName, proposedLeaderId: string) => void;
  onOfferShare(roomName: RoomName, offeredPlayerId: string, shareType: PlayerActionShareOfferedType): void;
  onProposeLeader(
    proposedLeaderId: string | undefined,
    currentRoom: RoomName
  ): void;
  onRoleIncrement: (roleKey: RoleKey, increment: number) => void;
  onWithdrawAbdicationOffer(action: PlayerActionAbdicationOffered): void;
  players: Player[];
  player: Player;
}

function GamePage({
  game,
  onAppointLeader,
  onGameStart,
  onOfferAbdication,
  onOfferShare,
  onProposeLeader,
  onRoleIncrement,
  onWithdrawAbdicationOffer,
  players,
  player,
}: Props) {

  const currentRooms = selectCurrentGameRoomAllocation(game);
  const currentRoom = currentRooms && currentRooms[player.socketId];

  const currentLeaders = selectCurrentRoomCurrentLeaders(game);

  const leaderIdInThisRoom = currentRoom && currentLeaders[currentRoom];
  const currentLeader = leaderIdInThisRoom
    ? game.players[leaderIdInThisRoom]
    : undefined;

  const playersWithRooms = selectGamePlayersWithRooms(game)

  if (game.status === GameStatus.LOBBY) {
    return <GameLobby {...{ game, onGameStart, onRoleIncrement, players, player }} />;
  } else if (currentRoom) {
    return <GameOngoing {...{ currentLeader, currentRoom, game, player, players: playersWithRooms, onAppointLeader, onOfferAbdication, onOfferShare, onProposeLeader, onWithdrawAbdicationOffer }} />;
  } else {
    return <p>Waiting for room allocation...</p>
  }
}

export default GamePage;
