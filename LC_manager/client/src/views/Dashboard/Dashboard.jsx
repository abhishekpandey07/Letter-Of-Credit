import React from "react";
import PropTypes from "prop-types";
// react plugin for creating charts
import ChartistGraph from "react-chartist";
import {
  ContentCopy,
  Store,
  InfoOutline,
  Warning,
  DateRange,
  LocalOffer,
  Update,
  ArrowUpward,
  AccessTime,
  Accessibility
} from "@material-ui/icons";
import { withStyles, Grid } from "material-ui";

import {
  StatsCard,
  ChartCard,
  TasksCard,
  RegularCard,
  Table,
  ItemGrid,
  TimeAnalysisCard
} from "components";

import PageTable from 'components/Table/PaginationTable'
import {
  dailySalesChart,
  emailsSubscriptionChart,
  completedTasksChart
} from "variables/charts";
import Divider from '@material-ui/core/Divider'
import Typography from '@material-ui/core/Typography'
import CircularProgress from '@material-ui/core/CircularProgress';
import dashboardStyle from "assets/jss/material-dashboard-react/dashboardStyle";
import EJSON from 'mongodb-extended-json'
import {formatDate, formatAmount} from 'utils/common'
import ReactExport from 'react-data-export'

const month = [ 'Jan', 'Feb', 'Mar',
                'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep',
                'Oct', 'Nov', 'Dec'
              ]
class Dashboard extends React.Component {
  state = {
    value: 0,
    cycleTrend:[],
    monthData: null,
    thisWeek: null,
    bank: null,
    expiryData:null,
    next30: null,
  };

  handleChange = (event, value) => {
    this.setState({ value });
  };

  handleChangeIndex = index => {
    this.setState({ value: index });
  };

  callCycleApi = async () => {
    const url = '/info/cycle'
    var response = await fetch(url,{credentials:'include'})
    const body = await response.json()
    if(response.status !== 200){
      console.log(response.status)
      return null
    }
    
    return EJSON.parse(body)
  }

  callMonthApi = async () => {
    const url = '/info/month'
    var response = await fetch(url,{credentials:'include'})
    const body = await response.json()
    if(response.status !== 200){
      console.log(response.status)
      return null
    }
    
    return EJSON.parse(body) 
  }

  callWeekApi = async() => {
    const url ='/info/thisWeek'
    var response = await fetch(url,{credentials:'include'})
    const body = await response.json()
    if(response.status !== 200){
      console.log(response.status)
      return null
    }
    
    return EJSON.parse(body) 
  }

  callBankApi = async () => {
    const url = '/banks'
    var response = await fetch(url,{credentials:'include'})
    const body = await response.json()
    if(response.status !== 200){
      console.log(response.status)
      return null
    }
    
    return EJSON.parse(body)  
  }

  callExpiryApi = async () => {
    const url = '/info/LC/expiring'
    var response = await fetch(url,{credentials:'include'})
    const body = await response.json()
    if(response.status !== 200){
      console.log(response.status)
      return null
    }
    
    return EJSON.parse(body)   
  }

  call30daysApi = async () => {
    const url = '/info/30days'
    var response = await fetch(url,{credentials:'include'})
    const body = await response.json()
    if(response.status !== 200){
      console.log(response.status)
      return null
    }
    
    return EJSON.parse(body)   
  }

  componentDidMount(){
    this.callCycleApi()
    .then(res => {this.setState({cycleTrend:res})})
    .catch(error => {console.log(error)})

    this.callMonthApi()
    .then(res => {this.setState({monthData:res})})
    .catch(error => {console.log(error)})

    this.call30daysApi()
    .then(res => {this.setState({next30:res})})
    .catch(error => {console.log(error)})        

    // this.callWeekApi()
    // .then(res => {this.setState({thisWeek:res})})
    // .catch(error => {console.log(error)})    

    this.callBankApi()
    .then(res => {this.setState({bank: res, })})
    .catch(error => {console.log(error)})        

    this.callExpiryApi()
    .then(res => {this.setState({expiryData: res, })})
    .catch(error => {console.log(error)})        
  }

