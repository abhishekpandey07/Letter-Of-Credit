import React from "react";
import { Grid } from "material-ui";
import EJSON from 'mongodb-extended-json'
//import getComponent from 'hadron-react-bson'
import { RegularCard, Table, ItemGrid } from "components";

class Suppliers extends React.Component{
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

    };

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
        suppliers.push([ supplier.name, supplier.city, String(supplier.projects._id), String(supplier.banks),
                      supplier.LCs])
        return suppliers

      },[])
      console.log(this.state.suppliers)
      console.log('supplierData: ' + String(supplierData))
      return (
        <Grid container>
          <ItemGrid xs={12} sm={12} md={12}>
            <RegularCard
              cardTitle="suppliers"
              cardSubtitle="Here is a subtitle for this table"
              content={
                <Table
                  tableHeaderColor="primary"
                  tableHead={["Name", "City", "Projects", "Banks", "LCs"]}
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
            />
          </ItemGrid>
          {/*<ItemGrid xs={12} sm={12} md={12}>
            <RegularCard
              plainCard
              cardTitle="Table on Plain Background"
              cardSubtitle="Here is a subtitle for this table"
              content={
                <Table
                  tableHeaderColor="primary"
                  tableHead={["ID", "Name", "Country", "City", "Salary"]}
                  tableData={[
                    ["1", "Dakota Rice", "$36,738", "Niger", "Oud-Turnhout"],
                    ["2", "Minerva Hooper", "$23,789", "Curaçao", "Sinaai-Waas"],
                    ["3", "Sage Rodriguez", "$56,142", "Netherlands", "Baileux"],
                    [
                      "4",
                      "Philip Chaney",
                      "$38,735",
                      "Korea, South",
                      "Overland Park"
                    ],
                    [
                      "5",
                      "Doris Greene",
                      "$63,542",
                      "Malawi",
                      "Feldkirchen in Kärnten"
                    ],
                    ["6", "Mason Porter", "$78,615", "Chile", "Gloucester"]
                  ]}
                />
              }
            />
          </ItemGrid>*/}
        </Grid>
      );
    }
}
export default Suppliers;

