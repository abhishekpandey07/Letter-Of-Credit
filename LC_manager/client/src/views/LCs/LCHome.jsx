import React from "react";
import { Grid, Icon, withStyles,  Button, Typography,List,ListItem, Divider } from "@material-ui/core";
import AddIcon from '@material-ui/icons/Add'
import SplashScreen from '../../SplashPage.jsx'
import EJSON from 'mongodb-extended-json'
//import getComponent from 'hadron-react-bson'
import {Done, Delete, Save} from '@material-ui/icons'
import { Link,NavLink } from "react-router-dom";
import { RegularCard, Table, ItemGrid, LCPanel } from "components";
import LCRoutes from 'routes/lcs.jsx'
import TextField from '@material-ui/core/TextField'
import {IconButton as SearchButton} from 'components'
import Search from '@material-ui/icons/Search'
import FormControl from '@material-ui/core/FormControl'
import Input from '@material-ui/core/Input'
import Select from '@material-ui/core/Select'
import InputLabel from '@material-ui/core/InputLabel'
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Slide from '@material-ui/core/Slide';
import axios from 'axios'

const styles = theme => ({
  paper: {
    position: 'absolute',
    width: theme.spacing.unit * 50,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing.unit * 4,
  },
  grid:{
    padding: "0 15px !important"
  }
});

function Transition(props) {
  return <Slide direction="up" {...props} />;
}

const dialogState = {
  closed: 0,
  closeAction: 1,
  deleteAction: 2,
  feedback: 3,
  downloadPDF: 4,
}

class LCHome extends React.Component{
    constructor(props){
      super(props)
      this.state = {
        LCs: [],
        arrange: null,
        supplier: '',
        issuer: '',
        search: '',
        display:'Active',
        dialog: dialogState.closed
      }
      this.dialogMode = 'action'
    }

    callAllApi = async () => {
      const response = await fetch('/LCs',{credentials:'include'});
      const body = await response.json();
      if (response.status !== 200) throw Error(body.message);
      const ret = new Map(EJSON.parse(body));
      console.log(ret);
      return ret;

    };
    //
    componentDidMount() {
      this.callAllApi()
      .then(res => this.setState({ LCs: res }))
      .catch(err => console.log(err));
    }

    dialogSuccess = () => {
      this.dialogMode = 'success'
    }
    //
    updateLCPanel = (key,LC) => {
      var LCs = this.state.LCs
      LCs.set(key,LC);
      this.setState({LCs: LCs})
    }
    
    handleDelete = (LC_no,id) => (event,target) => {
      this.dialog = this.generateDialog('Delete LC',`Are you sure you want to delete LC : ${LC_no}`,
                                        {name: 'delete',action : this.deleteLC(LC_no,id)})
      this.setState((prevState) => ({dialog: dialogState.deleteAction}));
    };

    deleteLC = (LC_no,id) => {
        var LCs = this.state.LCs
        LCs.delete(LC_no)
        this.setState((prevState) => {LCs:LCs})
    }

    

    handleChange = (name) => (event) => {
      this.setState({[name]: event.target.value})
      console.log(this.state.arrange)
    }

  // title = string
  // context = string
  // action = {
  // name : 'Close',
  // handle: this.handleClose
  //}

  
  handleDialogClose = () => {
    console.log('In this . handle Dialog Close')
    this.setState((prevState) => ({dialog:dialogState.closed}))
  }

