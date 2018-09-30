import React from "react";
import { Grid, InputLabel} from "@material-ui/core";
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import EJSON from 'mongodb-extended-json';
import axios from 'axios'

import {
  //ProfileCard,
  RegularCard,
  Button,
  CustomInput,
  ItemGrid
} from "components";


//import avatar from "assets/img/faces/marc.jpg";

class NewSupplierForm extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      name: '',
      city: '',
      bank: '',
      branch: '',
      IFSC: '',
      project: '',
      projectsList: []
      }

      
  }
  
  callProjectsApi = async () => {
     const response = await fetch('/api/projects',{credentials:'include'});
     const body = await response.json();
     if (response.status !== 200) throw Error(body.message);
     return EJSON.parse(body);
   };

  handleChange = name => event => {
    this.setState({ [name]: event.target.value.toUpperCase() });
    console.log(this.state)
  };
  

    componentWillMount() {
      console.log('async was called');
      this.callProjectsApi()
      .then(res => this.setState({ projectsList: res }))
      .catch(err => console.log(err));

    }

  handleSubmit = event => {

    axios.post('/api/suppliers', this.state,{credentials:'include'})
     .then(function(response){
       console.log(response);
       //Perform action based on response
       window.location = '/Suppliers'
   })
     .catch(function(error){
       console.log(error);
       //Perform action based on error
     });
  }

  render () {
    //console.log(this.suppliersList)
    //console.log(this.issuerList)
    var projectsList = this.state.projectsList.map(prop => {
      return(
        <option value={prop._id} >
          {prop.name} ({prop.location})
        </option>
      )
    })

    
    return (
      <div>
      <form>
        <Grid container>
          <ItemGrid xs={12} sm={12} md={12}>
            <RegularCard
              cardTitle="Register New Supplier"
              cardSubtitle="Enter Supplier Details"
              content={
                <div>
                  <Grid container>
                    <ItemGrid xs={6} sm={3} md={3}>
                      <CustomInput
                          labelText="Supplier Name"
                          id="Supplier Name"
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
                          labelText="City"
                          id="city"
                          value={this.state.city}
                          onChange={this.handleChange('city')}
                          formControlProps={{
                            fullWidth: true
                          }}
                          inputProps ={{
                            required: true,
                            onChange: this.handleChange('city')
                          }}
                          
                        />
                    </ItemGrid>
                    <ItemGrid xs={6} sm={3} md={3}>
                      <CustomInput
                          labelText="Bank Name"
                          id="Bank Name"
                          value={this.state.bank}
                          onChange={this.handleChange('bank')}
                          formControlProps={{
                            fullWidth: true
                          }}
                          inputProps ={{
                            required: true,
                            onChange: this.handleChange('bank')
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
                    
                    <ItemGrid xs={12} sm={4} md={4}>
                      <div>
                       <FormControl fullWidth={true}>
                        <InputLabel htmlFor="Project">Project</InputLabel>
                        <Select
                          native
                          value={this.state.project.name}
                          onChange={this.handleChange('project')}
                          inputProps={{
                            name: 'supplier',
                            id: 'supplier-field'
                          }}
                        >
                          <option value=""/>
                          {projectsList}
                        </Select>
                      </FormControl>
                      </div>
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

export default NewSupplierForm;
