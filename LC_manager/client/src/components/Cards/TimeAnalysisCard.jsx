import React from "react";
import PropTypes from "prop-types";
import {
  withStyles,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Tabs,
  Tab
} from "material-ui";
import { BugReport, Code, Cloud, Calendar } from "@material-ui/icons";

import { Tasks } from "components";
import PageTable from 'components/Table/PaginationTable'

import FormControlLabel from '@material-ui/core/FormControlLabel'
import Switch from '@material-ui/core/Switch'


import tasksCardStyle from "assets/jss/material-dashboard-react/tasksCardStyle";
import Button from '@material-ui/core/Button'
import FileDownload from '@material-ui/icons/FileDownload'
import Tooltip from '@material-ui/core/Tooltip'
import IconButton from '@material-ui/core/IconButton'
import ReactExport from 'react-data-export'
import {formatDate, formatAmount} from 'utils/common'


const ExcelFile = ReactExport.ExcelFile
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn
const downloadIcon = 
                <Tooltip
                  id="tooltip-top"
                  title='Download As ExcelFile'
                  placement="top"

                >
                  <IconButton
                    aria-label='download'
                    style={{ width: "40px", height: "40px"}}
                  >
                    <FileDownload
                      style={{
                        width: "25px",
                        height: "25px",
                        backgroundColor: "transparent",
                        boxShadow: "none"
                      }}
                    />
                  </IconButton>
              </Tooltip>

const month = [ 'Jan', 'Feb', 'Mar',
                'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep',
                'Oct', 'Nov', 'Dec'
              ]


class TimeAnalysisCard extends React.Component {
  constructor(props){
    super(props)
    this.today = new Date(Date.now())
    this.state = {
      value: this.today.getMonth(),
      dateWise:false
    }
    
    console.log(this.props.data)
  };

  handleChange = name => (event,value) => {
    this.setState({ [name] : value});
    console.log(this.state)
  };  

  getDownloadButton(data){
    const headers = ['Issuer','Supplier', 'Project', 'LCNo', 'DueDate' ,'DueAmount','Payment'];
    var monthData = null
    var dateData = null
    var workBook = null
    if(data!= null){
      monthData = data.monthData.reduce((acc,prop,key) => {
        acc.push({
          Issuer: prop[0],
          Supplier: prop[1],
          Project: prop[2],
          LCNO : prop[3],
          DueDate: prop[4],
          Dueamount: Number(prop[5].split(',').join('')),
          Payment: prop[6]
        })
        return acc;
      },[])
      monthData.push({
        DueDate: 'Total',
        Dueamount: this.totalDue

      })

      const name = 'LC_payments_' + month[this.state.value]

      workBook =
            <ExcelFile element={downloadIcon} filename={name}>
                <ExcelSheet data={monthData} name={month[this.state.value]}>
                    <ExcelColumn label="Issuer" value="Issuer"/>
                    <ExcelColumn label="Supplier" value="Supplier"/>
                    <ExcelColumn label="Project" value="Project"/>
                    <ExcelColumn label="LC no." value="LCNO"/>
                    <ExcelColumn label="Due Date" value="DueDate"/>
                    <ExcelColumn label="Due Amount" value="Dueamount"/>
                    <ExcelColumn label="Payment Type" value="Payment"/>
                </ExcelSheet>
                <ExcelSheet data={data.dateWiseData} name={'date_wise_' + month[this.state.value]}>
                    <ExcelColumn label="Due Date" value="date"/>
                    <ExcelColumn label="Due Amount" value="amount"/>
                </ExcelSheet>
            </ExcelFile>
    }

  return workBook
  }

