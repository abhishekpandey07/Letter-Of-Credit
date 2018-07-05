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

const status = {
  running: 'running',
  completed: 'completed',
  arbitrated: 'arbitrated'
}

class NewProjectForm extends React.Component{
  constructor(props){
    super(props);
    this.state ={
      WO_no: '',
      WO_date: '', 
      client: '',
      name: '',
      location: '',
      startDT: '',
      stipEndDT: '',
      expcEndDT: '',
      value: '',
      variation: '',
      finalBill: '',
      managerName: '',
      managerContact: '',
      arbLoc: '',
      arbId: '',
      status : '',
    }
  }

  handleChange = name => event => {
    this.setState({ [name]: event.target.value});
    console.log(this.state)
  };
  

  componentWillMount() {
     console.log('async was called');
  }

  handleSubmit = event => {

    axios.post('/projects', this.state,{credentials:'include'})
     .then(function(response){
       console.log(response);
       window.location = '/Projects'
   })
     .catch(function(error){
       console.log(error);
     });
  }

  render () {
    const {classes} = this.props
    var options = [<option value=''/>]

    for(var key in status){
      if(status.hasOwnProperty(key)){
        options.push(<option key={status[key]} value={status[key]}>{status[key]}</option>)
      }
    }
    return (
      <div>
      <form>
        <Grid container>
          <ItemGrid xs={12} sm={8} md={8}>
            <RegularCard
              cardTitle="Register New Project"
              cardSubtitle="Enter Project Details"
              content={
                <div>
                  <Grid container>
                    <ItemGrid xs={12} sm={3} md={3}>
                      <TextField
                          label="WorkOrder Number"
                          id="WO_no"
                          fullWidth
                          required
                          onChange={this.handleChange('WO_no')}
                          type='text'
                          margin='normal'
                        />
                    </ItemGrid>
                    <ItemGrid xs={12} sm={3} md={3}>
                      <TextField
                          label="WorkOrder Date"
                          id="WO_DT"
                          fullWidth
                          required
                          onChange={this.handleChange('WO_DT')}
                          type='date'
                          margin='normal'
                          InputLabelProps={{
                            shrink:true
                          }}
                        />
                    </ItemGrid>
                  </Grid>
                  <Grid container>
                    <ItemGrid xs={12} sm={3} md={3}>
                      <TextField
                          label="Client Name"
                          id="client"
                          fullWidth
                          required
                          onChange={this.handleChange('client')}
                          type='text'
                          margin='normal'
                        />
                    </ItemGrid>
                    <ItemGrid xs={12} sm={3} md={3}>
                      <TextField
                          label="Project Name"
                          id="name"
                          fullWidth
                          required
                          onChange={this.handleChange('name')}
                          type='text'
                          margin='normal'
                        />
                    </ItemGrid>
                    <ItemGrid xs={12} sm={3} md={3}>
                      <TextField
                          label="Project Location"
                          id="location"
                          fullWidth
                          required
                          onChange={this.handleChange('location')}
                          type='text'
                          margin='normal'
                        />
                    </ItemGrid>
                  </Grid>
                  <Grid container>
                    <ItemGrid xs={12} sm={3} md={3}>
                      <FormControl fullWidth className={classes.margin} margin='normal'>
                        <InputLabel htmlFor="awardedValue">Awarded Value</InputLabel>
                        <Input
                          id="awardedValue"
                          deafultValue={0}
                          type="number"
                          onChange={this.handleChange('value')}
                          startAdornment={<InputAdornment position="start">Rs.</InputAdornment>}
                        />
                      </FormControl>
                    </ItemGrid>
                    <ItemGrid xs={12} sm={3} md={3}>
                      <FormControl fullWidth className={classes.margin} margin='normal'>
                        <InputLabel htmlFor="variation">Variations</InputLabel>
                        <Input
                          id="variation"
                          deafultValue={0}
                          type="number"
                          onChange={this.handleChange('variation')}
                          startAdornment={<InputAdornment position="start">Rs.</InputAdornment>}
                        />
                      </FormControl>
                    </ItemGrid>
                  </Grid>
                  <Grid container>
                    <ItemGrid xs={12} sm={3} md={3}>
                      <TextField
                          label="Start Date"
                          id="startDT"
                          fullWidth
                          required
                          onChange={this.handleChange('startDT')}
                          type='date'
                          margin='normal'
                          InputLabelProps={{
                            shrink:true
                          }}
                        />
                    </ItemGrid>
                    <ItemGrid xs={12} sm={3} md={3}>
                      <TextField
                          label="Stipulated End Date"
                          id="stipEndDT"
                          fullWidth
                          required
                          onChange={this.handleChange('stipEndDT')}
                          type='date'
                          margin='normal'
                          InputLabelProps={{
                            shrink:true
                          }}
                        />
                    </ItemGrid>
                    <ItemGrid xs={12} sm={3} md={3}>
                      <TextField
                          label="Expected/Actual End Date"
                          id="expcEndDT"
                          fullWidth
                          required
                          onChange={this.handleChange('expcEndDT')}
                          type='date'
                          margin='normal'
                          InputLabelProps={{
                            shrink:true
                          }}
                        />
                    </ItemGrid>
                  </Grid>
                  <Grid container>
                    <ItemGrid xs={12} sm={3} md={3}>
                      <TextField
                          label="Manager Name"
                          id="managerName"
                          fullWidth
                          required
                          onChange={this.handleChange('managerName')}
                          type='text'
                          margin='normal'
                        />
                    </ItemGrid>
                    <ItemGrid xs={12} sm={3} md={3}>
                      <TextField
                          label="Manager Cotnact"
                          id="managerContact"
                          fullWidth
                          required
                          onChange={this.handleChange('managerContact')}
                          type='text'
                          margin='normal'
                        />
                    </ItemGrid>
                    <ItemGrid xs={12} sm={3} md={3}>
                      <TextField
                          label="Status"
                          fullWidth
                          select
                          required
                          margin='normal'
                          onChange={this.handleChange('status')}
                          SelectProps={{
                            native:true
                          }}
                        >
                        {options}
                        </TextField>
                    </ItemGrid>
                  </Grid>
                  {
                    this.state.status === status.completed ?

                    <Grid container>
                      <ItemGrid xs={12} sm={3} md={3}>
                        <FormControl fullWidth className={classes.margin} margin='normal'>
                          <InputLabel htmlFor="finalBill">Final Bill Value</InputLabel>
                          <Input
                            id="finalBill"
                            defaultValue={0}
                            type="number"
                            onChange={this.handleChange('finalBill')}
                            startAdornment={<InputAdornment position="start">Rs.</InputAdornment>}
                          />
                        </FormControl>
                      </ItemGrid>
                      </Grid> :
                       this.state.status === status.arbitrated ? 
                        <Grid container>
                          <ItemGrid xs={12} sm={3} md={3}>
                            <FormControl fullWidth className={classes.margin} margin='normal'>
                              <InputLabel htmlFor="finalBill">Final Bill Value</InputLabel>
                              <Input
                                id="finalBill"
                                defaultValue={0}
                                type="number"
                                onChange={this.handleChange('finalBill')}
                                startAdornment={<InputAdornment position="start">Rs.</InputAdornment>}
                              />
                            </FormControl>
                          </ItemGrid>
                          <ItemGrid xs={12} sm={3} md={3}>
                            <TextField
                              label="Arbitration Location"
                              id="arbLoc"
                              fullWidth
                              required
                              onChange={this.handleChange('arbLoc')}
                              type='text'
                              margin='normal'
                            />
                          </ItemGrid>
                          <ItemGrid xs={12} sm={3} md={3}>
                            <TextField
                              label="Arbitration ID"
                              id="arbId"
                              fullWidth
                              required
                              onChange={this.handleChange('arbId')}
                              type='text'
                              margin='normal'
                            />
                          </ItemGrid>
                        </Grid>
                      :
                      <div/>
                  } 
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

export default withStyles(styles)(NewProjectForm);
