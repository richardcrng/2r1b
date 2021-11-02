import { Redirect, useParams } from "react-router-dom";
import PlayerNamer from "../lib/atoms/PlayerNamer";
import GamePage from "../modules/game/GamePage";
import useGame from "../hooks/useGame";
import usePlayer from "../hooks/usePlayer";
import useSocketAliases from "../hooks/useSocketAliases";
import { useSocket } from "../socket";
import { ClientEvent } from "../types/event.types";
import { GameStatus } from "../types/game.types";

function GameRoute() {
  const { gameId } = useParams<{ gameId: string }>();
  const socket = useSocket();
  const socketAliases = useSocketAliases();

  const game = useGame(gameId);
  const player = usePlayer(socket.id, socketAliases);

  const takenNames = Object.values(game.data?.players ?? {}).map(
    (player) => player.name!
  );

  if (game.loading) {
    return <p>Loading...</p>
  } else if (game.error) {
    return <Redirect to="/" />;
  } else if (game.data?.status === GameStatus.ONGOING && !player.data) {
    return <p>Can't join a game that is underway - sorry</p>;
  } else if (!player.loading && !player.data?.name) {
    return (
      <>
        <p>
          To {player.data?.isHost ? "host" : "join"} the game, please choose a
          player name first:
        </p>
        <PlayerNamer
          handleSetName={(name) => {
            if (player.data) {
              // player is in game, so update
              socket.emit(ClientEvent.UPDATE_PLAYER, gameId, {
                socketId: socket.id,
                name,
                gameId,
              });
            } else {
              // player not in game, so join
              socket.emit(ClientEvent.JOIN_GAME, gameId, {
                socketId: socket.id,
                name,
              });
            }
          }}
          takenNames={takenNames}
        />
      </>
    );
  } else {
    return (
      <>
        {game.loading && <p>Loading...</p>}
        {game.data && player.data && (
          <GamePage
            game={game.data}
            onAppointLeader={(leaderId, currentRoom) => {
              socket.emit(
                ClientEvent.APPOINT_ROOM_LEADER,
                game.data!.id,
                currentRoom,
                player.data!.socketId,
                leaderId
              );
            }}
            onGameStart={() => {
              socket.emit(ClientEvent.START_GAME, game.data!.id);
            }}
            onGameRestart={() => {
              socket.emit(ClientEvent.RESET_GAME, game.data!.id);
            }}
            onNextRound={() => {
              socket.emit(ClientEvent.NEXT_ROUND, game.data!.id);
            }}
            onProposeLeader={(leaderId, currentRoom) => {
              socket.emit(
                ClientEvent.PROPOSE_ROOM_LEADER,
                game.data!.id,
                currentRoom,
                player.data!.socketId,
                leaderId
              );
            }}
            onRoleIncrement={(roleKey, increment) => {
              socket.emit(
                ClientEvent.INCREMENT_ROLE,
                game.data!.id,
                roleKey,
                increment
              );
            }}
            players={Object.values(game.data.players)}
            player={player.data}
          />
        )}
      </>
    );
  }
}

export default GameRoute;
