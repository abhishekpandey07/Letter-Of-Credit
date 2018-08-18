import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import AddIcon from '@material-ui/icons/Add';
import Edit from '@material-ui/icons/Edit';
import InfoOutline from '@material-ui/icons/InfoOutline'
import {InsertDriveFile,Close} from '@material-ui/icons'
import FileUpload from '@material-ui/icons/FileUpload'
import FileDownload from '@material-ui/icons/FileDownload'
import IconButton from '@material-ui/core/IconButton'
import TableCell from '@material-ui/core/Table'
import Tooltip from '@material-ui/core/Tooltip'
import {Table} from "components"
import classNames from 'classnames'
import
{ Grid, Button,
  TextField, Input, InputLabel, FormControl} from '@material-ui/core'
import Select from '@material-ui/core/Select'
import ItemGrid from 'components'
import red from '@material-ui/core/colors/red'
import axios from 'axios'
import InputAdornment from '@material-ui/core/InputAdornment';
import FileIOButton from 'components/FileIOButtons/FileIOButton'
import EJSON from 'mongodb-extended-json'
import {roundAmount, formatDate, formatAmount} from 'utils/common'
import moment from 'moment'
import {Done, Delete, Save} from '@material-ui/icons'
import {List, ListItem} from '@material-ui/core'

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Slide from '@material-ui/core/Slide';
import SummaryDownloadButton from './SummaryDownloadButton'
 import jsPDF from 'jspdf';
 import ReactToPrint from 'react-to-print'



const styles = theme => ({
  root: {
    width: '100%'
  },
  heading: {
    fontSize: theme.typography.pxToRem(10),
    flexBasis: '19.00%',
    flexShrink: 0,
  },
  secondaryHeading: {
    fontSize: theme.typography.pxToRem(10),
    color: theme.palette.text.secondary,
  },
  content: {
    fontSize: theme.typography.pxToRem(8),
    flexBasis: '33.33%',
    flexShrink: 0,
  },

  button:{
    margin: theme.spacing.unit,
  },

  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    //width:100,
    flexBasis: '33.33%',
    flexShrink:0,
  },
  margin: {
    margin: theme.spacing.unit,
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    flexBasis:'33.33%',
    flexShrink: 0

  },
  withoutLabel: {
    marginTop: theme.spacing.unit * 3,
  },
  textField1: {
    flexBasis: 200,
  },
  grid:{
    padding: "0 15px !important"
  },
  tableActionButton: {
    width: "27px",
    height: "27px"
  },
  tableActionButtonIcon: {
    width: "17px",
    height: "17px"
  },
  edit: {
    backgroundColor: "transparent",
    //color: primaryColor,
    boxShadow: "none"
  },
});

function Transition(props) {
  return <Slide direction="up" {...props} />;
}

//const states = {notCompleted: 0 , completed: 1, closed: 2}
const dialogState = {
  closed: 0,
  closeAction: 1,
  deleteAction: 2,
  feedback: 3,
  downloadPDF: 4,
}
const cycleSwitch = {
  newCycle: 0,
  cycleEdit: 1,
  cyclePayCheck: 2,
  edit: 3,
  none: 4,
  cycleFiles: 5,
}
const extensionSwitch = {
  newExtension: 0,
  editExtension: 1,
  none: 2,
  extensionFiles: 3,
}
class LCPanel extends React.Component {
  constructor(props){
    super(props)
    this.state ={
      // cycle states
      cycleIndex: null,
      cycleContent: cycleSwitch.none,
      cycleFile: null,

      //new cycle states
      pay_ref: '',
      due_DT: '',
      due_amt: 0,
      acc: 0,
      cycleGST: 0,
      cycleTID: '',
      payTID: '',
      payPost: 89,
      payBC: 0,
      payGST: 0,
      payMode:'',
      payed_DT: '',

      // extension states
      extensionIndex:null,
      extensionContent: extensionSwitch.none,
      extensionFile: '',
      expanded: null,

      // new extension
      openDT: '',
      expDT:'',
      amend:0,
      open:0,
      post:200,
      GST:0,
      TID: '',

      // margin dates
      m_cl_DT: '',
      m_cl_amt: 0,
      
      //other states
      closed: this.props.LC.status==='Closed',
      edit: false,
      //dialog states
      dialog: dialogState.closed,
      pdf: false,
    }

    this.totalPaymentCharges = 0;
    this.totalExtensionCharges = 0;
    this.newPayment = false;
    this.dialogMode = 'action'
  }

  resetState = () => {
    this.setState({
      // cycle states
      cycleIndex: null,
      cycleContent: cycleSwitch.none,
      cycleFile: '',
      //new cycle states
      pay_ref: '',
      due_DT: '',
      due_amt: 0,
      acc: 0,
      cycleGST: 0,
      cycleTID: '',
      payTID: '',
      payPost: 89,
      payBC: 0,
      payGST: 0,
      payMode:'',
      // extension states
      extensionIndex:null,
      extensionContent: extensionSwitch.none,
      extensionFile: '',
      // new extension
      openDT: '',
      expDT:'',
      amend:0,
      open:0,
      post:200,
      GST:0,
      //other states
      closed: this.props.LC.status==='Closed',
      edit: false,
      refFile: '',
      dialog: dialogState.closed
    })
  }

  handlePanelChange = panel => (event, expanded) => {
    this.setState({
      expanded: expanded ? panel : false,
    });
  };

  handleValueChange = name => event => {
    switch(name){
      case 'due_amt':{
        var acc = Math.round(event.target.value*0.0035)
        var cycleGST = Math.round(acc*.18)
        this.setState({
          [name]: event.target.value,
          cycleGST: cycleGST,
          acc: acc, 
        })
        break;
      }
      case 'amend':{
        var amend = parseFloat(event.target.value)
        var GST = roundAmount((parseFloat(this.state.open) + amend)*0.18)
        this.setState({
          [name]: event.target.value,
          GST: GST
        })
        break;
      }
      case 'open':{
        var open = parseFloat(event.target.value)
        var GST = roundAmount((parseFloat(this.state.amend) + open)*0.18)
        this.setState({
          [name]: event.target.value,
          GST: GST
        })
        break;
      }
      case 'openDT':{
        var openDT = moment(event.target.value)
        var expDT = openDT.add(90,'day')
        this.setState({
          [name]: event.target.value,
          expDT: expDT.format('YYYY-MM-DD')
             });
        break;
      }
      case 'payBC':{
        var GST = Math.round(event.target.value*0.18)
        this.setState({
          [name]: event.target.value,
          payGST: GST
             });
        break; 
      }
      default: this.setState({[name]:event.target.value});
    }
  }

  // generators
  generateToolTipIcons = (iconsObject,index,render) => {
    const {classes} = this.props;
    return iconsObject.reduce((acc,prop,key) => {
        var shouldRender = render ? render[key] : prop.render;
        shouldRender ?
               acc.push(
               <Tooltip
                  id="tooltip-top"
                  title={prop.tip}
                  placement="top"
                  classes={{ tooltip: classes.tooltip }}
                >
                <IconButton
                  aria-label={prop.id}
                  className={classes.tableActionButton}
                  onClick={prop.handle(index)}
                >
                  <prop.icon
                    className={
                      classes.tableActionButtonIcon + " " + classes.edit
                    }
                  />
                </IconButton>
              </Tooltip>
               ):
               {}

        return acc
      },[]);
  
  }
  
