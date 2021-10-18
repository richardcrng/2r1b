import { useState } from "react";
import { Button, Header, Image, Modal } from "semantic-ui-react";
import styled from 'styled-components'
import { Card, CardType, Game, Player } from "../../types/game.types";

interface Props {
  game: Game;
  player: Player;
  onCardClick: (card: Card, idx: number, player: Player) => void;
  onNextRound: () => void;
  onGameRestart: () => void;
}

enum SectionView {
  DISTRIBUTION = 'distribution',
  GAME_STATS = 'game-stats',
  MAIN_GAME = 'main-game'
}

const ActionArea = styled.div`
  width: 100%;
`

const Container = styled.div`
  width: 100%;
`

function GameOngoing({ game, player, onCardClick, onGameRestart, onNextRound }: Props) {

  return (
    <Container className="active-contents flex-between">
      Game is ongoing
    </Container>
  );
}

export default GameOngoing;
