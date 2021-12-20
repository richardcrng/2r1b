import styled from "styled-components";
import { LeaderVote, PlayerWithRoom } from "../../../../types/game.types";

const TableContainer = styled.div`
  overflow-x: scroll;

  table {
    width: 100%;
  }

  th {
    text-align: left;
  }
`;

interface Props {
  players: Record<string, PlayerWithRoom>;
  votes: [string, LeaderVote[]][];
}

function GameOngoingVotes({ players, votes }: Props): JSX.Element {
  return (
    <>
      {votes.length === 0 ? (
        <p>Nobody has proposed any replacement leaders yet</p>
      ) : (
        <TableContainer>
          <table>
            <tr>
              <th></th>
              <th>Proposed</th>
              <th>Voters</th>
            </tr>
            {votes.map(([playerId, votesForPlayer]) => (
              <tr key={playerId}>
                <td>
                  <strong>{votesForPlayer.length}</strong>
                </td>
                <td>{players[playerId].name}</td>
                <td>
                  {votesForPlayer
                    .map((vote) => players[vote.voterId].name)
                    .join(", ")}
                </td>
              </tr>
            ))}
          </table>
        </TableContainer>
      )}
    </>
  );
}

export default GameOngoingVotes;
