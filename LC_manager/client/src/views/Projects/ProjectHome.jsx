import React from "react";
import { Grid, Icon, withStyles,  Button, Typography } from "@material-ui/core";
import AddIcon from '@material-ui/icons/Add'

import EJSON from 'mongodb-extended-json'
//import getComponent from 'hadron-react-bson'
import { NavLink } from "react-router-dom";
import { RegularCard, Table, ItemGrid } from "components";
import axios from 'axios'
import PageTable from 'components/Table/PaginationTable'
import {formatAmount} from 'utils/common'

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
      const response = await fetch('/api/projects',{credentials:'include'});
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
        projects.push([ project.name, project.location, formatAmount(project.value), project.manager])
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
                <PageTable
                  enableEdit={true}
                  editHandler={this.editHandler}
                  enableEDit
                  tableHeaderColor="primary"
                  isNumericColumn={[false,false,true,true]}
                  tableHead={["Name", "Location", "Value", "Manager"]}
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

