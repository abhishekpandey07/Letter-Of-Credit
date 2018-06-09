import React from "react";
import {
  withStyles,
  Table,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "material-ui";

import PropTypes from "prop-types";
import LCPanel from 'components/LCs/LCPanel'
import tableStyle from "assets/jss/material-dashboard-react/tableStyle";

function BankTable({ ...props }) {
  const { classes, tableHead, tableData, tableHeaderColor } = props;
  const head = tableHead.map((prop, key) => {
                return (
                  <TableCell
                    className={classes.tableCell + " " + classes.tableHeadCell}
                    key={key}
                  >
                    {prop}
                  </TableCell>
                );
              })   
  const data = tableData.map((prop, key) => {
            return (
              <TableRow key={key}>
                <LCPanel LC={prop}/>
              </TableRow>
            );
          })
   return (
    <div className={classes.tableResponsive}>
      <Table className={classes.table}>
        {tableHead !== undefined ? (
          <TableHead className={classes[tableHeaderColor + "TableHeader"]}>
            <TableRow>
              {head}
            </TableRow>
          </TableHead>
        ) : null}
        <TableBody>
          {data}
        </TableBody>
      </Table>
    </div>
  );
}

BankTable.defaultProps = {
  tableHeaderColor: "gray"
};

BankTable.propTypes = {
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

export default withStyles(tableStyle)(BankTable);
