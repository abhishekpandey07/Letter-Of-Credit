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
  ItemGrid
} from "components";

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
import {formatDate} from 'utils/common'


const month = {
  "1": "Jan",
  "2": "Feb",
  "3": "Mar",
  "4": "Apr",
  "5": "May", 
  "6": "Jun", 
  "7": "Jul",
  "8": "Aug",
  "9": "Sep",
  "10": "Oct",
  "11": "Nov",
  "12": "Dec"
}

// TODO: Add a list of LC expiring in next 14 days.
class Dashboard extends React.Component {
  state = {
    value: 0,
    cycleTrend:[],
    monthData: null,
    thisWeek: null,
    bank: null
  };
  handleChange = (event, value) => {
    this.setState({ value });
  };

  handleChangeIndex = index => {
    this.setState({ value: index });
  };

  callCycleApi = async () => {
    const url = '/info/cycle'
    var response = await fetch(url)
    const body = await response.json()
    if(response.status !== 200){
      console.log(response.status)
      return null
    }
    
    return EJSON.parse(body)
  }

  callMonthApi = async () => {
    const url = '/info/month'
    var response = await fetch(url)
    const body = await response.json()
    if(response.status !== 200){
      console.log(response.status)
      return null
    }
    
    return EJSON.parse(body) 
  }

  callWeekApi = async() => {
    const url ='/info/thisWeek'
    var response = await fetch(url)
    const body = await response.json()
    if(response.status !== 200){
      console.log(response.status)
      return null
    }
    
    return EJSON.parse(body) 
  }

  callBankApi = async () => {
    const url = '/nativeBanks'
    var response = await fetch(url)
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

    this.callWeekApi()
    .then(res => {this.setState({thisWeek:res})})
    .catch(error => {console.log(error)})    

    this.callBankApi()
    .then(res => {this.setState({bank: res, })})
    .catch(error => {console.log(error)})        
  }

  render() {

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
    var monthContent = null
    this.today = new Date(Date.now())
    if(this.state.monthData){
      const thisMonth = this.state.monthData.reduce((acc,item) => {
        ( item._id.month===(this.today.getMonth()+1)) ?
          acc.push(item) : {} 
          return acc
      },[])

      this.totalDue = 0
      this.totalCount = 0
      const monthTableData = thisMonth.reduce((data,prop,key) => {

        const tableData = prop.LC.map((lc,index) => {
          const paid = lc.payment.payed_amt > 0 ? 'PAYED' : 'NOT PAYED'
          const date = formatDate(new Date(lc.payment.due_DT))
          const row = [prop._id.issuer,lc.supplier[0],lc.LC_no,date,String(lc.payment.due_amt), paid]
          data.push(row) 
        })
        this.totalDue += parseFloat(prop.amount)
        this.totalCount += prop.count
        return data
      },[])
      console.log('Total Due : ' + this.totalDue)
      monthContent = (
        <div>
          <Typography variant='subheading' align='center' padding='10'>
            Total Amount Due : {this.totalDue}
          </Typography>
          <Table
            headerColor='orange'
            tableHead = {['Issuer','Supplier', 'LC No.', 'Due Date' ,'Due Amount','Status']}
            tableData = {monthTableData}
          />
        </div>
        )
    }
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
        const available = String(parseFloat(limit)-parseFloat(used))
        banks.push([ bank.name,String(bank.LC_limit),
                      String(bank.LC_used), available,active])
        return banks

      },[])

      bankContent = (
        <Table
          tableHeaderColor="primary"
          tableHead={["Name", "Limit", "Utilized","Remaining", "Active LCs"]}
          tableData={bankData}
        />
      )
    }

    var weekDueCount = this.state.thisWeek ? (this.state.thisWeek.length > 0 ? this.state.thisWeek[0].count : 0) : 0

    return (
      <div>
        <Grid container>
          <ItemGrid xs={12} sm={6} md={3}>
            <StatsCard
              icon={InfoOutline}
              iconColor="orange"
              title="Payments"
              description={"This Week : " + weekDueCount}
              statIcon={InfoOutline}
              statIconColor="primary"
              statLink={{ text: "Update Details", href: "/LCs" }}
            />
          </ItemGrid>
          <ItemGrid xs={12} sm={6} md={3}>
            <StatsCard
              icon={Store}
              iconColor="green"
              title="Payments this Week"
              description="$34,245"
              statIcon={DateRange}
              statText="Last 24 Hours"
            />
          </ItemGrid>
          <ItemGrid xs={12} sm={6} md={3}>
            <StatsCard
              icon={InfoOutline}
              iconColor="red"
              title="Fixed Issues"
              description="75"
              statIcon={LocalOffer}
              statText="Tracked from Github"
            />
          </ItemGrid>
        </Grid>
        {/*<Grid container>
          <ItemGrid xs={12} sm={12} md={6}>
            <ChartCard
              chart={
                <ChartistGraph
                  className="ct-chart"
                  data={cycleTrendData}
                  type="Bar"
                  options={cycleTrendOptions}
                  responsiveOptions={emailsSubscriptionChart.responsiveOptions}
                  listener={emailsSubscriptionChart.animation}
                />
              }
              chartColor="primary"
              title="Email Subscriptions"
              text="Last Campaign Performance"
              statIcon={AccessTime}
              statText="campaign sent 2 days ago"
            />
          </ItemGrid>
        </Grid>*/}
        <Grid container>
          <ItemGrid xs={12} sm={4} md={6}>
            <RegularCard
              cardTitle="Bank Status"
              cardSubtitle="Limits"
              content={bankContent}
                />
          </ItemGrid>
          <ItemGrid xs={12} sm={12} md={6}>
            <RegularCard
              cardTitle="Payments"
              cardSubtitle={
                
                  "Month : " + month[this.today.getMonth()+1] + '          Total : ' +
                  this.totalDue + '          Count : ' + this.totalCount
                
              }
              content={monthContent}
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


