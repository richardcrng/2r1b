import {
  Redirect,
  Route,
  Switch,
  useHistory,
  useRouteMatch,
} from "react-router-dom";
import RoleCardViewer from "../modules/role/card/viewer/RoleCardViewer";
import { ALL_ROLES } from "../types/role.types";

const roleKeys = Object.keys(ALL_ROLES) as (keyof typeof ALL_ROLES)[];

function ReferenceRoute(): JSX.Element {
  const { path, url } = useRouteMatch();
  const history = useHistory();

  return (
    <Switch>
      <Route exact path={`${path}/roles`}>
        <RoleCardViewer
          onRoleSelect={(newRole) =>
            history.push(
              `${url}/roles/${newRole.toLowerCase().replaceAll("_", "-")}`
            )
          }
        />
      </Route>
      {roleKeys.map((roleKey) => (
        <Route
          key={roleKey}
          exact
          path={`${path}/roles/${roleKey.toLowerCase().replaceAll("_", "-")}`}
        >
          <RoleCardViewer
            selectedRole={roleKey}
            onRoleSelect={(newRole) =>
              history.push(
                `${url}/roles/${newRole.toLowerCase().replaceAll("_", "-")}`
              )
            }
          />
        </Route>
      ))}
      {roleKeys.map((roleKey) => (
        <Route
          key={roleKey}
          exact
          path={`${path}/roles/${roleKey
            .replace(/(_RED|_BLUE|_GREY)/, "")
            .toLowerCase()
            .replaceAll("_", "-")}`}
        >
          <Redirect
            to={`${path}/roles/${roleKey.toLowerCase().replaceAll("_", "-")}`}
          />
        </Route>
      ))}
      <Route exact path={`${path}/roles/blue-team`}>
        <Redirect to={`${path}/roles/team-blue`} />
      </Route>
      <Route exact path={`${path}/roles/red-team`}>
        <Redirect to={`${path}/roles/team-red`} />
      </Route>
    </Switch>
  );
}

export default ReferenceRoute;