  generatePaymentData = () => {
    const {LC} = this.props
    
    const paymentIconTools = [
      {
        icon: InsertDriveFile,
        handle: this.handleCycleFilesClick,
        tip: 'Files',
        id:'CycleFiles',
      },
      {
        icon: InfoOutline,
        handle: this.handleCyclePaymentClick,
        tip: 'Enter Transaction ID',
        id:'Info',
      },
      {
        icon: Done,
        handle: (index) => {},
        tip: 'Payment Completed and Reviewed',
        id:'Done'
      },
      {
        icon: Close,
        handle: this.handleCycleDelete,
        tip: 'Delete',
        id:'deleteCycle',
      },
      {
        icon: Edit,
        handle : this.handleCycleEditClick,
        tip: 'Edit',
        id: 'Edit',
      }
    ]
    
    this.totalPaymentCharges = 0
    this.newPayment = false
    const paymentData = LC.payment.cycles.reduce((array,item,index) => {
      if(item.due_DT){
        const due = formatDate(new Date(item.due_DT))
        const ref = item.LB_pay_ref ? item.LB_pay_ref: "Not Updated"

        const charges = (parseFloat(item.acc.acc) +
                        parseFloat(item.acc.GST) +
                        parseFloat(item.pay.bill_com) +
                        parseFloat(item.pay.post) +
                        parseFloat(item.pay.GST));

        this.totalPaymentCharges += charges;
        const newPayment = (item.pay.mode=='Not Updated' && item.payed==true)
        this.newPayment = this.newPayment || newPayment
        const render = [true, newPayment,
                        (item.pay.mode!=='Not Updated' && item.payed===true),
                        this.state.edit, this.state.edit]
        const icons = this.generateToolTipIcons(paymentIconTools,index,render);
        
        array.push([due,formatAmount(item.due_amt),ref,formatAmount(charges),icons])
        return array
      }
      return array
    },[])

    paymentData.push(['Total',formatAmount(LC.payment.total_due)])
    return paymentData
  }

  // generate Extension Table Data

  getLCinfo = () => {
    return this.props.LC
  }

  generateExtensionData = () =>{
    const {LC} = this.props;
    const extensionIconTools = [
      {
        icon: InsertDriveFile,
        handle: this.handleExtensionFilesClick,
        tip: 'Files',
        id:'Files',
        render: true
      },
      {
        icon: Edit,
        handle : this.handleExtensionEditClick,
        tip: 'Edit',
        id: 'Edit',
        render : this.state.edit
      },
      {
        icon: Close,
        handle: this.handleExtensionDelete,
        tip: 'Delete',
        id:'deleteExtension',
        render: this.state.edit
      }
    ]
    this.totalExtensionCharges = 0;
    const extensionData = LC.dates.reduce((array,item,index) => {
      var id = index === 0? 'Original': 'Extended'

      const icons = this.generateToolTipIcons(extensionIconTools,index)
      const charges = parseFloat(item.post) + 
                                    parseFloat(item.open) +
                                    parseFloat(item.amend) +
                                    parseFloat(item.GST)
      this.totalExtensionCharges += charges;
      const open = formatDate(new Date(item.openDT))
      const exp = formatDate(new Date(item.expDT))
      array.push([id,open,exp,formatAmount(roundAmount(charges)),icons])//,app, bc])
      return array
    },[])

    return extensionData
  }

  generateCycleCreationForm = () => {
    const {classes} = this.props;
    const form = 
    <div>  
      <Divider style={{margin:'10px'}}/>
      <Typography variant='body1' align='center' style={{color:'purple'}}>
        Cycle Creation Details
      </Typography> 
      <Grid container justify='flex-end'>
        <Grid item className={classes.grid} xs={12} sm={4}>
            <TextField
              required
              id="LB_pay_ref"
              label="Bank LB_pay_ref"
              type="text"
              value={this.state.pay_ref}
              className={classes.textField}
              InputLabelProps={{
                shrink: true,
              }}
              margin='normal'
              fullWidth={true}
              onChange={this.handleValueChange('pay_ref')}
          />
        </Grid>
        <Grid item className={classes.grid} xs={12} sm={4}>
            <TextField
              required
              id="due_DT"
              label="Due Date"
              type="date"
              className={classes.textField}
              value={String(this.state.due_DT).slice(0,10)}
              onChange={this.handleValueChange('due_DT')}
              margin='normal'
              fullWidth={true}
              InputLabelProps={{
                shrink: true,
              }}
          />
        </Grid>
        <Grid item className={classes.grid} xs={12} sm={4}>
            <TextField
              required
              id="cycleTID"
              label="Transaction ID"
              type="text"
              className={classes.textField}
              value={this.state.cycleTID}
              onChange={this.handleValueChange('cycleTID')}
              InputLabelProps={{
                shrink: true,
              }}
              margin='normal'
              fullWidth={true}
          />
        </Grid>
      </Grid>
      <Grid container >
        <Grid item className={classes.grid} xs={12} sm={4}>
          <FormControl margin='normal' fullWidth>
            <InputLabel htmlFor="due_amt">Due Amount</InputLabel>
            <Input
              id="due_amt"
              type="number"
              value={this.state.due_amt}
              onChange={this.handleValueChange('due_amt')}
              className={classes.textField}
              startAdornment={<InputAdornment position="start">Rs.</InputAdornment>}
            />
          </FormControl>
        </Grid>
        <Grid item className={classes.grid} xs={12} sm={4} md={4}>
          <FormControl margin='normal' fullWidth>
            <InputLabel htmlFor="acc-charge">Acceptance Charge</InputLabel>
            <Input
              id="acc"
              type="number"
              value={this.state.acc}
              onChange={this.handleValueChange('acc')}
              className={classes.textField}
              startAdornment={<InputAdornment position="start">Rs.</InputAdornment>}
            />
          </FormControl>
        </Grid>
        <Grid item className={classes.grid} xs={12} sm={4} md={4}>
          <FormControl margin='normal' fullWidth>
            <InputLabel htmlFor="acc-charge">GST</InputLabel>
            <Input
              id="cycleGST"
              type="number"
              value={this.state.cycleGST}
              onChange={this.handleValueChange('cycleGST')}
              className={classes.textField}
              startAdornment={<InputAdornment position="start">Rs.</InputAdornment>}
            />
          </FormControl>
        </Grid>
      </Grid>
    </div>
    return form
  }
  
