// ##############################
// // // App styles
// #############################

import { drawerWidth, transition, container } from "assets/jss/material-dashboard-react.jsx";

const appStyle = theme => ({
  wrapper: {
    position: "relative",
    top: "0",
    minHeight: "100vh",
    zIndex: 1,
    overflow: 'none',
  },

  mainPanel: {
    [theme.breakpoints.up("md")]: {
      width: `calc(100% - ${drawerWidth}px)`,
    },
    overflow: "hidden",
    position: "relative",
    float: "right",
    ...transition,
    maxHeight: "100%",
    width: "100%",
    overflowScrolling: 'none'
  },
  content: {
    position: "relative",
    top: "0",
    height: "100%",
    zIndex: 0.5,
    overflow: 'none',
    marginTop: "15px",
    padding: "30px 15px",
    minHeight: "calc(100% - 123px)",
  },
  'content-left': {
    marginLeft: -drawerWidth,
  },
  'content-right': {
    marginRight: -drawerWidth,
  },
  contentShift: {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  'contentShift-left': {
    marginLeft: 0,
  },
  'contentShift-right': {
    marginRight: 0,
  },
  container,
  map: {
    marginTop: "70px"
  },
  appFrame: {
    zIndex: 1,
    overflow: 'none',
    position: 'relative',
    display: 'flex',
    width: '100%',
  },
});

export default appStyle;
