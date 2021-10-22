import { selectCurrentGameRoomAllocation, selectCurrentRoomCurrentLeaders, selectGamePlayersWithRooms } from "../../selectors/game";
import { Game, GameStatus, Player, RoomName } from "../../types/game.types";
import { RoleKey } from "../../types/role.types";
import GameLobby from "./lobby/GameLobby";
import GameOngoing from "./ongoing/GameOngoing";

interface Props {
  game: Game;
  onAppointLeader(appointedLeaderId: string, currentRoom: RoomName): void;
  onGameStart(): void;
  onGameRestart: () => void;
  onNextRound: () => void;
  onProposeLeader(proposedLeaderId: string, currentRoom: RoomName): void;
  onRoleIncrement: (roleKey: RoleKey, increment: number) => void;
  players: Player[];
  player: Player;
}

function GamePage({
  game,
  onAppointLeader,
  onGameStart,
  onGameRestart,
  onNextRound,
  onProposeLeader,
  onRoleIncrement,
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
    return <GameOngoing {...{ currentLeader, currentRoom, game, player, players: playersWithRooms, onAppointLeader, onGameRestart, onNextRound, onProposeLeader }} />;
  } else {
    return <p>Waiting for room allocation...</p>
  }
}

export default GamePage;
