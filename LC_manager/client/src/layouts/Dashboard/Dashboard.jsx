import React from "react";
import PropTypes from "prop-types";
import { Switch, Route, Redirect } from "react-router-dom";
// creates a beautiful scrollbar
import PerfectScrollbar from "perfect-scrollbar";
import "perfect-scrollbar/css/perfect-scrollbar.css";
import { withStyles } from "material-ui";

import { Header, Footer, Sidebar } from "components";

import dashboardRoutes from "routes/dashboard.jsx";
import loginRoutes from 'routes/login.js'
import LCRoutes from "routes/lcs.jsx"

import appStyle from "assets/jss/material-dashboard-react/appStyle.jsx";
import RegisterPage from 'views/Login/Register.jsx'
import image from "assets/img/sidebar-2.jpg";
import logo from "assets/img/reactlogo.png";
import axios from 'axios'
import classNames from 'classnames'
//This is the class
class DashLayout extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      mobileOpen: false,
      permOpen: true,
      data: this.props.data
    }
    console.log(this.props)
  }

  handleDrawerToggle = () => {
    this.setState({ mobileOpen: !this.state.mobileOpen });
  };

  handlePermDrawerToggle = () => {
    this.setState(prev => {return {permOpen: !prev.permOpen }});
    console.log('permOpen changed : ' + this.state.permOpen )
  }

  handleRegister = () => {
    window.location = '/register'
  }

  handleLogout = () => {
    axios.post('/users/logout',{credentials:'include'})
    .then( res => {
      if(res.data.logout)
        console.log('Logged out successfully')
        window.location = '/'
    }).catch(error => {
      console.log(error)
    })
  }

  getRoute = () => { return true}
  
  componentDidMount() {
    if(navigator.platform.indexOf('Win') > -1){
      // eslint-disable-next-line
      const ps = new PerfectScrollbar(this.refs.mainPanel);
    }
  }
  
  componentDidUpdate() {
    this.refs.mainPanel.scrollTop = 0;
  }
  
  render() {
    const { classes, ...rest } = this.props;
    const switchRoutes = (
            <Switch>
              {
                dashboardRoutes.map((prop, key) => {
                if (prop.redirect)
                  return <Redirect from={prop.path} to={prop.to} key={key} />;
                return <Route path={prop.path} render={(props) => {return <prop.component {...props} data={this.state.data}/>}} key={key} />;
                })
              }                         
            </Switch>
          );
    return (
      <div className={classes.wrapper}>
        <Sidebar
          routes={dashboardRoutes}
          logoText={"MVOMNI"}
          logo={logo}
          image={image}
          handleDrawerToggle={this.handleDrawerToggle}
          open={this.state.mobileOpen}
          color="blue"
          data={this.state.data}
          permOpen={this.state.permOpen}
          permHandle={this.handlePermDrawerToggle}
          handleLogout={this.handleLogout}
          {...rest}
        />    
        <div className={classNames(classes.content, classes['content-left'], {
              [classes.contentShift]: this.state.permOpen,
              [classes['contentShift-left']]: this.state.permOpen,
            })} ref='mainPanel'
          >
        <div className={classes.mainPanel}>
          {/*<Header
            routes={dashboardRoutes}
            {...rest}
          />*/}
          {/* On the /maps route we want the map to be on full screen - this is not possible if the content and conatiner classes are present because they have some paddings which would make the map smaller */}
          {this.getRoute() ? (
            <div className={classes.content}>
              <div className={classes.container}>{switchRoutes}</div>
            </div>
          ) : (
            <div className={classes.map}>{switchRoutes}</div>
          )}
          {this.getRoute() ? <Footer /> : null}
        </div>
        </div>
      </div>
    );
  }
}

DashLayout.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(appStyle)(DashLayout);
