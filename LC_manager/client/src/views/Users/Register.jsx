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
      role: 'read',
      username: null,
      //password: null,
      _id : null,
      email: null,
      //passconf: null,
      registrationSuccess: null,
      registrationFailure: null
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
    
    axios.post(url,this.state,{credentials:'include'})
    .then(res => {
      console.log(res)
      var res = JSON.parse(res.data);
      if(res.status == 200){
        this.setState({
          registrationSuccess: true,
          name: res.name,
          role: res.role,
          email: res.email
        })

      } else {
        this.setState({registrationFailure: true})
      }
    })
    .catch(error => {
      console.error(error)
    })
  }


  generateRegistrationForm = () => {
    const form = 
        <div>
          <Typography align='center' variant='headline' style={{padding:'10px',marginTop:'10px',color:'purple'}}>
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
        </div>

  return form
  }

  render () {

    return(
        <div>
          <div>
          <Grid container justify='center' aling='center'>
            <Grid item xs={6} sm={4} md={4}>
            <Paper elevation='6' style={{padding:'10px 10px', marginLeft: 'auto', marginRight:'auto'}}>
            {
              !this.state.registrationSuccess && !this.state.registrationFailure ? 
              this.generateRegistrationForm()
              :
              this.state.registrationSuccess ?
              <div>
                <Typography variant='headline' align='center' style={{color:'purple',padding:'10px',marginTop:'10px'}} gutterBottom>
                  User Registration Successfull!
                </Typography>
                <Typography variant='subheading' align='center' gutterBottom>
                  Name: {this.state.name}
                </Typography>
                <Typography variant='subheading' align='center' gutterBottom>
                  Email: {this.state.email}
                </Typography>
                <Typography variant='subheading' align='center' gutterBottom>
                  role: {this.state.role}
                </Typography>
              </div>
              :
              <Grid container justify='center' direction='column' align='center'>
                <Grid item xs={8}>
                  <Typography variant='headline' align='center' style={{padding:'10px',marginTop:'10px',color:'purple'}} gutterBottom>
                      User Registration Failed!
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <Button variant='outlined' align='center'
                  onClick={()=>{this.setState({registrationSuccess:false,registrationFailure:false})}}>
                    Try Again!
                  </Button>
                </Grid>
              </Grid>
            }
            </Paper>  
            </Grid>
          </Grid>
          </div>
        </div>
      );

  }

}

export default RegisterPage;
