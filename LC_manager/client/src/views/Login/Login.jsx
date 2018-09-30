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
    const url = '/session-authenticate'
    var res = await axios.get(url,{credentials: 'include'})
    const data = await EJSON.parse(res.data);
    if(data.authenticated === true){
        console.log('Authenticated! providing access')
        this.props.onLoginSuccess(data)
        return true
      }
    return false
  } 

  componentWillMount = async () => {
    const url = 'session-authenticate'
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
  }

  componentDidMount = () =>{
    var input = document.getElementById("pass");
    var submit = document.getElementById("submit")

      // Execute a function when the user releases a key on the keyboard
      input.addEventListener("keyup", function(event) {
        // Cancel the default action, if needed
        event.preventDefault();
        // Number 13 is the "Enter" key on the keyboard
        if (event.keyCode === 13) {
          // Trigger the button element with a click
          submit.click();
        }
    });
  }

  handleValueChange = target => event => {
    this.setState({ [target] : event.target.value });
    console.log(this.state)
  }

  handleSubmit = event => {
    const url = '/api/users/login'

    const username = document.getElementById('username').value
    const password = document.getElementById('pass').value
    
    const payload = {
      username: username,
      password: password, 
    }


    try{
      axios.post(url,payload,{credentials:'include'})
      .then(res => {
        if(res.status == 200){

          const data = EJSON.parse(res.data);
          if(data.status === 404){
            this.setState({userError:true})
            console.log(data.message)
          } 
          if(data.status === 401){
            this.setState({error:true})
          }
          if(data.status === 200 && data.authenticated === true){
            console.log('Authenticated! providing access')
            this.setState({
              authenticated: true 
            })
            this.props.onLoginSuccess(data)
          } else {
            console.log('not authenticated')
            this.setState({error:true})        
          }
        }
      })
      .catch(error => {
        console.error(error)
      })
    }catch(error){
      console.log(error)
    }
  }

  render () {
    var {classes , ...rest} = this.props
    return(
      <div className={classes.mainPanel} ref='mainPanel'>
        <Header {...rest}/>
        <div className={classes.content}>
        <div className={classes.container}>
          <Grid container justify='center' alignItems='center'>
            <Grid item xs={6} sm={3} md={3}>
              <Paper style={{padding:'10px 10px', marginLeft: 'auto', marginRight:'auto'}} elevation={6}>
                <Grid container justify='space-around' alignItems='center' direction='column'>
                    <Typography variant='headline' align='center' style={{padding:'10px',marginTop:'10px'}} >
                      LC Manager Login
                    </Typography>
                  <Grid item xs={12} sm={12} md={12}>
                    <FormControl margin='normal' style={{width:'100%'}} >
                      <TextField
                        required
                        id='username'
                        type='text'
                        label='Email'
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={12} md={12}>
                    <FormControl  margin='normal' style={{width:'100%'}}>
                      <TextField
                        error={this.state.error}
                        required
                        id='pass'
                        type='password'
                        label='password'
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={12} md={12}>
                    <Button id='submit' variant='contained' onClick={this.handleSubmit} align='center'>
                      Submit
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </div>
        </div>
      </div>
      );
  }
  //end
}

export default withStyles(appStyle)(LoginPage);
