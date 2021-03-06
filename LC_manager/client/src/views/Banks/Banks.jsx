import React from "react";
import {Switch, Route, Redirect, NavLink } from "react-router-dom";
import BankRoutes from 'routes/banks.jsx'

const switchRoutes = (
  <Switch>
    {BankRoutes.map((prop, key) => {
      if (prop.redirect)
        return <Redirect from={prop.path} to={prop.to} key={key} />;
      return <Route path={prop.path} component={prop.component} key={key} />;
    })}
  </Switch>
);

 const Banks = ({...props}) => {
    return switchRoutes;
    
}

export default Banks;