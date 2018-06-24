const styles = theme => ({
  root: {
    width: '100%',
  },
  heading: {
    fontSize: theme.typography.pxToRem(13),
    flexBasis: '20.00%',
    flexShrink: 0,
  },
  secondaryHeading: {
    fontSize: theme.typography.pxToRem(10),
    color: theme.palette.text.secondary,
  },
  content: {
    fontSize: theme.typography.pxToRem(8),
    flexBasis: '33.33%',
    flexShrink: 0,
  },

  button:{
    margin: theme.spacing.unit,
  },

  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width:200,
    flexBasis: '33.33%',
    flexShrink:0,
  },
  margin: {
    margin: theme.spacing.unit,
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    flexBasis:'33.33%',
    flexShrink: 0

  },
  withoutLabel: {
    marginTop: theme.spacing.unit * 3,
  },
  textField1: {
    flexBasis: 200,
  },
  grid:{
    padding: "0 15px !important"
  },
  tableActionButton: {
    width: "27px",
    height: "27px"
  },
  tableActionButtonIcon: {
    width: "17px",
    height: "17px"
  },
  edit: {
    backgroundColor: "transparent",
    color: primaryColor,
    boxShadow: "none"
  },
});