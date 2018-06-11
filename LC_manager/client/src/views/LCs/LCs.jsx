import React from "react";
import {Switch, Route, Redirect, NavLink } from "react-router-dom";
import LCRoutes from 'routes/lcs.jsx'

const switchRoutes = (
  <Switch>
    {LCRoutes.map((prop, key) => {
      if (prop.redirect)
        return <Redirect from={prop.path} to={prop.to} key={key} />;
      return <Route path={prop.path} component={prop.component} key={key} refresh={true} />;
    })}
  </Switch>
);

 const LCs = ({...props}) => {
    return switchRoutes;
    
}

export default LCs;