import React from "react";
import PropTypes from "prop-types";
import { NavLink } from "react-router-dom";
import cx from "classnames";
import {
  withStyles,
  Drawer,
  Hidden,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
} from "@material-ui/core";

import { HeaderLinks } from "components";
import Grid from '@material-ui/core/Grid'
import sidebarStyle from "assets/jss/material-dashboard-react/sidebarStyle.jsx";
import Header from 'components/Header/Header.jsx'
class Sidebar extends React.Component {
  // verifies if routeName is the one active (in browser input)
  constructor(props){
    super(props)
    this.state = {
      open: true
    }
  }
  
  handleDrawerToggle = () => {
    this.setState(prev => {return { open : !prev.open}})
  }

  activeRoute = (routeName) => {
    return this.props.location.pathname.indexOf(routeName) > -1 ? true : false;
  }

 render ()
   {const { classes, color, logo, image, logoText, routes,data } = this.props;
       var links = (
       <List className={classes.list}>
         {routes.map((prop, key) => {
           if (prop.redirect || !prop.roles.includes(data.role)) return null;
           const listItemClasses = cx({
             [" " + classes[color]]: this.activeRoute(prop.path)
           });
           const whiteFontClasses = cx({
             [" " + classes.whiteFont]: this.activeRoute(prop.path)
           });
           return (
             <NavLink
               to={prop.path}
               className={classes.item}
               activeClassName="active"
               key={key}
             >
               <ListItem button className={classes.itemLink + listItemClasses}>
                 <ListItemIcon className={classes.itemIcon + whiteFontClasses}>
                   <prop.icon />
                 </ListItemIcon>
                 <ListItemText
                   primary={prop.sidebarName}
                   className={classes.itemText + whiteFontClasses}
                   disableTypography={true}
                 />
               </ListItem>
             </NavLink>
           );
         })}
       </List>
     );
     var brand = (
       <div className={classes.logo}>
         <div className = {classes.logoLink} >
           <div className={classes.logoImage}>
             <img src={logo} alt="logo" className={classes.img} onclick={this.handleDrawerToggle}/>
           </div>
           {logoText}
         </div>
       </div>
     );
    console.log(routes)
     return (
          <div>
             <Hidden mdUp>
               <Drawer
                 variant="temporary"
                 anchor="right"
                 open={this.props.open}
                 classes={{
                   paper: classes.drawerPaper
                 }}
                 onClose={this.props.handleDrawerToggle}
                 ModalProps={{
                   keepMounted: true // Better open performance on mobile.
                 }}
               >
                 {brand}
                 <div className={classes.sidebarWrapper}>
                   <HeaderLinks />
                   {links}
                 </div>
                 {image !== undefined ? (
                   <div
                     className={classes.background}
                     style={{ backgroundImage: "url(" + image + ")" }}
                   />
                 ) : null}
                  <ol className={classes.ol}>
                    {
                      [0,1,2].map((prop,key) => {
                        return <li onClick = { () => this.setState({sidbarImg:key})}>*</li>
                      })
                    }
                  </ol>
               </Drawer>
             </Hidden>
             <Hidden smDown>
               <Drawer
                 anchor="left"
                 variant="persistent"
                 open={this.props.permOpen}
                 classes={{
                   paper: classes.drawerPaper
                 }}
                 onClose={this.props.permHandle}
               >
                 <Button onClick={this.props.permHandle}>{brand}</Button>
                 <div className={classes.sidebarWrapper}>{links}</div>
                 {image !== undefined ? (
                   <div
                     className={classes.background}
                     style={{ backgroundImage: "url(" + image + ")" }}
                   />
                 ) : null}
                 <ol className={classes.ol}>
                    {
                      [0,1,2].map((prop,key) => {
                        return <li onClick = { () => this.setState({sidbarImg:key})}>*</li>
                      })
                    }
                  </ol>
               </Drawer>
             </Hidden>
           
           </div>
     );}
};

Sidebar.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(sidebarStyle)(Sidebar);
