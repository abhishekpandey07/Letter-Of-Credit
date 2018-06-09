import React from "react";
import {Switch, Route, Redirect, NavLink } from "react-router-dom";
import ProjectRoutes from 'routes/projects.jsx'

const switchRoutes = (
  <Switch>
    {ProjectRoutes.map((prop, key) => {
      if (prop.redirect)
        return <Redirect from={prop.path} to={prop.to} key={key} />;
      return <Route path={prop.path} component={prop.component} key={key} />;
    })}
  </Switch>
);

 const Projects = ({...props}) => {
    return switchRoutes;
    
}

export default Projects;