  generateDialog = (title,context,action) => {
    this.dialog = 
      <div>
        <Dialog
          open={this.state.dialog !== dialogState.closed}
          TransitionComponent={Transition}
          keepMounted
          onClose={this.handleDialogClose}
        >
          <DialogTitle id="alert-dialog-slide-title">
            {title}
          </DialogTitle>
          <DialogContent>
          {
            this.dialogMode !== 'success' ? 
              <DialogContentText id="alert-dialog-slide-description">
                  {context}
              </DialogContentText>
              : 
              <Grid container justify='center' align='center'>
                <Grid>
                  <Done style={{width:'150px',height:'150px',color:'green'}}/>   
                </Grid>
              </Grid>
          }
          </DialogContent>
          {
            this.dialogMode == 'action'?
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

      this.setState((prevState) => ({dialog:dialogState.closeAction}))
  }

    render() {
      console.log(this.state.LCs)
      const {classes} = this.props
      const arrangeList = ['issuing bank', 'supplier']
      const displayList = ['All','Active','Closed']
      
      const searchLists = [...this.state.LCs].reduce((arr,[lc_no,prop],key)=>{
        if(!arr.suppliers.some((obj)=>{
          return obj._id == prop.supplier._id
        }))
          {
            arr.suppliers.push(prop.supplier)
          }

        if(!arr.banks.some((obj)=>{
          return obj._id == prop.issuer._id
        })){
          arr.banks.push(prop.issuer)
        }

        return arr
      },{banks:[],suppliers:[]})

      var searchBar =
        <Grid container justify='flex-end' alignItems='center'>
          <Grid item className={classes.grid}>
             <FormControl fullWidth={true} margin='normal'>
              <InputLabel htmlFor="issuer"> Display</InputLabel>
              <Select
                native
                onChange={this.handleChange('display')}
                defaultValue = 'Active'
                inputProps={{
                  name: 'search By',
                  id: 'searchSelect'
                }}
              >
                {displayList.reduce((acc,prop,key) =>{
                  acc.push(<option value={prop}>{prop}</option>)
                  return acc
                },[<option value=''/>])}
              </Select>
            </FormControl>
          </Grid>
          <Grid item className={classes.grid}>
             <FormControl fullWidth={true} margin='normal'>
              <InputLabel htmlFor="issuer"> Search By</InputLabel>
              <Select
                native
                onChange={this.handleChange('arrange')}
                inputProps={{
                  name: 'search By',
                  id: 'searchSelect'
                }}
              >
                {arrangeList.reduce((acc,prop,key) =>{
                  acc.push(<option value={prop}>{prop}</option>)
                  return acc
                },[<option value=''/>])}
              </Select>
            </FormControl>
          </Grid>
          {this.state.arrange === 'supplier' ?
          <Grid item className={classes.grid}>
             <FormControl fullWidth={true} margin='normal'>
              <InputLabel htmlFor="supplierSelect"> Select a supplier</InputLabel>
              <Select
                native
                onChange={this.handleChange('supplier')}
                inputProps={{
                  name: 'supplierSelect',
                  id: 'supplierSelect'
                }}
              >
                {
                  searchLists.suppliers.reduce((acc,prop,key)=>{
                    acc.push(<option value={prop._id}>{prop.name}</option>)
                    return acc
                  },[<option value=''/>])
                }
              </Select>
            </FormControl>
          </Grid>:
          <div/>
         }
         {this.state.arrange === 'issuing bank' ?
          <Grid item className={classes.grid}>
             <FormControl fullWidth={true} margin='normal'>
              <InputLabel htmlFor="issuerSelect"> Select a bank</InputLabel>
              <Select
                native
                onChange={this.handleChange('issuer')}
                inputProps={{
                  name: 'issuerSelect',
                  id: 'issuerSelect'
                }}
              >
                {
                  searchLists.banks.reduce((acc,prop,key)=>{
                    acc.push(<option value={prop._id}>{prop.name}</option>)
                    return acc
                  },[<option value=''/>])
                }
              </Select>
            </FormControl>
          </Grid>:
          <div/>
         }
          <Grid item className={classes.grid}>
            <Grid container spacing={8} alignItems="flex-end" diection='row'>
              <Grid item>
                <Search style={{width:'17px'}} />
              </Grid>
              <Grid item>                
                <TextField
                  style={{
                    marginTop: '32px'
                  }}
                  margin="normal"
                  fullWidth
                  inputProps={{
                    placeholder: "Search keyword"
                  }}
                  onChange={this.handleChange('search')}
                />
              </Grid>
            </Grid>
          </Grid>
          <Grid item >
            <Button variant='contained' size='medium'
              component={Link} to={`/LCs/AddNewLC`}
              onClick={this.handleAddOpen}>
                <AddIcon style={{width:'17px',height:'17px',marginRight:'10px'}}/>
                <Typography align='center'> New LC</Typography>
          </Button>
          </Grid>
        </Grid>

      var panels
      if(this.state.LCs < 1){
        var panels = 
          <Grid item xs = {12} sm={12} md={12} style={{height:'500px'}}>
            <Grid container direction='column' justify='center' alignItems='center' style={{height:'100%'}}>
              <Grid item>
                <SplashScreen/>
              </Grid>
            </Grid>
          </Grid>
      }else{
        if(this.state.LCs.length < 1){
          var panels = (
          <Typography varaint='title'>
          No LCs to Display
          </Typography>
          )
        } else {
          var LCs
          if(this.state.display === 'Active'){
            LCs = [...this.state.LCs].filter(([lc_no,LC]) => { return !(LC.status === 'Closed')})
            console.log('length of LCs = ' + String(LCs.length))
          } else if(this.state.display == 'Closed'){
            LCs = [...this.state.LCs].filter(([lc_no,LC]) => {return (LC.status === 'Closed')})
          } else{
            LCs = [...this.state.LCs]
          }
          
          if(this.state.supplier && this.state.arrange=='supplier'){
            LCs = LCs.filter(([lc_no,LC]) =>{
              return (LC.supplier._id == this.state.supplier)
            })
          } else if(this.state.issuer && this.state.arrange=='issuing bank'){
              LCs = LCs.filter(([lc_no,LC]) => {
                return (LC.issuer._id == this.state.issuer)
              })
          }
          
          var panels = [...LCs].reduce((arr,[lc_no,prop],key) => {
            var panel = null
            if(this.state.search){
              if((prop.LC_no.includes(this.state.search) ||
                   prop.supplier.name.includes((this.state.search).toUpperCase()) ||
                   prop.issuer.name.includes((this.state.search).toUpperCase()) ||
                   prop.project.name.includes((this.state.search).toUpperCase()) ||
                   prop.project.location.includes((this.state.search).toUpperCase())
                   )
               ){
                panel = 
                        <Grid item xs={12} sm={12} md={12}>
                          <LCPanel LC={prop}
                          onUpdate={this.updateLCPanel}
                          onDelete={this.deleteLC}
                          />

                        </Grid>
              }
            } else {
              panel = <Grid item xs={12} sm={12} md={12}>
                          <LCPanel LC={prop}
                          onUpdate={this.updateLCPanel}
                          onDelete={this.deleteLC}
                          />
                      </Grid>
            
            }
            panel == null ? {} : arr.push(panel)
            return arr
          },[]);
        }
      }

      return (
        <div className="grid">
          {/*this.dialog*/}
          <Grid container>
            <ItemGrid xs={12} sm={12} md={12}>
              <RegularCard
                cardTitle="Letters of Credit"
                cardSubtitle="Click on a panel to know more about or to update a Letter of Credit."
                content={
                  <Grid container style={{flexGrow:1}}>
                    <Grid item xs={12} sm={12} md={12}>
                      {searchBar}
                    </Grid>
                    <Grid item xs={12}>
                      <Grid container justify='center' align = 'center' direction='column'>
                        {panels}
                      </Grid>
                    </Grid>
                  </Grid>
                }
                />
            </ItemGrid>
          </Grid>
        </div>
      )
    }
}
export default withStyles(styles)(LCHome);
