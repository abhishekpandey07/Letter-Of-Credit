import React from "react";
import { Grid, Icon, withStyles,  Button, Typography,List,ListItem, Divider } from "@material-ui/core";
import AddIcon from '@material-ui/icons/Add'

import EJSON from 'mongodb-extended-json'
//import getComponent from 'hadron-react-bson'
import { NavLink } from "react-router-dom";
import { RegularCard, Table, ItemGrid, LCPanel } from "components";
import LCRoutes from 'routes/lcs.jsx'
import TextField from '@material-ui/core/TextField'
import {IconButton as SearchButton} from 'components'
import Search from '@material-ui/icons/Search'
import FormControl from '@material-ui/core/FormControl'
import Input from '@material-ui/core/Input'
import Select from '@material-ui/core/Select'
import InputLabel from '@material-ui/core/InputLabel'

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

class LCHome extends React.Component{
    constructor(props){
      super(props)
      this.state = {
        LCs: [],
        arrange: null,
        supplier: '',
        issuer: '',
        search: ''
      }
    }

    callAllApi = async () => {
      const response = await fetch('/LCs',{credentials:'include'});
      const body = await response.json();
      if (response.status !== 200) throw Error(body.message);
      
      return EJSON.parse(body);

    };

    componentDidMount() {
      this.callAllApi()
      .then(res => this.setState({ LCs: res }))
      .catch(err => console.log(err));
    }

    updateLCPanel = (key,LC) => {
      var LCs = this.state.LCs
      LCs[key] = LC;
      this.setState({LCs: LCs})
    }

    deleteLC = (id) => {
      var LCs = this.state.LCs
      delete LCs[id]
      this.setState({LCs:LCs})
    }

    handleChange = (name) => (event) => {
      this.setState({[name]: event.target.value})
      console.log(this.state.arrange)
    }

    render() {
      
      const {classes} = this.props
      const arrangeList = ['issuing bank', 'supplier']
      
      const searchLists = this.state.LCs.reduce((arr,prop,key)=>{
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
        <Grid container justify='flex-end'>
          <Grid item className={classes.grid} xs={12} sm={12} md={2}>
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
          <Grid item className={classes.grid} xs={12} sm={12} md={2}>
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
          <Grid item className={classes.grid} xs={12} sm={12} md={2}>
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
          <Grid item className={classes.grid} xs={12} sm={12} md={2}>
              <TextField
                style={{
                  marginTop: '32px'
                }}
                margin="normal"
                fullWidth
                inputProps={{
                  placeholder: "Search by LC number"
                }}
                onChange={this.handleChange('search')}
              />
          </Grid>
          <Grid item className={classes.grid} xs={12} sm={12} md={1}>
              <SearchButton
                style={{
                  marginTop: '28px',
                  marginBottom: '20px',
                  marginLeft: '0px'
                }}
                color="white"
                aria-label="edit" 
              >
                <Search style={{width:'17px'}} />
              </SearchButton>
          </Grid>
        </Grid>

      var panels
      if(this.state.LCs < 1){
        var panels = (
          <Typography varaint='title'>
          No LCs to Display
          </Typography>
          )
      }else{
        var LCs
        if(this.state.supplier && this.state.arrange=='supplier'){
          LCs = this.state.LCs.filter((LC) =>{
            return (LC.supplier._id == this.state.supplier)
          })
        } else {
          if(this.state.issuer && this.state.arrange=='issuing bank'){
            LCs = this.state.LCs.filter((LC) => {
              return (LC.issuer._id == this.state.issuer)
            })
          } 

          else {
            LCs = this.state.LCs
          }
        }
        var panels = LCs.reduce((arr,prop,key) => {
          var panel = null
          if(this.state.search){
            if(prop.LC_no.includes(this.state.search)){
              panel = 
                      <Grid item xs={12} sm={12} md={12}>
                        <LCPanel LC={prop} id={key}
                        onUpdate={this.updateLCPanel}
                        onDelete={this.deleteLC}/>
                      </Grid>
            }
          } else {
            panel = <Grid item xs={12} sm={12} md={12}>
                        <LCPanel LC={prop} id={key}
                        onUpdate={this.updateLCPanel}
                        onDelete={this.deleteLC}/>
                    </Grid>
          }
          
          panel == null ? {} : arr.push(panel)
          return arr
        },[]);
      }

      return (
        <div className="grid">
          <Grid container>
            <ItemGrid xs={12} sm={12} md={12}>
              <RegularCard
                cardTitle="Letters of Credit"
                cardSubtitle="Click on a panel to know more about or to update a Letter of Credit."
                content={
                  <Grid container style={{flexGrow:1}}>
                    <Grid item xs={12}>
                      {searchBar}
                    </Grid>
                    <Grid item xs={12}>
                      <Grid container>
                        {panels}
                      </Grid>
                    </Grid>
                  </Grid>
              }
              footer={
                  <div>
                    <NavLink
                      to={'/LCs/AddNewLC'}
                      activeClassName="active"
                    >
                      <Button variant="fab" color="secondary" aria-label="add" onClick={this.handleAddOpen}>
                        <AddIcon />
                      </Button>
                    </ NavLink>
                   </div>
              }/> 
            </ItemGrid>
          </Grid>
        </div>
      )
    }
}
export default withStyles(styles)(LCHome);