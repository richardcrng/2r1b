import { useEffect } from "react";
import { useSocket } from "../socket";
import { ServerEvent, ServerEventListeners } from "../types/event.types";

export default function useSocketListener<
  ListenEvent extends ServerEvent = ServerEvent
>(event: ListenEvent, listener: ServerEventListeners[ListenEvent]): void {
  const socket = useSocket();

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore this is okay - it's the right type of listener
    socket.on(event, listener);

    return function cleanup() {
      socket.off(event, listener);
    };
  });
}
