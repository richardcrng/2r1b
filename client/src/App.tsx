import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import useMobileVH from "./hooks/useMobileVH";
import GameRoute from "./routes/GameRoute";
import IndexRoute from "./routes/IndexRoute";
import ReferenceRoute from "./routes/ReferenceRoute";

function App() {
  useMobileVH()

  return (
    <Router>
      <main
        className='background'
        style={{
          backgroundImage: "url('/assets/2r1b-background.png')",
          backgroundPosition: "center center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <div className='active-area'>
          <Switch>
            <Route exact path="/game/:gameId" component={GameRoute} />
            <Route path="/reference" component={ReferenceRoute} />
            <Route path="/" component={IndexRoute} />
          </Switch>
        </div>
      </main>
    </Router>
  );
}

export default App;
