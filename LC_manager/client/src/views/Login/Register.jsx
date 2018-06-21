import React from 'react'
import { Header, Footer} from 'components'
import Input from '@material-ui/core/Input';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import EJSON from 'mongodb-extended-json';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid'
import axios from 'axios'

class RegisterPage extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      name: null,
      role: null,
      username: null,
      password: null,
      _id : null,
      email: null,
      passconf: null,
    }

  }

  handleValueChange = target => event => {
    this.setState({ [target] : event.target.value });
    console.log(this.state)
  }

  inputValidation = () => {
    if(this.state.password === this.state.passconf)
      return true
    return false
  }

  handleSubmit = event => {

    if(!this.inputValidation()){
      console.log('Input not valid')
      return
    }

    const url = '/users/register'
        
    /*var data = new FormData()
    data.append('name',this.state.name);
    data.append('role',this.state.role);
    data.append('email',this.state.email);
    data.append('_id',this.state._id)
    data.append('username',this.state.username);
    data.append('password',this.state.password);
    data.append('_method','PUT')


    fetch(url,{
      method: 'POST',
      body: data
    })*/
    axios.post(url,this.state)
    .then(res => {
      console.log(res)
    })
    .catch(error => {
      console.error(error)
    })
  }

  render () {

    return(
        <div>
          <div><Grid container>
            <Grid item xs={12} sm ={12} md={4}/>
            <Grid item xs={12} sm ={12} md={4}>
              <FormControl fullWidth={true}>
                <TextField
                  required
                  id='name'
                  label='Employee ID'
                  type='text'
                  onChange={this.handleValueChange('_id')}
                  InputLabelProps={{shrink:true}}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} sm ={12} md={4}/>
          </Grid>
          <Grid container>
            <Grid item xs={12} sm ={12} md={4}/>
            <Grid item xs={12} sm ={12} md={4}>
              <FormControl fullWidth={true}>
                <TextField
                  required
                  id='name'
                  label='Name'
                  type='text'
                  value={this.state.name}
                  onChange={this.handleValueChange('name')}
                  InputLabelProps={{shrink:true}}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} sm ={12} md={4}/>
          </Grid>
          </div>
          <div>
          <Grid container>
            <Grid item xs={12} sm ={12} md={4}/>
            <Grid item xs={12} sm ={12} md={4}>
              <FormControl fullWidth={true}>
                <TextField
                  required
                  id='email'
                  label='Email'
                  type='text'
                  value={this.state.email}
                  onChange={this.handleValueChange('email')}
                  InputLabelProps={{shrink:true}}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} sm ={12} md={4}/>
          </Grid>
          </div>
          <div>
          <Grid container>
            <Grid item xs={12} sm ={12} md={4}/>
            <Grid item xs={12} sm ={12} md={4}>
              <FormControl fullWidth={true}>
                <TextField
                  required
                  id='role'
                  label='Role'
                  type='text'
                  value={this.state.role}
                  onChange={this.handleValueChange('role')}
                  InputLabelProps={{shrink:true}}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} sm ={12} md={4}/>
          </Grid>
          </div>
          <div>
          <Grid container>
            <Grid item xs={12} sm ={12} md={4}/>
            <Grid item xs={12} sm ={12} md={4}>
              <div>
              <FormControl fullWidth={true}>
                <TextField
                  required
                  id='username'
                  label='username'
                  type='text'
                  value={this.state.username}
                  onChange={this.handleValueChange('username')}
                  InputLabelProps={{shrink:true}}
                />
              </FormControl>
              </div>
            </Grid>
            <Grid item xs={12} sm ={12} md={4}/>
          </Grid>
          </div>
          <div>
          <Grid container>
            <Grid item xs={12} sm ={12} md={4}/>
            <Grid item xs={12} sm ={12} md={4}>
              <FormControl fullWidth={true}>
                <TextField
                  required
                  id='pass'
                  label='Password'
                  type='password'
                  value={this.state.password}
                  onChange={this.handleValueChange('password')}
                  InputLabelProps={{shrink:true}}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} sm ={12} md={4}/>
          </Grid>          
          </div>
          <div>
          <Grid container>
            <Grid item xs={12} sm ={12} md={4}/>
            <Grid item xs={12} sm ={12} md={4}>
              <FormControl fullWidth={true}>
                <TextField
                  required
                  id='passconfirm'
                  label='Confirm Password'
                  type='password'
                  value={this.state.passconf}
                  onChange={this.handleValueChange('passconf')}
                  InputLabelProps={{shrink:true}}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} sm ={12} md={4}/>
          </Grid>
          </div>
          <div>
          <Button onClick={this.handleSubmit}>
            Submit
          </Button>                    
          </div>
        </div>
      );

  }

}

export default RegisterPage;
