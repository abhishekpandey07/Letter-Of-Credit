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

const styles = theme => ({
  root: {
    width: '100%'
  },
  heading: {
    fontSize: theme.typography.pxToRem(13),
    flexBasis: '20.00%',
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
    width:200,
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

const states = {notCompleted: 0 , completed: 1, closed: 2}
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
      //other states
      closed: states.notCompleted,
      refFile: ''
    }
    console.log(this.props.LC)
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
      closed: states.notCompleted,
      refFile: ''
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
    

    const paymentData = LC.payment.cycles.reduce((array,item,index) => {
      if(item.due_DT){
        const due = formatDate(new Date(item.due_DT))
        const ref = item.LB_pay_ref ? item.LB_pay_ref: "SADFSAF"

        const charges = (parseFloat(item.acc.acc) +
                        parseFloat(item.acc.GST) +
                        parseFloat(item.pay.bill_com) +
                        parseFloat(item.pay.post) +
                        parseFloat(item.pay.GST));
        const render = [true,item.payed==true,this.state.cycleContent === cycleSwitch.edit,
                        this.state.cycleContent === cycleSwitch.edit]
        const icons = this.generateToolTipIcons(paymentIconTools,index,render);
        
        array.push([due,formatAmount(item.due_amt),ref,charges,icons])
        return array
      }
      return array
    },[])

    paymentData.push(['Total',formatAmount(LC.payment.total_due)])
    return paymentData
  }

  // generate Extension Table Data

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
        render : this.state.cycleContent === cycleSwitch.edit
      },
      {
        icon: Close,
        handle: this.handleExtensionDelete,
        tip: 'Delete',
        id:'deleteExtension',
        render: this.state.cycleContent === cycleSwitch.edit
      }
    ]

    const extensionData = LC.dates.reduce((array,item,index) => {
      var id = index === 0? 'Original': 'Extended'

      const icons = this.generateToolTipIcons(extensionIconTools,index)
      const charges = ( parseFloat(item.post) + 
                        parseFloat(item.open) +
                        parseFloat(item.amend) +
                        parseFloat(item.GST))
      const open = formatDate(new Date(item.openDT))
      const exp = formatDate(new Date(item.expDT))
      array.push([id,open,exp,charges,icons])//,app, bc])
      return array
    },[])

    return extensionData
  }

  generateCycleCreationForm = () => {
    const {classes} = this.props;
    const form = 
    <div> 
    <Grid container>
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

  generateCyclePaymentForm = (index) => {
    const {classes} = this.props;
    const form = 
        <Grid container>
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
            <FormControl margin='normal' fullWidth>
              <InputLabel htmlFor="bill_com">Bill Commission</InputLabel>
              <Input
                id="bill_com"
                type="number"
                value={this.state.cycleBC}
                onChange={this.handleValueChange('cycleBC')}
                className={classes.textField}
                startAdornment={<InputAdornment position="start">Rs.</InputAdornment>}
              />
            </FormControl>
          </Grid>
          <Grid item className={classes.grid} xs={12} sm={4}>
            <FormControl margin='normal' fullWidth>
              <InputLabel htmlFor="cyclePost">Posting Charges</InputLabel>
              <Input
                id="cyclePost"
                type="number"
                value={this.state.cyclePost}
                onChange={this.handleValueChange('cyclePost')}
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
        <Divider style={{margin:'10px'}}/>
        <Typography variant='body1'>
          Payment Details
        </Typography>
        {paymentDetails}
        <Button color="primary" size='small'
          variant='outlined' className={classes.button}
          onClick={this.handleCycleEditSubmit}>
          submit
        </Button>
      </div>
    return form
  }

////function to update payment details.
  generateCyclePaymentform = () => {
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
      <Button color="primary" size='small'
        variant='outlined' className={classes.button}
        onClick={this.handleEditSubmit}>
        submit
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

  //// Handle Cycle Content Switch

  cycleContentSwitch = () => {
    const newCycleForm = this.generateCycleCreationForm();
    const paymentCheckForm = this.generateCyclePaymentForm();
    const cycleEditForm = this.generateCycleEditForm();
    const LCEditForm = this.generateLCEditForm();
    
    const {classes} = this.props;
    switch(this.state.cycleContent){
      case cycleSwitch.newCycle:{
        return (
            <div>
            {newCycleForm}
              <Button color="primary" size='small'
                variant='outlined' className={classes.button}
                onClick={this.handleCycleSubmit}>
                submit
              </Button>
            </div>
          )
      }
      case cycleSwitch.cycleEdit: {
        return cycleEditForm
      }
      case cycleSwitch.cyclePayCheck: {
        return paymentCheckForm;
      }
      case cycleSwitch.edit: {
        return LCEditForm;
      }
      case cycleSwitch.cycleFiles: {
        return this.generateCycleFilesForm(this.state.cycleIndex);
      }
      case cycleSwitch.none:{
        return <Button mini variant='contained' className={classes.button}
                        onClick={this.handleCycle}>Create New Cycle</Button>        
      }
      default:{
        return <Button mini variant='contained' className={classes.button}
                        onClick={this.handleCycle}>Create New Cycle</Button>        
      }

    }
      
  }

  /// Switch for handling extension side content
  extensionContentSwitch = () => {
    const extensionForm = this.generateExtensionForm();
    const {classes} = this.props;

    switch(this.state.extensionContent){
      case extensionSwitch.newExtension:{
        return (
            <div>
            {extensionForm}
              <Button color="primary" size='small'
                variant='outlined' className={classes.button}
                onClick={this.handleExtensionSubmit}>
                submit
              </Button>
            </div>
          )
      }
      case extensionSwitch.editExtension: {
        return (
            <div>
            {extensionForm}
              <Button color="primary" size='small'
                variant='outlined' className={classes.button}
                onClick={this.handleEditExtensionSubmit}>
                submit
              </Button>
            </div>
          )
      }
      case extensionSwitch.extensionFiles: {
        return this.generateExtensionFilesForm(this.state.extensionIndex)
      }

      case extensionSwitch.none: {
        return <Button size='small' variant='contained' className={classes.button}
                          onClick={this.handleExtensionClick}>Add Ext.</Button>        
      }

      default:
       return <Button size='small' variant='contained' className={classes.button}
                          onClick={this.handleExtensionClick}>Add Ext.</Button>         
    } 
  }

  // Cycle Handles

  handleCycle = (event) => {
    this.setState({cycleContent:cycleSwitch.newCycle})
  }

  handleCycleEditClick = (cycleIndex) => (event) => {
    const cycle = this.props.LC.payment.cycles[cycleIndex]
    this.setState({cycleContent: (cycleIndex===this.state.cycleIndex?
                    this.state.cycleContent === cycleSwitch.cycleEdit?
                    cycleSwitch.none: cycleSwitch.cycleEdit: cycleSwitch.cycleEdit),
                   cycleIndex: cycleIndex,
                   due_DT: cycle.due_DT,
                   due_amt: cycle.due_amt,
                   acc: cycle.acc.acc,
                   cycleGST: cycle.acc.GST,
                   cycleTID: cycle.acc.TID,
                   payTID: cycle.pay.TID,
                   payPost: cycle.pay.post,
                   payBC: cycle.pay.bill_com,
                   payGST: cycle.pay.GST,
                   pay_ref: cycle.LB_pay_ref,
                 })
  }

  handleCyclePaymentClick = (cycleIndex) => (event) => {
    const cycle = this.props.LC.payment.cycles[cycleIndex]
    this.setState({cycleContent: (cycleIndex===this.state.cycleIndex?
                    this.state.cycleContent === cycleSwitch.cyclePayCheck?
                    cycleSwitch.none: cycleSwitch.cyclePayCheck: cycleSwitch.cyclePayCheck),
                   cycleIndex: cycleIndex,
                   payTID: cycle.pay.TID,
                   payPost: cycle.pay.post,
                   payBC: cycle.pay.bill_com,
                   payGST: cycle.pay.GST,
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
    axios.post(url,payload)
    .then((response) =>{
      this.resetState()
      this.props.onUpdate(this.props.id,EJSON.parse(response.data))
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
      index: this.state.cycleIndex
    }
    const url = 'LCs/'+this.props.LC._id+
                    '/editCycle'
    axios.post(url,payload)
    .then((response) =>{
      this.resetState()
      this.props.onUpdate(this.props.id,EJSON.parse(response.data))
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
      this.props.onUpdate(this.props.id,EJSON.parse(response.data))
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
      index: this.state.cycleIndex
    }
    const url = 'LCs/'+this.props.LC._id+
                    '/checkCyclePayment'
    axios.post(url,payload)
    .then((response) =>{
      this.resetState()
      this.props.onUpdate(this.props.id,EJSON.parse(response.data))
    }).then((error) => {
      console.log(error)
    })
  }

  // Extension Handles

  handleExtensionClick = (event) => {
    this.setState({extensionContent: extensionSwitch.newExtension})
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
          open: extension.open,
          post: extension.post,
          GST: extension.GST,
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
    axios.post(url,payload)
    .then((response) =>{
      this.resetState()
      this.props.onUpdate(this.props.id,EJSON.parse(response.data))
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
    axios.post(url,payload)
    .then((response) =>{
      this.resetState()
      this.props.onUpdate(this.props.id,EJSON.parse(response.data))
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
    })
    .then((response) =>{
      this.resetState()
      this.props.onUpdate(this.props.id,EJSON.parse(response.data))
    }).then((error) => {
      console.log(error)
    })
  }

  handleEditClick = (event) => {
    this.setState({ cycleContent :
                    (this.state.cycleContent===cycleSwitch.edit)?
                      cycleSwitch.none : cycleSwitch.edit})
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
      this.resetState()
      this.props.onUpdate(this.props.id,EJSON.parse(response.data))
    }).then((error) => {
      console.log(error)
    })


  }

  handleClose = (event) => {
    const url = 'LCs/'+this.props.LC._id+
                    '/close'
    axios.post(url,{_method: 'PUT'},{credentials:'include'})
    .then((response) => {
      console.log(response)
      this.setState({closed:states.closed})
    }).catch((error) => {
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
    axios.post(url,payload,{credentials:'include'})
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
    var disableCloseButton = false
    if(this.state.closed){
       disableCloseButton = (this.state.closed === states.completed)? false: true
    }
    
   const paymentData = this.generatePaymentData()
   const extensionData = this.generateExtensionData()
   var cycleEditForm = null;
   if(this.state.cycleEdit)    
    cycleEditForm = this.generateCycleEditForm()

    return (
    <div>
      <div className={classes.root}>
        <ExpansionPanel expanded={expanded === 'panel1'} onChange={this.handlePanelChange('panel1')} divider>
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
            <Typography className={classes.heading}>{LC.supplier.name}</Typography>
            <Typography className={classes.heading}>{LC.project.name + '(' + (LC.project.location) + ')'}</Typography>
            <Typography className={classes.heading}>{LC.LC_no}</Typography>
            <Typography className={classes.heading}>Rs. {String(LC.amount)}</Typography>
            <Typography className={classes.heading}>{LC.status}</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <Grid container spacing={32}>
            <Grid item className={classes.grid} xs={12} sm={6}>
              <Grid item className={classes.grid}>
                <Table
                  isNumericColumn={[false,true,true,true,true]}
                  tableHead = {['Due Date', 'Due Amount', 'Bank LB Ref.','Bank Charges']}
                  tableData = {paymentData}
                  icon={true}
                />
              </Grid>
              {this.cycleContentSwitch()}                
            </Grid>
            <Grid item className={classes.grid} xs={12} sm={6}>
                <Grid item className={classes.grid} xs={12}>
                  <Table
                    icon={true}
                    isNumericColumn={['false,false,false,false,false']}
                    tableHead = {['Type','Opening Date', 'Expirty Date',
                                  'Bank Charges']}
                    tableData = {extensionData}
                  />
                </Grid>
                {this.extensionContentSwitch()}
            </Grid>
            <Grid item className={classes.grid} xs={12} sm={12}>
              <Button mini variant='contained' className={classes.button}
                onClick={this.handleEditClick}>Edit</Button>
              <Button mini variant='contained' className={classes.button}
                  onClick={this.handleDelete} colour={red}>Delete</Button>
              <Button mini disabled={disableCloseButton} variant='contained' className={classes.button}
                  onClick={this.handleClose}>
                  Close
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

export default withStyles(styles)(LCPanel);