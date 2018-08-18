import {
  drawerWidth,
  container,
  defaultFont,
  primaryColor,
  defaultBoxShadow,
  infoColor,
  successColor,
  warningColor,
  dangerColor
} from "assets/jss/material-dashboard-react.jsx";


const styles = theme => ({
  appBar: {
   backgroundColor: '#FFFFFF',
    ...defaultBoxShadow,
    borderBottom: "0",
    position: "fixed",
    width: "100%",
    paddingTop: "10px",
    zIndex: "1029",
    color: "#000000",
    border: "0",
    borderRadius: "3px",
    padding: "10px 10",
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    minHeight: "75px",
    display: "block"
  },
  hide: {
    visibility: "hidden"
  },
  logoImage: {
    width: "50px",
    height: "50px",
    display: "inline",
    margin: '0px',
    padding: '0px',
  },
  appBarShift: {
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  'appBarShift-left': {
    marginLeft: drawerWidth,
  },
  'appBarShift-right': {
    marginRight: drawerWidth,
  },
  menuButton: {
    marginLeft: 12,
    marginRight: 20,
  },
});

export default styles