  ////
  generateCyclePaymentForm = (index) => {
    const paymentModes = ['Regular','Devolved']
    const {classes} = this.props;
    const form = 
      <div>
        <Divider style={{margin:'10px'}}/>
        <Typography variant='body1' align='center' style={{color:'purple'}}>
          Payment Details
        </Typography>
        <Grid container>
          <Grid item className={classes.grid} xs={12} sm={4}>
            <TextField
              required
              id="payed_DT"
              label="Payment Date"
              type="date"
              className={classes.textField}
              value={String(this.state.payed_DT).slice(0,10)}
              onChange={this.handleValueChange('payed_DT')}
              margin='normal'
              fullWidth={true}
              InputLabelProps={{
                shrink: true,
              }}
          />
        </Grid>
          <Grid item className={classes.grid} xs={12} sm={4}>
            <TextField
              id='payTID'
              required
              margin='normal'
              fullWidth
              label='Payment Transaction ID'
              value={this.state.payTID}
              onChange={this.handleValueChange('payTID')}
              InputLabelProps={{
                shrink:true
              }}
            />
          </Grid>
          <Grid item className={classes.grid} xs={12} sm={4}>
            <FormControl fullWidth={true} margin='normal'>
              <InputLabel htmlFor="cycleFileSelect"> Payment Type</InputLabel>
              <Select
                required
                native
                onChange={this.handleValueChange('payMode')}
                inputProps={{
                  name: 'Payment Type',
                  id: 'paymentType'
                }}
                value={this.state.payMode}
              >
                {paymentModes.reduce((acc,prop,key) => {
                  acc.push(<option value={prop}>{prop}</option>)
                  return acc
                },[<option/>])}
              </Select>
            </FormControl>
          </Grid>
          <Grid item className={classes.grid} xs={12} sm={4}>
            <FormControl margin='normal' fullWidth>
              <InputLabel htmlFor="bill_com">Bill Commission</InputLabel>
              <Input
                id="bill_com"
                type="number"
                value={this.state.payBC}
                onChange={this.handleValueChange('payBC')}
                className={classes.textField}
                startAdornment={<InputAdornment position="start">Rs.</InputAdornment>}
              />
            </FormControl>
          </Grid>
          <Grid item className={classes.grid} xs={12} sm={4}>
            <FormControl margin='normal' fullWidth>
              <InputLabel htmlFor="payPost">Posting Charges</InputLabel>
              <Input
                id="cyclePost"
                type="number"
                value={this.state.payPost}
                onChange={this.handleValueChange('payPost')}
                className={classes.textField}
                startAdornment={<InputAdornment position="start">Rs.</InputAdornment>}
              />
            </FormControl>
          </Grid>
          <Grid item className={classes.grid} xs={12} sm={4}>
            <FormControl margin='normal' fullWidth>
              <InputLabel htmlFor="payGST">GST charges</InputLabel>
              <Input
                id="payGST"
                type="number"
                value={this.state.payGST}
                onChange={this.handleValueChange('payGST')}
                className={classes.textField}
                startAdornment={<InputAdornment position="start">Rs.</InputAdornment>}
              />
            </FormControl>
          </Grid>
        </Grid>
      </div>
      return form
  }
  // Returns a form to edit the whole Cycle

  generateCycleEditForm = (index) => {
    const creationDetails = this.generateCycleCreationForm()
    const paymentDetails = this.generateCyclePaymentForm()
    const {classes} = this.props;
    const form = 
      <div>
        {creationDetails}
        {paymentDetails}
        <Button color="green" size='small'
          variant='contained' className={classes.button}
          onClick={this.handleCycleEditSubmit}>
          <Save style={{marginRight: '10px'}}/> Save
        </Button>
        
      </div>
    return form
  }

////function to update payment details.
  generateCyclePaymentSubmitForm = () => {
    const cyclePaymentForm = this.generateCyclePaymentForm()
    const {classes} = this.props
    const form = 
    <div>
        <Typography variant='body1'>
          Payment Details
        </Typography>
        {cyclePaymentForm}
        <Button color="primary" size='small'
          variant='outlined' className={classes.button}
          onClick={this.handleCyclePaymentSubmit}>
          submit
        </Button>
      </div>
    return form

  }

// LC edit form
  generateLCEditForm = () => {
    const {classes, LC} = this.props
    const form = 
      <div>
      <Divider style={{margin:'10px'}}/>
        <Typography variant='body1' align='center' style={{color:'purple'}}>
          LC Details
        </Typography>
        <Grid container>
          <Grid item className={classes.grid} xs={12} sm={4}>
          <FormControl fullWidth={true} margin='normal'>
              <TextField
                required
                id="LC_no"
                label="LC Number"
                type="text"
                defaultValue = {LC.LC_no}
                className={classes.textField}
                InputLabelProps={{
                  shrink: true,
                }}
            /> </FormControl>
          </Grid>
          <Grid item className={classes.grid} xs={12} sm={4}>
          <FormControl fullWidth={true} margin='normal'>
              <TextField
                required
                id="FDR_no"
                label="FDR Number"
                type="text"
                defaultValue = {LC.FDR_no}
                InputLabelProps={{
                  shrink: true,
                }}
                className={classes.textField}
            /> </FormControl>
          </Grid>
          <Grid item className={classes.grid} xs={12} sm={4}>
            <FormControl margin='normal'>
              <InputLabel htmlFor="amount"> Amount</InputLabel>
              <Input
                id="amount"
                type="number"
                defaultValue = {String(LC.amount)}
                startAdornment={<InputAdornment position="start">Rs.</InputAdornment>}
              />
            </FormControl>
          </Grid>
        </Grid>
        <Button color="green" size='small'
          variant='contained' className={classes.button}
          onClick={this.handleEditSubmit}>
          <Save style={{marginRight: '10px'}}/> Save
        </Button>
      </div>    

    return form
  }

  // generate Cycle Files form 

  generateCycleFilesForm = (index) => {
    const cycleFiles = [
      {
        name: 'Bill of Material',
        value: 'bill_of_material',
        abbrev: 'boe'
      },
      {
        name: "Bank's Acceptance Letter",
        value: 'acceptance',
        abbrev: 'acc'
      },
      {
        name: 'Material Receipt Nature? (MRN)',
        value: 'receipt',
        abbrev: 'rec'
      }
    ]

    const {classes, LC} = this.props;
    const docDet = this.state.cycleFile ? cycleFiles[this.state.cycleFile] : null
    const document = docDet ? LC.payment.cycles[this.state.cycleIndex].documents[docDet.abbrev]: null
    var val = this.state.cycleFile ? cycleFiles[this.state.cycleFile].name : ''
    const selection = 
        <Grid item className={classes.grid} xs={12} sm={4}>
          <FormControl fullWidth={true} margin='normal'>
            <InputLabel htmlFor="cycleFileSelect"> File</InputLabel>
            <Select
              required
              native
              onChange={this.handleValueChange('cycleFile')}
              inputProps={{
                name: 'cycleFile',
                id: 'cycleFileSelect'
              }}
              value={val}
            >
              {cycleFiles.reduce((acc,prop,key) => {
                acc.push(<option value={key}>{prop.name}</option>)
                return acc
              },[<option/>])}
            </Select>
          </FormControl>
        </Grid>
        
    const form = 
        (document && document.rec)?
        <div>
          <Grid container>
            {selection}
            <Grid item className={classes.grid} xs={12} sm={5}>
              <Typography variant='body2'>
                {
                    document.rec == true ?
                    <b>Uploaded! Click to download.</b> :
                    <b>Not Uploaded! Select or Drag and drop to upload</b>    
                }
              </Typography>
              <FileIOButton id={LC._id}
                name={docDet.value} index={index}
                onSubmit = {this.onDocumentSubmit}
                exists = {document.rec == true}/>
            </Grid>
          </Grid>
        </div>       
        :
         this.state.cycleFile ?
         <div>
           <Grid container>
            {selection}
             <Grid item className={classes.grid} xs={12} sm={5}>
                <Typography variant='body2'>
                  <b>Not Uploaded! Select or Drag and drop to upload</b>    
                </Typography>
                <FileIOButton id={LC._id}
                  name={docDet.value} index={index}
                  onSubmit = {this.onDocumentSubmit}
                  exists = {false}/>
              </Grid>
            </Grid>
          </div>
         :
        <Grid container>
          {selection}
        </Grid>

    return form
  }

