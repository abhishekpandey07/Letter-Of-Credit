import React from "react";
import {NavLink} from 'react-router-dom'
import { Grid, InputLabel, withStyles, Divider, Paper} from "@material-ui/core";
import Input from '@material-ui/core/Input';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import EJSON from 'mongodb-extended-json';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import axios from 'axios'

import {
  //ProfileCard,
  RegularCard,
  Button,
  CustomInput,
  ItemGrid
} from "components";


//import avatar from "assets/img/faces/marc.jpg";


const styles = theme =>{
  formControl : {
    fullWidth: true
  }
}

class NewBankForm extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      name: '',
      branch: '',
      IFSC: '',
      LC_limit: 0,
      LC_used: 0
      }

      
  }
  
  /*callProjectsApi = async () => {
     const response = await fetch('/projects');
     const body = await response.json();
     if (response.status !== 200) throw Error(body.message);
     return EJSON.parse(body);
   };*/

  handleChange = name => event => {
    this.setState({ [name]: event.target.value.toUpperCase() });
    console.log(this.state)
  };
  

    componentDidMount() {
      console.log('async was called');
    /*  this.callProjectsApi()
      .then(res => this.setState({ projectsList: res }))
      .catch(err => console.log(err));
  */
    }

  handleSubmit = event => {

    axios.post('/api/banks', this.state,{credentials:'true'})
     .then(function(response){
       console.log(response);
       //Perform action based on response
       window.location='/Banks'
   })
     .catch(function(error){
       console.log(error);
       //Perform action based on error
     });
  }

  render () {
    //console.log(this.BanksList)
    //console.log(this.issuerList)
    /*var projectsList = this.state.projectsList.map(prop => {
      return(
        <option value={prop._id} >
          {prop.name} ({prop.location})
        </option>
      )
    })*/

    const {classes} = this.props
    return (
      <div>
      <form>
        <Grid container>
          <ItemGrid xs={12} sm={12} md={12}>
            <RegularCard
              cardTitle="Register New Bank"
              cardSubtitle="Enter Bank Details"
              content={
                <div>
                  <Grid container>
                    <ItemGrid xs={6} sm={3} md={3}>
                      <CustomInput
                          labelText="Bank Name"
                          id="Bank Name"
                          value={this.state.name}
                          onChange={this.handleChange('name')}
                          formControlProps={{
                            fullWidth: true
                          }}
                          inputProps ={{
                            required: true,
                            onChange: this.handleChange('name')
                          }}
                        />
                    </ItemGrid>
                    <ItemGrid xs={6} sm={3} md={3}>
                      <CustomInput
                          labelText="Bank Branch"
                          id="Bank Brancg"
                          value={this.state.branch}
                          onChange={this.handleChange('branch')}
                          formControlProps={{
                            fullWidth: true
                          }}
                          inputProps ={{
                            required: true,
                            onChange: this.handleChange('branch')
                          }}
                          
                        />
                    </ItemGrid>

                    <ItemGrid xs={6} sm={3} md={3}>
                      <CustomInput
                          labelText="Bank IFSC"
                          id="bank IFSC"
                          value={this.state.IFSC}
                          onChange={this.handleChange('IFSC')}
                          formControlProps={{
                            fullWidth: true
                          }}
                          inputProps ={{
                            required: true,
                            onChange: this.handleChange('IFSC')
                          }}
                          
                        />
                    </ItemGrid>
                    <ItemGrid xs={6} sm={3} md={3}>
                      <FormControl fullWidth className={classes.margin} margin='normal'>
                        <InputLabel htmlFor="adornment-amount">LC limit</InputLabel>
                        <Input
                          id="adornment-amount"
                          value={this.state.LC_limit}
                          type="number"
                          onChange={this.handleChange('LC_limit')}
                          startAdornment={<InputAdornment position="start">Rs.</InputAdornment>}
                        />
                      </FormControl>
                    </ItemGrid>
                    <ItemGrid xs={6} sm={3} md={3}>
                      <FormControl fullWidth className={classes.margin} margin='normal'>
                        <InputLabel htmlFor="adornment-amount">LC used</InputLabel>
                        <Input
                          id="adornment-amount"
                          value={this.state.LC_used}
                          type="number"
                          onChange={this.handleChange('LC_used')}
                          startAdornment={<InputAdornment position="start">Rs.</InputAdornment>}
                        />
                      </FormControl>
                    </ItemGrid>
                    </Grid>
                </div>  
                }
               footer={<div>
                          <Button color="primary" type="submit" onClick={this.handleSubmit}>Submit</Button>
                      </div>

              }
                />
          </ItemGrid>
        </Grid>
      </form>
      </div>
    );
  }
}

export default withStyles(styles)(NewBankForm);
