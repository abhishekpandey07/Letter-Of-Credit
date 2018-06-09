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

class NewLCForm extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      supplier: '',
      issuer: '',
      openDT: '',
      expDT: '',
      LC_no: '',
      FDR_no: '',
      FDR_DT: '',
      m_amt: 0,
      m_cl_DT: '',
      amount: 0,
      due_DT: '',
      due_amt: 0,
      payed_amt: 0,
      pay_ref: '',
      opening: 0,
      amendment: 0,
      boea: 0,
      postal: 0,
      GST: 0,
      disbursement:0,
      suppliersList: [],
      issuerList: []
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

    /*createMenuItems(list) {
    return ( {list.map((prop, key) => {
                  return (
                    <MenuItem
                      className={classes.tableCell + " " + classes.tableHeadCell}
                      key={key}
                      value={prop._id}
                    >
                      {prop.name}
                    </MenuItem>
                  );
                })}
    );
   }

   */
  handleSupplierChange = name => event => {
    this.setState({ ['supplier']: event.target.value });
  };

  handleIssuerChange = name => event => {
    this.setState({ 'issuer': event.target.value });
  };

  handleChange = name => event => {
    this.setState({ [name]: event.target.value.toUpperCase() });
    console.log(this.state)
  };

    componentDidMount() {
      console.log('async was called');
      this.callSupplierApi()
      .then(res => this.setState({ suppliersList: res }))
      .catch(err => console.log(err));

      this.callIssuerApi()
      .then(res => this.setState({issuerList: res}))
      .catch(err => console.log(err));

    }

  handleSubmit = event => {

    axios.post('/LCs', this.state)
     .then(function(response){
       console.log(response);
       //Perform action based on response
   })
     .catch(function(error){
       console.log(error);
       //Perform action based on error
     });
  }

  render () {
    //console.log(this.suppliersList)
    //console.log(this.issuerList)

    var suppliersList = this.state.suppliersList.map(prop => {
      return(
        <option value={prop._id} >
          {prop.name} ({prop.city})
        </option>
      )
    })

    var issuersList = this.state.issuerList.map(prop => {
      return(
        <option value={prop._id} >
          {prop.name}
        </option>
      )
    })
    const {classes} = this.props
    return (
      <div>
      <form onSubmit={this.handleSubmit}>
        <Grid container>
          <ItemGrid xs={12} sm={12} md={12}>
            <RegularCard
              cardTitle="Register New LC"
              cardSubtitle="Enter LC Details"
              content={
                <div>
                  <Grid container>
                    <ItemGrid xs={12} sm={6} md={6}>
                      <div>
                       <FormControl fullWidth={true}>
                        <InputLabel htmlFor="Supplier">Supplier</InputLabel>
                        <Select
                          native
                          value={this.state.supplier.name}
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
                    <ItemGrid xs={12} sm={6} md={6}>
                      
                       <FormControl fullWidth={true}>
                        <InputLabel htmlFor="Issuer">Issuer Bank</InputLabel>
                        <Select
                          required
                          native
                          value={this.state.issuer.name}
                          onChange={this.handleChange('issuer')}
                          inputProps={{
                            name: 'issuer',
                            id: 'issuer-field'
                          }}
                        >
                          <option value=""/>
                          {issuersList}
                        </Select>
                      </FormControl>
                    </ItemGrid>
                    <ItemGrid xs={6} sm={3} md={3}>
                      <CustomInput
                          labelText="LC number"
                          id="LC_NO"
                          value={this.state.LC_no}
                          onChange={this.handleChange('LC_no')}
                          formControlProps={{
                            fullWidth: true
                          }}
                          inputProps ={{
                            required: true,
                            onChange: this.handleChange('LC_no')
                          }}
                        />
                    </ItemGrid>
                    <ItemGrid xs={6} sm={3} md={3}>
                      <CustomInput
                          labelText="FDR number"
                          id="FDR_NO"
                          value={this.state.FDR_no}
                          onChange={this.handleChange('FDR_no')}
                          formControlProps={{
                            fullWidth: true
                          }}
                          inputProps ={{
                            required: true,
                            onChange: this.handleChange('FDR_no')
                          }}
                          
                        />
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
                          <InputLabel htmlFor="adornment-amount">Margin Amount</InputLabel>
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
                          margin = {'inherit'}
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
                          margin = {'inherit'}
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
                          margin = {'inherit'}
                      />

                      <FormHelperText> Please put FDR Date.</FormHelperText>
                     </FormControl> 
                    </ItemGrid>
                    <ItemGrid xs={6} sm={3} md={3}>
                      <FormControl fullWidth={true} margin='normal'>
                        <TextField
                          required
                          id="m_cl_DT"
                          label="Margin Clear Date"
                          type="date"
                          defaultValue = "2018-02-07"
                          value = {this.state.m_cl_DT}
                          onChange = {this.handleChange('m_cl_DT')}
                          InputLabelProps={{
                            shrink: true,

                          }}
                          margin = {'inherit'}
                      />
                      <FormHelperText> Please put Margin Clearance Date.</FormHelperText>
                     </FormControl> 
                    </ItemGrid>
                  </Grid>
                  <Grid container padding={true}>
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
                          margin = 'inherit'
                      />
                      <FormHelperText> Please put First Installment due date.</FormHelperText>
                     </FormControl> 
                    </ItemGrid>
                    <ItemGrid xs={6} sm={3} md={3}>
                      <FormControl fullWidth className={classes.margin} margin='normal'>
                          <InputLabel htmlFor="adornment-amount">Installment Amount</InputLabel>
                          <Input
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
                          required
                          id="pay_ref"
                          label="Payment Ref."
                          type="text"
                          value = {this.state.pay_ref}
                          onChange = {this.handleChange('pay_ref')}
                          InputLabelProps={{
                            shrink: true,
                          }}
                          margin = 'inherit'
                      />
                     </FormControl> 
                    </ItemGrid>
                  </Grid>  
                </div>  
                }
                footer={
                  <div>
                    <NavLink
                      to="/LCs"
                      activeClassName="active"
                      >
                      <Button color="primary" type="submit" onClick={this.handleSubmit}>Submit</Button>
                  </NavLink>
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
