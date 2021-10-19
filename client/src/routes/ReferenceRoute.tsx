import { Redirect, Route, Switch, useHistory, useRouteMatch } from "react-router-dom";
import RoleCard, { getColors } from "../modules/role/card/RoleCard";
import { ALL_ROLES } from "../types/role.types";


const roleKeys = Object.keys(ALL_ROLES) as (keyof typeof ALL_ROLES)[]
const roleValues = Object.values(ALL_ROLES)
const roleValuesAlphabetised = roleValues.sort((a, b) => a.roleName < b.roleName ? -1 : 1)

function ReferenceRoute() {
  const { path, url } = useRouteMatch();
  const history = useHistory()

  return (
    <Switch>
      <Route exact path={`${path}/roles`}>
        <div>
          <h1>Pick a role</h1>
          <ul>
            {roleValuesAlphabetised.map((role) => (
              <li
                key={role.key}
                style={{ color: getColors(role.color).primary }}
                onClick={() => history.push(`${url}/roles/${role.key.toLowerCase()}`)}
              >
                {role.roleName}
              </li>
            ))}
          </ul>
        </div>
      </Route>
      {roleKeys.map((roleKey) => (
        <Route key={roleKey} exact path={`${path}/roles/${roleKey.toLowerCase()}`}>
          <h1>Role Reference</h1>
          <RoleCard role={ALL_ROLES[roleKey]} />
        </Route>
      ))}
      {roleKeys.map((roleKey) => (
        <Route
          key={roleKey}
          exact
          path={`${path}/roles/${roleKey.replace(/(_RED|_BLUE|_GREY)/, "").toLowerCase()}`}
        >
          <Redirect to={`${path}/roles/${roleKey.toLowerCase()}`} />
        </Route>
      ))}
    </Switch>
  );
}

export default ReferenceRoute;