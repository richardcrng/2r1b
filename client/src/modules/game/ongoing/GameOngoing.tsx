import { useRiducer } from 'riduce';
import { Button, Modal } from 'semantic-ui-react';
import styled from 'styled-components'
import { Card, Game, Player, PlayerGameState } from "../../../types/game.types";
import { getRoleDefinition } from '../../../utils/role-utils';
import RoleCard from '../../role/card/RoleCard';
import { selectCurrentGameRoomAllocation, selectCurrentRoomCurrentLeaders } from '../../../selectors/game';

interface Props {
  game: Game;
  player: Player;
  onCardClick: (card: Card, idx: number, player: Player) => void;
  onNextRound: () => void;
  onGameRestart: () => void;
}

const Container = styled.div`
  width: 100%;
`

const DEFAULT_PLAYER_GAME_STATE: PlayerGameState = {
  modal: {
    isOpen: false
  }
}

function GameOngoing({ game, player, onCardClick, onGameRestart, onNextRound }: Props) {

  const { state, dispatch, actions } = useRiducer(DEFAULT_PLAYER_GAME_STATE);

  const handleModalClose = () => dispatch(actions.modal.isOpen.create.off());
  const handleModalOpen = () => dispatch(actions.modal.isOpen.create.on());

  const currentRooms = selectCurrentGameRoomAllocation(game);
  const currentRoom = currentRooms && currentRooms[player.socketId];

  const currentLeaders = selectCurrentRoomCurrentLeaders(game);

  const leaderIdInThisRoom = currentRoom && currentLeaders[currentRoom];
  const currentLeaderName = leaderIdInThisRoom && game.players[leaderIdInThisRoom].name

  const handleRoleReveal = () => {
    if (player.role) {
      dispatch(
        actions.modal.create.assign({
          isOpen: true,
          title: "Here's your role!",
          content: <RoleCard role={getRoleDefinition(player.role)} />,
        })
      );
    }
  }

  // useSocketListener(ServerEvent.ROLE_AND_ROOM_ALLOCATIONS_MADE, (gameId) => {
  //   if (gameId === game.id && player.role) {
  //     dispatch(actions.modal.create.assign({
  //       isOpen: true,
  //       title: "Shh, here's your role!",
  //       content: <RoleCard role={getRoleDefinition(player.role)} />
  //     }))
  //   }
  // })

  return (
    <>
      <Container className="active-contents flex-between">
        <div>
          <h1>Situation Room {currentRoom}</h1>
          <h2>Leader: {currentLeaderName ?? "<none>"}</h2>
        </div>
        <div style={{ width: '100%' }}>
          <Button secondary fluid>{leaderIdInThisRoom ? 'PROPOSE' : 'APPOINT'} LEADER</Button>
          <Button primary fluid>OFFER SHARE</Button>
          <Button color='red' fluid onClick={handleRoleReveal}>REVEAL ROLE</Button>
        </div>
      </Container>
      <Modal
        open={state.modal.isOpen}
        closeIcon
        onClose={handleModalClose}
        onOpen={handleModalOpen}
      >
        <Modal.Header>{state.modal.title}</Modal.Header>
        <Modal.Content>
          {/* {player.role && <RoleCard role={getRoleDefinition(player.role)} />} */}
          {state.modal.content}
        </Modal.Content>
      </Modal>
    </>
  );
}

export default GameOngoing;