  //returns an object with chartist data and options fields
  getCycleTrendContent(){
    const cycleTrendData = this.state.cycleTrend.reduce((data,obj) => {
      data.labels.push(month[obj._id.month]+'('+obj._id.year+')')
      data.series[0].push(String(obj.count))
      return data
    },{labels: [], series: [[]]})

    const cycleTrendOptions = {
      axisX: {
        showGrid: false
      },
      chartPadding: {
        top: 0,
        right: 5,
        bottom: 0,
        left: 0
      }
    }

    return { data: cycleTrendData, option : cycleTrendOptions}    
  }

  getBankContent(){
    var bankContent = null;
    if(this.state.bank){
      let bankData = this.state.bank.reduce((banks,bank)=>{
        const active = bank.LCs.reduce((total,lc)=>{
          if(lc.status === 'Active' || lc.status === 'Extended')
            total++;
          return total
        },0)                            
        const limit = String(bank.LC_limit)
        const used = String(bank.LC_used)                            
        const available = formatAmount(parseFloat(limit)-parseFloat(used))
        banks.push([ bank.name,formatAmount(bank.LC_limit),
                      formatAmount(bank.LC_used), available,active])
        return banks

      },[])

      bankContent = (
        <Table
          tableHeaderColor="primary"
          isNumericColumn={[false,true,true,true,false]}
          tableHead={["Name", "Limit", "Utilized","Remaining", "Active LCs"]}
          tableData={bankData}
        />
      )
    }
    return bankContent
  }

  getExpiryContent(){
    var expContent = null
    if(this.state.expiryData){
      expContent = this.state.expiryData.reduce((acc,prop,key) => {
        const expDT = formatDate(new Date(prop.expDT))
        acc.push([prop.issuer,prop.supplier,prop.project,
                  formatAmount(prop.amount),formatAmount(prop.unUtilized),expDT])
        return acc
      },[])
    }
    return (
      <PageTable
        isNumericColumn={[false,false,false,true,true,true]}
        tableHeaderColor="primary"
        tableHead={['Issuer', 'Supplier', 'Project', 'Amount' , 'Un-Utilized', 'Expiry Date']}
        tableData={expContent? expContent : [[]]}
      />
    )
  }
  //
  getNext30Content(){
    var next30Content = null
    if(this.state.next30){
      next30Content = this.state.next30.reduce((acc,prop,key) => {
        const dueDT = formatDate(new Date(prop.dueDT))
        acc.push([prop.issuer,prop.LC_no,prop.supplier,
                  dueDT, formatAmount(prop.amount)])
        return acc
      },[])
    }
    return (
      <PageTable
        isNumericColumn={[false,false,false,false,true]}
        tableHeaderColor="primary"
        tableHead={['Issuer', 'LC Number', 'Supplier', 'Due Date','Due Amount']}
        tableData={next30Content? next30Content : [[]]}
      />
    )
  }

  

  render() {
    const cycleTrend = this.getCycleTrendContent()
    const bankContent = this.getBankContent()
    const next30Content = this.getNext30Content()

    return (
      <div>
        <Grid container>
          <ItemGrid xs={12} sm={12} md={12}>
            <TimeAnalysisCard
              data={this.state.monthData}
            />
          </ItemGrid>
          <ItemGrid xs={12} sm={12} md={12}>
            <RegularCard
              cardTitle="Expirations"
              cardSubtitle={
                "Letter Of Credits Expiring in the next 14 days"
              }
              content={this.getExpiryContent()}
                />
          </ItemGrid>
        </Grid>
        <Grid container>
          <ItemGrid xs={12} sm={12} md={12}>
            <RegularCard
              cardTitle="Bank Status"
              cardSubtitle="Limits"
              content={bankContent}
                />
          </ItemGrid>
          <ItemGrid xs={12} sm={12} md={12}>
            <RegularCard
              cardTitle="Payments"
              cardSubtitle={
                "Payments for the next 30 days"              
              }
              content={next30Content}
            />
          </ItemGrid>
        </Grid>
      </div>
    );
  }
}

Dashboard.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(dashboardStyle)(Dashboard);


