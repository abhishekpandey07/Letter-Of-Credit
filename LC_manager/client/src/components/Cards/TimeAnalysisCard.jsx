import React from "react";
import PropTypes from "prop-types";
import {
  withStyles,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Typography,
  Tabs,
  Tab
} from "material-ui";
import { BugReport, Code, Cloud, DateRange } from "@material-ui/icons";

import { Tasks } from "components";
import PageTable from 'components/Table/PaginationTable'

import FormControlLabel from '@material-ui/core/FormControlLabel'
import Switch from '@material-ui/core/Switch'

import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import tasksCardStyle from "assets/jss/material-dashboard-react/tasksCardStyle";
import Button from '@material-ui/core/Button'
import FileDownload from '@material-ui/icons/FileDownload'
import Tooltip from '@material-ui/core/Tooltip'
import IconButton from '@material-ui/core/IconButton'
import ReactExport from 'react-data-export'
import {formatDate, formatAmount} from 'utils/common'
import Grid from '@material-ui/core/Grid'
import SliderTabs from './SliderTabs'
import moment from 'moment'

const ExcelFile = ReactExport.ExcelFile
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn
const downloadIcon = 
                <Tooltip
                  id="tooltip-top"
                  title='Download As ExcelFile'
                  placement="top"
                >
                  <Button variant='contained' size='small'>
                    <FileDownload
                      style={{
                        marginLeft: '0px',
                        width: "25px",
                        height: "25px",
                        backgroundColor: "transparent",
                        boxShadow: "none",
                        marginRight:'10px'
                      }}
                    /> Download
                  </Button>
              </Tooltip>

const month = [ 'Jan', 'Feb', 'Mar',
                'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep',
                'Oct', 'Nov', 'Dec'
              ]
const fullMonth = [ 'January', 'February', 'March',
                    'April', 'May', 'June',
                    'July', 'August','September',
                    'October', 'November', 'December']


