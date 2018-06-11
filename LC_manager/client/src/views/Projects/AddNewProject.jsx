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

class NewProjectForm extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      name: '',
      location: '',
      value: '',
      manager: ''
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
  

  componentWillMount() {
     console.log('async was called');
  }

  handleSubmit = event => {

    axios.post('/projects', this.state)
     .then(function(response){
       console.log(response);
       //Perform action based on response
       window.location('/Projects')
   })
     .catch(function(error){
       console.log(error);
       //Perform action based on error
     });
  }

  render () {
    //console.log(this.ProjectsList)
    //console.log(this.issuerList)
    const {classes} = this.props
    return (
      <div>
      <form onSubmit={this.handleSubmit}>
        <Grid container>
          <ItemGrid xs={12} sm={12} md={12}>
            <RegularCard
              cardTitle="Register New Project"
              cardSubtitle="Enter Project Details"
              content={
                <div>
                  <Grid container>
                    <ItemGrid xs={6} sm={3} md={3}>
                      <CustomInput
                          labelText="Project Name"
                          id="Project Name"
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
                          labelText="Location"
                          id="location"
                          value={this.state.location}
                          onChange={this.handleChange('location')}
                          formControlProps={{
                            fullWidth: true
                          }}
                          inputProps ={{
                            required: true,
                            onChange: this.handleChange('location')
                          }}
                          
                        />
                    </ItemGrid>
                    <ItemGrid xs={6} sm={3} md={3}>
                      <CustomInput
                          labelText="manager"
                          id="manager Name"
                          value={this.state.manager}
                          onChange={this.handleChange('manager')}
                          formControlProps={{
                            fullWidth: true
                          }}
                          inputProps ={{
                            required: true,
                            onChange: this.handleChange('manager')
                          }}
                          
                        />
                    </ItemGrid>
                    <ItemGrid xs={6} sm={3} md={3}>
                      <FormControl fullWidth className={classes.margin} margin='normal'>
                        <InputLabel htmlFor="adornment-amount">Value</InputLabel>
                        <Input
                          id="adornment-amount"
                          value={this.state.value}
                          type="number"
                          onChange={this.handleChange('value')}
                          startAdornment={<InputAdornment position="start">Rs.</InputAdornment>}
                        />
                      </FormControl>
                    </ItemGrid>
                    </Grid>
                </div>  
                }
               footer={<div>
                        <NavLink
                          to="/Projects"
                          activeClassName="active"
                        >
                          <Button color="primary" type="submit" onClick={this.handleSubmit}>Submit</Button>
                        </NavLink>
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

export default withStyles(styles)(NewProjectForm);
