import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Icon from '@material-ui/core/Icon'
//import {Table, TableHead, TableRow, TableCell, TableBody} from '@material-ui/core'
import {Table} from "components"
import
{ Grid, Paper,Divider, List, MenuItem, Button,
  TextField, Input, InputLabel, FormControl,
  Dialog, DialogTitle } from '@material-ui/core'
import red from '@material-ui/core/colors/red'
import FileUpload from '@material-ui/icons/FileUpload'
import FileDownload from '@material-ui/icons/FileDownload'
import axios from 'axios'
import InputAdornment from '@material-ui/core/InputAdornment';
import FileUploadButton from './FileInput'


const styles = theme => ({
  root: {
    width: '100%',
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    flexBasis: '33.33%',
    flexShrink: 0,
  },
  secondaryHeading: {
    fontSize: theme.typography.pxToRem(15),
    color: theme.palette.text.secondary,
  },
  content: {
    fontSize: theme.typography.pxToRem(15),
    flexBasis: '33.33%',
    flexShrink: 0,
  },

  button:{
    margin: theme.spacing.unit,
  },

  input:{
    display:'none',
  }
});


const mockData = [{name: 'Application',uploaded: true},
            {name:'Bank Charges Advice',uploaded: false},
            {name:'Application for Extension ',uploaded:true},
            {name:'Material Receipt Advice', uploaded:true},
            {name:'Bank Acceptance BOE',uploaded:true}]

class LCPanel extends React.Component {
  constructor(props){
    super(props)
    this.state ={
      LC: props.LC,
      payment: null,
      index: null,
      extension: false,
      newCycle: false, // state variable for adding new LC Cycles
      expanded: null,
      payed_amt: 0,
      pay_ref: '',
      openDT: '',
      expDate:'',
      due_DT: '',
      due_amt: 0,
      refFile: '',

    }
  }

  handleChange = panel => (event, expanded) => {
    this.setState({
      expanded: expanded ? panel : false,
      newCycle: false,
      payment: null,
      index: null,
      extension: false

    });
  };

  handlePaymentClick = (index) => (event) => {
    
    this.setState({payment: (index==this.state.index?
                    !this.state.payment: true),
                   index: index
                 })
    
  }

  handlePaymentSubmit = (event) => {
    const payload = {
      payment : this.state.payed_amt,
      pay_ref: this.state.pay_ref,
      index: this.state.index,
      _method: 'PUT'
    }
    const url = 'LCs/'+this.state.LC._id+
                    '/addPayment'
    axios.post(url,payload)
    .then((response) =>{
      console.log(response)
    }).then((error) => {
      console.log(error)
    })
  }

  handleCycle = (event) => {
    this.setState({newCycle: !this.state.newCycle}) 
  }

  handleCycleSubmit = (event) => {
    const payload = {
      due_DT : this.state.due_DT,
      due_amt: this.state.due_amt,
      _method: 'PUT'
    }
    const url = 'LCs/'+this.state.LC._id+
                    '/addDueDetails'
    axios.post(url,payload)
    .then((response) =>{
      console.log(response)
    }).then((error) => {
      console.log(error)
    })
  }

  handleChangeValue = name => event => {
    this.setState({[name]:event.target.value});
  }

  handleExtensionClick = (event) => {
    this.setState({extension: !this.state.extension})
  }

  handleDelete = (event) => {
    var payload = {
      _method : 'DELETE'
    }

    const url = 'LCs/'+this.state.LC._id+
                    '/edit'
    axios.post(url,payload)
    .then((response) =>{
      console.log(response)
    }).then((error) => {
      console.log(error)
    })
  }