  generateExtensionFilesForm = (index) => {
    const extensionFiles = [
      {
        name: 'Application',
        value: 'application',
        abbrev: 'app'
      },
      {
        name: "Bank Charges",
        value: 'bankCharges',
        abbrev: 'bc'
      }
    ]

    const {classes, LC} = this.props;
    const docDet = this.state.extensionFile ? extensionFiles[this.state.extensionFile] : null
    const document = docDet ? LC.dates[this.state.extensionIndex][docDet.abbrev]: null

    const selection = 
        <Grid item className={classes.grid} xs={12} sm={4}>
          <FormControl fullWidth={true} margin='normal'>
            <InputLabel htmlFor="extensionFileSelect"> File</InputLabel>
            <Select
              required
              native
              onChange={this.handleValueChange('extensionFile')}
              inputProps={{
                name: 'extensionFile',
                id: 'extensionFileSelect'
              }}
            >
              {extensionFiles.reduce((acc,prop,key) => {
                acc.push(<option value={key}>{prop.name}</option>)
                return acc
              },[<option value=''/>])}
            </Select>
          </FormControl>
        </Grid>
    const form = 
        document ?
        Boolean(document.rec) == true ?        
        <div>
          <Grid container>
            {selection}
            <Grid item className={classes.grid} xs={12} sm={5}>
              <Typography variant='body2'>
                <b>Uploaded! Click to download.</b>
              </Typography>
              <FileIOButton id={LC._id}
                name={docDet.value} index={index}
                onSubmit = {this.onDocumentSubmit}
                exists = {true}/>
            </Grid>
          </Grid>
        </div>
        :
        <div>
          <Grid container>
            {selection}
            <Grid item className={classes.grid} xs={12} sm={5}>
              <Typography variant='body2'>
                <b>Not Uploaded! Select or Drag and drop to upload</b>
              </Typography>
              <FileIOButton id={LC._id}
                name={docDet.value} index={index}
                onSubmit = {this.onDocumentSubmit}
                exists = {false}
                />
            </Grid>       
          </Grid>
        </div>
          :
          this.state.extensionFile?
        <div>
          <Grid conatiner>
            {selection}
            <Grid item className={classes.grid} xs={12} sm={5}>
              <Typography variant='body2'>
                <b>Not Uploaded! Select or Drag and drop to upload</b>
              </Typography>
              <FileIOButton id={LC._id}
                name={docDet.value} index={index}
                onSubmit = {this.onDocumentSubmit}
                exists = {false}/>
            </Grid>
          </Grid>
        </div> 
        :
        <Grid container>
          {selection}
        </Grid>

    return form
  }


  // generate Extension Form 

  generateExtensionForm = () => {
    const {classes} = this.props
    const form = 
      <div>
        <Grid container>
          <Grid item className={classes.grid} xs={12} sm={4}>
            <TextField
              required
              id="openDT"
              label="Opening Date"
              type="date"
              value = {this.state.openDT}
              onChange = {this.handleValueChange('openDT')}
              InputLabelProps={{
                shrink: true,
              }}
              margin='normal'
              fullWidth
              className={classes.textField}
            />
          </Grid>
          <Grid item className={classes.grid} xs={12} sm={4}>
            <TextField
              required
              margin='normal'
              fullWidth
              id="expDT"
              label="Expiry Date"
              type="date"
              value = {this.state.expDT}
              onChange = {this.handleValueChange('expDT')}
              InputLabelProps={{
                shrink: true,
              }}
              className={classes.textField}
              />
          </Grid>
          <Grid item className={classes.grid} xs={12} sm={4}>
              <TextField
                required
                id="TID"
                label="Transaction ID"
                type="text"
                value={this.state.TID}
                onChange={this.handleValueChange('TID')}
                className={classes.textField}
                InputLabelProps={{
                  shrink: true,
                }}
                margin='normal'
                fullWidth={true}
            />
          </Grid>
        </Grid>
        <Grid container>
          <Grid item className={classes.grid} xs={12} sm={4} md={4}>
            <FormControl margin='normal' fullWidth>
              <InputLabel htmlFor="open">Open</InputLabel>
              <Input
                id="open"
                type="number"
                value={this.state.open}
                onChange={this.handleValueChange('open')}
                className={classes.textField}
                startAdornment={<InputAdornment position="start">Rs.</InputAdornment>}
              />
            </FormControl>
          </Grid>
          <Grid item className={classes.grid} xs={12} sm={4} md={4}>
            <FormControl margin='normal' fullWidth>
              <InputLabel htmlFor="amend">Amend</InputLabel>
              <Input
                id="amend"
                type="number"
                value={this.state.amend}
                onChange={this.handleValueChange('amend')}
                className={classes.textField}
                startAdornment={<InputAdornment position="start">Rs.</InputAdornment>}
              />
            </FormControl>
          </Grid>
          <Grid item className={classes.grid} xs={12} sm={4} md={4}>
            <FormControl margin='normal' fullWidth>
              <InputLabel htmlFor="GST">GST</InputLabel>
              <Input
                id="GST"
                type="number"
                value={this.state.GST}
                onChange={this.handleValueChange('GST')}
                className={classes.textField}
                startAdornment={<InputAdornment position="start">Rs.</InputAdornment>}
              />
            </FormControl>
          </Grid>
        </Grid>
        <Grid container>
          <Grid item className={classes.grid} xs={12} sm={4} md={4}>
            <FormControl margin='normal' fullWidth>
              <InputLabel htmlFor="post">Posting Charges</InputLabel>
              <Input
                id="post"
                type="number"
                value={this.state.post}
                onChange={this.handleValueChange('post')}
                className={classes.textField}
                startAdornment={<InputAdornment position="start">Rs.</InputAdornment>}
              />
            </FormControl>
          </Grid>
        </Grid>
        
      </div>

    return form;
  }

