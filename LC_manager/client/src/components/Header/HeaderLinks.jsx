import React from "react";
import classNames from "classnames";
import { Manager, Target, Popper } from "react-popper";
import {
  withStyles,
  IconButton,
  MenuItem,
  MenuList,
  Grow,
  Paper,
  ClickAwayListener,
  Hidden,
  Button,
  Typography
} from "@material-ui/core";
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField'
import Grid from '@material-ui/core/Grid'
import { NavLink } from 'react-router-dom'
import { Person, Notifications, Dashboard, Search, Done } from "@material-ui/icons";
import { CustomInput, IconButton as SearchButton } from "components";

import headerLinksStyle from "assets/jss/material-dashboard-react/headerLinksStyle";
import axios from "axios";

class HeaderLinks extends React.Component {
  state = {
    open: false,
    prof: false,
    passChangeDialog: false,
    passChangeSuccess: null,
    passChangeFailure: null,
    newPassMatchError: false
  };
  handleClick = () => {
    this.setState({ open: !this.state.open });
  };

  handleProfClick = () => {
    console.log('in prof click')
    this.setState({prof: !this.state.prof})
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  handleProfClose = () =>  {
    this.setState({ prof: false})
  };

  handleLogout = () => {
    this.handleProfClose();
    this.props.handleLogout();
  }

  handleChangePassClick = () => {
    this.setState({passChangeDialog: true})
  }

  handleDialogClose = () => {
    console.log('closing dialog')
    this.setState({passChangeDialog: false})
  }

  handleChangePassSubmit = () =>{
    var oldPass = document.getElementById('oldPass').value
    var newPass = document.getElementById('newPass').value
    var confNewPass = document.getElementById('confNewPass').value
    if(oldPass && newPass && confNewPass){
      if(newPass == confNewPass){
        const url = '/users/changePass'
        console.log('posting request')
        axios.post(url,{
          old: oldPass,
          new: newPass,
          confNew: confNewPass,
          _method: 'PUT'
        },
        {
          credentials: 'include'
        })
        .then((res) => {
          console.log(res)
          if(res.data.status == 200){
            this.setState({passChangeSuccess:true})
          } else {
            this.setState({passChangeFailure:true})
          }
        })
        .then((error) => {
          console.log(error)
        })    
      } else {
        console.log('New password does not match')
        this.setState({newPassMatchError:true})
      }
    } 
    else {
      this.incompleteForm = true
    }

  }

  generatePassChangeForm = () => {
    const form = 
    <Grid container direction = 'column' align='center'>
      <Grid item md={10} xs={12} sm={10}>
        <TextField
          autoFocus
          margin="noraml"
          id="oldPass"
          label="Old Password"
          type="password"
          fullWidth
        />
      </Grid>
      <Grid item md={10} xs={12} sm={10}>
        <TextField
          error={this.state.newPassMatchError}
          autoFocus
          margin="normal"
          id="newPass"
          label="New Password"
          type="password"
          fullWidth
        />
      </Grid>
      <Grid item md={10} xs={12} sm={10}>
        <TextField
          error={this.state.newPassMatchError}
          autoFocus
          margin="noraml"
          id="confNewPass"
          label="Confirm New Password"
          type="password"
          fullWidth
        />
      </Grid>
    </Grid>
    return form
  }

  render() {
    const { classes } = this.props;
    const { open, prof } = this.state;
    const roles = ['Admin','COO']
    this.newPassMatchError = false
    return (
      <div>
      { 
        roles.includes(this.props.role)?
        <NavLink
          to='/Register'
          activeClassName="active"

        >
          <Button varaint='contained' style={{margin:"0px 15px"}}>
            Register New User
          </Button>
        </NavLink>
        :
        <div/>
      }
        <IconButton
          color="inherit"
          aria-label="Dashboard"
          className={classes.buttonLink}
        >
          <Dashboard className={classes.links} />
          <Hidden mdUp>
            <p className={classes.linkText}>Dashboard</p>
          </Hidden>
        </IconButton>
        <Manager style={{ display: "inline-block" }}>
          <Target>
            <IconButton
              color="inherit"
              aria-label="Person"
              aria-owns={prof ? "menu-list" : null}
              aria-haspopup="true"
              onClick={this.handleProfClick}
              className={classes.buttonLink}              
            >
              <Person className={classes.links} />
              <Hidden mdUp>
                <p onClick={this.handleProfClick} className={classes.linkText}>
                Profile</p>
              </Hidden>
            </IconButton>
              
          </Target>
          <Popper
            placement="bottom-start"
            eventsEnabled={prof}
            className={
              classNames({ [classes.popperClose]: !prof }) +
              " " +
              classes.pooperResponsive
            }
          >
            <ClickAwayListener onClickAway={this.handleProfClose}>
              <Grow
                in={prof}
                id="prof-list"
                style={{ transformOrigin: "0 0 0" }}
              >
                <Paper className={classes.dropdown}>
                  <MenuList role="menu">
                    <MenuItem
                      onClick={this.handleLogout}
                      className={classes.dropdownItem}
                    >
                    <Typography align='center' variant='subheading'>
                      Logout
                    </Typography>
                    </MenuItem>
                    <MenuItem
                      onClick={this.handleChangePassClick}
                      className={classes.dropdownItem}
                    >
                    <Typography align='center' variant='subheading' style={{colour:'purple'}}>
                      Change Password
                    </Typography>
                    <Dialog
                      open={this.state.passChangeDialog}
                      onClose={this.handleDialogClose}
                      aria-labelledby="form-dialog-title"
                    >
                      <DialogTitle id="form-dialog-title">Change Password</DialogTitle>
                      <DialogContent>
                      { !this.state.passChangeSuccess && !this.state.passChangeFailure  ?
                        this.generatePassChangeForm()
                        :
                        this.state.passChangeSuccess?
                        <div>
                            <Typography align='center'>
                              Password successfully changed!
                            </Typography>
                            <Done align='center' style={{
                              width: '150px',
                              height:'150px',
                              align:'center',
                              margin: 'auto'
                            }}/>
                          </div>
                        :
                        <Typography align = 'center'>
                          Password could not be changed
                        </Typography>
                      }
                      </DialogContent>
                      <DialogActions>
                      { !this.state.passChangeSuccess && !this.state.passChangeFailure ? 
                        <Button onClick={this.handleChangePassSubmit} color="primary">
                          Submit
                        </Button>
                        :
                        <div/>
                      }
                      </DialogActions>
                    </Dialog>
                    </MenuItem>
                  </MenuList>
                </Paper>
              </Grow>
            </ClickAwayListener>
          </Popper>
        </Manager>
      </div>
    );
  }
}

export default withStyles(headerLinksStyle)(HeaderLinks);
