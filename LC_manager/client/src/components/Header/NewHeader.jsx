import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import HeaderLinks from './HeaderLinks'
import Button from '@material-ui/core/Button'
import Menu from '@material-ui/core/Menu'
import Hidden from '@material-ui/core/Hidden'
import styles from 'assets/jss/material-dashboard-react/newHeaderStyles'
import Grid from '@material-ui/core/Grid'
import logo from 'assets/../../public/logo.png'

function NewHeader(props){
  const {classes, data} = props
  return (
    <div className={classes.root}>
      <AppBar
        className={classNames(classes.appBar, {
          [classes.appBarShift]: props.open,
          [classes[`appBarShift-left`]]: props.open,
        })}
      >
        <Toolbar disableGutters={!props.open}>
          <Grid container direction='row' justify='space-between' alignItems='center'>
            <Grid item>
              <Grid container direction='row' justify='flex-start' spacing={16}>
                <Grid item>
                  <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    onClick={props.permHandle}
                    className={classNames(classes.menuButton, {[classes.hide] : (!data.authenticated || props.open)})}
                  >
                    <MenuIcon />
                  </IconButton>
                </Grid>
                <Grid item>
                  <img src={logo} className={classes.logoImage}/>
                </Grid>
                <Grid item>
                  <Typography variant='title' align='center'
                    style={{margin:'auto',paddingTop:'15px'}}>
                      Letter Of Credit Manager
                  </Typography>  
                </Grid>
              </Grid>
            </Grid>
            <Grid item>
              <Hidden smDown implementation="css">
                <HeaderLinks 
                  handleLogout={props.handleLogout}
                  role={props.data.role}
                  />
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
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>
  </div>
  );
}

NewHeader.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(NewHeader);