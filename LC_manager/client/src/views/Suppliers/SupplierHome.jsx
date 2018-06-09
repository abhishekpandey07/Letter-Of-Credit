import React from "react";
import { Grid, Icon, withStyles,  Button, Typography } from "@material-ui/core";
import AddIcon from '@material-ui/icons/Add'

import EJSON from 'mongodb-extended-json'
//import getComponent from 'hadron-react-bson'
import { NavLink } from "react-router-dom";
import { RegularCard, Table, ItemGrid } from "components";

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


class SupplierHome extends React.Component{
    constructor(props){
      super(props)
      this.state = {
        suppliers: []
      }
      console.log('Created suppliers instance')
      console.log(this.state)
    }

    callApi = async () => {
      const response = await fetch('/suppliers');
      const body = await response.json();
      if (response.status !== 200) throw Error(body.message);
      
      return EJSON.parse(body);

    }

    componentDidMount() {
      console.log('async was called')
      this.callApi()
      .then(res => this.setState({ suppliers: res }))
      .catch(err => console.log(err));
    }

    render() {
      let supplierData = this.state.suppliers.reduce((suppliers,supplier)=>{
  //      console.log(getComponent(supplier.LC_used))
        /*suppliers.push([supplier["name"],supplier["branch"],supplier["IFSC"],
                            supplier["LC_limit"]["numberdecimal"],
                            supplier["LC_used"]["$numberdecimal"],
                            supplier["LCs"]])*/
        suppliers.push([ supplier.name, supplier.city, String(supplier.projects[0].name), String(supplier.banks[0].name),
                      String(supplier.banks[0].branch),String(supplier.banks[0].IFSC),supplier.LCs])
        return suppliers

      },[])
      console.log(this.state.suppliers)
      console.log('supplierData: ' + String(supplierData))
      return (
       <div> 
        <Grid container>
          <ItemGrid xs={12} sm={12} md={12}>
            <RegularCard
              cardTitle="suppliers"
              cardSubtitle="Here is a subtitle for this table"
              content={
                <Table
                  tableHeaderColor="primary"
                  tableHead={["Name", "City", "Projects", "Bank", "Branch", "IFSC", "LCs"]}
                  /*tableData={[
                    ["Dakota Rice", "Niger", "Oud-Turnhout", "$36,738"],
                    ["Minerva Hooper", "Curaçao", "Sinaai-Waas", "$23,789"],
                    ["Sage Rodriguez", "Netherlands", "Baileux", "$56,142"],
                    ["Philip Chaney", "Korea, South", "Overland Park", "$38,735"],
                    ["Doris Greene", "Malawi", "Feldkirchen in Kärnten", "$63,542"],
                    ["Mason Porter", "Chile", "Gloucester", "$78,615"]
                  ]}*/
                  tableData={supplierData}
                  expansionHead = "Letters of Credit."
                />
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

