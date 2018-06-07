import React from "react";
import { Grid, Icon, withStyles,  Button, Typography } from "@material-ui/core";
import AddIcon from '@material-ui/icons/Add'
import Modal from '@material-ui/core/Modal';
import EJSON from 'mongodb-extended-json'
//import getComponent from 'hadron-react-bson'
import {Switch, Route, Redirect, NavLink } from "react-router-dom";
import { RegularCard, Table, ItemGrid, AddModal } from "components";
import LCRoutes from 'routes/lcs.jsx'

const switchRoutes = (
  <Switch>
    {LCRoutes.map((prop, key) => {
      if (prop.redirect)
        return <Redirect from={prop.path} to={prop.to} key={key} />;
      return <Route path={prop.path} component={prop.component} key={key} />;
    })}
  </Switch>
);

 const LCs = ({...props}) => {
    return switchRoutes;
    
}

export default LCs;