import styled from "styled-components";

const TimerText = styled.p`
  font-size: 3rem;
`;

interface Props {
  className?: string;
  secondsShown?: number;
}

function Timer({ className, secondsShown = 0 }: Props): JSX.Element {
  const hhmmss = new Date(secondsShown * 1000).toISOString().substr(11, 8);
  const mmss = hhmmss.slice(3);

  return <TimerText className={className}>{mmss}</TimerText>;
}

export default Timer;
