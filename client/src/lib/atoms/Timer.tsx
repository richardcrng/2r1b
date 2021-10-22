import styled from 'styled-components'

const TimerText = styled.p`
  font-size: 3rem;
`

interface Props {
  secondsShown?: number;
}

function Timer({ secondsShown = 0 }: Props) {
  const hhmmss = new Date(secondsShown * 1000).toISOString().substr(11, 8);
  const mmss = hhmmss.slice(3);

  return <TimerText>{mmss}</TimerText>
}

export default Timer;