import { useQuery } from "react-query";
import { useHistory } from "react-router";
import { Button, Icon, Image, Message } from "semantic-ui-react";
import useSocketListener from "../hooks/useSocketListener";
import { socketUrl, useSocket } from "../socket";
import { ClientEvent, ServerEvent } from "../types/event.types";

function IndexRoute(): JSX.Element {
  const socket = useSocket();
  const history = useHistory();

  useSocketListener(ServerEvent.GAME_CREATED, (data) => {
    history.push(`/game/${data.id}`);
  });

  const handleNewGame = () => {
    socket.emit(ClientEvent.CREATE_GAME, socket.id);
  };

  const handleJoinGame = () => {
    window.alert(
      "This isn't implemented yet - get the join link from your host!"
    );
  };

  const { isLoading } = useQuery("server-ping", () =>
    fetch(`${socketUrl}/ping`).then((res) => res.json())
  );

  return (
    <div
      className="active-contents"
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div className="flex-center" style={{ textAlign: "center" }}>
        <h1>Two Rooms and a Boom</h1>
        <Image src="/assets/2r1b-dual.jpeg" size="small" />

        {isLoading ? (
          <>
            <Message icon>
              <Icon name="circle notched" loading />
              <Message.Content>
                <Message.Header>Loading...</Message.Header>
                <p>This can be 30-40s on first boot. Thanks for waiting!</p>
              </Message.Content>
            </Message>
          </>
        ) : (
          <p style={{ margin: "5%" }}>
            Find your teammates, establish trust, and exchange hostages before
            time runs out and the bomb explodes!
          </p>
        )}
      </div>
      <div style={{ width: "100%" }}>
        <Button
          fluid
          color="black"
          onClick={() => window.open("https://github.com/richardcrng/2r1b")}
        >
          LEARN
        </Button>
        <Button
          disabled={isLoading}
          fluid
          color="green"
          onClick={handleJoinGame}
        >
          JOIN
        </Button>
        <Button disabled={isLoading} fluid primary onClick={handleNewGame}>
          NEW
        </Button>
      </div>
    </div>
  );
}

export default IndexRoute;
