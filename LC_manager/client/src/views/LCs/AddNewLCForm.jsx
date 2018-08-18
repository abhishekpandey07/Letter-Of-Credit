import React from "react";
import { Grid, InputLabel, Divider, withStyles} from "@material-ui/core";
import Input from '@material-ui/core/Input';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import EJSON from 'mongodb-extended-json';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import Typography from '@material-ui/core/Typography'
import axios from 'axios'
import moment from 'moment'
import lcFormStyles from 'assets/jss/material-dashboard-react/lcFormStyles.jsx'
import {roundAmount} from 'utils/common'
import {
  //ProfileCard,
  RegularCard,
  Button,
  ItemGrid
} from "components";

import IconButton from '@material-ui/core/IconButton'
import AddIcon from '@material-ui/icons/Add'

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
      amount: 0,
      open: 0,
      post: 200,
      GST: 0,
      suppliersList: [],
      issuerList: [],
    }
  }

  callSupplierApi = async () => {
     const response = await fetch('/suppliers',{credentials:'include'});
     const body = await response.json();
     if (response.status !== 200) throw Error(body.message);
     return EJSON.parse(body);
   };

   callIssuerApi = async () => {
     const response = await fetch('/nativeBanks',{credentials:'include'});
     const body = await response.json();
     if (response.status !== 200) throw Error(body.message);
     return EJSON.parse(body);
   };

  handleChange = name => event => {
    switch(name){
      case "amount":{
        var m_amt = Math.round(event.target.value*0.15)
        var open = Math.round(event.target.value*0.0045)
        var GST = roundAmount(open*0.18)
        this.setState({
          [name]: event.target.value,
          open: open,
          GST: GST,
          m_amt: m_amt
             });
        break;
       }
      case 'openDT':{
        var openDT = moment(event.target.value)
        console.log(openDT)
        var expDT = openDT.add(90,'day')
        console.log(expDT.format('YYYY-MM-DD'))
        this.setState({
          [name]: event.target.value,
          expDT: expDT.format('YYYY-MM-DD')
             });
        break;
      }
      case 'open':{
        var GST = roundAmount(event.target.value*0.18,2)
        this.setState({
          [name]: event.target.value,
          GST: GST
        })
        break;
      }
      default:{
        this.setState({ [name]: event.target.value})
      }
    }

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
    
    axios.post('/LCs', this.state,{credentials : 'include'})
     .then(function(response){
        console.log(response)
        window.location ='/LCs'
      })
     .catch(function(error){
       console.log(error)
     });
  }

  addProject = (event,target) => {
    try {
      this.projects.push(this.state.project)
    } catch(error) {
      this.projects = []
      this.projects.push(this.state.project)
    } 

  } 

  render () {
    const {classes} = this.props
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
                <Typography variant='subheading' className={classes.formHeading}>Issuer and Supplier Details</Typography> 
                  <Grid container padding={true}>
                    <ItemGrid xs={12} sm={2} md={3}>
                       <FormControl fullWidth={true} margin='normal'>
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
                          {issuersList}
                        </Select>
                      </FormControl>
                    </ItemGrid>
                    <ItemGrid xs={12} sm={2} md={3}>
                      <div>
                       <FormControl fullWidth={true} margin='normal'>
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
                    <ItemGrid xs={12} sm={2} md={3}>
                       <FormControl fullWidth={true} margin='normal'>
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
                    <ItemGrid xs={12} sm={2} md={3}>
                       <FormControl fullWidth={true} margin='normal'>
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
                    <Divider style={{margin:'20px'}}/>
                    <Typography variant='subheading' className={classes.formHeading}>
                      Letter of Credit Details
                    </Typography>
                    <Grid container padding={true}>
                    <ItemGrid xs={6} sm={2} md={3}>
                      <FormControl fullWidth={true} margin='normal'>
                        <TextField
                            required
                            label="LC number"
                            id="LC_NO"
                            onChange={this.handleChange('LC_no')}
                          />
                      </FormControl>
                    </ItemGrid>
                    <ItemGrid xs={6} sm={2} md={2}>
                      <FormControl fullWidth margin='normal'>
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
                    <ItemGrid xs={6} sm={2} md={2}>
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
                    <ItemGrid xs={6} sm={2} md={2}>
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
                  </Grid>
                  <Grid container>
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
                    <ItemGrid xs={6} sm={2} md={2}>
                      <FormControl fullWidth margin='normal'>
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
                    <ItemGrid xs={6} sm={2} md={2}>
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
                  </Grid>
                  <Divider style={{margin:'20px'}}/>
                    <Typography variant='subheading' className={classes.formHeading}>
                      Additional Charges
                    </Typography>
                  <Grid container padding={true}>
                    <ItemGrid xs={12} sm={2} md={2}>
                      <FormControl fullWidth  margin='normal'>
                          <InputLabel htmlFor="open">Opening Charges</InputLabel>
                          <Input
                            required
                            id="open"
                            type="number"
                            value={this.state.open}
                            onChange={this.handleChange('open')}
                            startAdornment={<InputAdornment position="start">Rs.</InputAdornment>}
                          />
                        </FormControl>
                    </ItemGrid>
                    <ItemGrid xs={12} sm={2} md={2}>
                      <FormControl fullWidth  margin='normal'>
                          <InputLabel htmlFor="post">Posting Charges</InputLabel>
                          <Input
                            required
                            id="post"
                            type="number"
                            value={this.state.post}
                            onChange={this.handleChange('post')}
                            startAdornment={<InputAdornment position="start">Rs.</InputAdornment>}
                          />
                        </FormControl>
                      </ItemGrid>
                      <ItemGrid xs={12} sm={2} md={2}>
                      <FormControl fullWidth  margin='normal'>
                          <InputLabel htmlFor="post">GST Charges</InputLabel>
                          <Input
                            required
                            id="GST"
                            type="number"
                            value={this.state.GST}
                            onChange={this.handleChange('GST')}
                            startAdornment={<InputAdornment position="start">Rs.</InputAdornment>}
                          />
                          </FormControl>
                      </ItemGrid>
                      <ItemGrid xs={12} sm={2} md={2}>
                        <Typography variant='subheading'>Total : {roundAmount(parseFloat(this.state.open) +
                                                    parseFloat(this.state.post) + parseFloat(this.state.GST))}</Typography>
                      </ItemGrid>
                  </Grid>
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

export default withStyles(lcFormStyles)(NewLCForm);
