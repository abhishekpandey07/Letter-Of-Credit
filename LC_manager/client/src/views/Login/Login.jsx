import React from 'react'
import Input from '@material-ui/core/Input';
import Paper from '@material-ui/core/Paper'
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import {withStyles} from '@material-ui/core/'
import axios from 'axios'
import EJSON from 'mongodb-extended-json';

import Header from './LoginHeader.jsx'
import { transition, container } from "assets/jss/material-dashboard-react.jsx";
import { createMuiTheme } from '@material-ui/core/styles';
import purple from '@material-ui/core/colors/purple';
import green from '@material-ui/core/colors/green';


const appStyle = theme => ({
  wrapper: {
    position: "relative",
    top: "0",
    height: "100vh"
  },
  mainPanel: {
    [theme.breakpoints.up("md")]: {
      width: '100%'
    },
    overflow: "auto",
    position: "relative",
    float: "right",
    ...transition,
    maxHeight: "100%",
    width: "100%",
    overflowScrolling: 'touch'
  },
  content: {
    marginTop: "70px",
    padding: "30px 15px",
    minHeight: "calc(100% - 123px)"
  },
  container,
  paper: theme.mixins.gutters({
    paddingTop: 16,
    paddingBottom: 16,
    marginTop: theme.spacing.unit * 3,
    justifyContent: 'center'
  }),
  formHeading: {
    variant: 'headline',
    align: 'center',
    color: '#e91e6'
  }
});


class LoginPage extends React.Component {
   constructor(props){
    super(props);
    this.state = {
      authenticated: false,
      error: false,
    }
  }

  checkAuthentication = async () => {
    const url = '/users/sessionAuthentication'
    var res = await axios.get(url,{credentials: 'include'})
    const data = await EJSON.parse(res.data);
    if(data.authenticated === true){
        console.log('Authenticated! providing access')
        this.props.onLoginSuccess(data)
        return true
      }
    return false
  } 

  /*componentWillMount = async () => {

    /*const url = '/users/sessionAuthentication'
    axios.get(url,{credentials: 'include'})
    .then(res => {
      const data = EJSON.parse(res.data);
      if(data.authenticated === true){
        console.log('Authenticated! providing access')
        this.props.onLoginSuccess(data)
      }
    }).catch( error => {
      console.log(error)
    })

    var loggedIn = await this.checkAuthentication()
    loggedIn? console.log('login Successfull'):{}
  }*/

  /*handleValueChange = target => event => {
    this.setState({ [target] : event.target.value });
    console.log(this.state)
  }*/

  handleSubmit = event => {
    const url = '/users/login'

    const username = document.getElementById('username').value
    const password = document.getElementById('pass').value
    
    const payload = {
      username: username,
      password: password, 
    }


    axios.post(url,payload,{credentials:'include'})
    .then(res => {
      if(res.status == 200){
        const data = EJSON.parse(res.data);
        if(data.authenticated === true){
          console.log('Authenticated! providing access')
          this.setState({
            authenticated: true 
          })
          this.props.onLoginSuccess(data)
        }
      }

      if(res.status==401){
          console.log('not authenticated')
          this.setState({error:true})        
      }

    })
    .catch(error => {
      console.error(error)
    })
  }

  render () {
    var {classes , ...rest} = this.props
    return(
      <div className={classes.mainPanel} ref='mainPanel'>
        <Header {...rest}/>
        <div className={classes.content}>
        <div className={classes.container}>
          <Grid container>
            <Grid item xs={12} sm={12} md={4} />
            <Grid item xs={12} sm={12} md={4}>
              <Paper margin='normal' className={classes.paper} elevation={6}>
                <div>
                  <Typography variant='headline' align='center' >
                    LC Manager Login
                  </Typography>
                </div>
                <div clasName={classes.content} justifyContent='center'>
                <FormControl margin='normal' fullWidth={true} >
                  <TextField
                    required
                    id='username'
                    type='text'
                    label='username'
                  />
                </FormControl>
                </div>
                <div>
                <FormControl fullWidth={true} margin='normal'>
                  <TextField
                    error={this.state.error}
                    required
                    id='pass'
                    type='password'
                    label='password'
                  />
                </FormControl>
                </div>
                <div>
                <Button variant='contained' onClick={this.handleSubmit} align='center'>
                  Submit
                </Button>
                </div>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={12} md={4} />
          </Grid>
        </div>
        </div>
      </div>
      );
  }
  //end
}

export default withStyles(appStyle)(LoginPage);
