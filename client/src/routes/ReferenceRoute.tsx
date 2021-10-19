import { Redirect, Route, Switch, useHistory, useRouteMatch } from "react-router-dom";
import RoleCardViewer from "../modules/role/card/viewer/RoleCardViewer";
import { ALL_ROLES } from "../types/role.types";


const roleKeys = Object.keys(ALL_ROLES) as (keyof typeof ALL_ROLES)[]

function ReferenceRoute() {
  const { path, url } = useRouteMatch();
  const history = useHistory()

  return (
    <Switch>
      <Route exact path={`${path}/roles`}>
        <RoleCardViewer
          onRoleSelect={(newRole) =>
            history.push(`${url}/roles/${newRole.toLowerCase()}`)
          }
        />
      </Route>
      {roleKeys.map((roleKey) => (
        <Route
          key={roleKey}
          exact
          path={`${path}/roles/${roleKey.toLowerCase()}`}
        >
          <RoleCardViewer
            selectedRole={roleKey}
            onRoleSelect={(newRole) =>
              history.push(`${url}/roles/${newRole.toLowerCase()}`)
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
            .toLowerCase()}`}
        >
          <Redirect to={`${path}/roles/${roleKey.toLowerCase()}`} />
        </Route>
      ))}
      <Route exact path={`${path}/roles/blue_team`}>
        <Redirect to={`${path}/roles/team_blue`} />
      </Route>
      <Route exact path={`${path}/roles/red_team`}>
        <Redirect to={`${path}/roles/team_red`} />
      </Route>
    </Switch>
  );
}

export default ReferenceRoute;