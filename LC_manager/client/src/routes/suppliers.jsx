/*import DashboardPage from "views/Dashboard/Dashboard.jsx";
import UserProfile from "views/UserProfile/UserProfile.jsx";
import TableList from "views/TableList/TableList.jsx";
import Banks from "views/Banks/Banks.jsx"
import Suppliers from 'views/Suppliers/Suppliers.jsx';
import Supplier from 'views/Supplier/Supplier.jsx';
import Typography from "views/Typography/Typography.jsx";
import Icons from "views/Icons/Icons.jsx";
import Maps from "views/Maps/Maps.jsx";
import NotificationsPage from "views/Notifications/Notifications.jsx";
import NewLCForm from 'views/Supplier/AddNewLCForm.jsx'

import {
  Dashboard,
  Person,
  ContentPaste,
  LibraryBooks,
  BubbleChart,
  LocationOn,
  Notifications
} from "@material-ui/icons";
*/
import NewSupplierForm from 'views/Suppliers/AddSupplier.jsx'
import SupplierHome from 'views/Suppliers/SupplierHome.jsx'
const SupplierRoutes = [
  {
    path: "/Suppliers/AddNewSupplier",
    component: NewSupplierForm
  },
  { 
    path: "/Suppliers",
    component: SupplierHome
  },
  { redirect: true, path: "/", to: "/Suppliers", navbarName: "Redirect" }
];

export default SupplierRoutes;
