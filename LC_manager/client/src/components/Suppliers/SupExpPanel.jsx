import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import {Table,PageTable} from "components"
import
{ Grid, Button,
  TextField, Input, InputLabel, FormControl} from '@material-ui/core'
import red from '@material-ui/core/colors/red'
import axios from 'axios'
import InputAdornment from '@material-ui/core/InputAdornment';
import FileIOButton from 'components/FileIOButtons/FileIOButton'
import EJSON from 'mongodb-extended-json'
import Select from '@material-ui/core/Select';

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

class SupplierPanel extends React.Component {
  constructor(props){
    super(props)
    this.state ={
      expanded: null,
      addProject: false,
      addBank: false,
    }
  }

  handlePanelChange = panel => (event, expanded) => {
    this.setState({
      expanded: expanded ? panel : false,
      addProject: false,
      addBank: false,
    });
  };


  handleProjectClick = (event) => {
    this.setState({addProject: !this.state.addProject})
  }

  handleBankClick = (event) => {
    this.setState(prev => {return {addBank: !prev.addBank}})
  }

  handleProjectSubmit = (event) => {
    const project = document.getElementById('project').value    
    const payload = {
      project : project,
      _method: 'PUT'
    }
    const url = 'suppliers/'+this.props.supplier._id+
                    '/addProject'
    axios.post(url,payload,{credentials:'include'})
    .then((response) =>{
      this.setState({addProject:false})
      console.log(response)
      this.props.onUpdate(this.props.id,EJSON.parse(response.data))
    }).then((error) => {
      console.log(error)
    })
  }

  handleBankSubmit = (event) => {
    const name = document.getElementById('bankname').value
    const bankbranch = document.getElementById('bankbranch').value
    const IFSC = document.getElementById('IFSC').value
    const payload = {
      name: name,
      branch: bankbranch,
      IFSC: IFSC,
      _method: 'PUT'
    }
    const url = 'suppliers/'+this.props.supplier._id+
                    '/addBank'
    axios.post(url,payload,{credentials:'include'})
    .then((response) =>{
      this.handleBankClick()
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

    const url = 'suppliers/'+this.props.supplier._id+
                    '/edit'
    axios.post(url,payload)
    .then((response) =>{
      this.props.onDelete(this.props.id)

    }).then((error) => {
      console.log(error)
    })
  }

  render() {
    const { classes ,supplier} = this.props;
    const { expanded } = this.state;

    const LCs = supplier.banks.reduce((lcs,bank) => {
            var validLCs = bank.LCs.reduce((valid,lc)=>{
              (lc.status === ("Active") || lc.status === "Extended") ? valid++ : null
              return valid
            },0)

            lcs += validLCs
            return lcs

          },0)

    const ActiveProjects = supplier.projects.reduce((projects,project) => {
      projects.push([project.name])
      return projects
    },[])

    const Data = supplier.banks.reduce((data,bank) =>{
      if(bank.LCs.length > 0){
        bank.LCs.map(lc=> {
          if(lc.status === 'Active' || lc.status === 'Extended'){
            data.LCData.push([lc.LC_no,String(lc.amount),lc.status])
          }
        })
      }
      data.BanksData.push([bank.name,bank.branch,bank.IFSC])
      return data
    },{LCData: [],BanksData:[]})

    return (
    <div>
      <div className={classes.root}>
        <ExpansionPanel expanded={expanded === 'panel1'} onChange={this.handlePanelChange('panel1')}>
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
            <Typography className={classes.heading}>{supplier.name}</Typography>
            <Typography className={classes.heading}>Projects: {supplier.projects.length}</Typography>
            <Typography className={classes.heading}>Letters of Credit: {LCs}</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <Grid container spacing={32}>
            <Grid item xs={12} sm={12} md={4}>
              <Grid item xs={12}>
                <div>
                <Table
                  isNumericColumn={[false,false,false]}
                  tableHead = {["Bank","Branch","IFSC"]}
                  tableData = {Data.BanksData}
                />
                </div>
              </Grid>
              <Grid item >
                  {this.state.addBank ?
                          <div>
                          <div>
                            <FormControl fullWidth={true} margin='normal'>
                                <TextField
                                  required
                                  id='bankname'
                                  label='Bank Name'
                                  type='text'
                                />
                            </FormControl>
                          </div>
                          <div>
                            <FormControl fullWidth={true} margin='normal'>
                                <TextField
                                  required
                                  id='bankbranch'
                                  label='Bank Branch'
                                  type='text'
                                />
                            </FormControl>
                          </div>
                          <div>
                            <FormControl fullWidth={true} margin='normal'>
                                <TextField
                                  required
                                  id='IFSC'
                                  label='Bank IFSC Code'
                                  type='text'
                                />
                            </FormControl>
                          </div>
                          <div>
                            <Button color="primary" size='small'
                                variant='outlined' className={classes.button}
                                onClick={this.handleBankSubmit}>
                                Submit
                              </Button>
                            </div>
                          </div>

                              : 
                              <div>
                              <Button mini variant='contained' className={classes.button}
                                  onClick={this.handleBankClick}>Add New Bank</Button>
                              </div>
                        }
                </Grid>
                </Grid>
            
            <Grid item xs={12} sm={12} md={4}>
              <Grid item>
                <div>
                <Table
                  isNumericColumn={[false,false]}
                  tableHead = {["Projects"]}
                  tableData = {ActiveProjects}
                />
                </div>
              </Grid>
                
                  {this.state.addProject ?
                          <div>
                            <FormControl className={classes.margin} margin='normal'>
                                <InputLabel htmlFor="Project">Project</InputLabel>
                                <Select
                                  native
                                  inputProps={{
                                    name: 'project',
                                    id: 'project'
                                  }}
                                >
                                  {this.props.projectsList}
                                </Select>
                            </FormControl>
                            <Button color="primary" size='small'
                                variant='outlined' className={classes.button}
                                onClick={this.handleProjectSubmit}>
                                Submit
                              </Button>
                            </div>
                              : 
                              <div>
                              <Button mini variant='contained' className={classes.button}
                                  onClick={this.handleProjectClick}>Add Project</Button>
                              </div>
                        }
                </Grid>
            <Grid item xs={12} sm={12} md={4} >
              <Grid item>
                <PageTable
                  tableHeaderColor="primary"
                  isNumericColumn={[false,true,false]}
                  tableHead = {["LC Number","Amount", "status"]}
                  tableData = {Data.LCData}
                />
                </Grid>  
            </Grid>
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

SupplierPanel.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(SupplierPanel);