  /// margin clearance form
  generateMarginClearanceForm = () => {
    const {classes} = this.props
    console.log(this.props.LC.m_cl_DT)
    const form = !this.props.LC.m_cl_DT ?
      <Grid item className={classes.grid} xs={12} sm={12}>
          <Divider style={{padding:'5px',marginTop: '20px'}}/>
          <Grid item className={classes.grid} xs={12} sm={12}>
            <Typography variant='body1' 
              style={{marginTop: '10px',
                      color:"purple"}}>
            Update Margin Clearance Details </Typography>
          </Grid>
          <Grid item className={classes.grid} xs={12} sm={12}>
            <Grid container>
              <Grid item className={classes.grid} xs={12} sm={4}>
                <TextField
                  required
                  id="m_cl_DT"
                  label="Clearance Date"
                  type="date"
                  value = {this.state.m_cl_DT}
                  onChange = {this.handleValueChange('m_cl_DT')}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  margin='normal'
                  fullWidth
                  className={classes.textField}
                />
              </Grid>
              <Grid item className={classes.grid} xs={12} sm={4}>
                <FormControl margin='normal' fullWidth>
                  <InputLabel htmlFor="m_cl_amt">Credited Amount</InputLabel>
                  <Input
                    id="m_cl_amt"
                    type="number"
                    value={this.state.m_cl_amt}
                    onChange={this.handleValueChange('m_cl_amt')}
                    className={classes.textField}
                    startAdornment={<InputAdornment position="start">Rs.</InputAdornment>}
                  />
                </FormControl>
            </Grid>
              <Button color="primary" size='small'
                variant='outlined' className={classes.button}
                onClick={this.handleMarginDataSubmit}>
                submit
              </Button>
          </Grid>
        </Grid>
      </Grid>
      :
      <div>
        {/*<Typography variant='body1'
                  style={{padding:'10px', margin:'10px'}}>
                  Margin Clearance Date : {formatDate(new Date(this.props.LC.m_cl_DT))}
                </Typography>
                <Typography variant='body1'
                  style={{padding:'10px', margin:'10px'}}>
                  Margin Cleared Amount : {formatAmount(this.props.LC.m_cl_amt)}
                </Typography>*/}
      </div>
      return form 
  }

  generateSummary = (props) => {
    const {classes, LC} = this.props
    const amount = parseFloat(LC.amount)
    const due_amt = parseFloat(LC.payment.total_due)
    const clearedAmount = parseFloat(LC.m_cl_amt)
    const marginAmount = parseFloat(LC.m_amt)
    this.UnUtilized = amount-due_amt
    const totalCharges = roundAmount(this.totalPaymentCharges + this.totalExtensionCharges)
    const form = 
      <div>
        <Typography variant='title' align='center' style={{color:'purple'}}>Summary</Typography>
        <Divider inset style={{margin:'5px'}}/>
	<Grid item xs={12}>
	<Grid container justify='center'>
          <Grid item xs={3} sm={4} md={4} >
            <TableCell>
              <Typography variant='body1' align='center' style={{color:'purple'}}>
                Issuer
              </Typography>
            </TableCell>
            <TableCell>
              <Typography variant='body2' align='center'>
                {LC.issuer.name}
              </Typography>
            </TableCell>
            <TableCell>
              <Typography variant='body1' align='center' style={{color:'purple'}}>
                LC Number
              </Typography>
            </TableCell>
            <TableCell>
              <Typography variant='body2' align='center'>
                {LC.LC_no}
              </Typography>
            </TableCell>
          </Grid>
          <Grid item xs={3} sm={4} md={4}>
            <TableCell>
              <Typography variant='body1' align='center' style={{color:'purple'}}>
                Supplier Name
              </Typography>
            </TableCell>
            <TableCell>
              <Typography variant='body2' align='center'>
                {LC.supplier.name}
              </Typography>
            </TableCell>
            <TableCell>
              <Typography variant='body1' align='center' style={{color:'purple'}}>
                Projects 
              </Typography>
            </TableCell>
            {
              [LC.project].map((prop,key) => {
                 var name = prop.name.split(/[\s,-]+/).slice(1).join(' ')
                 console.log(name);
                 var element = 
                    <TableCell>
                      <Typography variant='body2' align='center'>
                        {name + ' - ' + prop.location}
                       </Typography>
                    </TableCell>          
                  return element
                })
            }
          </Grid> 
          <Grid item xs={3} sm={4} md={4}>
            <TableCell>
              <Typography variant='body1' align='center' style={{color:'purple'}}>
                Amount
              </Typography>
            </TableCell>
            <TableCell>
              <Typography variant='body2' align='center'>
                Rs. {formatAmount(LC.amount)}
              </Typography>
            </TableCell>
            <TableCell>
              <Typography variant='body1' align='center' style={{color:'purple'}}>
                Margin Amount
              </Typography>
            </TableCell>
            <TableCell>
              <Typography variant='body2' align='center'>
                Rs.{formatAmount(marginAmount)}
              </Typography>
            </TableCell>
          </Grid>
      	</Grid>
      	<Grid item xs={12}>
      	    <Divider style={{margin:'10px'}}/>
    	</Grid>
    	</Grid>
	   <Grid item xs={12}>
    	<Grid container>
    	  <Grid item xs={4}/>
    	  <Grid item xs={4}>
    	    <Typography variant='body1' align='center' style={{color:'purple'}}>
              Charges and Margins
          </Typography>
         <Divider style={{margin:'10px'}}/>
        </Grid>
       <Grid item xs={4}/>
        <Grid item xs={2}>
          <TableCell>
            <Typography variant='body2' align='left' >
              Payment Charges: 
            </Typography>
          </TableCell>
          <TableCell>
            <Typography variant='body2' align='left' >
              Extension Charges: 
            </Typography>
          </TableCell><TableCell>
            <Typography variant='body2' align='left' >
              Total Charges: 
            </Typography>
          </TableCell>
        </Grid>
        <Grid item xs={2}>
          <TableCell numeric>
            {formatAmount(this.totalPaymentCharges)}
          </TableCell>
          <TableCell numeric>
            {formatAmount(roundAmount(this.totalExtensionCharges))}
          </TableCell>
          <TableCell numeric>
            {formatAmount(roundAmount(this.totalExtensionCharges + this.totalPaymentCharges))}
          </TableCell>
        </Grid>
        <Grid item xs={2}>
          <TableCell>
            <Typography variant='body2' align='left' >
              UnUtilized Amount : 
            </Typography>
          </TableCell>
          <TableCell>
            <Typography variant='body2' align='left' >
              Loss : 
            </Typography>
          </TableCell>
          {/*<TableCell>
            <Typography variant='body2' align='left' >
              Total Charges : 
            </Typography>
          </TableCell>*/}
        </Grid>
        <Grid item xs={2}>
          <TableCell numeric>
            {formatAmount(this.UnUtilized)}
          </TableCell>
          <TableCell numeric>
            {formatAmount(roundAmount((this.UnUtilized/amount)*totalCharges))}
          </TableCell>
          {/*<TableCell numeric>
            {formatAmount(totalCharges)}
          </TableCell>*/}
      </Grid>
      <Grid item xs={2}>
        <TableCell>
          <Typography variant='body2' align='left' >
            Clearance Date : 
          </Typography>
        </TableCell>
        <TableCell>
          <Typography variant='body2' align='left' >
            Cleared Amount: 
          </Typography>
          <Typography variant='body2' align='left' >
            Interest : 
          </Typography>
        </TableCell>
      </Grid>
      <Grid item xs={2}>
        <TableCell numeric>
          {LC.m_cl_DT ? formatDate(new Date(LC.m_cl_DT)) : 'Not Updated'}
        </TableCell>
        <TableCell numeric>
          {clearedAmount > 0 ? formatAmount(clearedAmount) : 'Not Updated'}
        </TableCell>
        <TableCell numeric>
          {
            clearedAmount > 0 ? 
            formatAmount(roundAmount(clearedAmount-marginAmount)) : '0'
          }
        </TableCell>
      </Grid>
    </Grid>
    </Grid>
  </div>
    
    return form
  }