  getMonthContent(){
    var monthContent = null
    var monthTableData = null
    this.today = new Date(Date.now())
    console.log('in month data')
    if(this.props.data!=null){
      console.log('creating month content')
      this.totalDue = 0
      this.totalCount = 0

      monthTableData = this.props.data.reduce((data,prop,key) => {
        if((prop._id.month===(this.state.value + 1))){
          const tableData = prop.LC.map((lc,index) => {
            // use this to show paid done Icon
            const paid = lc.payment.payed ? lc.payment.pay.mode : 'NOT PAYED'
            
            const date = formatDate(new Date(lc.payment.due_DT))

            const row = [String(prop._id.issuer),lc.supplier[0],lc.project[0],String(lc.LC_no),date,formatAmount(lc.payment.due_amt),paid]
            data.monthData.push(row) 

            var index = data.dateWiseData.findIndex((obj)=>{
              return (obj.date == date) ? true : false
            })

            index == -1 ? data.dateWiseData.push({date: date, amount: parseFloat(lc.payment.due_amt)}) :
            data.dateWiseData[index].amount += parseFloat(lc.payment.due_amt)

            })
          this.totalDue += parseFloat(prop.amount)
          this.totalCount += prop.count
        }
        return data
      },{monthData:[],dateWiseData:[]})

      
      const dateWiseData = monthTableData.dateWiseData.reduce((list,data,key)=>{
        list.push([data.date,formatAmount(data.amount)])
        return list
      },[])
      console.log(monthTableData.dateWiseData)
      const downloadButton = this.getDownloadButton(monthTableData)

      monthContent = (
        <div>
          <Typography variant='body2' align='left' padding='10' style={{flexBasis: 0.8, flexShrink:0}}>
            Total Amount Due : Rs.{formatAmount(this.totalDue)}
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={this.state.dateWise}
                onChange={this.handleChange('dateWise')}
                value="checkedB"
                color="primary"
              />
            }
            label="Day Wise Payments"
            style={{flexBasis:0.8, flexShrink:0}}
          />
          {this.state.dateWise?
            <PageTable
              isNumericColumn={[false,true]}
              tableHeaderColor="primary"
              tableHead = {['Due Date',' Due Amount']}
              tableData = {dateWiseData}
              download = {downloadButton}
            />
            :
            <PageTable
              isNumericColumn={[false,false,false,false,true,true]}
              tableHeaderColor="primary"
              tableHead = {['Issuer','Supplier', 'Project','LC No.', 'Due Date' ,'Due Amount',"Payment Type"]}
              tableData = {monthTableData.monthData}
              download = {downloadButton}
            />
          }
        </div>
        )
    }

    return monthContent
  }

  render() {
    const { classes } = this.props;
    //var data = this.processData()
    const monthContent = this.getMonthContent()
    return (
      <Card className={classes.card}>
        <CardHeader
          classes={{
            root: classes.cardHeader,
            title: classes.cardTitle,
            content: classes.cardHeaderContent
          }}
          title={<Typography variant='title' style={{color:'white'}}>Month:</Typography>}
          action={
            <Tabs
              classes={{
                flexContainer: classes.tabsContainer,
                indicator: classes.displayNone
              }}
              value={this.state.value}
              onChange={this.handleChange('value')}
              textColor="inherit"
            >
            { month.map((prop,key) => {
                if(key >= this.today.getMonth() && key <= this.today.getMonth() +3)
                  return <Tab
                      classes={{
                        wrapper: classes.tabWrapper,
                        labelIcon: classes.labelIcon,
                        label: classes.label,
                        textColorInheritSelected: classes.textColorInheritSelected
                      }}
                      icon={<BugReport className={classes.tabIcon} />}
                      label={prop}
                      value={key}
                    />
                return 
              })
            }

            </Tabs>
          }
        />
        <CardContent>
          {/*<div>
          <Typography variant='body2' align='left' padding='10'>
            Total Amount Due : Rs.{formatAmount(this.totalDue)}
          </Typography>
          <PageTable
            isNumericColumn={[false,false,false,false,true]}
            tableHeaderColor="primary"
            tableHead = {['Issuer','Supplier', 'LC No.', 'Due Date' ,'Due Amount']}
            tableData = {data}
            download = {this.getDownloadButton(data)}
          />
        </div>*/}
        {monthContent}
        </CardContent>
      </Card>
    );
  }
}

TimeAnalysisCard.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(tasksCardStyle)(TimeAnalysisCard);
