import React from "react";
import PropTypes from "prop-types";
import { Menu } from "@material-ui/icons";
import {
  withStyles,
  AppBar,
  Toolbar,
  IconButton,
  Hidden,
  Button
} from "@material-ui/core";
import MenuIcon from '@material-ui/icons/Menu'
import cx from "classnames";

import headerStyle from "assets/jss/material-dashboard-react/headerStyle.jsx";
import classNames from 'classnames'
import HeaderLinks from "./HeaderLinks";

function Header({ ...props }) {
  function makeBrand() {
    var name;
    props.routes.map((prop, key) => {
      if (prop.path === props.location.pathname) {
        if(prop.path === '/dashboard'){
          name = 'Welcome '+ props.data.name
        } else{
          name = prop.navbarName;
        }
        
      }
      return null;
    });
    return name;
  }
  const { classes, color } = props;
  const appBarClasses = cx({
    [" " + classes[color]]: color
  });
  return (
    <AppBar className={classNames(classes.appBar, {
              [classes.appBarShift]: props.open,
              [classes['appBarShift-left']]: props.open,
            })}>
      <Toolbar disableGutters={!props.open} className={classes.container}>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={props.permHandle}
          className={classNames(classes.menuButton, props.open && classes.hide)}
        >
          <MenuIcon />
        </IconButton>
        
        <div className={classNames(classes.flex,{[classes.flex]: props.open})}>
          {/* Here we create navbar brand, based on route name */}
          <Button href="#" className={classes.title}>
            {makeBrand()}
          </Button>
        </div>
        <Hidden smDown implementation="css">
          <HeaderLinks handleLogout={props.handleLogout}
            role={props.data.role}handleRegister={props.handleRegister}/>
        </Hidden>
        <Hidden mdUp>
          <IconButton
            className={classes.appResponsive}
            color="inherit"
            aria-label="open drawer"
            onClick={props.handleDrawerToggle}
          >
            <Menu />
          </IconButton>
        </Hidden>
        
      </Toolbar>
    </AppBar>
  );
}

Header.propTypes = {
  classes: PropTypes.object.isRequired,
  color: PropTypes.oneOf(["primary", "info", "success", "warning", "danger"])
};

export default withStyles(headerStyle)(Header);