  /*generatePDFView = (props) => {
    const {LC} = props
    const element = 
         <Document>
          <Page size="A4">
            <View>
              <Typography> {LC.LC_NO} </Typography>
              {this.generateSummary()}
            </View>
          </Page>
        </Document>
    return element
  }

  downloadPDF = () => {
    var pdf = new jsPDF('p', 'pt', 'letter');
    const element = this.generatePDFView()
    pdf.fromHTML(element,(dispose) => {
      pdf.save(`$HOME/output.pdf`)
    })
    //this.setState({pdf: true})

  }*/





  // title = string
  // context = string
  // action = {
  // name : 'Close',
  // handle: this.handleClose
  //}

  handleDialogClose = () => {
    this.setState((prevState) => ({dialog:dialogState.closed}))
  }

  generateDialog = (title,context,action) => {
    var dialog = 
      <div>
        <Dialog
          open={this.state.dialog !== dialogState.closed}
          TransitionComponent={Transition}
          keepMounted
          onClose={this.handleDialogClose}
        >
          <DialogTitle style={{color:'purple'}}>
            {title}
          </DialogTitle>
          <DialogContent style={{minWidth:'500px'}}>
          {
            this.dialogMode !== 'success' ? 
              <DialogContentText>
                  {context}
              </DialogContentText>
              : 
              <Grid container justify='center' align='center' direction='column'>
                <Grid>
                  <Typography align='center'
                    variant='subheading' >
                    `LC ${this.props.LC.LC_no} was successfully closed!`
                  </Typography>
                </Grid>
                <Grid>
                  <Done style={{width:'150px',height:'150px',color:'green',margin:'auto'}}/>   
                </Grid>
              </Grid>
          }
          </DialogContent>
          {
            this.dialogMode === 'action'?
            <DialogActions>
              <Button onClick={this.handleDialogClose} color="secondary">
                Cancel
              </Button>
              <Button onClick={action.handle} color="primary">
                {action.name}
              </Button>
            </DialogActions>
            :
            <div/>
          }
        </Dialog>
      </div>
    return dialog
  }
//
  //// Handle Cycle Content Switch
//
  cycleContentSwitch = () => {
    const newCycleForm = this.generateCycleCreationForm();
    const paymentCheckForm = this.generateCyclePaymentSubmitForm();
    const cycleEditForm = this.generateCycleEditForm();
    //const LCEditForm = this.generateLCEditForm();
    const disableNewCycle = (this.props.LC.status === 'Expired') || this.state.closed
    const {classes} = this.props;
    switch(this.state.cycleContent){
      case cycleSwitch.newCycle:{
        return (
            <div>
            {newCycleForm}
            <Grid item xs={6} sm={3} justify='flex-end'>
              <Button color="blue" size='small' 
                variant='contained' className={classes.button}
                onClick={this.handleCycleSubmit}>
                Submit
              </Button>
              <Button color="contained" size='small'
                variant='outlined' className={classes.button}
                onClick={this.handleCycle}>
                Close
              </Button>
            </Grid>
            </div>
          )
      }
      case cycleSwitch.cycleEdit: {
        return cycleEditForm
      }
      case cycleSwitch.cyclePayCheck: {
        return paymentCheckForm;
      }
      // case cycleSwitch.edit: {
      //   return LCEditForm;
      // }
      case cycleSwitch.cycleFiles: {
        return this.generateCycleFilesForm(this.state.cycleIndex);
      }
      case cycleSwitch.none:{
        return <Button mini disabled={disableNewCycle} 
                variant='contained' className={classes.button}
                onClick={this.handleCycle}>Create New Cycle</Button>        
      }
      default:{
        return <Button mini variant='contained' className={classes.button}
                disabled={disableNewCycle}
                onClick={this.handleCycle}>Create New Cycle</Button>        
      }

    }
      
  }

  /// Switch for handling extension side content
  extensionContentSwitch = () => {
    const extensionForm = this.generateExtensionForm();
    const {classes} = this.props;
    const disableNewExtension = (this.props.LC.status === 'Expired') || this.state.closed
    switch(this.state.extensionContent){
      case extensionSwitch.newExtension:{
        return (
            <div>
            {extensionForm}
              <Button color="primary" size='small'
                variant='contained' className={classes.button}
                onClick={this.handleExtensionSubmit}>
                submit
              </Button>
              <Button color="secondary" size='small'
                variant='contained' className={classes.button}
                onClick={this.handleExtensionClick}>
                Close
              </Button>
            </div>
          )
      }
      case extensionSwitch.editExtension: {
        return (
            <div>
            {extensionForm}
              <Button color="green" size='small'
                variant='contained' className={classes.button}
                onClick={this.handleEditExtensionSubmit}>
                <Save style={{marginRight: '10px'}}/> Save
              </Button>
            </div>
          )
      }
      case extensionSwitch.extensionFiles: {
        return this.generateExtensionFilesForm(this.state.extensionIndex)
      }

      case extensionSwitch.none: {
        return this.state.closed? 
          this.generateMarginClearanceForm()
          :
          <Button size='small' disabled={disableNewExtension}
            variant='contained' className={classes.button}
            onClick={this.handleExtensionClick}>Add Ext.</Button>        
      }

      default:
       return this.state.closed? 
          this.generateMarginClearanceForm()
          :
          <Button size='small' disabled={this.state.closed}
            variant='contained' className={classes.button}
            onClick={this.handleExtensionClick}>Add Ext.</Button>         
       
    } 
  }

  // Cycle Handles

  handleCycle = (event) => {
    this.setState({cycleContent:
                      this.state.cycleContent === cycleSwitch.newCycle ?
                      cycleSwitch.none : cycleSwitch.newCycle
                    })
  }

  handleCycleEditClick = (cycleIndex) => (event) => {
    const cycle = this.props.LC.payment.cycles[cycleIndex]
    this.setState({cycleContent: (cycleIndex===this.state.cycleIndex?
                    this.state.cycleContent === cycleSwitch.cycleEdit?
                    cycleSwitch.none: cycleSwitch.cycleEdit: cycleSwitch.cycleEdit),
                   cycleIndex: cycleIndex,
                   due_DT: cycle.due_DT,
                   payed_DT: cycle.payed_DT ? cycle.payed_DT : cycle.due_DT,
                   due_amt: cycle.due_amt,
                   acc: cycle.acc.acc,
                   cycleGST: cycle.acc.GST,
                   cycleTID: cycle.acc.TID,
                   payTID: cycle.pay.TID,
                   payPost: cycle.pay.post,
                   payBC: cycle.pay.bill_com,
                   payGST: cycle.pay.GST,
                   pay_ref: cycle.LB_pay_ref,
                   payMode: cycle.pay.mode
                 })
  }

  handleCyclePaymentClick = (cycleIndex) => (event) => {
    const cycle = this.props.LC.payment.cycles[cycleIndex]
    this.setState({cycleContent: (cycleIndex===this.state.cycleIndex?
                    this.state.cycleContent === cycleSwitch.cyclePayCheck?
                    cycleSwitch.none: cycleSwitch.cyclePayCheck: cycleSwitch.cyclePayCheck),
                   cycleIndex: cycleIndex,
                   payed_DT: cycle.due_DT,
                   payTID: cycle.pay.TID,
                   payPost: cycle.pay.post,
                   payBC: cycle.pay.bill_com,
                   payGST: cycle.pay.GST,
                   payMode: cycle.pay.mode
                 })
  }

