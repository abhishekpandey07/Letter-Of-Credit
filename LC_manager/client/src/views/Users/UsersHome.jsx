import React from "react";
import { Grid, Icon, withStyles,  Button } from "@material-ui/core";
import AddIcon from '@material-ui/icons/Add'
import {NavLink} from 'react-router-dom'
import EJSON from 'mongodb-extended-json';
import { RegularCard, Table, ItemGrid } from "components";
import Edit from '@material-ui/icons/Edit'
import Close from '@material-ui/icons/Close'
import Done from '@material-ui/icons/Done'
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Slide from '@material-ui/core/Slide';
import Tooltip from '@material-ui/core/Tooltip'
import IconButton from '@material-ui/core/IconButton'
import Typography from '@material-ui/core/Typography'
import Info from '@material-ui/icons/Info';

import axios from 'axios'
import { createCipher } from "crypto";
const styles = theme => ({
  button: {
    root: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-end',
    },
    icon: {
      margin: theme.spacing.unit * 2,
    },
    iconHover: {
      margin: theme.spacing.unit * 2,
      '&:hover': {
        color:"blue",
      },
    },
  }
});

function Transition(props) {
  return <Slide direction="up" {...props} />;
}
//

class Users extends React.Component{
    constructor(props){
      super(props)
      this.state = {
        users: [],
        idx: null,
        deleteDialog: false,
        error: null
      }
    }

    callApi = async () => {
        const response = await fetch('/api/users',{credentials:'include'});
        if(response.status !== 200) throw new Error(response.statusText);
        const body = await response.json();
        return EJSON.parse(body);
    };

    componentDidMount() {
      this.callApi()
      .then(res => this.setState({ users: res }))
      .catch(err => {
        this.setState({error: err.toString()})
      });
    }    

    handleClose = () => {
      this.setState({
        deleteDialog: false,
        idx: null,
        deletionSuccess:null,
        deletionFailure:null
      });
    };

    renderDeleteDialog = () =>{
      
      var dialog = 
      <div>
        <Dialog
          open={this.state.deleteDialog}
          TransitionComponent={Transition}
          keepMounted
          onClose={this.handleClose}
          aria-labelledby="alert-dialog-slide-title"
          aria-describedby="alert-dialog-slide-description"
        >
          <DialogTitle id="alert-dialog-slide-title">
            {"Remove User"}
          </DialogTitle>
          <DialogContent>
          {
            !this.state.deletionFailure && !this.state.deletionSuccess ?
            <div>
              <DialogContentText id="alert-dialog-slide-description">
                Are you sure you want to remove the following user ? 
              </DialogContentText>
              <Grid container align='center' justify='center' direction='row' style={{marginTop:'10px'}}>
                 <Grid item xs={4}>
                   <Typography align='left' variant='subheading'>
                    Name: 
                   </Typography>
                   <Typography align='left' variant='subheading'>
                    Email: 
                   </Typography>
                  </Grid>
                  <Grid item xs = {6}>
                   <Typography align='left' variant='subheading'>
                    {this.state.users[this.state.idx].name}
                   </Typography>
                   <Typography align='left' variant='subheading'>
                    {this.state.users[this.state.idx].email}
                   </Typography>
                  </Grid>
              </Grid>
              </div>
          :
          this.state.deletionSuccess ?
            <div>
              <DialogContentText id="alert-dialog-slide-description">
                  The user was successfully deleted.
              </DialogContentText>
              <Grid container justify='center'>
                <Grid item xs = {8}>
                  <Done style = {{width: '150px', height: '150px'}}/>
                </Grid>
              </Grid>
            </div>
              :
            <DialogContentText id="alert-dialog-slide-description">
                  An error occured while deleting the user! Please try again later.
              </DialogContentText>
          }
          </DialogContent>
          <DialogActions>
          {
            !this.state.deletionSuccess && !this.state.deletionFailure ?
            <div>
              <Button onClick={this.handleClose} color="primary">
                Cancel
              </Button>
              <Button onClick={this.handleDelete} color="secondary">
                Remove
              </Button>
            </div>
            :
            <div/>
          }
          </DialogActions>
        </Dialog>
      </div>
    return dialog
    }

    handleClickOpen = (key) => (event) =>{
      
      this.setState({
        idx:key,
        deleteDialog:true
      })

    }

    handleDelete = (event) => {
      const url = '/users/remove'
      console.log('deleting user with email : ' + this.state.users[this.state.idx].email)
      axios.post(url,{
        email: this.state.users[this.state.idx].email,
        _method: 'DELETE'
      },
      {
        credentials:'include'
      })
      .then((res) => {
        console.log(res)
        res = JSON.parse(res.data)
        if(res.status == 200){
          this.setState({deletionSuccess:true})
        } else {
          this.setState({deletionFailure:true})
        }
      })
    }

    generateToolTipIcons = (iconsObject,index,render) => {
      const {classes} = this.props;
      return iconsObject.reduce((acc,prop,key) => {
          var shouldRender = render ? render[key] : prop.render;
          shouldRender ?
                 acc.push(
                 <Tooltip
                    id="tooltip-top"
                    title={prop.tip}
                    placement="top"
                    classes={{ tooltip: classes.tooltip }}
                  >
                  <IconButton
                    aria-label={prop.id}
                    className={classes.tableActionButton}
                    onClick={prop.handle(index)}
                  >
                    <prop.icon
                      className={
                        classes.tableActionButtonIcon + " " + classes.edit
                      }
                    />
                  </IconButton>
                </Tooltip>
                 ):
                 {}

          return acc
        },[]);
    }

    render() {
      const userToolIcons = [
      {
        icon: Close,
        tip: 'remove',
        handle: this.handleClickOpen,
        id: 'remove'
      }
      ]

      var userData = null
      if(this.state.users){
        userData = this.state.users.reduce((users,user,key)=>{
          const created = String(new Date(user.created)).split(' ').splice(1,4).join(' ');
          const lastLogin = user.lastLogin ? String(new Date(user.lastLogin)).split(' ').splice(1,4).join(' '): '-'

          var toolIcons = this.generateToolTipIcons(userToolIcons,key,[true])
          users.push([user.name, user.email, user.username,
                        user.role, created,lastLogin,toolIcons])
          return users

        },[])
      }

      
      const {classes} = this.props
      var  dialog = this.state.deleteDialog ?
          this.renderDeleteDialog()
          :
        <div/>
      return (

        <div classname="Grid">
        {dialog}
          <Grid container>
            <ItemGrid xs={12} sm={12} md={12}>
              <RegularCard
                cardTitle="Users"
                cardSubtitle="List of all Users"
                content={
                  this.state.error ?
                    <div style={{display:'flex',justifyContent:'center'}}>
                      <Info style={{color: '#F33',align:'center',widht: '25px',height:'25px','marginRight':'10px'}}/>
                      <Typography variant='title' align='center'>
                        {this.state.error}
                      </Typography>
                    </div>
                  :
                  <Table
                    tableHeaderColor="primary"
                    isNumericColumn={[false,false,false,false,false,false,false]}
                    tableHead={["Name", "Email", "Username","Role",'Created','Last Login']}
                    tableData={userData}
                  />
                }
                footer={
                  !this.state.error?
                  <div>
                    <NavLink
                      to={'/users/register'}
                      activeClassName="active"
                    >
                      <Button variant="fab" color="secondary" aria-label="add" className={classes.button}>
                        <AddIcon />
                      </Button>
                    </ NavLink>
                   </div>:
                   <div/>
              }/> 
              
            </ItemGrid>
          </Grid>
        </div>

      );
    }
}
export default withStyles(styles)(Users);

