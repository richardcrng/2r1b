import { Redirect, Route, Switch, useHistory, useRouteMatch } from "react-router-dom";
import RoleCard, { getColors } from "../modules/role/card/RoleCard";
import RoleCardViewer from "../modules/role/card/viewer/RoleCardViewer";
import { ALL_ROLES } from "../types/role.types";


const roleKeys = Object.keys(ALL_ROLES) as (keyof typeof ALL_ROLES)[]

function ReferenceRoute() {
  const { path, url } = useRouteMatch();

  return (
    <Switch>
      <Route exact path={`${path}/roles`}>
        <div>
          <RoleCardViewer />
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