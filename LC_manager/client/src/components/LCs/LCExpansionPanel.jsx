import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import {Table} from "components"
import
{ Grid, Button,
  TextField, Input, InputLabel, FormControl} from '@material-ui/core'
import red from '@material-ui/core/colors/red'
import axios from 'axios'
import InputAdornment from '@material-ui/core/InputAdornment';
import FileIOButton from 'components/FileIOButtons/FileIOButton'
import EJSON from 'mongodb-extended-json'

const styles = theme => ({
  root: {
    width: '100%',
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    flexBasis: '20.00%',
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

class LCPanel extends React.Component {
  constructor(props){
    super(props)
    this.state ={
      expaned: null,
      payment: null,
      index: null,
      extension: false,
      newCycle: false, // state variable for adding new LC Cycles
      expanded: null,
      payed_amt: 0,
      pay_ref: '',
      openDT: '',
      expDT:'',
      due_DT: '',
      due_amt: 0,
      refFile: '',
    }

    console.log(this.props.id)
  }

  handlePanelChange = panel => (event, expanded) => {
    this.setState({
      expanded: expanded ? panel : false,
      newCycle: false,
      payment: null,
      index: null,
      extension: false

    });
  };


  handleValueChange = name => event => {
    this.setState({[name]:event.target.value});
  }

  // Payment Handles

  handlePaymentClick = (index) => (event) => {
    
    this.setState({payment: (index===this.state.index?
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
    const url = 'LCs/'+this.props.LC._id+
                    '/addPayment'
    axios.post(url,payload)
    .then((response) =>{
      this.setState({payment:null})
      this.props.onUpdate(this.props.id,EJSON.parse(response.data))
    }).then((error) => {
      console.log(error)
    })
  }

  // Cycle Handles

  handleCycle = (event) => {
    this.setState({newCycle: !this.state.newCycle}) 
  }

  handleCycleSubmit = (event) => {
    const payload = {
      due_DT : this.state.due_DT,
      due_amt: this.state.due_amt,
      _method: 'PUT'
    }
    const url = 'LCs/'+this.props.LC._id+
                    '/addDueDetails'
    axios.post(url,payload)
    .then((response) =>{
      this.handleCycle()
      this.props.onUpdate(this.props.id,EJSON.parse(response.data))
    }).then((error) => {
      console.log(error)
    })
  }
  // Extension Handles

  handleExtensionClick = (event) => {
    this.setState({extension: !this.state.extension})
  }

  handleExtensionSubmit = (event) => {
    var payload = {
      _method : 'PUT',
      openDT: this.state.openDT,
      expDT: this.state.expDT
    }

    const url = 'LCs/'+this.props.LC._id+
                    '/addExtension'
    axios.post(url,payload)
    .then((response) =>{
      this.handleExtensionClick()
      this.props.onUpdate(this.props.id,EJSON.parse(response.data))
    }).then((error) => {
      console.log(error)
    })

  }

  // Deletion Handles

  handleDelete = (event) => {
    var payload = {
      _method : 'DELETE'
    }

    const url = 'LCs/'+this.props.LC._id+
                    '/edit'
    axios.post(url,payload)
    .then((response) =>{
      this.props.onDelete(this.props.id)

    }).then((error) => {
      console.log(error)
    })
  }

// document submission handle
  onDocumentSubmit = (LC) =>  {
    this.props.onUpdate(this.props.id,EJSON.parse(LC))
  }

  render() {
    const { classes ,LC} = this.props;
    const { expanded } = this.state;
    console.log(LC)
    const paymentData = LC.payment.DT_amt.reduce((array,item,index) => {
      if(item.due_DT){
        const ref = item.pay_ref ? item.pay_ref:
                    <Button variant='contained' size='small'
                      onClick={this.handlePaymentClick(index)}>
                      Add Pay
                    </Button>      

        const rec = <FileIOButton id={LC._id}
                      name='receipt' index={index}
                      onSubmit = {this.onDocumentSubmit}
                      exists = {item.rec.rec}/>
        const accep = <FileIOButton id={LC._id}
                      name='acceptance' index={index}
                      onSubmit = {this.onDocumentSubmit}
                      exists = {item.acc.rec}/>

        array.push([item.due_DT.slice(0,10),String(item.due_amt),
          String(item.payed_amt),ref,rec,accep])
        return array
      }

      return array
    },[])

    paymentData.push([<Typography variant='subheading'>Total</Typography>,String(LC.payment.total_due),String(LC.payment.total_payed)])

    const extensionData = LC.dates.reduce((array,item,index) => {
      var id = index === 0? 'Original': 'Extended'

      const bc = <FileIOButton id={LC._id}
                  name='bankCharges' index={index}
                  onSubmit = {this.onDocumentSubmit}
                  exists = {item.bc.rec}/>

      const app = <FileIOButton id={LC._id}
                  name='application' index={index}
                  onSubmit = {this.onDocumentSubmit}
                  exists = {item.app.rec}/>

      array.push([id,item.openDT.slice(0,10),item.expDT.slice(0,10),
                  app, bc])
      return array
    },[])

       

    return (
    <div>
      <div className={classes.root}>
        <ExpansionPanel expanded={expanded === 'panel1'} onChange={this.handlePanelChange('panel1')}>
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
            <Typography className={classes.heading}>{LC.supplier.name}</Typography>
            <Typography className={classes.heading}>{LC.project.name + '(' + (LC.project.location) + ')'}</Typography>
            <Typography className={classes.heading}>{LC.LC_no}</Typography>
            <Typography className={classes.heading}>Rs. {String(LC.amount)}</Typography>
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
                                  onChange={this.handleValueChange('payed_amt')}
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
                                  onChange = {this.handleValueChange('pay_ref')}
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
                                  onChange = {this.handleValueChange('due_DT')}
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
                                  onChange={this.handleValueChange('due_amt')}
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
                                  onChange = {this.handleValueChange('openDT')}
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
                                  onChange = {this.handleValueChange('expDT')}
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