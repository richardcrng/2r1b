import styled from "styled-components";
import { SetupAlert } from "../../../../../utils/setup-utils";

interface Props {
  errors: SetupAlert[];
  warnings: SetupAlert[];
}

const ErrorAndWarningList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;

  li {
    padding-left: 1rem;
    text-indent: -0.7rem;
  }

  li.error::before {
    content: "🚨 ";
  }

  li.warning::before {
    content: "⚠️ ";
  }
`;

const GameLobbySetupErrors: React.FC<Props> = ({ errors, warnings }: Props) => {
  if (errors.length || warnings.length) {
    return (
      <details>
        <summary
          style={{
            color: errors.length ? "red" : "orange",
            fontWeight: "bold",
          }}
        >
          {errorAndWarningsTitle(errors.length, warnings.length)}
        </summary>
        <ErrorAndWarningList>
          {errors.map((error) => (
            <li className="error" key={error.message}>
              {error.message}
            </li>
          ))}
          {warnings.map((warning) => (
            <li className="warning" key={warning.message}>
              {warning.message}
            </li>
          ))}
        </ErrorAndWarningList>
      </details>
    );
  } else {
    return null;
  }
};

const errorAndWarningsTitle = (nErrors: number, nWarnings: number): string => {
  const messages: string[] = [];

  if (nErrors > 1) {
    messages.push(`${nErrors} errors`);
  } else if (nErrors === 1) {
    messages.push(`${nErrors} error`);
  }

  if (nWarnings > 1) {
    messages.push(`${nWarnings} warnings`);
  } else if (nWarnings === 1) {
    messages.push(`${nWarnings} warning`);
  }

  return messages.join(", ");
};

export default GameLobbySetupErrors;
