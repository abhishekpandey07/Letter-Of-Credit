import React from "react";
import { Grid, InputLabel, withStyles} from "@material-ui/core";
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


const styles = theme =>{
  formControl : {
    fullWidth: true
  }
}

class NewLCForm extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      supplier: '',
      issuer: '',
      supBank: '',
      project: '',
      openDT: '',
      expDT: '',
      LC_no: '',
      FDR_no: '',
      FDR_DT: '',
      m_amt: 0,
      m_cl_DT: '',
      amount: 0,
      /*due_DT: '',
      due_amt: 0,
      payed_amt: 0,
      pay_ref: '',
      opening: 0,
      amendment: 0,
      boea: 0,
      postal: 0,
      GST: 0,
      disbursement:0,*/
      suppliersList: [],
      issuerList: [],
    }
  }

  callSupplierApi = async () => {
     const response = await fetch('/suppliers');
     const body = await response.json();
     if (response.status !== 200) throw Error(body.message);
     return EJSON.parse(body);
   };

   callIssuerApi = async () => {
     const response = await fetch('/nativeBanks');
     const body = await response.json();
     if (response.status !== 200) throw Error(body.message);
     return EJSON.parse(body);
   };

  handleChange = name => event => {
    this.setState({ [name]: event.target.value });
    console.log(this.state)
  };

  componentDidMount() {
    var input = document.getElementById("submit");

      // Execute a function when the user releases a key on the keyboard
      input.addEventListener("keyup", function(event) {
        // Cancel the default action, if needed
        event.preventDefault();
        // Number 13 is the "Enter" key on the keyboard
        if (event.keyCode === 13) {
          // Trigger the button element with a click
          input.click();
        }
      });
    console.log('async was called');
    this.callSupplierApi()
    .then(res => this.setState({suppliersList:res}))
    .catch(err => console.log(err));

    this.callIssuerApi()
    .then(res => this.setState({issuerList: res}))
    .catch(err => console.log(err));
  }

  handleSubmit = event => {
    
    axios.post('/LCs', this.state)
     .then(function(response){
        console.log(response)
        window.location ='/LCs'
      })
     .catch(function(error){
       console.log(error)
     });
  }

  render () {

    var suppliersList = this.state.suppliersList.map(prop => {
      return(
        <option value={prop._id} >
          {prop.name} ({prop.city})
        </option>
      )
    })

    var issuersList = this.state.issuerList.reduce((arr,prop,index) => {
      arr.push(<option value={prop._id} >{prop.name}</option>)
      return arr
    },[<option value=''/>])

    var projectsList = []
    var supBankList = []
    if(this.state.supplier){
      console.log(this.state.supplier)
      const supplier = this.state.suppliersList.find((obj) => {
        console.log(obj._id)
        return obj._id === String(this.state.supplier);
      })

      projectsList = supplier.projects.reduce((arr,prop,index) => {
        arr.push(<option value={prop._id} >{prop.name}</option>)
        return arr
      },[<option value=''/>])

      supBankList = supplier.banks.reduce((arr,prop,index) => {
        arr.push(<option value={prop._id} >{prop.name}</option>)
        return arr
      },[<option value=''/>])      
    }

    
    const {classes} = this.props
    return (
      <div>
      <form >
        <Grid container>
          <ItemGrid xs={12} sm={12} md={12}>
            <RegularCard
              cardTitle="Register New LC"
              cardSubtitle="Enter LC Details"
              content={
                <div>
                  <Grid container>
                    <ItemGrid xs={12} sm={12} md={3}>
                       <FormControl fullWidth={true}>
                        <InputLabel htmlFor="issuer"> Issuer Bank</InputLabel>
                        <Select
                          required
                          native
                          onChange={this.handleChange('issuer')}
                          inputProps={{
                            name: 'issuer',
                            id: 'issuer'
                          }}
                        >
                          <option value=""/>
                          {issuersList}
                        </Select>
                      </FormControl>
                    </ItemGrid>
                    <ItemGrid xs={12} sm={12} md={3}>
                      <div>
                       <FormControl fullWidth={true}>
                        <InputLabel htmlFor="Supplier">Supplier</InputLabel>
                        <Select
                          native
                          onChange={this.handleChange('supplier')}
                          inputProps={{
                            name: 'supplier',
                            id: 'supplier-field'
                          }}
                        >
                          <option value=""/>
                          {suppliersList}
                        </Select>
                      </FormControl>
                      </div>
                    </ItemGrid>
                    <ItemGrid xs={12} sm={12} md={3}>
                       <FormControl fullWidth={true}>
                        <InputLabel htmlFor="supBank"> Supplier's Bank</InputLabel>
                        <Select
                          required
                          native
                          onChange={this.handleChange('supBank')}
                          inputProps={{
                            name: 'supBank',
                            id: 'supBank'
                          }}
                        >
                          {this.state.supplier?(supBankList):
                            <option value=""/>
                          }
                        </Select>
                      </FormControl>
                    </ItemGrid>
                    <ItemGrid xs={12} sm={12} md={3}>
                       <FormControl fullWidth={true}>
                        <InputLabel htmlFor="project">Project</InputLabel>
                        <Select
                          required
                          native
                          value={this.state.project.name}
                          onChange={this.handleChange('project')}
                          inputProps={{
                            name: 'project',
                            id: 'project'
                          }}
                        >
                          {this.state.supplier?(projectsList):
                            <option value=""/>
                          }
                        </Select>
                      </FormControl>
                    </ItemGrid>
                    </Grid>
                    <Grid container>
                    <ItemGrid xs={6} sm={3} md={3}>
                      <FormControl fullWidth={true} margin='normal'>
                        <TextField
                            required
                            label="LC number"
                            id="LC_NO"
                            onChange={this.handleChange('LC_no')}
                          />
                      </FormControl>
                    </ItemGrid>
                    <ItemGrid xs={6} sm={3} md={3}>
                      <FormControl fullWidth={true} margin='normal'>
                        <TextField
                            required
                            label="FDR number"
                            id="FDR_NO"
                            onChange={this.handleChange('FDR_no')}
                          />
                      </FormControl>
                    </ItemGrid>
                    <ItemGrid xs={6} sm={3} md={3}>
                      <FormControl fullWidth className={classes.margin} margin='normal'>
                        <InputLabel htmlFor="adornment-amount">Amount</InputLabel>
                        <Input
                          id="adornment-amount"
                          value={this.state.amount}
                          type="number"
                          onChange={this.handleChange('amount')}
                          startAdornment={<InputAdornment position="start">Rs.</InputAdornment>}
                        />
                      </FormControl>
                    </ItemGrid>
                    <ItemGrid xs={6} sm={3} md={3}>
                      <FormControl fullWidth className={classes.margin} margin='normal'>
                          <InputLabel htmlFor="adornment-amount">Margin Amount ({Math.round(this.state.amount*0.15)})</InputLabel>
                          <Input
                            id="adornment-margin-amount"
                            type="number"
                            value={this.state.m_amt}
                            onChange={this.handleChange('m_amt')}
                            startAdornment={<InputAdornment position="start">Rs.</InputAdornment>}
                          />
                        </FormControl>
                    </ItemGrid>
                    <ItemGrid xs={6} sm={3} md={3}>
                      <FormControl fullWidth={true} margin='normal'>
                        <TextField
                          required
                          id="openDT"
                          label="Open Date"
                          type="date"
                          defaultValue = "2018-02-07"
                          value = {this.state.openDT}
                          onChange = {this.handleChange('openDT')}
                          InputLabelProps={{
                            shrink: true,
                          }}
                      />
                      <FormHelperText> Please put LC opening Date.</FormHelperText>
                     </FormControl> 
                    </ItemGrid>
                    <ItemGrid xs={6} sm={3} md={3}>
                      <FormControl fullWidth={true} margin='normal'>
                        <TextField
                          required
                          id="expDate"
                          label="Expiry Date"
                          type="date"
                          defaultValue = "2018-02-07"
                          value = {this.state.expDT}
                          onChange = {this.handleChange('expDT')}
                          InputLabelProps={{
                            shrink: true,
                          }}
                      />

                      <FormHelperText> Please put LC expiry Date.</FormHelperText>
                     </FormControl> 
                    </ItemGrid>
                    <ItemGrid xs={6} sm={3} md={3}>
                      <FormControl fullWidth={true} margin='normal'>
                        <TextField
                          required
                          id="FDRDate"
                          label="FDR Date"
                          type="date"
                          defaultValue = "2018-02-07"
                          value = {this.state.FDR_DT}
                          onChange = {this.handleChange('FDR_DT')}
                          InputLabelProps={{
                            shrink: true,

                          }}
                          
                      />

                      <FormHelperText> Please put FDR Date.</FormHelperText>
                     </FormControl> 
                    </ItemGrid>
                    <ItemGrid xs={6} sm={3} md={3}>
                      <FormControl fullWidth={true} margin='normal'>
                        <TextField
                          id="m_cl_DT"
                          label="Margin Clear Date"
                          type="date"
                          defaultValue = "2018-02-07"
                          value = {this.state.m_cl_DT}
                          onChange = {this.handleChange('m_cl_DT')}
                          InputLabelProps={{
                            shrink: true,

                          }}
                          
                      />
                      <FormHelperText> Please put Margin Clearance Date.</FormHelperText>
                     </FormControl> 
                    </ItemGrid>
                  </Grid>
                  {/*<Grid container padding={true}>
                    <ItemGrid xs={6} sm={3} md={3}>
                      <FormControl fullWidth={true} margin='normal'>
                        <TextField
                          required
                          id="m_cl_DT"
                          label="Installment Due Date"
                          type="date"
                          defaultValue = "2018-02-07"
                          value = {this.state.due_DT}
                          onChange = {this.handleChange('due_DT')}
                          InputLabelProps={{
                            shrink: true,

                          }}                       
                      />
                      <FormHelperText> Please put First Installment due date.</FormHelperText>
                     </FormControl> 
                    </ItemGrid>
                    <ItemGrid xs={6} sm={3} md={3}>
                      <FormControl fullWidth className={classes.margin} margin='normal'>
                          <InputLabel htmlFor="adornment-amount">Installment Amount</InputLabel>
                          <Input
                            required
                            id="adornment-due-amount"
                            type="number"
                            value={this.state.due_amt}
                            onChange={this.handleChange('due_amt')}
                            startAdornment={<InputAdornment position="start">Rs.</InputAdornment>}
                          />
                        </FormControl>
                    </ItemGrid>
                    <ItemGrid xs={6} sm={3} md={3}>
                      <FormControl fullWidth className={classes.margin} margin='normal'>
                          <InputLabel htmlFor="adornment-amount">Payed Amount</InputLabel>
                          <Input
                            id="adornment-payed-amount"
                            type="number"
                            value={this.state.payed_amt}
                            onChange={this.handleChange('payed_amt')}
                            startAdornment={<InputAdornment position="start">Rs.</InputAdornment>}
                          />
                        </FormControl>
                    </ItemGrid>
                    <ItemGrid xs={6} sm={3} md={3}>
                      <FormControl fullWidth={true} margin='normal'>
                        <TextField
                          id="pay_ref"
                          label="Payment Ref."
                          type="text"
                          value = {this.state.pay_ref}
                          onChange = {this.handleChange('pay_ref')}
                          InputLabelProps={{
                            shrink: true,
                          }}
                          
                      />
                     </FormControl> 
                    </ItemGrid>
                  </Grid>*/}  
                </div>  
                }
                footer={
                  
                  <div>
                      <Button id='submit' color="primary" type="submit" onClick={this.handleSubmit}>Submit</Button>
                  </div>
                  }/>            
          </ItemGrid>
        </Grid>
      </form>
      </div>
    );
  }
}

export default withStyles(styles)(NewLCForm);
