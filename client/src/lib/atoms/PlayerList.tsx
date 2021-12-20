import { PropsWithChildren } from "react";
import { Player } from "../../types/game.types";

interface Props {
  className?: string;
  ownPlayerId?: string;
  players: Player[];
  listParent?: React.FunctionComponent<
    PropsWithChildren<{ className?: string; style?: React.CSSProperties }>
  >;
  listItemParent?: React.FunctionComponent<
    PropsWithChildren<{ className?: string }>
  >;
  renderPlayer?(player: Player, idx: number, ownPlayerId?: string): JSX.Element;
  style?: React.CSSProperties;
}

function PlayerList({
  className,
  ownPlayerId,
  players,
  listParent: List = DefaultListParent,
  listItemParent: ListItem = DefaultListItem,
  renderPlayer = defaultRenderPlayer,
  style,
}: Props): JSX.Element {
  return (
    <List className={className} style={style}>
      {players.map((player, idx) => (
        <ListItem key={player.socketId}>
          {renderPlayer(player, idx, ownPlayerId)}
        </ListItem>
      ))}
    </List>
  );
}

function DefaultListParent({
  className,
  children,
  style,
}: PropsWithChildren<{ className?: string; style?: React.CSSProperties }>) {
  return (
    <ol className={className} style={style}>
      {children}
    </ol>
  );
}

function DefaultListItem({
  className,
  children,
}: PropsWithChildren<{ className?: string }>) {
  return <li className={className}>{children}</li>;
}

const defaultRenderPlayer = (
  player: Player,
  _: number,
  ownPlayerId?: string
): JSX.Element => (
  <>
    {player.name}
    {player.socketId === ownPlayerId && " (you)"}
    {player.isHost && " (host)"}
  </>
);

export default PlayerList;