  handleCycleFilesClick = (cycleIndex) => (event) => {
    const cycleContent = (cycleIndex===this.state.cycleIndex)?
                    (this.state.cycleContent === cycleSwitch.cycleFiles)?
                    cycleSwitch.none: cycleSwitch.cycleFiles: cycleSwitch.cycleFiles;
    const cycleFile = cycleContent === cycleSwitch.none ? null : this.state.cycleFile;
    this.setState({
      cycleContent: cycleContent,
      cycleFile: cycleFile,
      cycleIndex: cycleIndex
    }) 
    
  }

  handleCycleSubmit = (event) => {
    const {onUpdate, LC} = this.props
    const LB_pay_ref = document.getElementById('LB_pay_ref').value
    const cycleTID = document.getElementById('cycleTID').value
    const payload = {
      due_DT : this.state.due_DT,
      due_amt: this.state.due_amt,
      LB_pay_ref: LB_pay_ref,
      acc: this.state.acc,
      GST: this.state.cycleGST,
      TID: cycleTID,
      _method: 'PUT'
    }
    const url = 'LCs/'+this.props.LC._id+
                    '/addNewCycle'
    axios.post(url,payload,{credentials:'include'})
    .then((response) =>{
      this.resetState()
      onUpdate(LC.LC_no,EJSON.parse(response.data))
    }).then((error) => {
      console.log(error)
    })
  }

  handleCycleEditSubmit = (event) => {
    const payload = {
      _method: 'PUT',
      due_DT: this.state.due_DT,
      due_amt: this.state.due_amt,       
      acc: this.state.acc,
      accGST: this.state.cycleGST,
      accTID: this.state.cycleTID,
      payTID: this.state.payTID,
      payPost: this.state.payPost,
      payBC: this.state.payBC,
      payGST: this.state.payGST,
      LB_pay_ref: this.state.pay_ref,
      payMode: this.state.payMode,
      index: this.state.cycleIndex,
      payed_DT: this.state.payed_DT
    }
    const url = 'LCs/'+this.props.LC._id+
                    '/editCycle'
    axios.post(url,payload,{credentials:'include'})
    .then((response) =>{
      this.resetState()
      this.props.onUpdate(this.props.LC.LC_no,EJSON.parse(response.data))
    }).then((error) => {
      console.log(error)
    })
  }

  handleCycleDelete = (index) => (event) => {
    const url = '/LCs/' + this.props.LC._id +
                    '/deleteCycle'
    axios.post(url,{
      _method: 'DELETE',
      index: index
    },{credentials: 'include'})
    .then((response) =>{
      this.resetState()
      this.props.onUpdate(this.props.LC.LC_no,EJSON.parse(response.data))
    }).then((error) => {
      console.log(error)
    })
  }

  handleCyclePaymentSubmit = (event) => {

    const payload = {
      _method: 'PUT',
      payTID: this.state.payTID,
      payPost: this.state.payPost,
      payBC: this.state.payBC,
      payGST: this.state.payGST,
      index: this.state.cycleIndex,
      payMode: this.state.payMode,
      payed_DT: this.state.payed_DT
    }
    const url = 'LCs/'+this.props.LC._id+
                    '/checkCyclePayment'
    axios.post(url,payload,{credentials:'include'})
    .then((response) =>{
      this.resetState()
      this.props.onUpdate(this.props.LC.LC_no,EJSON.parse(response.data))
    }).then((error) => {
      console.log(error)
    })
  }

  // Extension Handles

  handleExtensionClick = (event) => {
    this.setState({extensionContent:
                    this.state.extensionContent ===  extensionSwitch.newExtension ?
                    extensionSwitch.none: extensionSwitch.newExtension
                  })
  }

  handleExtensionEditClick = (extensionIndex) => (event) => {
    const extension = this.props.LC.dates[extensionIndex]

    this.setState({extensionContent: (extensionIndex===this.state.extensionIndex?
          this.state.extensionContent === extensionSwitch.editExtension?
          extensionSwitch.none: extensionSwitch.editExtension: extensionSwitch.editExtension),
          extensionIndex: extensionIndex,
          openDT: String(extension.openDT).slice(0,10),
          expDT: String(extension.expDT).slice(0,10),
          amend: extension.amend,
          open: extension.open === 0 ? roundAmount(this.props.LC.amount*0.0045) : extension.open ,
          post: extension.post === 0 ? 200: extension.post,
          GST: extension.GST === 0 ? roundAmount(this.props.LC.amount*0.0045*0.18): extension.GST,
          TID: extension.TID
         })
  }

  handleExtensionFilesClick = (extensionIndex) => (event) => {
    const extensionContent = (extensionIndex===this.state.extensionIndex)?
                    (this.state.extensionContent === extensionSwitch.extensionFiles)?
                    extensionSwitch.none: extensionSwitch.extensionFiles: extensionSwitch.extensionFiles;
    const extensionFile = extensionContent === extensionSwitch.none ? null : this.state.extensionFile;
    this.setState({
      extensionContent: extensionContent,
      extensionFile: extensionFile,
      extensionIndex: extensionIndex
    }) 
    
  }
  

  handleExtensionSubmit = (event) => {
    var payload = {
      _method : 'PUT',
      openDT: this.state.openDT,
      expDT: this.state.expDT,
      amend: this.state.amend,
      open: this.state.open,
      post: this.state.post,
      GST: this.state.GST
    }

    const url = 'LCs/'+this.props.LC._id+
                    '/addOrEditExtension'
    axios.post(url,payload,{credentials:'include'})
    .then((response) =>{
      this.resetState()
      this.props.onUpdate(this.props.LC.LC_no,EJSON.parse(response.data))
    }).then((error) => {
      console.log(error)
    })

  }

  handleEditExtensionSubmit = (event) => {
    var payload = {
      _method : 'PUT',
      openDT: this.state.openDT,
      expDT: this.state.expDT,
      amend: this.state.amend,
      open: this.state.open,
      post: this.state.post,
      GST: this.state.GST,
      TID: this.state.TID,
      index: this.state.extensionIndex
    }

    const url = 'LCs/'+this.props.LC._id+
                    '/addOrEditExtension'
    axios.post(url,payload,{credentials:'include'})
    .then((response) =>{
      this.resetState()
      this.props.onUpdate(this.props.LC.LC_no,EJSON.parse(response.data))
    }).then((error) => {
      console.log(error)
    })

  }

  handleExtensionDelete = (index) => (event) => {
    const url = '/LCs/' + this.props.LC._id +
                    '/deleteExtension'
    axios.post(url,{
      _method: 'DELETE',
      index: index
    },{credentials:'include'})
    .then((response) =>{
      this.resetState()
      this.props.onUpdate(this.props.LC.LC_no,EJSON.parse(response.data))
    }).then((error) => {
      console.log(error)
    })
  }

  handleEditClick = (event) => {
    this.setState({edit: !this.state.edit})
    
  }

