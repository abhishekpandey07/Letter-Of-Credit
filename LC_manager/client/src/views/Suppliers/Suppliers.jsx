import React from "react";
import {Switch, Route, Redirect } from "react-router-dom";
import SupplierRoutes from 'routes/suppliers.jsx'

const switchRoutes = (
  <Switch>
    {SupplierRoutes.map((prop, key) => {
      if (prop.redirect)
        return <Redirect from={prop.path} to={prop.to} key={key} />;
      return <Route path={prop.path} component={prop.component} key={key} refresh={true} />;
    })}
  </Switch>
);

 const Suppliers = ({...props}) => {
    return switchRoutes;
    
}

export default Suppliers;