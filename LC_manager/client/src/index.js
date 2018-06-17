import React from "react";
import ReactDOM from "react-dom";
import "assets/css/material-dashboard-react.css?v=1.2.0";
import { createBrowserHistory } from "history";
import indexRoutes from "routes/index.jsx";
import { Router, Route, Switch } from "react-router-dom";
import App from './App.jsx'	
import {CookiesProvider} from 'react-cookie'

ReactDOM.render(
	
	<CookiesProvider>
  		<App/>
  	</CookiesProvider>,
  document.getElementById("root")
);
