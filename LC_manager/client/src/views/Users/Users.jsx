import React from "react";
import {Switch, Route, Redirect, NavLink } from "react-router-dom";
import UserRoutes from 'routes/users.js'

const switchRoutes = (
  <Switch>
    {UserRoutes.map((prop, key) => {
      if (prop.redirect)
        return <Redirect from={prop.path} to={prop.to} key={key} />;
      return <Route path={prop.path} component={prop.component} key={key} refresh={true} />;
    })}
  </Switch>
);

const Users = ({...props}) => {
    return switchRoutes;
}

export default Users;