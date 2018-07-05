import React from 'react'
import { Header, Footer} from 'components'
import Input from '@material-ui/core/Input';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import Typography from '@material-ui/core/Typography'
import EJSON from 'mongodb-extended-json';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import Select from '@material-ui/core/Select'
import InputLabel from '@material-ui/core/InputLabel'
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
    axios.post(url,this.state,{credentials:'include'})
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
          <div>
            <Grid container justify='center'>
            <Grid item xs={6} sm={4} md={4}>
              <Paper elevation='6' style={{padding:'10px 10px', marginLeft: 'auto', marginRight:'auto'}}>
              <Typography align='center' variant='title' style={{padding:'10px',marginTop:'10px'}}>
                Enter New User Details
              </Typography>
              <Grid container justify='center' alignItems='center' direction='column'>
                <Grid item>
                  <FormControl margin='normal' >
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
                <Grid item xs={12} sm ={12} md={12}>
                  <FormControl margin='normal' >
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
                <Grid item xs={12} sm ={12} md={12}>
                  <FormControl margin='normal' >
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
                <Grid item xs={12} sm ={12} md={12} style={{marginBottom:'15px'}}>
                   <FormControl fullWidth={true} margin='normal'>
                    <InputLabel htmlFor="role" required> Role</InputLabel>
                    <Select
                      required
                      native
                      onChange={this.handleValueChange('role')}
                      inputProps={{
                        name: 'role',
                        id: 'role',
                      }}
                    >
                      {['read','readWrite','admin'].map((prop,key) => {
                        return(<option value={prop}>{prop}</option>)
                      })}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={12} md={12}>
                  <Button variant='contained' onClick={this.handleSubmit}>
                    Submit
                  </Button>                    
                </Grid>
              </Grid>
            </Paper>  
            </Grid>
          </Grid>
          </div>
        </div>
      );

  }

}

export default RegisterPage;
