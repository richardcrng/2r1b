import { useRiducer } from 'riduce';
import { Button, Modal } from 'semantic-ui-react';
import styled from 'styled-components'
import { Game, Player, PlayerWithRoom, RoomName } from "../../../types/game.types";
import { getRoleDefinition } from '../../../utils/role-utils';
import RoleCard from '../../role/card/RoleCard';
import { selectNonZeroOrderedVotesForPlayers } from '../../../selectors/game';
import PlayerLeaderProposal from '../../player/interaction/PlayerLeaderProposal';
import GameOngoingVotes from './votes/GameOngoingVotes';
import Timer from '../../../lib/atoms/Timer';
import PlayerLeaderAbdication from '../../player/interaction/PlayerLeaderAbdication';
import usePlayerActions from '../../player/usePlayerActions';
import { isPlayerAbdicationAction, PlayerActionType } from '../../../types/player-action.types';

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
  players: Record<string, PlayerWithRoom>
  onAppointLeader(appointedLeaderId: string, roomName: RoomName): void;
  onOfferAbdication(roomName: RoomName, proposedLeaderId: string): void;
  onProposeLeader(proposedLeaderId: string | undefined, roomName: RoomName): void;
  onNextRound: () => void;
  onGameRestart: () => void;
}

function GameOngoing(props: Props) {

  usePlayerActions(props.game, props.player);

  const votesForPlayers = selectNonZeroOrderedVotesForPlayers(props.game);
  const votesInThisRoom = votesForPlayers.filter(([playerId]) => props.players[playerId].room === props.currentRoom)

  const { state, dispatch, actions } = useRiducer(DEFAULT_PLAYER_GAME_STATE);

  const handleModalClose = () => dispatch(actions.modal.isOpen.create.off());
  const handleModalOpen = () => dispatch(actions.modal.isOpen.create.on());

  const handleRoleReveal = () => {
    dispatch(
      actions.modal.create.assign({
        isOpen: true,
        title: () => "Here's your role!",
        content: ({ player }) =>
          player.role ? (
            <RoleCard role={getRoleDefinition(player.role)} />
          ) : (
            <p>'Waiting for role...'</p>
          ),
      })
    );
  }

  const handleAbdicationOffer = () => {
    dispatch(
      actions.modal.create.assign({
        isOpen: true,
        title: () => "Abdicate Leadership",
        content: ({ currentRoom, onOfferAbdication, player, players }) => {
          const currentOffer = Object.values(player.pendingActions).find(
            isPlayerAbdicationAction
          );

          return (
            <PlayerLeaderAbdication
              currentOfferId={currentOffer?.abdicatingLeaderId === player.socketId ? currentOffer.proposedNewLeaderId : undefined}
              currentRoom={currentRoom}
              player={player}
              players={players}
              onOfferAbdication={onOfferAbdication}
            />
          );
        }
      })
    )
  }

  const handleLeaderProposal = () => {
    dispatch(
      actions.modal.create.assign({
        isOpen: true,
        title: ({ currentLeader }) => `${currentLeader ? "Propose" : "Appoint"} Leader`,
        content: ({
          currentRoom,
          currentLeader,
          onAppointLeader,
          onProposeLeader,
          player,
          players,
        }) => (
          <PlayerLeaderProposal
            currentLeader={currentLeader}
            currentRoom={currentRoom}
            currentVote={player.leaderVote?.proposedLeaderId}
            onAppointLeader={(id, roomName) => {
              onAppointLeader(id, roomName);
              handleModalClose();
            }}
            onProposeLeader={(id, roomName) => {
              onProposeLeader(id, roomName);
              handleModalClose();
            }}
            player={player}
            players={players}
          />
        ),
      })
    );
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

  const ModalContent = state.modal.content

  return (
    <>
      <Container className="active-contents">
        <Header>
          <h1>Situation Room {props.currentRoom}</h1>
          <h2>{leaderMessage(props.player, props.currentLeader)}</h2>
          <hr />
        </Header>
        <TimerArea>
          <Timer secondsShown={props.game.currentTimerSeconds} />
          <hr />
        </TimerArea>
        <VotesArea>
          <h3>
            Votes
          </h3>
          <GameOngoingVotes
            players={props.players}
            votes={votesInThisRoom}
          />
        </VotesArea>
        <Actions>
          {props.currentLeader?.socketId === props.player.socketId ? (
            <Button secondary fluid onClick={handleAbdicationOffer}>
              ABDICATE LEADERSHIP
            </Button>
          ): (
            <Button secondary fluid onClick={handleLeaderProposal}>
              {props.currentLeader ? "PROPOSE" : "APPOINT"} LEADER
            </Button>
          )}
          <Button primary fluid>
            OFFER SHARE
          </Button>
          <Button color="red" fluid onClick={handleRoleReveal}>
            REVEAL ROLE
          </Button>
        </Actions>
      </Container>
      <Modal
        open={state.modal.isOpen}
        closeIcon
        onClose={handleModalClose}
        onOpen={handleModalOpen}
      >
        <Modal.Header>
          {state.modal.title && state.modal.title(props)}
        </Modal.Header>
        <Modal.Content>
          {ModalContent && <ModalContent {...props} />}
        </Modal.Content>
      </Modal>
    </>
  );
}

const leaderMessage = (currentPlayer: Player, leader?: Player): JSX.Element => {
  if (!leader) {
    return <>No room leader yet</>
  } else if (currentPlayer.socketId === leader.socketId) {
    return <><strong>You</strong> are room leader</>
  } else {
    return <><strong>{leader.name}</strong> is room leader</>
  }
}

export default GameOngoing;
