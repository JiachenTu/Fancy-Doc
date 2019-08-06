import React from 'react';
import { BrowserRouter, Route, Switch, Link } from 'react-router-dom';

import Login from "./containers/Login";
import Register from "./containers/Register";
import Editor from "./containers/Editor";

class App extends React.Component {
  render() {
    return (
      <BrowserRouter>
        <div>
          <Route path="/:anything" render={() => <Link to="/">Back to Home</Link>} />
          {/* Normally multiple routes can match at once.*/}
          {/* In a Switch, only the 1st matched route renders.*/}
          <Switch>
            {/* Your routes here */}
            <Route exact={true} path="/" component={Login} />
            <Route exact={true} path="/login" component={Login} />
            <Route exact={true} path="/register" component={Register} />
            <Route exact={true} path="/editor" component={Editor} />
            {/* <Route path="/directory" component={Directory} /> */}

            {/* A route with no path is matched unconditionally.*/}
            <Route render={() => <h1>404</h1>} />
          </Switch>
        </div>
      </BrowserRouter>
    );
  }
};

export default App;