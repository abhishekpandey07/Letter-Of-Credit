import React from 'react'
import { Header, Footer} from 'components'
import Input from '@material-ui/core/Input';
import Paper from '@material-ui/core/Paper'
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import EJSON from 'mongodb-extended-json';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid'
import axios from 'axios'
import {instanceOf} from 'prop-types'
import { withCookies, Cookies } from 'react-cookie'

class LoginPage extends React.Component {
   constructor(props){
    super(props);
    this.state = {
      username: null,
      password: null,
    }
  }

  componentWillMount = () => {
    const url = '/users/sessionAuthentication'
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
  }

  handleValueChange = target => event => {
    this.setState({ [target] : event.target.value });
    console.log(this.state)
  }

  handleSubmit = event => {
    const url = '/users/login'

    const payload = {
      username: this.state.username,
      password: this.state.password, 
    }

    axios.post(url,payload,{credentials:'include'})
    .then(res => {
      console.log(res)
      const data = EJSON.parse(res.data);
      if(data.authenticated === true){
        console.log('Authenticated! providing access')
        this.setState({
          username: null, 
          password: null, 
        })
        this.props.onLoginSuccess(data)
      }
    })
    .catch(error => {
      console.error(error)
    })
  }

  render () {

    return(
        <div>
          <Grid container>
            <Grid xs={12} sm={12} md={4} />
            <Grid xs={12} sm={12} md={4}>
              <Paper>
                <div>
                <FormControl fullWidth={true}>
                  <TextField
                    required
                    id='username'
                    type='text'
                    label='username'
                    onChange={this.handleValueChange('username')}
                  />
                </FormControl>
                </div>
                <div>
                <FormControl fullWidth={true}>
                  <TextField
                    required
                    id='pass'
                    type='password'
                    label='password'
                    onChange={this.handleValueChange('password')}
                  />
                </FormControl>
                </div>
                <div>
                <Button variant='contained' onClick={this.handleSubmit}>
                  Submit
                </Button>
                </div>
              </Paper>
            </Grid>
            <Grid xs={12} sm={12} md={4} />
          </Grid>
        </div>
      );

  }

}

LoginPage.propTypes = {
  cookies: instanceOf(Cookies).isRequired
}

export default withCookies(LoginPage);
