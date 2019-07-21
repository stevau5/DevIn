import React, { Fragment } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Landing from './components/layout/Landing';
import Register from './components/auth/register';
import Login from './components/auth/login';

import './App.css';

const App = () => (
  <Router>
    <Fragment>
      <Navbar />
      <Route exact path = '/' component = {Landing} />
      <section className="container">
        <Switch>
          <Route exact path = '/register' component = {Register}></Route>
          <Route exact path = '/login' component = {Login}></Route>
        </Switch>
      </section>
    </Fragment>
  </Router>
  
);

export default App;
