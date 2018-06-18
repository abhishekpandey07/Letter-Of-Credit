import React from "react";
import { Grid, Icon, withStyles,  Button, Typography } from "@material-ui/core";
import AddIcon from '@material-ui/icons/Add'

import EJSON from 'mongodb-extended-json'
//import getComponent from 'hadron-react-bson'
import { NavLink } from "react-router-dom";
import { RegularCard, Table, ItemGrid } from "components";
import SupplierPanel from 'components/Suppliers/SupExpPanel.jsx'

const styles = theme => ({
  paper: {
    position: 'absolute',
    width: theme.spacing.unit * 50,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing.unit * 4,
  },
});

/*const styles = theme => ({
  root: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  icon: {
    margin: theme.spacing.unit * 2,
  },
  iconHover: {
    margin: theme.spacing.unit * 2,
    '&:hover': {
      color:"blue",
    },
  },
});
*/


class SupplierHome extends React.Component{
    constructor(props){
      super(props)
      this.state = {
        suppliers: [],
        projects: []
      }
      console.log('Created suppliers instance')
      console.log(this.state)
    }

    callSupplierApi = async () => {
      const response = await fetch('/suppliers');
      const body = await response.json();
      if (response.status !== 200) throw Error(body.message);
      
      return EJSON.parse(body);

    }

    callProjectsApi = async() => {
      const response = await fetch('/projects');
      const body = await response.json();
      if (response.status !== 200) throw Error(body.message);
      
      return EJSON.parse(body);      
    }

    componentDidMount() {
      console.log('async was called')
      this.callSupplierApi()
      .then(res => this.setState({ suppliers: res }))
      .catch(err => console.log(err));

      this.callProjectsApi()
      .then(res => this.setState({ projects: res }))
      .catch(err => console.log(err));
    }

    updateSupplierPanel = (key,supplier) => {
      var suppliers = this.state.suppliers
      suppliers[key] = supplier;
      console.log(suppliers)
      this.setState({suppliers: suppliers})
      console.log(this.state.suppliers)
    }

    deleteSupplier = (id) => {
      var suppliers = this.state.suppliers
      delete suppliers[id]
      this.setState({suppliers:suppliers})
    }

    render() {
      const projectsList  = this.state.projects.reduce((arr,project) => {
        arr.push(<option value={project._id}>{project.name}</option>)
          //returning array
        return arr;
      },[<option value=''/>])
      if(this.state.suppliers < 1){
        var panels = (
          <Typography varaint='title'>
          No Suppliers to Display
          </Typography>
          )
      }else{
        var panels = this.state.suppliers.reduce((arr,prop,key) => {
          console.log(key)
          arr.push(<SupplierPanel supplier={prop} id={key}
                      onUpdate={this.updateSupplierPanel}
                      onDelete={this.deleteSupplier}
                      projectsList={projectsList}/>)
          return arr
        },[])
      }
      return (
       <div> 
        <Grid container>
          <ItemGrid xs={12} sm={12} md={12}>
            <RegularCard
              cardTitle="suppliers"
              cardSubtitle="Here is a subtitle for this table"
              content={
                panels
              }
              footer={
                <div>
                  <NavLink
                      to={'/Suppliers/AddNewSupplier'}
                      activeClassName="active"
                  >
                    <Button variant="fab" color="secondary" aria-label="add">
                      <AddIcon />
                    </Button>
                  </ NavLink>
                </div>
              }
            />
          </ItemGrid>
        </Grid>
      </div>
      );
    }
}
export default (SupplierHome);

