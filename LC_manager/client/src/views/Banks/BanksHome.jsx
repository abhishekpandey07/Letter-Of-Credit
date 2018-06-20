import React from "react";
import { Grid, Icon, withStyles,  Button } from "@material-ui/core";
import AddIcon from '@material-ui/icons/Add'
import {NavLink} from 'react-router-dom'
import EJSON from 'mongodb-extended-json';
import { RegularCard, Table, ItemGrid } from "components";


const styles = theme => ({
  button: {
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
  }
});


class Banks extends React.Component{
    constructor(props){
      super(props)
      this.state = {
        banks: [],
        modalOpen: false 
      }
      console.log('Created Banks instance')
      console.log(this.state)
    }

    callApi = async () => {

      const response = await fetch('/nativeBanks');
      const body = await response.json();
      if (response.status !== 200) throw Error(body.message);
      return EJSON.parse(body);

    };

    componentDidMount() {
      console.log('async was called')
      this.callApi()
      .then(res => this.setState({ banks: res }))
      .catch(err => console.log(err));
    }

    render() {
      let bankData = this.state.banks.reduce((banks,bank)=>{
  //      console.log(getComponent(bank.LC_used))
        /*banks.push([bank["name"],bank["branch"],bank["IFSC"],
                            bank["LC_limit"]["numberdecimal"],
                            bank["LC_used"]["$numberdecimal"],
                            bank["LCs"]])*/
        const active = bank.LCs.reduce((total,lc)=>{
          if(lc.status === 'Active' || lc.status === 'Extended')
            total++;
          return total
        },0)                            
        const limit = String(bank.LC_limit)
        const used = String(bank.LC_used)                            
        const available = String(parseFloat(limit)-parseFloat(used))
        banks.push([ bank.name, bank.branch, bank.IFSC, String(bank.LC_limit),
                      String(bank.LC_used), available,active])
        return banks

      },[])

      
      const {classes} = this.props
      return (
        <div classname="Grid">
          <Grid container>
            <ItemGrid xs={12} sm={12} md={12}>
              <RegularCard
                cardTitle="Banks"
                cardSubtitle="Here is a subtitle for this table"
                content={
                  <Table
                    tableHeaderColor="primary"
                    tableHead={["Name", "Branch", "IFSC", "LC LIMIT", "LC Used","LC Remaining", "Active LCs"]}
                    tableData={bankData}
                    expansionHead = "Letters of Credit."
                  />
                }
                footer={
                  <div>
                    <NavLink
                      to={'/Banks/AddNewBank'}
                      activeClassName="active"
                    >
                      <Button variant="fab" color="secondary" aria-label="add" className={classes.button}>
                        <AddIcon />
                      </Button>
                    </ NavLink>
                   </div>
              }/> 
              
            </ItemGrid>
          </Grid>
        </div>

      );
    }
}
export default withStyles(styles)(Banks);

