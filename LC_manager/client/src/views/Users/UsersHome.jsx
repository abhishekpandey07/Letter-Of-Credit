import React from "react";
import { Grid, Icon, withStyles,  Button } from "@material-ui/core";
import AddIcon from '@material-ui/icons/Add'
import {NavLink} from 'react-router-dom'
import EJSON from 'mongodb-extended-json';
import { RegularCard, Table, ItemGrid } from "components";
import Edit from '@material-ui/icons/Edit'
import Close from '@material-ui/icons/Close'

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


class Users extends React.Component{
    constructor(props){
      super(props)
      this.state = {
        users: [],
      }
      console.log('Created Users instance')
      console.log(this.state)
    }

    callApi = async () => {

      const response = await fetch('/users');
      const body = await response.json();
      if (response.status !== 200) throw Error(body.message);
      return EJSON.parse(body);

    };

    componentDidMount() {
      console.log('async was called')
      this.callApi()
      .then(res => this.setState({ users: res }))
      .catch(err => console.log(err));
    }

    handleEdit = (key) => {
      return 
    }

    render() {
      const userToolIcons = [
      {
        icon: Edit,
        handle: this.handleEdit,
      }
      ]

      let userData = this.state.users.reduce((users,user)=>{
        const created = String(new Date(user.created)).split(' ').splice(1,4).join(' ');
        const lastLogin = user.lastLogin ? String(new Date(user.lastLogin)).split(' ').splice(1,4).join(' '): '-'
        users.push([user.name, user.email, user.username,
                      user.role, created,lastLogin])
        return users

      },[])

      
      const {classes} = this.props
      return (
        <div classname="Grid">
          <Grid container>
            <ItemGrid xs={12} sm={12} md={12}>
              <RegularCard
                cardTitle="Users"
                cardSubtitle="List of all Users"
                content={
                  <Table
                    enableEdit={true}
                    iconTools = {userToolIcons}
                    tableHeaderColor="primary"
                    isNumericColumn={[false,false,false,false,false,false,false]}
                    tableHead={["Name", "Email", "Username","Role",'Created','Last Login']}
                    tableData={userData}
                  />
                }
                footer={
                  <div>
                    <NavLink
                      to={'/users/register'}
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
export default withStyles(styles)(Users);