// Time analysis card for dashboard
class TimeAnalysisCard extends React.Component {
  constructor(props){
    super(props)
    this.today = new Date(Date.now())
    const startYear = 2018
    const currYear = this.today.getFullYear()
    this.state = {
      monthValue: this.today.getMonth(),
      dateWise:false,
      startMonth: this.today.getMonth(),
      startYear: currYear % startYear,
      yearValue: currYear % startYear,
    }
    const diff =  currYear - startYear
    this.year = [...Array(diff+1).keys()].map((prop,key) => {return prop+startYear}) 
    this.newPaymentDate = null
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
    const style = {
      style: {
        border: {
          top: {style: 'medium', color: 'black'},
          right: {style: 'medium', color: 'black'},
          left: {style: 'medium', color: 'black'},
          bottom: {style: 'medium', color: 'black'},
        }
      }
    }

    if(data != null){
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

      const name = 'LC_payments_' + month[this.state.monthValue]

      workBook =
            <ExcelFile element={downloadIcon} filename={name}>
                <ExcelSheet data={monthData} name={month[this.state.monthValue]}>
                    <ExcelColumn label="Issuer" value="Issuer"/>
                    <ExcelColumn label="Supplier" value="Supplier"/>
                    <ExcelColumn label="Project" value="Project"/>
                    <ExcelColumn label="LC no." value="LCNO"/>
                    <ExcelColumn label="Due Date" value="DueDate"/>
                    <ExcelColumn label="Due Amount" value="Dueamount"/>
                    <ExcelColumn label="Payment Type" value="Payment"/>
                </ExcelSheet>
                <ExcelSheet data={data.dateWiseData} name={'date_wise_' + month[this.state.monthValue]}>
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
    if(this.props.data!=null){
      this.totalDue = 0
      this.totalCount = 0
      this.devolved = 0
      this.totalPayed = 0      
      this.nextPaymentAmount = 0
      var min = 365
      monthTableData = this.props.data.reduce((data,prop,key) => {
        if((prop._id.month === (this.state.monthValue + 1)) &&
           (prop._id.year === this.year[this.state.yearValue])){
          const tableData = prop.LC.map((lc,index) => {
            // use this to show paid done Icon
            const paid = lc.payment.payed ? lc.payment.pay.mode : 'NOT PAYED'
            this.devolved += lc.payment.pay.mode === 'Devolved' ? parseFloat(lc.payment.due_amt) : 0
            this.totalPayed += lc.payment.payed ? parseFloat(lc.payment.due_amt) : 0

            var date = new Date(lc.payment.due_DT)
            var diffDays = moment.duration(date - this.today).days()
            console.log(date,diffDays)
            if( date.getMonth() === this.today.getMonth() && diffDays >=0 && diffDays < min ){
              min = diffDays
              this.nextPaymentDate = new Date(date)
            }
            date = formatDate(date)

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
      this.totalRemaining = this.totalDue - this.totalPayed

      var index = monthTableData.dateWiseData.findIndex((obj)=>{
              return (obj.date == formatDate(this.nextPaymentDate)) ? true : false
            })

      index == -1 ? null: this.nextPaymentAmount = monthTableData.dateWiseData[index].amount;
      
      const dateWiseData = monthTableData.dateWiseData.reduce((list,data,key)=>{
        list.push([data.date,formatAmount(data.amount)])
        return list
      },[])
      console.log(monthTableData.dateWiseData)
      const downloadButton = this.getDownloadButton(monthTableData)

      monthContent = (
        <Grid container>
          <Grid container justify='space-between' direction='row' align='baseline'>
            <Grid item style={{margin:'auto'}}>
              <Typography variant='body2' style={{color:'purple'}}>
                Total Amount Due
              </Typography>
              <Typography variant='body2' align='right'>
                Rs. {formatAmount(this.totalDue)}
              </Typography>
            </Grid>
            <Grid item style={{margin:'auto'}}>
              <Typography variant='body2' style={{color:'purple'}}>
                Total Amount Payed
              </Typography>
              <Typography variant='body2' align='right'>
                Rs. {formatAmount(this.totalPayed)}
              </Typography>
            </Grid>
            <Grid item style={{margin:'auto'}}>
              <Typography variant='body2' style={{color:'purple'}}>
                Total Amount Remaining
              </Typography>
              <Typography variant='body2' align='right'>
                Rs. {formatAmount(this.totalRemaining)}
              </Typography>
            </Grid>
            <Grid item style={{margin:'auto'}}>
              <Typography variant='body2' style={{color:'purple'}}>
                Devolved Amount
              </Typography>
              <Typography variant='body2' align='right'>
                Rs. {formatAmount(this.devolved)}
              </Typography>
            </Grid>
            <Grid item style={{margin:'auto'}}>
              <Typography variant='body2' style={{color:'purple'}}>
                Next Payment Date
              </Typography>
              <Typography variant='body2' align='right'>
                {this.nextPaymentDat ? formatDate(this.nextPaymentDate) : '-'}
              </Typography>
            </Grid>
            <Grid item style={{margin:'auto'}}>
              <Typography variant='body2' style={{color:'purple'}}>
                Next Payment Amount
              </Typography>
              <Typography variant='body2' align='right'>
                Rs. {formatAmount(this.nextPaymentAmount)}          
              </Typography>
            </Grid>
            <Grid item style={{margin:'auto'}}>
             {downloadButton}
            </Grid>
          </Grid>
          <Grid item xs = {12}>
            {
              this.state.dateWise?
              <PageTable
                isNumericColumn={[false,true]}
                tableHeaderColor="primary"
                tableHead = {['Due Date',' Due Amount']}
                tableData = {dateWiseData}
              />
              :
              <PageTable
                isNumericColumn={[false,false,false,false,true,true]}
                tableHeaderColor="primary"
                tableHead = {['Issuer','Supplier', 'Project','LC No.', 'Due Date' ,'Due Amount',"Payment Type"]}
                tableData = {monthTableData.monthData}
              />
            }
          </Grid>
        </Grid>
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
          title={<Typography variant='headline' style={{color:'white'}}>Payments</Typography>}
          subheader={ 
            <Typography style={{color:'lightgray',fontSize: '18px'}}>
              {fullMonth[this.state.monthValue]+", "+ this.year[this.state.yearValue]}
            </Typography>
                    }

          
        />
        <CardActions>
          <Grid container justify='space-between' alignItems='center' direction='row'>
            <Grid item style={{marginLeft: '20px'}}>
              <SliderTabs
                title='Month'
                currIdx={this.state.monthValue}
                tabChangeHandle={this.handleChange('monthValue')}
                data={month}
                range={4}
                icon={DateRange}
              />
            </Grid>
            <Grid item style={{margin:'auto'}}>
              <SliderTabs
                title='Year'
                currIdx={this.state.yearValue}
                tabChangeHandle={this.handleChange('yearValue')}
                data={this.year}
                icon={DateRange}
              />
            </Grid>
            <Grid item style={{margin:'auto'}}>
              <FormControlLabel
                control={
                  <Switch
                    checked={this.state.dateWise}
                    onChange={this.handleChange('dateWise')}
                    value="checkedB"
                    color='secondary'
                  />
                }
                label="Day Wise Payments"
              />
            </Grid>
          </Grid>
        </CardActions>
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

export default withStyles(tasksCardStyle, {withTheme: true})(TimeAnalysisCard);

