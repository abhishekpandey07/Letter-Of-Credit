// ##############################
// // // TasksCard styles
// #############################

import {
  card,
  cardHeader,
  defaultFont,
  primaryBoxShadow
} from "assets/jss/material-dashboard-react.jsx";

const sliderTabsStyle = theme => ({
  tabWrapper: {
    width: "auto",
    display: "inline-flex",
    alignItems: "inherit",
    flexDirection: "row",
    justifyContent: "center",
    [theme.breakpoints.down("sm")]: {
      display: "flex"
    }
  },
  tabIcon: {
    float: "left",
    [theme.breakpoints.down("sm")]: {
      marginTop: "-2px"
    }
  },
  displayNone: {
    display: "none",
  },
  labelIcon: {
    height: "44px",
    width: "110px",
    minWidth: "72px",
    paddingLeft: "14px",
    borderRadius: "3px"
  },
  tabsContainer: {
    marginTop: "4px",
    color: "#FFFFFF",
    [theme.breakpoints.down("sm")]: {
      display: "grid"
    }
  },
  tabs: {
    width: "100px",
    minWidth: "70px",
    paddingLeft: "10px"
  },
  cardHeaderContent: {
    flex: "none"
  },
  label: {
    lineHeight: "19px",
    textTransform: "uppercase",
    fontSize: "12px",
    fontWeight: "500",
    marginLeft: "-10px"
  },
  textColorInheritSelected: {
    backgroundColor: "rgba(255, 255, 255, 1)",
    transition: "background-color .4s"
  }
});

export default sliderTabsStyle;
