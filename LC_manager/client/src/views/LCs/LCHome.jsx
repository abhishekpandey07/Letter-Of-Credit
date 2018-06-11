import React from "react";
import { Grid, Icon, withStyles,  Button, Typography } from "@material-ui/core";
import AddIcon from '@material-ui/icons/Add'

import EJSON from 'mongodb-extended-json'
//import getComponent from 'hadron-react-bson'
import { NavLink } from "react-router-dom";
import { RegularCard, Table, ItemGrid, LCPanel } from "components";
import LCRoutes from 'routes/lcs.jsx'
//import LCCard from 'components/LCs/LCCards'
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

class LCHome extends React.Component{
    constructor(props){
      super(props)
      this.state = {
        LCs: [],
        addMode: false,
      }
      this.forceUpdate()
      console.log('Created LCs instance')
      console.log(this.state)
    }

    callApi = async () => {
      const response = await fetch('/LCs');
      const body = await response.json();
      if (response.status !== 200) throw Error(body.message);
      
      return EJSON.parse(body);

    };


    handleAddOpen = () => {
      this.setState({addMode: true});
      console.log('addMode set to True.')
    };

    handleAddClose = () => {
      this.setState({addMode: false});
      console.log('Modal closed')
    }
    componentWillMount() {
      console.log('async was called')
      this.callApi()
      .then(res => this.setState({ LCs: res }))
      .catch(err => console.log(err));
    }

    render() {
      
      let LCData = this.state.LCs.reduce((LCs,LC)=>{
  //      console.log(getComponent(LC.LC_used))
        /*LCs.push([LC["name"],LC["branch"],LC["IFSC"],
                            LC["LC_limit"]["numberdecimal"],
                            LC["LC_used"]["$numberdecimal"],
                            LC["LCs"]])*/
        if(LC != null){                  
        LCs.push([ LC.supplier.name, LC.issuer.name,
                    LC.dates[0].openDT.slice(0,10), LC.dates[0].expDT.slice(0,10),
                    LC.LC_no,LC.FDR_no,
                    LC.FDR_DT.slice(0,10),String(LC.m_amt),
                    String(LC.amount),
                    String(LC.payment.DT_amt[0].due_DT.slice(0,10)),
                    String(LC.payment.DT_amt[0].due_amt),
                    String(LC.payment.DT_amt[0].payed_amt),
                    String(LC.payment.total_due),
                    String(LC.payment.total_payed),
                    LC.status])}
        return LCs

      },[])
      console.log(this.state.LCs)
      console.log('LCData: ' + String(LCData))
      const {classes} = this.props
      
      var panels = this.state.LCs.map((prop,key) => {
        return (
          <LCPanel LC={prop} />
          )
      })

      return (
        <div className="grid">
          <Grid container>
            <ItemGrid xs={12} sm={12} md={12}>
              <RegularCard
                cardTitle="LCs"
                cardSubtitle="Here is a subtitle for this table"
                content={
                  panels
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
      /*const data = this.state.LCs.map((prop,key)=>{
              return (
                <Grid item xs={12}>
                  <LCCard LC = {prop}/>
                </Grid>
                )
            })


      return (
      <RegularCard xs={12} sm={12} md={12}
        cardTitle = "Letters of Credit"
        cardSubtitle = "List of LCs"
        content = {<div>
                    <Grid container>
                      {data}
                    </Grid>
                  </div>
                }
          />
        )*/
    }
}
export default withStyles(styles)(LCHome);