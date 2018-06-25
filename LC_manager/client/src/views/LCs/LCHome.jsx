import React from "react";
import { Grid, Icon, withStyles,  Button, Typography,List,ListItem, Divider } from "@material-ui/core";
import AddIcon from '@material-ui/icons/Add'

import EJSON from 'mongodb-extended-json'
//import getComponent from 'hadron-react-bson'
import { NavLink } from "react-router-dom";
import { RegularCard, Table, ItemGrid, LCPanel } from "components";
import LCRoutes from 'routes/lcs.jsx'

const styles = theme => ({
  paper: {
    position: 'absolute',
    width: theme.spacing.unit * 50,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing.unit * 4,
  },
});

class LCHome extends React.Component{
    constructor(props){
      super(props)
      this.state = {
        LCs: [],
        
      }
    }

    callAllApi = async () => {
      const response = await fetch('/LCs',{credentials:'include'});
      console.log(response)
      const body = await response.json();
      if (response.status !== 200) throw Error(body.message);
      
      return EJSON.parse(body);

    };

    componentDidMount() {
      console.log('async was called')
      this.callAllApi()
      .then(res => this.setState({ LCs: res }))
      .catch(err => console.log(err));
    }

    updateLCPanel = (key,LC) => {
      var LCs = this.state.LCs
      LCs[key] = LC;
      console.log(LCs)
      this.setState({LCs: LCs})
      console.log(this.state.LCs)
    }

    deleteLC = (id) => {
      var LCs = this.state.LCs
      delete LCs[id]
      this.setState({LCs:LCs})
    }

    render() {
      
      if(this.state.LCs < 1){
        var panels = (
          <Typography varaint='title'>
          No LCs to Display
          </Typography>
          )
      }else{
        var panels = this.state.LCs.reduce((arr,prop,key) => {
          var panel = 
            <Grid item xs={12} sm={12} md={12}>
                <LCPanel LC={prop} id={key}
                onUpdate={this.updateLCPanel}
                onDelete={this.deleteLC}/>
            </Grid>
          arr.push(panel)
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
                  <Grid container>
                    {panels}
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