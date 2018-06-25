import React from "react";
import {
  withStyles,
  Table,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
  Tooltip,
  IconButton
} from "material-ui";

import PropTypes from "prop-types";
//import { Edit, Close, Check, Add, FileUpload } from "@material-ui/icons";
import tableStyle from "assets/jss/material-dashboard-react/tableStyle";
import classNames from 'classnames'
// const icons = {
//   "edit": Edit,
//   "add": Add,
//   "upload": FileUpload,
//   "check": Check, 
//   "close": Close
// }




const CustomTableCell = withStyles(theme => ({
  head: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  body: {
    fontSize: 14,
  },
}))(TableCell);


function CustomTable({ ...props }) {
  const { classes, tableHead, tableData, tableHeaderColor } = props;
   var icon;
   return (
    <div className={classes.tableResponsive}>
      <Table className={classes.table}>
        {tableHead !== undefined ? (
          <TableHead className={classes[tableHeaderColor + "TableHeader"]}>
            <TableRow>
              {tableHead.map((prop, key) => {
                return (
                  <TableCell
                    className={classes.tableHeadCell}
                    key={key}
                    numeric={props.isNumericColumn[key]}
                  >
                    <b>{prop}</b>
                  </TableCell>
                );
              })}  
            </TableRow>
          </TableHead>
        ) : null}
        <TableBody>
          {tableData.map((prop1, key) => {
            return (
              <TableRow key={key} hover={props.icon}>
                {prop1.map((prop, key) => {
                  return (
                    (props.icon) ? 
                    (key==(prop1.length-1) && props.icon==true) ?
                    <TableCell className={classes.tableActions} key={key}
                      numeric={props.isNumericColumn[key]}>
                      {prop}
                    </TableCell> :
                    <CustomTableCell className={classes.tableCell} key={key}
                      numeric={props.isNumericColumn[key]}>
                      {prop}
                    </CustomTableCell>
                    :
                    <CustomTableCell className={classes.tableCell} key={key}
                      numeric={props.isNumericColumn[key]}>
                      {prop}
                    </CustomTableCell>

                  );
                })}
                {
                  props.enableEdit ? 
                  <TableCell className={classes.tableActions}>
                    {props.iconTools.map((prop,key2)=>{
                      return(
                        <Tooltip
                          id="tooltip-top"
                          title="Edit"
                          placement="top"
                          classes={{ tooltip: classes.tooltip }}
                        >
                        <IconButton
                          aria-label="Edit"
                          className={classes.tableActionButton}
                          onClick={prop.handle(key)}
                        >
                          <prop.icon
                            className={
                              classes.tableActionButtonIcon + " " + classes.edit
                            }
                          />
                        </IconButton>
                      </Tooltip>)
                      })}
                  </TableCell>:
                  <div/>
                }
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

CustomTable.defaultProps = {
  tableHeaderColor: "primary"
};

CustomTable.propTypes = {
  classes: PropTypes.object.isRequired,
  tableHeaderColor: PropTypes.oneOf([
    "warning",
    "primary",
    "danger",
    "success",
    "info",
    "rose",
    "gray"
  ]),
  tableHead: PropTypes.arrayOf(PropTypes.string),
  tableData: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string))
};

export default withStyles(tableStyle)(CustomTable);
