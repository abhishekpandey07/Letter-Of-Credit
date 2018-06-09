import React from "react";
import { Grid, Icon, withStyles,  Button, Typography } from "@material-ui/core";
import AddIcon from '@material-ui/icons/Add'

import EJSON from 'mongodb-extended-json'
//import getComponent from 'hadron-react-bson'
import { NavLink } from "react-router-dom";
import { RegularCard, Table, ItemGrid } from "components";
import axios from 'axios'

function rand() {
  return Math.round(Math.random() * 20) - 10;
}

function getModalStyle() {
  const top = 50 + rand();
  const left = 50 + rand();

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

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


class ProjectHome extends React.Component{
    constructor(props){
      super(props)
      this.state = {
        projects: []
      }
      console.log('Created Projects instance')
      console.log(this.state)
    }

    callApi = async () => {
      const response = await fetch('/projects');
      const body = await response.json();
      if (response.status !== 200) throw Error(body.message);
      
      return EJSON.parse(body);

    }

    

    deleteButton = (id) => {
      return (
        <Button variant="contained" color="secondary">
        Delete
      </Button>
        );

    }

    componentDidMount() {
      console.log('async was called')
      this.callApi()
      .then(res => this.setState({ projects: res }))
      .catch(err => console.log(err));
    }

    render() {
      let projectData = this.state.projects.reduce((projects,project)=>{
        var supplier = project.suppliers.length > 0 ? project.suppliers[0].name: 'No Suppliers Registered';
        projects.push([ project.name, project.location, String(project.value), project.manager,
                      supplier])
        return projects

      },[])
      console.log(this.state.projects)
      console.log('projectData: ' + String(projectData))
      return (
       <div> 
        <Grid container>
          <ItemGrid xs={12} sm={12} md={12}>
            <RegularCard
              cardTitle="Projects"
              cardSubtitle="List of All Projects"
              content={
                <Table
                  tableHeaderColor="primary"
                  tableHead={["Name", "Location", "Value", "Manager", "Suppliers"]}
                  /*tableData={[
                    ["Dakota Rice", "Niger", "Oud-Turnhout", "$36,738"],
                    ["Minerva Hooper", "Curaçao", "Sinaai-Waas", "$23,789"],
                    ["Sage Rodriguez", "Netherlands", "Baileux", "$56,142"],
                    ["Philip Chaney", "Korea, South", "Overland Park", "$38,735"],
                    ["Doris Greene", "Malawi", "Feldkirchen in Kärnten", "$63,542"],
                    ["Mason Porter", "Chile", "Gloucester", "$78,615"]
                  ]}*/
                  tableData={projectData}
                />
              }
              footer={
                <div>
                  <NavLink
                      to={'/projects/AddNewproject'}
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
export default (ProjectHome);