  handleEditSubmit = (event) => {
    const url = 'LCs/'+this.props.LC._id+
                    '/edit'
    const payload = {
      FDR_no: document.getElementById('FDR_no').value,
      LC_no: document.getElementById('LC_no').value,
      amount: document.getElementById('amount').value,
      _method: 'PUT'
    }

    axios.post(url,payload,{credentials:'include'})
    .then((response) =>{
      console.log(response)
      this.resetState()
      this.props.onUpdate(this.props.LC.LC_no,EJSON.parse(response.data))
    }).then((error) => {
      console.log(error)
    })


  }
  //
  handleClose = (event) => {
    const {LC, onUpdate} = this.props
    const url = `LCs/${LC._id}/close`

    axios.post(url,{_method: 'PUT'},{credentials:'include'})
    .then((response) => {
      this.dialogMode = 'success'
      this.setState((prevState) => ({closed:true}))
      setTimeout(() =>this.handleDialogClose,1000)
      setTimeout(() => {onUpdate(this.props.LC.LC_no,EJSON.parse(response.data))},1500)
      
    }).catch((error) => {
      console.log(error)
    })
  }

  // handle margin update
  handleMarginDataSubmit = (event) => {
    var payload ={
      _method : 'PUT',
      m_cl_DT : this.state.m_cl_DT,
      m_cl_amt: this.state.m_cl_amt
    }
    const url = 'LCs/'+this.props.LC._id+
                '/addMarginData'
    axios.post(url,payload,{credentials: 'include'})
    .then((response) => {
      console.log('marginData Update')
    }).then((error) => {
      console.log(error)
    })
  }

  // Deletion Handles
  handleDelete = (event) => {
    const {LC, onDelete} = this.props
    var payload = {
      _method : 'DELETE'
    }

    const url = 'LCs/'+LC._id+
                    '/edit'
    axios.post(url,payload,{credentials:'include'})
    .then((response) =>{      
      this.dialogMode = 'success'
      setTimeout(this.resetState,1000)
      setTimeout(() => {onDelete(LC.LC_no)},1800)
    
    }).catch((error) => {
      console.log(error)
    })
  }

// document submission handle
  onDocumentSubmit = (LC) =>  {
    this.props.onUpdate(this.props.LC.LC_no,EJSON.parse(LC))
  }

  render() {
    const { classes ,LC} = this.props;
    const { expanded } = this.state;
        
    const paymentData = this.generatePaymentData()
    const extensionData = this.generateExtensionData()
    var cycleEditForm = null;
    if(this.state.cycleEdit)    
      cycleEditForm = this.generateCycleEditForm()



    var title  = this.state.dialog === dialogState.closeAction ? 'Close LC' : 'Delete LC'
    var context = 'Should LC no. ' + LC.LC_no + ' be '
    context += this.state.dialog === dialogState.closeAction?  'closed?' : 'deleted?'
    var action = this.state.dialog === dialogState.closeAction ?
              {name:'Close', handle:this.handleClose} :
              {name:'Delete', handle:this.handleDelete}

    console.log(LC.LC_no,this.newPayment)
    return (
    <div>
      {this.generateDialog(title,context,action)}
      <div className={classes.root}>
        <ExpansionPanel expanded={expanded === 'panel1'} onChange={this.handlePanelChange('panel1')} divider>
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
            <Typography className={classes.heading}>{LC.issuer.name}</Typography>
            <Typography className={classes.heading}>{LC.supplier.name}</Typography>
            <Typography className={classes.heading}>{LC.LC_no}</Typography>
            <Typography className={classes.heading}>Rs. {String(LC.amount)}</Typography>
            <Typography className={classes.heading}>{LC.status}</Typography>
            
            {this.newPayment ? 
             <InfoOutline className={classes.tableActionButtonIcon}/>: 
             LC.status==='Closed' ? 
             <Done className={classes.tableActionButtonIcon}/>
             :
             <div/>
           }
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <Grid container spacing={24} justify='flex-end' style={{flexGrow:1}}>
              <Grid item className={classes.grid} xs={12}>
                <Divider style={{margin:'5px',padding:'1px'}}/>
              </Grid>
              <Grid item className={classes.grid} xs={12} sm={6}>
                <Grid container >
                  <Grid item className={classes.grid} xs={12}>
                    <Divider inset style={{margin:'10px'}}/>
                    <Typography variant='body1' align='center' style={{color:'purple'}}>
                      Payment Cycles
                    </Typography>
                    <Divider inset style={{margin:'10px'}}/>
                    <Table
                      id="paymentTable"
                      isNumericColumn={[false,true,true,true,true]}
                      tableHead = {['Due Date', 'Due Amount', 'Bank LB Ref.','Bank Charges']}
                      tableData = {paymentData}
                      icon={true}
                    />
                  </Grid>
                  {this.cycleContentSwitch()}                
                </Grid>
              </Grid>
              <Grid item className={classes.grid} xs={12} sm={6}>
                <Grid item className={classes.grid} xs={12}>
                  <Divider inset style={{margin:'10px'}}/>
                  <Typography variant='body1' align='center' style={{color:'purple'}}>
                    Extension Cycles
                  </Typography>
                  <Divider inset style={{margin:'10px'}}/>
                  <Table
                    id="extensionTable"
                    icon={true}
                    isNumericColumn={['false,false,false,false,false']}
                    tableHead = {['Type','Opening Date', 'Expirty Date',
                                  'Bank Charges']}
                    tableData = {extensionData}
                  />                  
                </Grid>
                {this.extensionContentSwitch()}
              </Grid>
              <Grid item xs={12}>
                <Divider />
              </Grid>
        
              <Grid item xs={12} sm={12} md={12}>
              {
                this.state.edit === true ?
                this.generateLCEditForm() : 
                <this.generateSummary ref={el => (this.componentRef = el)}/>
              }
              </Grid>
              <Grid item className={classes.grid} xs={12}>
                <Divider inset style={{margin:'0px',marginTop:'20px'}} />
              </Grid>
              <Grid item className={classes.grid} xs={12} sm={6} md={6}>
                <SummaryDownloadButton
                  payHead={['Due Date', 'Due Amount', 'Bank LB Ref.','Bank Charges']}
                  extHead={['Type','Opening Date', 'Expirty Date','Bank Charges']}
                  payData={paymentData}
                  extData={extensionData}
                  LC={LC}
                  totalExtensionCharges={this.totalExtensionCharges}
                  totalPaymentCharges={this.totalPaymentCharges}
                  UnUtilized={this.UnUtilized}
                  />
                <Button mini disabled={this.state.closed} variant='contained' className={classes.button}
                  onClick={this.handleEditClick} >
                  Edit LC <Edit style={{marginLeft:'10px'}} />
                </Button>
                <Button mini variant='contained' className={classes.button}
                    disabled={this.state.closed}
                    onClick={() =>{this.setState({dialog:dialogState.deleteAction})}} color="secondary">
                    Delete LC <Delete style={{marginLeft:'10px'}}/>
                </Button>
                <Button mini disabled={this.state.closed} variant='contained' color="primary"
                    onClick={() =>{this.setState({dialog:dialogState.closeAction})}}>
                    Close LC
                </Button>
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

class Panel extends React.Component{
  constructor(props){
    super(props);
  }

  render = ()=>{
    const {classes} = this.props
    return (
      <div>
        <ReactToPrint
          trigger={() => <a href="#">Print this out!</a>}
          content={() => this.componentRef}
        />
        <LCPanel {...this.props}  ref={el => (this.componentRef = el)} />
      </div>
    );
  }
}

export default withStyles(styles)(LCPanel);
