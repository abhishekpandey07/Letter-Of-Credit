import React from 'react'
import { createBrowserHistory } from "history";
import indexRoutes from "routes/index.jsx";
import { Router, Route, Switch } from "react-router-dom";
import LoginPage from 'views/Login/Login.jsx'
import Dashboard from 'layouts/Dashboard/Dashboard'
import axios from 'axios'
import EJSON from 'mongodb-extended-json'
import SplashComponent from 'SplashPage.jsx'
const hist = createBrowserHistory();

class App extends React.Component {
  constructor(props){
    super(props)
    this.state ={
      name: null,
      role: null,
      authenticated: null,
    }
  }
  
  checkAuthentication = async () => {
      const url = '/users/sessionAuthentication'
      var res = await axios.get(url,{credentials: 'include'})
      const data = await EJSON.parse(res.data);
      console.log(data)
      this.setState({authenticated: data.authenticated})
      if(data.authenticated === true){
          console.log('Authenticated! providing access')
          this.handleLoginSuccess(data)
          return true
        }
      return false
    }

  componentWillMount = async () => {
    var loggedIn = await this.checkAuthentication()
    loggedIn ? console.log('logged In') : {}
  }

  handleLoginSuccess = (data) => {
    this.setState({
      name: data.name,
      role: data.role,
      authenticated: data.authenticated 
    })
    console.log('authentication complete')
  }

  loginPage = () => {
    return (<LoginPage onLoginSuccess={this.handleLoginSuccess}/>)
  }

  dashboard = () => {
    return (<Dashboard />)
  }

  render () {
    if(this.state.authenticated !== null){
      
    const LoginSwitch = (<Switch>
                <Route path='/' component={this.loginPage} key='login' />
              </Switch>) 

    const authenticatedSwitch =
          <Switch>
              { 
                indexRoutes.map((prop, key) => {
                return <Route path={prop.path} render={(props) => {return <prop.component {...props} data={this.state }/>}} key={key} />;
                })
              }
              
            </Switch>
    return (

      <Router history={hist}>
        {this.state.authenticated===true ? authenticatedSwitch : LoginSwitch}
       </Router>)   
    }

    return <SplashComponent/>
  }
}

export default App