  render() {
    const { classes, LC } = this.props;
    const { expanded } = this.state;
    /*const head = ['Due Date', 'Due Amount','Payed', 'Payment Ref.'].map((prop, key)=>{
                        
                     return(   <TableCell>
                                <Typography>
                                  {prop}
                                </Typography>
                              </TableCell>
                            )
                    })*/
    /*
    const data = LC.payment.DT_amt.map((prop,key) => {
      return (
              <div>
              <TableRow>
                <TableCell>{prop.due_DT.slice(0,10)}</TableCell>
                <TableCell>{String(prop.due_amt)}</TableCell>
                <TableCell>{String(prop.payed_amt)}</TableCell>
                <TableCell>{prop.pay_ref? prop.pay_ref: ' '}</TableCell>
              </TableRow>
              </div>
        )
    })
  */

    function uploadLink(name,index) {
        return (<div>
                  <input
                  accept="image/*"
                  className={classes.input}
                  id={"contained-button-file"+name+String(index)}
                  multiple
                  type="file"
                />
                <label htmlFor={"contained-button-file"+name+String(index)}>
                  <Button variant="contained" component="span" className={classes.button}>
                    <FileUpload/>
                  </Button>
                </label>
        
      </div>)
    }

    function uploadLink1(name,index) {
        return (
          <Button
            component='span'
            variant='raised'
             containerElement='label' // <-- Just add me!
             label='My Label'>
             <input type="file" className={classes.input}/>
          </Button>
        )
    }

    const paymentData = LC.payment.DT_amt.reduce((array,item,index) => {
      const ref = item.pay_ref? item.pay_ref : <Button variant='contained' size='small'
                            onClick={this.handlePaymentClick(index)}>Add Pay</Button>
      console.log(item.rec.rec, item.acc.rec)
      const rec = item.rec.rec ? <FileDownload/>:<FileUploadButton id={this.state.LC._id} name='receipt' index={index}/>
      const accep = item.acc.rec ? <FileDownload/>:<FileUpload/>
      array.push([item.due_DT.slice(0,10),String(item.due_amt),
        String(item.payed_amt),ref,rec,accep])
      return array
    },[])

    const extensionData = LC.dates.reduce((array,item,index) => {
      var index = index === 0? 'original': 'extended'
      const bc = item.bc.rec ? (<FileDownload align='center'/>):
                                (<FileUpload align='center'/>)
      const app = item.app.rec ? <FileDownload/>:<FileUpload/>
      array.push([index,item.openDT.slice(0,10),item.expDT.slice(0,10),
                  app, bc])
      return array
    },[])


    const uploadButton = <Button variant="contained" color="default" size='small' mini>
                          <FileUpload />
                        </Button>
    const documentData = mockData.reduce((array,item)=>{
      var icon = item.uploaded? 'Uploaded': <FileUpload/>
      array.push([item.name,icon])
      return array
    },[])

    console.log(documentData)

    return (
    <div>
      <div className={classes.root}>
        <ExpansionPanel expanded={expanded === 'panel1'} onChange={this.handleChange('panel1')}>
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
            <Typography className={classes.heading}>{LC.supplier.name}</Typography>
            <Typography className={classes.heading}>{LC.LC_no}</Typography>
            <Typography className={classes.heading}>{LC.status}</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <Grid container spacing={32}>
            <Grid item xs={12} sm={6}>
              <Grid item>
                <Table
                  tableHead = {['Due Date', 'Due Amount','Payed', 'Payment Ref.',
                                'Material Receipt',"Acceptance"]}
                  tableData = {paymentData}
                />
              </Grid>
                
                  {this.state.payment ?
                          <div>
                          <Grid>
                            <Grid item xs={6} sm={3}>
                              <FormControl className={classes.margin} margin='normal'>
                                <InputLabel htmlFor="adornment-amount">Payment Amount</InputLabel>
                                <Input
                                  id="adornment-margin-amount"
                                  type="number"
                                  value={this.state.m_amt}
                                  onChange={this.handleChangeValue('payed_amt')}
                                  startAdornment={<InputAdornment position="start">Rs.</InputAdornment>}
                                />
                              </FormControl>
                              </Grid>
                              <Grid item xs={6} sm={3}>
                              <FormControl fullWidth={true} margin='normal'>
                                <TextField
                                  required
                                  id="pay ref"
                                  label="Payment ref."
                                  type="text"
                                  value = {this.state.pay_ref}
                                  onChange = {this.handleChangeValue('pay_ref')}
                                  InputLabelProps={{
                                    shrink: true,
                                  }}
                              />
                              </FormControl> 
                            </Grid>
                            </Grid>
                              <Button color="primary" size='small'
                                variant='outlined' className={classes.button}
                                onClick={this.handlePaymentSubmit}>
                                submit
                              </Button>
                            </div>
                              : 
                              this.state.newCycle ?

                          <div>
                            <Grid item xs={6} sm={3}>
                            <FormControl fullWidth={true} margin='normal'>
                                <TextField
                                  required
                                  id="due_date"
                                  label="Due Date"
                                  type="date"
                                  defaultValue = "2018-02-07"
                                  value = {this.state.due_DT}
                                  onChange = {this.handleChangeValue('due_DT')}
                                  InputLabelProps={{
                                    shrink: true,

                                  }}
                                  margin = {'inherit'}
                              /> </FormControl>
                            </Grid>
                            <Grid item xs={6} sm={3}>
                              <FormControl className={classes.margin} margin='normal'>
                                <InputLabel htmlFor="adornment-amount">Due Amount</InputLabel>
                                <Input
                                  id="adornment-due-amount"
                                  type="number"
                                  value={this.state.due_amt}
                                  onChange={this.handleChangeValue('due_amt')}
                                  startAdornment={<InputAdornment position="start">Rs.</InputAdornment>}
                                />
                              </FormControl>
                              </Grid>
                              <Button color="primary" size='small'
                                variant='outlined' className={classes.button}
                                onClick={this.handleCycleSubmit}>
                                submit
                              </Button>
                          </div>
                              : <Button mini variant='contained' className={classes.button}
                                  onClick={this.handleCycle}>Create New Cycle</Button>
                        }
                
            </Grid>
            <Grid item xs={12} sm={6} spacing={12}>
                <Grid item>
                <Table
                  tableHead = {['Type','Opening Date', 'Expirty Date',
                                'Application', 'Bank Charges']}
                  tableData = {extensionData}
                />
                </Grid>
                <div top-margin='15px'>
                  <Grid item xs={12} sm={3} spacing='24'>
                    {this.state.extension ?

                          <div>
                            <FormControl fullWidth={true} margin='normal'>
                                <TextField
                                  required
                                  id="openDT"
                                  label="Opening Date"
                                  type="date"
                                  defaultValue = "2018-02-07"
                                  value = {this.state.openDT}
                                  onChange = {this.handleChangeValue('openDT')}
                                  InputLabelProps={{
                                    shrink: true,

                                  }}
                                  margin = {'inherit'}
                              /> </FormControl>
                            <FormControl fullWidth={true} margin='normal'>
                                <TextField
                                  required
                                  id="expDT"
                                  label="Expiry Date"
                                  type="date"
                                  value = {this.state.expDT}
                                  onChange = {this.handleChangeValue('expDT')}
                                  InputLabelProps={{
                                    shrink: true,
                                  }}
                              /> </FormControl>  <Button color="primary" size='small'
                                variant='outlined' className={classes.button}
                                onClick={this.handleExtensionSubmit}>
                                submit
                              </Button>
                          </div>
                              : <Button mini variant='contained' className={classes.button}
                                  onClick={this.handleExtensionClick}>Add Extension</Button>}
                </Grid>
                </div>
              </Grid>
            {/*<Grid item xs={12} sm={2}>
              <Table
                tableHead = {['Documents','Uploaded']}
                tableData = {documentData}
              />
            </Grid>*/}
            <Grid item xs={12} sm={12}>
              <Button mini variant='contained' className={classes.button}>Edit</Button>
              <Button mini variant='contained' className={classes.button}
                  onClick={this.handleDelete} colour={red}>Delete</Button>
            </Grid>
          </Grid>
          </ExpansionPanelDetails>
        </ExpansionPanel>
      </div>
    </div>
    );
  }
}

LCPanel.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(LCPanel);