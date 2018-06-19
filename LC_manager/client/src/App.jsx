import React from 'react'
import { createBrowserHistory } from "history";
import indexRoutes from "routes/index.jsx";
import { Router, Route, Switch } from "react-router-dom";
import LoginPage from 'views/Login/Login.jsx'
import Dashboard from 'layouts/Dashboard/Dashboard'

const hist = createBrowserHistory();
class App extends React.Component {
	constructor(props){
		super(props)
		this.state ={
			name: null,
			role: null,
			authenticated: false,
		}
	}

	componentDidMount(){
		document.title=" LC Manager"
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
				{this.state.authenticated ? authenticatedSwitch : LoginSwitch}
			 </Router>)		

	}
}

export default App