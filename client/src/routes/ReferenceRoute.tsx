import { Redirect, Route, Switch, useRouteMatch } from "react-router";
import RoleCard from "../modules/role/card/RoleCard";
import { ALL_ROLES } from "../types/role.types";


const roleKeys = Object.keys(ALL_ROLES) as (keyof typeof ALL_ROLES)[]

function ReferenceRoute() {
  let { path, url } = useRouteMatch();

  return (
    <Switch>
      {roleKeys.map((roleKey) => (
        <Route exact path={`${path}/roles/${roleKey.toLowerCase()}`}>
          <RoleCard role={ALL_ROLES[roleKey]} />
        </Route>
      ))}
      {roleKeys.map((roleKey) => (
        <Route
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